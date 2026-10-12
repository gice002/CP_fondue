import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning and Resetting Database ---');

  // 1. Delete all transactional and operational data
  console.log('1. Deleting evaluations, tag maps, attachments, status histories, requisitions, audit logs, and tickets...');
  await prisma.evaluation.deleteMany();
  await prisma.ticketTagMap.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticketStatusHistory.deleteMany();
  await prisma.sparePartStatusHistory.deleteMany();
  await prisma.sparePartRequisition.deleteMany();
  await prisma.emailNotificationLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ticket.deleteMany();

  // 2. Reset equipment statuses
  console.log('2. Resetting equipment statuses to default...');
  await prisma.equipment.updateMany({
    data: { equipmentStatus: 'ปกติ' },
  });

  // Mark equipments for assigned/in-progress tickets as 'ชำรุดรอซ่อม'
  await prisma.equipment.updateMany({
    where: { id: { in: ['eq_01', 'eq_02', 'eq_03'] } },
    data: { equipmentStatus: 'ชำรุดรอซ่อม' },
  });

  // 3. Reset spare parts inventory quantities
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

  // 4. Ensure standard reference tags exist
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

  const tagUrgent = await prisma.tag.findUnique({ where: { tagName: 'งานเร่งด่วน' } });
  const tagFast = await prisma.tag.findUnique({ where: { tagName: 'งานเร่ง' } });
  const tagNecessary = await prisma.tag.findUnique({ where: { tagName: 'งานจำเป็น' } });
  const tagGeneral = await prisma.tag.findUnique({ where: { tagName: 'งานทั่วไป' } });

  // 5. Seed clean initial sample tickets
  console.log('4. Seeding clean set of representative tickets...');

  // Ticket 1: REQ-202610-0001 (PENDING_DISPATCH)
  const tkt0 = await prisma.ticket.create({
    data: {
      id: 'tkt_0001',
      ticketNumber: 'REQ-202610-0001',
      problemDescription: 'เครื่องคอมพิวเตอร์ Workstation เปิดไม่ติด พาวเวอร์ซัพพลายไม่มีไฟเข้า มีเสียงเตือน Beep code ตอนเปิด',
      currentStatus: 'PENDING_DISPATCH',
      urgency: 'URGENT',
      reporterUserId: 'usr_reporter_01',
      locationId: 'loc_03',
      equipmentId: 'eq_01',
      categoryId: 'cat_01',
      attachments: {
        create: [
          {
            filePath: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
            fileName: 'workstation_power_issue.jpg',
            fileType: 'image/jpeg',
            phase: 'BEFORE_REPAIR',
            caption: 'ไฟสถานะหน้าเครื่องไม่ติด พัดลมหมุนเบาๆ',
          },
        ],
      },
      statusHistories: {
        create: [
          {
            oldStatus: null,
            newStatus: 'PENDING_DISPATCH',
            changedByUserId: 'usr_reporter_01',
            ticketNotes: 'ผู้แจ้งส่งคำร้องผ่านระบบออนไลน์ (BR2, BR3)',
          },
        ],
      },
    },
  });
  if (tagNecessary) {
    await prisma.ticketTagMap.create({
      data: { ticketId: tkt0.id, tagId: tagNecessary.id },
    });
  }

  // Ticket 2: REQ-202505-0042 (ASSIGNED to usr_tech_01)
  const tkt1 = await prisma.ticket.create({
    data: {
      id: 'tkt_0042',
      ticketNumber: 'REQ-202505-0042',
      problemDescription: 'พอร์ต LAN เสียหมายเลข 14-16 เสียบสายแล้วไม่ติดไฟสัญญาณ ไฟเบอร์ลิงก์ห้องเซิร์ฟเวอร์สวิง',
      currentStatus: 'ASSIGNED',
      urgency: 'CRITICAL',
      reporterUserId: 'usr_reporter_01',
      assignedTechnicianId: 'usr_tech_01',
      locationId: 'loc_04',
      equipmentId: 'eq_02',
      categoryId: 'cat_01',
      adminNotes: 'มอบหมายช่างอนุชา ตรวจสอบพอร์ตสวิตช์ด่วน',
      targetSlaDate: new Date(Date.now() + 4 * 3600 * 1000),
      attachments: {
        create: [
          {
            filePath: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
            fileName: 'damage_switch_port.jpg',
            fileType: 'image/jpeg',
            phase: 'BEFORE_REPAIR',
            caption: 'สภาพไฟพอร์ต LAN หมายเลข 14-16 ดับ',
          },
        ],
      },
      statusHistories: {
        create: [
          {
            oldStatus: null,
            newStatus: 'PENDING_DISPATCH',
            changedByUserId: 'usr_reporter_01',
            ticketNotes: 'แจ้งคำร้องผ่านระบบออนไลน์',
          },
          {
            oldStatus: 'PENDING_DISPATCH',
            newStatus: 'ASSIGNED',
            changedByUserId: 'usr_admin_01',
            ticketNotes: 'เจ้าหน้าที่จ่ายงานให้ช่างอนุชา พงษ์ศิริ (BR4)',
          },
        ],
      },
    },
  });
  if (tagUrgent) {
    await prisma.ticketTagMap.create({
      data: { ticketId: tkt1.id, tagId: tagUrgent.id },
    });
  }

  // Ticket 3: REQ-202505-0038 (IN_PROGRESS by usr_tech_02)
  const tkt2 = await prisma.ticket.create({
    data: {
      id: 'tkt_0038',
      ticketNumber: 'REQ-202505-0038',
      problemDescription: 'เครื่องปรับอากาศรั่ว น้ำหยดลงโต๊ะทำงานอาจารย์และอุปกรณ์คอมพิวเตอร์',
      currentStatus: 'IN_PROGRESS',
      urgency: 'URGENT',
      reporterUserId: 'usr_reporter_01',
      assignedTechnicianId: 'usr_tech_02',
      locationId: 'loc_02',
      equipmentId: 'eq_03',
      categoryId: 'cat_02',
      adminNotes: 'แอร์มีน้ำรั่วส่งช่างสมศักดิ์เข้าตรวจสอบหน้างาน',
      targetSlaDate: new Date(Date.now() + 8 * 3600 * 1000),
      attachments: {
        create: [
          {
            filePath: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
            fileName: 'ac_water_leak.jpg',
            fileType: 'image/jpeg',
            phase: 'BEFORE_REPAIR',
            caption: 'น้ำหยดจากเครื่องปรับอากาศลงโต๊ะทำงาน',
          },
        ],
      },
      statusHistories: {
        create: [
          {
            oldStatus: null,
            newStatus: 'PENDING_DISPATCH',
            changedByUserId: 'usr_reporter_01',
            ticketNotes: 'ส่งคำร้องแอร์น้ำรั่ว',
          },
          {
            oldStatus: 'PENDING_DISPATCH',
            newStatus: 'ASSIGNED',
            changedByUserId: 'usr_admin_01',
            ticketNotes: 'จ่ายงานให้ช่างสมศักดิ์',
          },
          {
            oldStatus: 'ASSIGNED',
            newStatus: 'IN_PROGRESS',
            changedByUserId: 'usr_tech_02',
            ticketNotes: 'ช่างสมศักดิ์กดรับงานและกำลังเข้าตรวจเช็ค (BR5, BR6)',
          },
        ],
      },
    },
  });
  if (tagFast) {
    await prisma.ticketTagMap.create({
      data: { ticketId: tkt2.id, tagId: tagFast.id },
    });
  }

  // Ticket 4: REQ-202505-0031 (COMPLETED by usr_tech_03)
  const tkt3 = await prisma.ticket.create({
    data: {
      id: 'tkt_0031',
      ticketNumber: 'REQ-202505-0031',
      problemDescription: 'จอโปรเจกเตอร์สีเพี้ยนเป็นโทนสีม่วง สายสัญญาณ HDMI ติดๆ ดับๆ',
      currentStatus: 'COMPLETED',
      urgency: 'NORMAL',
      reporterUserId: 'usr_reporter_01',
      assignedTechnicianId: 'usr_tech_03',
      locationId: 'loc_01',
      equipmentId: 'eq_04',
      categoryId: 'cat_03',
      repairNotes: 'เปลี่ยนสายสัญญาณ HDMI เส้นใหม่ 5 เมตร และตั้งค่า Color Matrix บนโปรเจกเตอร์เรียบร้อย',
      completedAt: new Date(),
      attachments: {
        create: [
          {
            filePath: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=600',
            fileName: 'proof_after.jpg',
            fileType: 'image/jpeg',
            phase: 'AFTER_REPAIR',
            caption: 'ภาพหลังเปลี่ยนสาย HDMI จอแสดงผลสีปกติ (BR8)',
          },
        ],
      },
      statusHistories: {
        create: [
          {
            oldStatus: null,
            newStatus: 'PENDING_DISPATCH',
            changedByUserId: 'usr_reporter_01',
            ticketNotes: 'ส่งคำร้อง',
          },
          {
            oldStatus: 'PENDING_DISPATCH',
            newStatus: 'ASSIGNED',
            changedByUserId: 'usr_admin_01',
            ticketNotes: 'จ่ายงานให้ช่างธนกฤต',
          },
          {
            oldStatus: 'ASSIGNED',
            newStatus: 'IN_PROGRESS',
            changedByUserId: 'usr_tech_03',
            ticketNotes: 'ช่างธนกฤตรับงาน',
          },
          {
            oldStatus: 'IN_PROGRESS',
            newStatus: 'COMPLETED',
            changedByUserId: 'usr_tech_03',
            ticketNotes: 'ปิดงานซ่อมเรียบร้อย (BR8, BR9)',
          },
        ],
      },
      evaluation: {
        create: {
          ratingScore: 5,
          feedback: 'ช่างเข้ามาตรวจเร็วมากตามเวลากำหนด ตรวจเช็คสายสัญญาณ HDMI สำรองให้ด้วย ประทับใจการบริการครับ',
          evaluatorUserId: 'usr_reporter_01',
        },
      },
    },
  });
  if (tagGeneral) {
    await prisma.ticketTagMap.create({
      data: { ticketId: tkt3.id, tagId: tagGeneral.id },
    });
  }

  // 6. Create sample material requisition for Admin to approve
  const { SparePartService } = await import('../services/sparePartService');
  await SparePartService.createRequisition({
    ticketId: tkt2.id,
    technicianId: 'usr_tech_02',
    items: [{ partId: 'prt_03', quantity: 1 }],
    notes: 'ขอเบิกท่อน้ำทิ้งแอร์ PVC เพื่อเปลี่ยนเนื่องจากท่อเดิมกรอบแตก',
  });

  console.log('Database successfully cleaned and reset with clean initial records!');
}

main()
  .catch((e) => {
    console.error('Error during reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
