#!/usr/bin/env bash
# Bootstrap the EC2 (Ubuntu 22.04 / 24.04 / 25.04) to host the BoyZera backend stack.
#
# Run ONCE on a fresh instance, as user `ubuntu`:
#   chmod +x bootstrap-server.sh
#   ./bootstrap-server.sh
#
# Idempotent: safe to re-run if a step fails.

set -euo pipefail

log()  { printf '\n\033[1;32m[bootstrap]\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m[bootstrap]\033[0m %s\n' "$*" >&2; }

if [ "$(id -u)" -eq 0 ]; then
  warn "Run as the 'ubuntu' user (with sudo), not as root."
  exit 1
fi

# -----------------------------------------------------------------------------
log "1/8 — apt update & upgrade"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# -----------------------------------------------------------------------------
log "2/8 — base packages (curl, ca-certs, gnupg, ufw, nginx, certbot)"
sudo apt-get install -y \
  curl ca-certificates gnupg lsb-release \
  ufw nginx certbot python3-certbot-nginx \
  jq unattended-upgrades

# -----------------------------------------------------------------------------
log "3/8 — Docker Engine + Compose plugin"
if ! command -v docker >/dev/null 2>&1; then
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  CODENAME="$(. /etc/os-release && echo "${VERSION_CODENAME:-jammy}")"
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu ${CODENAME} stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin
else
  log "Docker already installed: $(docker --version)"
fi

if ! id -nG ubuntu | grep -qw docker; then
  log "Adding 'ubuntu' to docker group — relogin required for it to take effect"
  sudo usermod -aG docker ubuntu
fi

# -----------------------------------------------------------------------------
log "4/8 — UFW firewall (allow 22, 80, 443)"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status

# -----------------------------------------------------------------------------
log "5/8 — deploy directory /opt/boyzera"
sudo mkdir -p /opt/boyzera
sudo chown ubuntu:ubuntu /opt/boyzera

# -----------------------------------------------------------------------------
log "6/8 — Nginx site (api.boyzera.com)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_SRC="${SCRIPT_DIR}/../nginx/api.boyzera.com.conf"
if [ -f "${NGINX_SRC}" ]; then
  sudo cp "${NGINX_SRC}" /etc/nginx/sites-available/api.boyzera.com.conf
  sudo ln -sf /etc/nginx/sites-available/api.boyzera.com.conf \
             /etc/nginx/sites-enabled/api.boyzera.com.conf
  # Disable the default welcome page (only if present).
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl reload nginx
else
  warn "Nginx config not found at ${NGINX_SRC} — copy it manually before reloading nginx."
fi

# -----------------------------------------------------------------------------
log "7/8 — unattended-upgrades"
sudo dpkg-reconfigure -f noninteractive unattended-upgrades

# -----------------------------------------------------------------------------
log "8/8 — summary"
cat <<EOF

Bootstrap complete. Next steps (manual):

  1. Log out and back in (or run: newgrp docker) so 'ubuntu' picks up docker group.

  2. Point DNS A record:
       api.boyzera.com  ->  3.216.123.215
     Verify: dig +short api.boyzera.com

  3. Issue TLS certificate (once DNS resolves):
       sudo certbot --nginx -d api.boyzera.com \\
         -m felipe@mydatagent.ai --agree-tos --redirect --non-interactive

  4. Copy deploy/docker-compose.prod.yml and deploy/.env.example to /opt/boyzera:
       scp deploy/docker-compose.prod.yml ubuntu@HOST:/opt/boyzera/docker-compose.prod.yml
       scp deploy/.env.example            ubuntu@HOST:/opt/boyzera/.env
     Then edit /opt/boyzera/.env with REAL secrets.

  5. Log in to GHCR on the server (use a PAT with read:packages scope):
       echo \$GHCR_PAT | docker login ghcr.io -u <your-github-user> --password-stdin

  6. First boot:
       cd /opt/boyzera
       docker compose -f docker-compose.prod.yml pull
       docker compose -f docker-compose.prod.yml up -d
       docker compose -f docker-compose.prod.yml logs -f backend

  7. Configure GitHub secrets on the repo:
       DEPLOY_HOST = 3.216.123.215
       DEPLOY_USER = ubuntu
       DEPLOY_SSH_KEY = <private key for a CI-only key pair you added to ~/.ssh/authorized_keys>

EOF
