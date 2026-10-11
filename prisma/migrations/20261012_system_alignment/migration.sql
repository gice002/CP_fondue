-- Migration: 20261012_system_alignment
-- Purpose: Safely align database schema with Business Rules (BR1 - BR12) and System Requirements
-- All changes are strictly additive and non-destructive.

-- AlterTable users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'REPORTER';

-- AlterTable locations
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "building" TEXT NOT NULL DEFAULT 'CP-01 อาคารวิทยวิภาส';

-- AlterTable tickets
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "ticket_number" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "tickets_ticket_number_key" ON "tickets"("ticket_number");
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "urgency" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "location_detail" TEXT;
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "admin_notes" TEXT;
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "repair_notes" TEXT;
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "target_sla_date" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3);
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "assigned_technician_id" TEXT;
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "location_id" TEXT;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_assigned_technician_id_fkey') THEN
    ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_technician_id_fkey" 
      FOREIGN KEY ("assigned_technician_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_location_id_fkey') THEN
    ALTER TABLE "tickets" ADD CONSTRAINT "tickets_location_id_fkey" 
      FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AlterTable ticket_attachments
ALTER TABLE "ticket_attachments" ADD COLUMN IF NOT EXISTS "phase" TEXT NOT NULL DEFAULT 'BEFORE_REPAIR';
ALTER TABLE "ticket_attachments" ADD COLUMN IF NOT EXISTS "caption" TEXT;
ALTER TABLE "ticket_attachments" ADD COLUMN IF NOT EXISTS "file_name" TEXT;

-- AlterTable spare_part_inventories
ALTER TABLE "spare_part_inventories" ADD COLUMN IF NOT EXISTS "part_code" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "spare_part_inventories_part_code_key" ON "spare_part_inventories"("part_code");
ALTER TABLE "spare_part_inventories" ADD COLUMN IF NOT EXISTS "unit" TEXT NOT NULL DEFAULT 'ชิ้น';
ALTER TABLE "spare_part_inventories" ADD COLUMN IF NOT EXISTS "unit_cost" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "spare_part_inventories" ADD COLUMN IF NOT EXISTS "storage_room" TEXT;

-- AlterTable spare_part_requisitions
ALTER TABLE "spare_part_requisitions" ADD COLUMN IF NOT EXISTS "requisition_number" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "spare_part_requisitions_requisition_number_key" ON "spare_part_requisitions"("requisition_number");
ALTER TABLE "spare_part_requisitions" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "spare_part_requisitions" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3);
ALTER TABLE "spare_part_requisitions" ADD COLUMN IF NOT EXISTS "approved_by_user_id" TEXT;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spare_part_requisitions_approved_by_user_id_fkey') THEN
    ALTER TABLE "spare_part_requisitions" ADD CONSTRAINT "spare_part_requisitions_approved_by_user_id_fkey" 
      FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AlterTable evaluations
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "evaluator_user_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "evaluations_ticket_id_key" ON "evaluations"("ticket_id");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'evaluations_evaluator_user_id_fkey') THEN
    ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluator_user_id_fkey" 
      FOREIGN KEY ("evaluator_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
