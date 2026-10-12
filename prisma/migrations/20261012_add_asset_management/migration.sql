-- Migration: 20261012_add_asset_management
-- Purpose: Add AssetStatus, Asset, and AssetStatusHistory tables with strict audit retention

-- CreateTable asset_statuses
CREATE TABLE IF NOT EXISTS "asset_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "asset_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable assets
CREATE TABLE IF NOT EXISTS "assets" (
    "id" SERIAL NOT NULL,
    "asset_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status_id" INTEGER NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable asset_status_histories
CREATE TABLE IF NOT EXISTS "asset_status_histories" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "old_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "asset_statuses_name_key" ON "asset_statuses"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "assets_asset_code_key" ON "assets"("asset_code");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assets_status_id_fkey') THEN
    ALTER TABLE "assets" ADD CONSTRAINT "assets_status_id_fkey" 
      FOREIGN KEY ("status_id") REFERENCES "asset_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asset_status_histories_asset_id_fkey') THEN
    ALTER TABLE "asset_status_histories" ADD CONSTRAINT "asset_status_histories_asset_id_fkey" 
      FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'asset_status_histories_changed_by_id_fkey') THEN
    ALTER TABLE "asset_status_histories" ADD CONSTRAINT "asset_status_histories_changed_by_id_fkey" 
      FOREIGN KEY ("changed_by_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
