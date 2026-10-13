-- Migration: 20261013_equipment_status_table
-- Purpose: Extract equipmentStatus column into dedicated equipment_statuses table (PK: equipment_status_id, name)
-- Safely migrate existing equipment_status strings to relational foreign keys.

-- 1. Create equipment_statuses table
CREATE TABLE IF NOT EXISTS "equipment_statuses" (
    "equipment_status_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "equipment_statuses_pkey" PRIMARY KEY ("equipment_status_id")
);

-- Unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS "equipment_statuses_name_key" ON "equipment_statuses"("name");

-- 2. Add status_id column to equipments if not exists
ALTER TABLE "equipments" ADD COLUMN IF NOT EXISTS "status_id" TEXT;

-- 3. Populate equipment_statuses with seed/distinct statuses from equipments
INSERT INTO "equipment_statuses" ("equipment_status_id", "name")
VALUES
  ('eq_status_normal', 'ใช้งานได้ปกติ'),
  ('eq_status_damaged', 'ชำรุดรอซ่อม')
ON CONFLICT ("name") DO NOTHING;

-- If equipments currently has string equipment_status column, migrate data into equipment_statuses
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'equipments' AND column_name = 'equipment_status'
  ) THEN
    -- Insert any additional distinct status names from equipments
    INSERT INTO "equipment_statuses" ("equipment_status_id", "name")
    SELECT 'eq_status_' || md5(equipment_status), equipment_status
    FROM "equipments"
    WHERE "equipment_status" IS NOT NULL
    ON CONFLICT ("name") DO NOTHING;

    -- Update equipments.status_id based on matched name
    UPDATE "equipments" e
    SET "status_id" = es."equipment_status_id"
    FROM "equipment_statuses" es
    WHERE e."equipment_status" = es."name" AND e."status_id" IS NULL;

    -- Drop old equipment_status column
    ALTER TABLE "equipments" DROP COLUMN "equipment_status";
  END IF;
END $$;

-- 4. Set fallback default status for any unassigned equipment
UPDATE "equipments"
SET "status_id" = 'eq_status_normal'
WHERE "status_id" IS NULL;

-- 5. Add foreign key constraint from equipments.status_id to equipment_statuses.equipment_status_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'equipments_status_id_fkey'
  ) THEN
    ALTER TABLE "equipments"
    ADD CONSTRAINT "equipments_status_id_fkey"
    FOREIGN KEY ("status_id") REFERENCES "equipment_statuses"("equipment_status_id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
