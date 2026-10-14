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
      building: 'SC-09 อาคารวิทยวิภาส',
      floor: 'ชั้น 1',
      roomNumber: '101',
      roomName: 'ห้องสำนักงานคณบดีและธุรการ',
    },
    {
      id: 'loc_02',
      building: 'SC-09 อาคารวิทยวิภาส',
      floor: 'ชั้น 2',
      roomNumber: '202',
      roomName: 'ห้องบรรยาย Smart Classroom 202',
    },
    {
      id: 'loc_03',
      building: 'SC-09 อาคารวิทยวิภาส',
      floor: 'ชั้น 3',
      roomNumber: '304',
      roomName: 'Lab High-Performance Computing',
    },
    {
      id: 'loc_04',
      building: 'SC-09 อาคารวิทยวิภาส',
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

  // 4.1 Standard Tags
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

  // 7. Equipment Statuses
  const eqStatusDamaged = await prisma.equipmentStatus.upsert({
    where: { name: 'ชำรุดรอซ่อม' },
    update: {},
    create: { id: 'eq_status_damaged', name: 'ชำรุดรอซ่อม' },
  });

  const eqStatusNormal = await prisma.equipmentStatus.upsert({
    where: { name: 'ใช้งานได้ปกติ' },
    update: {},
    create: { id: 'eq_status_normal', name: 'ใช้งานได้ปกติ' },
  });

  // Equipments
  const equipments = [
    {
      equipmentCode: 'KKU-CP-67-0891',
      equipmentName: 'Desktop Workstation HP Z4 G4',
      statusId: eqStatusDamaged.id,
      locationId: 'loc_03',
    },
    {
      equipmentCode: 'KKU-CP-66-0120',
      equipmentName: 'Cisco Catalyst 9200 48-Port PoE+',
      statusId: eqStatusDamaged.id,
      locationId: 'loc_04',
    },
    {
      equipmentCode: 'KKU-CP-65-0315',
      equipmentName: 'เครื่องปรับอากาศ Daikin Inverter 36000 BTU',
      statusId: eqStatusDamaged.id,
      locationId: 'loc_02',
    },
    {
      equipmentCode: 'KKU-CP-66-0442',
      equipmentName: 'Projector Epson Laser EB-L520U',
      statusId: eqStatusNormal.id,
      locationId: 'loc_01',
    },
    {
      equipmentCode: 'KKU-CP-67-0105',
      equipmentName: 'เครื่องพิมพ์เลเซอร์ HP LaserJet Enterprise M608dn',
      statusId: eqStatusNormal.id,
      locationId: 'loc_01',
    },
    {
      equipmentCode: 'KKU-CP-66-0112',
      equipmentName: 'เครื่องปรับอากาศ Mitsubishi Heavy Duty 24000 BTU',
      statusId: eqStatusNormal.id,
      locationId: 'loc_01',
    },
    {
      equipmentCode: 'KKU-CP-66-0210',
      equipmentName: 'จอสัมผัสอัจฉริยะ Maxhub Interactive Display 86 นิ้ว',
      statusId: eqStatusNormal.id,
      locationId: 'loc_02',
    },
    {
      equipmentCode: 'KKU-CP-67-0222',
      equipmentName: 'ชุดไมโครโฟนไร้สาย Shure BLX288/PG58 Dual Wireless',
      statusId: eqStatusNormal.id,
      locationId: 'loc_02',
    },
    {
      equipmentCode: 'KKU-CP-67-0892',
      equipmentName: 'Desktop Workstation Dell Precision 3660',
      statusId: eqStatusNormal.id,
      locationId: 'loc_03',
    },
    {
      equipmentCode: 'KKU-CP-66-0350',
      equipmentName: 'เครื่องปรับอากาศ Carrier Inverter 40000 BTU',
      statusId: eqStatusNormal.id,
      locationId: 'loc_03',
    },
    {
      equipmentCode: 'KKU-CP-65-0455',
      equipmentName: 'เครื่องสำรองไฟ APC Smart-UPS RT 10kVA On-Line',
      statusId: eqStatusNormal.id,
      locationId: 'loc_04',
    },
    {
      equipmentCode: 'KKU-CP-66-0121',
      equipmentName: 'เซิร์ฟเวอร์ Dell PowerEdge R750 Rack Server',
      statusId: eqStatusNormal.id,
      locationId: 'loc_04',
    },
  ];

  for (const eq of equipments) {
    await prisma.equipment.upsert({
      where: { equipmentCode: eq.equipmentCode },
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
    {
      id: 'prt_07',
      partCode: 'MAT-RAM-016',
      partName: 'หน่วยความจำ RAM DDR4 16GB (3200MHz)',
      unit: 'แถว',
      stockQuantity: 12,
      unitCost: 1450,
      storageRoom: 'สโตร์อุปกรณ์ฮาร์ดแวร์ CoP-Wh01',
    },
    {
      id: 'prt_08',
      partCode: 'MAT-SSD-512',
      partName: 'SSD M.2 NVMe 512GB PCIe 4.0',
      unit: 'ตัว',
      stockQuantity: 15,
      unitCost: 1890,
      storageRoom: 'สโตร์อุปกรณ์ฮาร์ดแวร์ CoP-Wh01',
    },
    {
      id: 'prt_09',
      partCode: 'MAT-FAN-120',
      partName: 'พัดลมระบายความร้อนเคสคอมพิวเตอร์ 120mm PWM',
      unit: 'ตัว',
      stockQuantity: 20,
      unitCost: 280,
      storageRoom: 'สโตร์อุปกรณ์ฮาร์ดแวร์ CoP-Wh01',
    },
    {
      id: 'prt_10',
      partCode: 'MAT-AIR-015',
      partName: 'คาปาซิเตอร์ แคปรันแอร์ (Running Capacitor 35uF)',
      unit: 'ตัว',
      stockQuantity: 18,
      unitCost: 320,
      storageRoom: 'สโตร์ซ่อมบำรุงอาคาร CoP-Wh02',
    },
    {
      id: 'prt_11',
      partCode: 'MAT-AIR-020',
      partName: 'มอเตอร์พัดลมคอยล์เย็น Blower Motor แอร์',
      unit: 'ชุด',
      stockQuantity: 8,
      unitCost: 1850,
      storageRoom: 'สโตร์ซ่อมบำรุงอาคาร CoP-Wh02',
    },
    {
      id: 'prt_12',
      partCode: 'MAT-DISP-008',
      partName: 'รีโมทคอนโทรลจอโปรเจกเตอร์และจอสัมผัส Universal',
      unit: 'อัน',
      stockQuantity: 10,
      unitCost: 450,
      storageRoom: 'สโตร์อุปกรณ์โสต CoP-Wh03',
    },
    {
      id: 'prt_13',
      partCode: 'MAT-AUD-001',
      partName: 'ชุดถ่านชาร์จ Eneloop Pro AA x4 สำหรับไมโครโฟนไร้สาย',
      unit: 'แพ็ค',
      stockQuantity: 16,
      unitCost: 690,
      storageRoom: 'สโตร์อุปกรณ์โสต CoP-Wh03',
    },
    {
      id: 'prt_14',
      partCode: 'MAT-AUD-005',
      partName: 'สายสัญญาณเสียง Audio XLR to XLR 5m Neutrik',
      unit: 'เส้น',
      stockQuantity: 14,
      unitCost: 380,
      storageRoom: 'สโตร์อุปกรณ์โสต CoP-Wh03',
    },
    {
      id: 'prt_15',
      partCode: 'MAT-PRN-001',
      partName: 'ตลับหมึก HP Original LaserJet Toner Cartridge (CF237A)',
      unit: 'กล่อง',
      stockQuantity: 6,
      unitCost: 4200,
      storageRoom: 'สโตร์หมึกและอุปกรณ์พิมพ์ CoP-Wh01',
    },
    {
      id: 'prt_16',
      partCode: 'MAT-UPS-001',
      partName: 'แบตเตอรี่แห้งทดแทน UPS 12V 9Ah Sealed Lead Acid',
      unit: 'ก้อน',
      stockQuantity: 12,
      unitCost: 890,
      storageRoom: 'สโตร์ระบบไฟฟ้าและสำรองไฟ CoP-Wh02',
    },
    {
      id: 'prt_17',
      partCode: 'MAT-NET-024',
      partName: 'โมดูล SFP+ 10GBASE-SR Transceiver Cisco Compatible',
      unit: 'ตัว',
      stockQuantity: 8,
      unitCost: 1250,
      storageRoom: 'สโตร์ระบบเครือข่าย CoP-Wh01',
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
        equipmentCode: 'KKU-CP-66-0120',
        categoryId: 'cat_01',
        adminNotes: 'มอบหมายช่างอนุชา ตรวจสอบพอร์ตสวิตช์ด่วน',
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
        equipmentCode: 'KKU-CP-65-0315',
        categoryId: 'cat_02',
        adminNotes: 'แอร์มีน้ำรั่วส่งช่างสมศักดิ์เข้าตรวจสอบหน้างาน',
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
        equipmentCode: 'KKU-CP-66-0442',
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
      },
    });

    console.log('Seeded sample tickets:', [tkt1.ticketNumber, tkt2.ticketNumber, tkt3.ticketNumber]);
  }

  // 10. Seed Asset Statuses & Sample Assets (Requirement: Asset Management)
  const defaultAssetStatuses = ['AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'RETIRED'];
  for (const statusName of defaultAssetStatuses) {
    await prisma.assetStatus.upsert({
      where: { name: statusName },
      update: {},
      create: { name: statusName },
    });
  }

  const assetStatusAvailable = await prisma.assetStatus.findUnique({ where: { name: 'AVAILABLE' } });
  const assetStatusMaintenance = await prisma.assetStatus.findUnique({ where: { name: 'UNDER_MAINTENANCE' } });

  const initialAssets = [
    { assetCode: 'AST-SC09-001', name: 'Dell Precision Tower 3660', statusId: assetStatusAvailable?.id || 1 },
    { assetCode: 'AST-SC09-002', name: 'Core Network Switch Cisco 9300', statusId: assetStatusMaintenance?.id || 2 },
    { assetCode: 'AST-SC09-003', name: 'Smart Podium Touch Display 24"', statusId: assetStatusAvailable?.id || 1 },
  ];

  for (const ast of initialAssets) {
    await prisma.asset.upsert({
      where: { assetCode: ast.assetCode },
      update: { name: ast.name, statusId: ast.statusId },
      create: ast,
    });
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
