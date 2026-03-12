import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHypeAndItemsTables1710288000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new columns to users table
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "hype" float NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "dailyEngagement" float NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "daysMissed" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "lastHypeCalculation" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "lastDailyAwardDate" TIMESTAMP
    `);

    // 2. Create item_category enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."game_items_category_enum" AS ENUM(
          'vehicle_car', 'vehicle_motorcycle',
          'clothing_shirt', 'clothing_shorts', 'clothing_jacket', 'clothing_pants',
          'scenario'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Create item_rarity enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."game_items_rarity_enum" AS ENUM('common', 'rare', 'epic', 'legendary');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // 4. Create game_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "game_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "category" "public"."game_items_category_enum" NOT NULL,
        "rarity" "public"."game_items_rarity_enum" NOT NULL DEFAULT 'common',
        "requiredFollowers" bigint NOT NULL DEFAULT 0,
        "engagementBonus" float NOT NULL DEFAULT 0,
        "followersPerHourBonus" float NOT NULL DEFAULT 0,
        "imageUrl" character varying,
        "thumbnailUrl" character varying,
        "brand" character varying,
        "model" character varying,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_game_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_game_items_category" ON "game_items" ("category")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_game_items_requiredFollowers" ON "game_items" ("requiredFollowers")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_game_items_isActive" ON "game_items" ("isActive")`);

    // 5. Create user_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "itemId" uuid NOT NULL,
        "isEquipped" boolean NOT NULL DEFAULT false,
        "unlockedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_items" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_items_userId_itemId" UNIQUE ("userId", "itemId"),
        CONSTRAINT "FK_user_items_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_items_itemId" FOREIGN KEY ("itemId") REFERENCES "game_items"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_items_userId_isEquipped" ON "user_items" ("userId", "isEquipped")`);

    // 6. Create hype_configs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hype_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "version" character varying NOT NULL,
        "beta" float NOT NULL DEFAULT 0.15,
        "gamma" float NOT NULL DEFAULT 1.2,
        "maxStreakBonus" float NOT NULL DEFAULT 0.20,
        "minDailyGain" float NOT NULL DEFAULT 0.005,
        "decayLight" float NOT NULL DEFAULT 0.03,
        "decayNormal" float NOT NULL DEFAULT 0.05,
        "decayHeavy" float NOT NULL DEFAULT 0.07,
        "minEngagementThreshold" float NOT NULL DEFAULT 0.3,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hype_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_hype_configs_version" UNIQUE ("version")
      )
    `);

    // 7. Create daily_award_configs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "daily_award_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "version" character varying NOT NULL,
        "alpha" float NOT NULL DEFAULT 0.7,
        "beta" float NOT NULL DEFAULT 0.15,
        "gamma" float NOT NULL DEFAULT 1.4,
        "maxStreakBonus" float NOT NULL DEFAULT 0.5,
        "minDailyGain" bigint NOT NULL DEFAULT 1,
        "maxDailyGain" bigint NOT NULL DEFAULT 1000000,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_daily_award_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_daily_award_configs_version" UNIQUE ("version")
      )
    `);

    // 8. Ensure uuid-ossp extension exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "game_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hype_configs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "daily_award_configs"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."game_items_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."game_items_rarity_enum"`);
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "hype",
        DROP COLUMN IF EXISTS "dailyEngagement",
        DROP COLUMN IF EXISTS "daysMissed",
        DROP COLUMN IF EXISTS "lastHypeCalculation",
        DROP COLUMN IF EXISTS "lastDailyAwardDate"
    `);
  }
}
