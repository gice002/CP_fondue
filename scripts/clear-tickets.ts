import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning and Resetting Database to Clean Slate ---');

  // 1. Delete all transactional, audit, and operational data
  console.log('1. Deleting evaluations, tag maps, attachments, status histories, requisitions, notifications, audit logs, and tickets...');
  await prisma.evaluation.deleteMany();
  await prisma.ticketTechnicianMap.deleteMany();
  await prisma.ticketTagMap.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticketStatusHistory.deleteMany();
  await prisma.sparePartStatusHistory.deleteMany();
  await prisma.sparePartRequisition.deleteMany();
  await prisma.emailNotificationLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ticket.deleteMany();

  // 2. Ensure equipment statuses exist and reset equipment to operational
  console.log('2. Resetting equipment statuses to default operational (ใช้งานได้ปกติ)...');
  let eqStatusNormal = await prisma.equipmentStatus.findUnique({ where: { name: 'ใช้งานได้ปกติ' } });
  if (!eqStatusNormal) {
    eqStatusNormal = await prisma.equipmentStatus.create({ data: { name: 'ใช้งานได้ปกติ' } });
  }

  let eqStatusDamaged = await prisma.equipmentStatus.findUnique({ where: { name: 'ชำรุดรอซ่อม' } });
  if (!eqStatusDamaged) {
    eqStatusDamaged = await prisma.equipmentStatus.create({ data: { name: 'ชำรุดรอซ่อม' } });
  }

  await prisma.equipment.updateMany({
    data: { statusId: eqStatusNormal.id },
  });

  // 3. Reset spare parts inventory quantities to initial stock
  console.log('3. Resetting spare parts inventory stock levels...');
  const initialStocks: Record<string, number> = {
    prt_01: 50,
    prt_02: 35,
    prt_03: 20,
    prt_04: 15,
    prt_05: 10,
    prt_06: 25,
  };
  for (const [id, stockQuantity] of Object.entries(initialStocks)) {
    await prisma.sparePartInventory.updateMany({
      where: { id },
      data: { stockQuantity },
    });
  }

  // 4. Ensure standard reference priority tags exist
  console.log('4. Verifying standard tags...');
  const standardTags = [
    { id: 'tag_01', tagName: 'งานเร่งด่วน' },
    { id: 'tag_02', tagName: 'งานเร่ง' },
    { id: 'tag_03', tagName: 'งานจำเป็น' },
    { id: 'tag_04', tagName: 'งานทั่วไป' },
    { id: 'tag_05', tagName: 'งานที่ต้องรออุปกรณ์' },
  ];
  for (const tg of standardTags) {
    await prisma.tag.upsert({
      where: { tagName: tg.tagName },
      update: {},
      create: tg,
    });
  }

  console.log('Database successfully cleared! All tickets and evaluations wiped clean for fresh end-to-end testing.');
}

main()
  .catch((e) => {
    console.error('Error during database wipe:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
