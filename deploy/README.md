# Deploy — BoyZera backend on AWS EC2

Production deploy targets a single EC2 (Ubuntu 24.04+, IP `3.216.123.215`) running:
- NestJS backend (containerized, image pulled from GHCR)
- PostgreSQL 15 (containerized, **not** exposed publicly)
- Redis 7 (containerized, **not** exposed publicly)
- Nginx + Let's Encrypt on the host (TLS termination)

PostgreSQL and Redis run on the same host **temporarily** — they will move to managed infra (RDS / Elasticache) once the official environment is set up.

---

## Layout

```
deploy/
├── README.md                          ← you are here
├── docker-compose.prod.yml            ← lives at /opt/boyzera/docker-compose.prod.yml on the server
├── .env.example                       ← template — copy to /opt/boyzera/.env and fill
├── nginx/
│   └── api.boyzera.com.conf           ← reverse proxy → 127.0.0.1:5001
└── scripts/
    └── bootstrap-server.sh            ← one-shot server provisioning
```

The backend Dockerfile lives at `../Dockerfile` (repo root of `boyzera-backend`, multi-stage).

> **Important:** this directory (`deploy/`) and the Dockerfile live inside the `boyzera-backend` repo, **not** in the parent monorepo. Git operations here run against `github.com/felipemarques-rec/boyzera-backend`.

---

## Before the first commit (clean up tracked secrets)

The current `boyzera-backend` repo has `.env` **tracked in git** (it shows up as modified, not ignored). Before pushing any of the deploy artifacts, untrack it so the new `.gitignore` rule sticks:

```bash
cd apps/backend
git rm --cached .env
# Optionally also: git rm --cached .env.example if it ever gets committed
git add .gitignore Dockerfile .dockerignore docker-entrypoint.sh deploy .github
git commit -m "infra: containerize backend and add CI/CD to EC2"
git push origin main
```

> **Past commits still contain the leaked `.env`.** Treat `JWT_SECRET`, `TELEGRAM_BOT_TOKEN`, and `POSTGRES_PASSWORD` from the dev `.env` as **compromised** — rotate them before exposing the server publicly. To purge from history later: `git filter-repo --path .env --invert-paths` (destructive, requires force-push and coordinated with anyone else who cloned).

---

## Initial server bootstrap (one-time)

From your workstation:
```bash
chmod 400 '/mnt/c/Users/Felipe Marques/Downloads/projetoboy.pem'
scp -i '/mnt/c/Users/Felipe Marques/Downloads/projetoboy.pem' \
    -r deploy ubuntu@3.216.123.215:/tmp/
ssh -i '/mnt/c/Users/Felipe Marques/Downloads/projetoboy.pem' ubuntu@3.216.123.215
```

On the server:
```bash
cd /tmp/deploy
./scripts/bootstrap-server.sh        # installs docker, nginx, certbot, ufw
exit                                  # log out so docker group takes effect
```

Reconnect, then:
```bash
# 1) Place compose + env in /opt/boyzera
cp /tmp/deploy/docker-compose.prod.yml /opt/boyzera/
cp /tmp/deploy/.env.example            /opt/boyzera/.env
nano /opt/boyzera/.env                  # fill real values (see "Env vars" below)

# 2) Authenticate with GHCR (PAT with `read:packages` scope)
echo "<YOUR_GHCR_PAT>" | docker login ghcr.io -u <github-user> --password-stdin

# 3) Issue TLS cert (after DNS A-record points to the EC2 IP)
sudo certbot --nginx -d api.boyzera.com \
  -m felipe@mydatagent.ai --agree-tos --redirect --non-interactive

# 4) First boot
cd /opt/boyzera
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Env vars (`/opt/boyzera/.env`)

Substitutions from the dev `.env`:
| Key | Dev value (Render) | Server value (Docker network) |
|---|---|---|
| `POSTGRES_HOST` | `dpg-d5e39615pdvs73eh247g-a` | `postgres` |
| `REDIS_HOST` | `red-d5e3b6je5dus73bnlveg` | `redis` |
| `NODE_ENV` | — | `production` |
| `IMAGE_OWNER` | — | `<github-user-lowercase>` (set by CI) |
| `IMAGE_TAG` | — | `latest` initially, overwritten by CI per-deploy |

**Must rotate before any real traffic** (these are leaked in dev / previous infra):
- `JWT_SECRET` — generate with `openssl rand -base64 48`
- `TELEGRAM_BOT_TOKEN` — re-issue via @BotFather
- `POSTGRES_PASSWORD` — pick a fresh value, set the same value in `.env` and on first DB init (or recreate volume)

Other keys (game config, rate limit, SMTP) carry over verbatim from the dev `.env`.

---

## GitHub Actions setup

Repository → Settings → Secrets and variables → Actions → New secret:
| Secret | Value |
|---|---|
| `DEPLOY_HOST` | `3.216.123.215` |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_KEY` | Private key (ed25519) of a CI-dedicated keypair. Add the matching **public** key to `~ubuntu/.ssh/authorized_keys` on the EC2 |

The workflow `.github/workflows/deploy-backend.yml` triggers on every push to `main` (excluding Markdown-only changes), builds a `linux/amd64` image, pushes to `ghcr.io/<owner>/boyzera-backend:<sha>` (and `:latest`), then SSHes into the server and runs `docker compose pull && up -d`.

For GHCR pulls **on the server**, generate a Personal Access Token (classic) with `read:packages` and log in once (`docker login ghcr.io ...`) — credentials are cached in `~/.docker/config.json` and survive reboots.

---

## Day-2 ops

- **View logs:** `docker compose -f /opt/boyzera/docker-compose.prod.yml logs --tail=200 -f backend`
- **Restart backend only:** `docker compose -f /opt/boyzera/docker-compose.prod.yml up -d --force-recreate backend`
- **Migrations (manual):** `docker compose -f /opt/boyzera/docker-compose.prod.yml exec backend npm run migration:run:prod`
- **DB shell:** `docker compose -f /opt/boyzera/docker-compose.prod.yml exec postgres psql -U boyzera -d boyzera`
- **Backup (run from `/opt/boyzera`):**
  ```bash
  docker compose -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "backup-$(date +%F).sql.gz"
  ```
- **Renew cert (auto):** `systemctl status certbot.timer` — Ubuntu's systemd timer handles it.

---

## Verification checklist

After everything is up:
- [ ] `curl -I https://api.boyzera.com/` returns a valid response (HTTP/2, valid TLS).
- [ ] `docker compose -f /opt/boyzera/docker-compose.prod.yml ps` shows `postgres` healthy and `backend` running.
- [ ] `nc -zv 3.216.123.215 5432` from outside **times out** (Postgres not exposed).
- [ ] `nc -zv 3.216.123.215 6379` from outside **times out** (Redis not exposed).
- [ ] `nc -zv 3.216.123.215 5001` from outside **times out** (backend bound only to loopback).
- [ ] A push to `main` (e.g., `git commit --allow-empty -m "ci: kick" && git push`) triggers the workflow and the new image is live on the server within ~5 minutes.

---

## Notes / known limitations

- Pull-based deploy via SSH — simple and works without an agent. If you want zero-downtime rolling deploys later, add a second backend replica and a Nginx upstream block.
- No automated DB backups yet — add `pg_dump` to cron once real data starts flowing.
- Migrations run automatically on container start (`docker-entrypoint.sh`). If a migration fails, the container will crash-loop — read `docker compose logs backend` to diagnose, fix the migration in code, redeploy.
- This setup expects an `amd64` EC2 (the default for `t3` / `m5` / etc.). If you ever switch to Graviton (ARM64), update `platforms:` in `.github/workflows/deploy-backend.yml`.
