-- 1. Migrate ticket references from sequence_in_system to equipment_code
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "equipment_code" TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'equipment_id'
    ) THEN
        UPDATE "tickets" t
        SET "equipment_code" = e."equipment_code"
        FROM "equipments" e
        WHERE t."equipment_id" = e."sequence_in_system";
    END IF;
END $$;

-- 2. Drop old foreign key constraint from tickets to equipments
ALTER TABLE "tickets" DROP CONSTRAINT IF EXISTS "tickets_equipment_id_fkey";

-- 3. Drop column equipment_id from tickets
ALTER TABLE "tickets" DROP COLUMN IF EXISTS "equipment_id";

-- 4. Drop target_sla_date from tickets
ALTER TABLE "tickets" DROP COLUMN IF EXISTS "target_sla_date";

-- 5. Drop old primary key on equipments(sequence_in_system)
ALTER TABLE "equipments" DROP CONSTRAINT IF EXISTS "equipments_pkey";

-- 6. Drop column sequence_in_system from equipments
ALTER TABLE "equipments" DROP COLUMN IF EXISTS "sequence_in_system";

-- 7. Add primary key on equipments(equipment_code)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'equipments_pkey'
    ) THEN
        ALTER TABLE "equipments" ADD CONSTRAINT "equipments_pkey" PRIMARY KEY ("equipment_code");
    END IF;
END $$;

-- 8. Add foreign key from tickets(equipment_code) to equipments(equipment_code)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tickets_equipment_code_fkey'
    ) THEN
        ALTER TABLE "tickets" ADD CONSTRAINT "tickets_equipment_code_fkey" 
          FOREIGN KEY ("equipment_code") REFERENCES "equipments"("equipment_code") 
          ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
