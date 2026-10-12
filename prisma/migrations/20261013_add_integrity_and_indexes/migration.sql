-- Migration: Add Database-Level Check Constraints and Performance Indexes
-- Generated for Review - DO NOT EXECUTE DIRECTLY AGAINST PRODUCTION OR UNVERIFIED DATABASES

-- 1. Check Constraint to guarantee stock quantity can never drop below zero at the DB engine level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_spare_part_stock_non_negative'
  ) THEN
    ALTER TABLE "spare_part_inventories"
    ADD CONSTRAINT "check_spare_part_stock_non_negative"
    CHECK ("stock_quantity" >= 0);
  END IF;
END $$;

-- 2. Indexes on foreign keys and frequently queried filter/sort columns
CREATE INDEX IF NOT EXISTS "idx_tickets_current_status" ON "tickets" ("current_status");
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned_technician_id" ON "tickets" ("assigned_technician_id");
CREATE INDEX IF NOT EXISTS "idx_tickets_reporter_user_id" ON "tickets" ("reporter_user_id");
CREATE INDEX IF NOT EXISTS "idx_tickets_created_at_desc" ON "tickets" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_tickets_status_tech" ON "tickets" ("assigned_technician_id", "current_status");

-- 3. Composite index on status histories for fast timeline retrieval
CREATE INDEX IF NOT EXISTS "idx_ticket_status_histories_ticket_id_changed_at" ON "ticket_status_histories" ("ticket_id", "changed_at" ASC);

-- 4. Audit Log indexes for fast filtering by table, command, and timestamp
CREATE INDEX IF NOT EXISTS "idx_audit_logs_table_changed_at" ON "audit_logs" ("table_name", "changed_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" ("user_id");

-- 5. Spare Part Requisition indexes
CREATE INDEX IF NOT EXISTS "idx_spare_part_requisitions_ticket_id" ON "spare_part_requisitions" ("ticket_id");
CREATE INDEX IF NOT EXISTS "idx_spare_part_requisitions_status" ON "spare_part_requisitions" ("status");
