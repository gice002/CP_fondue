import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial reference data...');

  // 1. Departments
  const deptAdmin = await prisma.department.upsert({
    where: { id: 'dept_admin' },
    update: {},
    create: {
      id: 'dept_admin',
      departmentName: 'งานบริหารจัดการอาคารและเทคโนโลยี',
    },
  });

  const deptCS = await prisma.department.upsert({
    where: { id: 'dept_cs' },
    update: {},
    create: {
      id: 'dept_cs',
      departmentName: 'ภาควิชาวิทยาการคอมพิวเตอร์',
    },
  });

  const deptNet = await prisma.department.upsert({
    where: { id: 'dept_net' },
    update: {},
    create: {
      id: 'dept_net',
      departmentName: 'ฝ่ายเครือข่ายและการสื่อสาร CoP KKU',
    },
  });

  // 2. Positions
  const posReporter = await prisma.position.upsert({
    where: { id: 'pos_reporter' },
    update: {},
    create: { id: 'pos_reporter', positionName: 'อาจารย์ / บุคลากร' },
  });

  const posAdmin = await prisma.position.upsert({
    where: { id: 'pos_admin' },
    update: {},
    create: { id: 'pos_admin', positionName: 'เจ้าหน้าที่บริหารงานทั่วไป' },
  });

  const posTech = await prisma.position.upsert({
    where: { id: 'pos_tech' },
    update: {},
    create: { id: 'pos_tech', positionName: 'ช่างเทคนิคคอมพิวเตอร์และอาคาร' },
  });

  const posExec = await prisma.position.upsert({
    where: { id: 'pos_exec' },
    update: {},
    create: { id: 'pos_exec', positionName: 'รองคณบดีฝ่ายบริหารและโครงสร้างพื้นฐาน' },
  });

  // 3. Users
  const users = [
    {
      id: 'usr_reporter_01',
      firstName: 'สมชาย',
      lastName: 'เกียรติวิทยา',
      email: 'somchai.k@kkumail.com',
      phoneNumber: '089-765-4321',
      role: 'REPORTER',
      positionId: posReporter.id,
      departmentId: deptCS.id,
    },
    {
      id: 'usr_admin_01',
      firstName: 'จิราพร',
      lastName: 'สว่างเนตร',
      email: 'jiraporn.s@kkumail.com',
      phoneNumber: '043-009700 ต่อ 44444',
      role: 'ADMIN_DISPATCH',
      positionId: posAdmin.id,
      departmentId: deptAdmin.id,
    },
    {
      id: 'usr_tech_01',
      firstName: 'อนุชา',
      lastName: 'พงษ์ศิริ',
      email: 'anucha.p@kkumail.com',
      phoneNumber: '081-445-9988',
      role: 'TECHNICIAN',
      positionId: posTech.id,
      departmentId: deptNet.id,
    },
    {
      id: 'usr_tech_02',
      firstName: 'สมศักดิ์',
      lastName: 'ช่างทอง',
      email: 'somsak.c@kkumail.com',
      phoneNumber: '081-945-8821',
      role: 'TECHNICIAN',
      positionId: posTech.id,
      departmentId: deptAdmin.id,
    },
    {
      id: 'usr_tech_03',
      firstName: 'ธนกฤต',
      lastName: 'มั่งมี',
      email: 'thanakrit.m@kkumail.com',
      phoneNumber: '086-332-1100',
      role: 'TECHNICIAN',
      positionId: posTech.id,
      departmentId: deptNet.id,
    },
    {
      id: 'usr_exec_01',
      firstName: 'อานันท์',
      lastName: 'ชัยวิสุทธิ์',
      email: 'anan.c@kkumail.com',
      phoneNumber: '043-009700 ต่อ 44001',
      role: 'EXECUTIVE',
      positionId: posExec.id,
      departmentId: deptAdmin.id,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        phoneNumber: u.phoneNumber,
      },
      create: u,
    });
  }

  // 4. Locations
  const locations = [
    {
      id: 'loc_01',
      building: 'CP-01 อาคารวิทยวิภาส',
      floor: 'ชั้น 1',
      roomNumber: '101',
      roomName: 'ห้องสำนักงานคณบดีและธุรการ',
    },
    {
      id: 'loc_02',
      building: 'CP-01 อาคารวิทยวิภาส',
      floor: 'ชั้น 2',
      roomNumber: '202',
      roomName: 'ห้องบรรยาย Smart Classroom 202',
    },
    {
      id: 'loc_03',
      building: 'CP-01 อาคารวิทยวิภาส',
      floor: 'ชั้น 3',
      roomNumber: '304',
      roomName: 'Lab High-Performance Computing',
    },
    {
      id: 'loc_04',
      building: 'CP-02 อาคารศูนย์สารสนเทศ',
      floor: 'ชั้น 4',
      roomNumber: '405',
      roomName: 'Network Operation Center & Server Room',
    },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: loc,
      create: loc,
    });
  }

  // 5. Problem Categories
  const categories = [
    { id: 'cat_01', categoryName: 'ระบบคอมพิวเตอร์และเครือข่าย' },
    { id: 'cat_02', categoryName: 'ระบบปรับอากาศและการระบายอากาศ' },
    { id: 'cat_03', categoryName: 'ระบบไฟฟ้าและโสตทัศนูปกรณ์' },
    { id: 'cat_04', categoryName: 'ระบบอาคารและสุขาภิบาล' },
  ];

  for (const cat of categories) {
    await prisma.problemCategory.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  // 6. Work Statuses
  const statuses = [
    { id: 'stat_01', statusName: 'PENDING_DISPATCH', statusDescription: 'รอคัดกรองและจ่ายงาน' },
    { id: 'stat_02', statusName: 'ASSIGNED', statusDescription: 'มอบหมายช่างแล้ว' },
    { id: 'stat_03', statusName: 'IN_PROGRESS', statusDescription: 'กำลังปฏิบัติงาน' },
    { id: 'stat_04', statusName: 'COMPLETED', statusDescription: 'ดำเนินการเสร็จสิ้น' },
    { id: 'stat_05', statusName: 'CANCELLED', statusDescription: 'ยกเลิกคำร้อง' },
  ];

  for (const st of statuses) {
    await prisma.workStatus.upsert({
      where: { id: st.id },
      update: st,
      create: st,
    });
  }

  // 7. Equipments
  const equipments = [
    {
      id: 'eq_01',
      equipmentCode: 'KKU-CP-67-0891',
      equipmentName: 'Desktop Workstation HP Z4 G4',
      equipmentStatus: 'ชำรุดรอซ่อม',
      locationId: 'loc_03',
    },
    {
      id: 'eq_02',
      equipmentCode: 'KKU-CP-66-0120',
      equipmentName: 'Cisco Catalyst 9200 48-Port PoE+',
      equipmentStatus: 'ชำรุดรอซ่อม',
      locationId: 'loc_04',
    },
    {
      id: 'eq_03',
      equipmentCode: 'KKU-CP-65-0315',
      equipmentName: 'เครื่องปรับอากาศ Daikin Inverter 36000 BTU',
      equipmentStatus: 'ชำรุดรอซ่อม',
      locationId: 'loc_02',
    },
    {
      id: 'eq_04',
      equipmentCode: 'KKU-CP-66-0442',
      equipmentName: 'Projector Epson Laser EB-L520U',
      equipmentStatus: 'ปกติ',
      locationId: 'loc_01',
    },
  ];

  for (const eq of equipments) {
    await prisma.equipment.upsert({
      where: { id: eq.id },
      update: eq,
      create: eq,
    });
  }

  // 8. Spare Parts Inventory
  const spareParts = [
    {
      id: 'prt_01',
      partCode: 'MAT-NET-008',
      partName: 'หัวคอนเน็กเตอร์ RJ-45 Cat6 Shielded',
      unit: 'ชิ้น',
      stockQuantity: 50,
      unitCost: 25,
      storageRoom: 'สโตร์ระบบเครือข่าย CoP-Wh01',
    },
    {
      id: 'prt_02',
      partCode: 'MAT-NET-012',
      partName: 'สายสัญญาณ UTP Cat6 Patch Cord 3m',
      unit: 'เส้น',
      stockQuantity: 35,
      unitCost: 120,
      storageRoom: 'สโตร์ระบบเครือข่าย CoP-Wh01',
    },
    {
      id: 'prt_03',
      partCode: 'MAT-AIR-004',
      partName: 'ท่อน้ำทิ้งแอร์ PVC เกรดทนความเย็น',
      unit: 'ท่อน',
      stockQuantity: 20,
      unitCost: 150,
      storageRoom: 'สโตร์ซ่อมบำรุงอาคาร CoP-Wh02',
    },
    {
      id: 'prt_04',
      partCode: 'MAT-AIR-009',
      partName: 'แผ่นกรองฝุ่นแอร์ Antibacterial Air Filter',
      unit: 'ชุด',
      stockQuantity: 15,
      unitCost: 350,
      storageRoom: 'สโตร์ซ่อมบำรุงอาคาร CoP-Wh02',
    },
    {
      id: 'prt_05',
      partCode: 'MAT-PWR-001',
      partName: 'พาวเวอร์ซัพพลาย 650W 80+ Gold',
      unit: 'ตัว',
      stockQuantity: 10,
      unitCost: 2200,
      storageRoom: 'สโตร์อุปกรณ์ฮาร์ดแวร์ CoP-Wh01',
    },
    {
      id: 'prt_06',
      partCode: 'MAT-DISP-003',
      partName: 'สายสัญญาณ HDMI 2.1 Ultra High Speed 5m',
      unit: 'เส้น',
      stockQuantity: 25,
      unitCost: 290,
      storageRoom: 'สโตร์อุปกรณ์โสต CoP-Wh03',
    },
  ];

  for (const part of spareParts) {
    await prisma.sparePartInventory.upsert({
      where: { id: part.id },
      update: part,
      create: part,
    });
  }

  // 9. Initial Seed Tickets to populate realistic data if empty
  const ticketCount = await prisma.ticket.count();
  if (ticketCount === 0) {
    console.log('Seeding initial tickets...');
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

    console.log('Seeded sample tickets:', [tkt1.ticketNumber, tkt2.ticketNumber, tkt3.ticketNumber]);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
