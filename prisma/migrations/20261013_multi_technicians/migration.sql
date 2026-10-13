-- CreateTable
CREATE TABLE IF NOT EXISTS "ticket_technician_maps" (
    "ticket_id" TEXT NOT NULL,
    "technician_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_technician_maps_pkey" PRIMARY KEY ("ticket_id","technician_id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_ticket_technician_maps_technician_id" ON "ticket_technician_maps"("technician_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ticket_technician_maps_ticket_id_fkey'
    ) THEN
        ALTER TABLE "ticket_technician_maps" ADD CONSTRAINT "ticket_technician_maps_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("ticket_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ticket_technician_maps_technician_id_fkey'
    ) THEN
        ALTER TABLE "ticket_technician_maps" ADD CONSTRAINT "ticket_technician_maps_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
