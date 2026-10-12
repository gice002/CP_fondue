import { PrismaClient } from '@prisma/client';
import { TicketService } from '../services/ticketService';
import { SparePartService } from '../services/sparePartService';
import { UserService } from '../services/userService';
import { AuditService } from '../services/auditService';
import { StatsService } from '../services/statsService';

const prisma = new PrismaClient();

async function runTestSuite() {
  console.log('====================================================');
  console.log('CP FONDUE: AUTOMATED DATABASE INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // -----------------------------------------------------------------
    // TEST 1: Database Read - Empty/Existing Tickets
    // -----------------------------------------------------------------
    console.log('--- TEST GROUP 1: Core Ticket CRUD Operations ---');
    const initialTickets = await TicketService.getTickets();
    assert(Array.isArray(initialTickets), 'TicketService.getTickets returns valid array from PostgreSQL');

    // -----------------------------------------------------------------
    // TEST 2: Create Maintenance Request (BR2, BR3)
    // -----------------------------------------------------------------
    const newTicket = await TicketService.createTicket({
      locationId: 'loc_03',
      locationDetail: 'โต๊ะคอมพิวเตอร์แถวที่ 2',
      category: 'ระบบคอมพิวเตอร์และเครือข่าย',
      description: 'ทดสอบระบบแจ้งซ่อมอัตโนมัติผ่าน Prisma ORM',
      attachmentUrls: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600'],
      reporterId: 'usr_reporter_01',
    });

    assert(Boolean(newTicket.id), 'Ticket successfully created with persisted ID');
    assert(newTicket.ticketNumber.startsWith('REQ-'), `Ticket number format valid (${newTicket.ticketNumber})`);
    assert(newTicket.status === 'PENDING_DISPATCH', 'Initial ticket status is PENDING_DISPATCH');
    assert(newTicket.attachments.length === 1, 'Initial attachment metadata saved in database');

    // Verify in database directly
    const dbTicketCheck = await prisma.ticket.findUnique({
      where: { id: newTicket.id },
      include: { attachments: true, statusHistories: true },
    });
    assert(dbTicketCheck !== null, 'Direct PostgreSQL check confirms row exists in tickets table');
    assert(dbTicketCheck?.attachments.length === 1, 'Direct PostgreSQL check confirms attachment persisted');
    assert(dbTicketCheck?.statusHistories.length === 1, 'Direct PostgreSQL check confirms initial status history');

    // -----------------------------------------------------------------
    // TEST 3: Read Created Ticket By ID
    // -----------------------------------------------------------------
    const readTicket = await TicketService.getTicketById(newTicket.id);
    assert(readTicket !== null && readTicket.id === newTicket.id, 'TicketService.getTicketById returns persisted record');

    // -----------------------------------------------------------------
    // TEST 4: Assign Technician (BR4, UC-9)
    // -----------------------------------------------------------------
    // -----------------------------------------------------------------
    // TEST 4: Queue-based Multiple Assignment (Req 1.1)
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Queue-based Multi-Assignment & Single Active Task ---');

    // Ensure technician 02 has completed any existing in-progress tasks before test
    await prisma.ticket.updateMany({
      where: { assignedTechnicianId: 'usr_tech_02', currentStatus: 'IN_PROGRESS' },
      data: { currentStatus: 'COMPLETED' },
    });

    // Create 3 tickets for technician queue testing
    const ticketA = await TicketService.createTicket({
      locationId: 'loc_01',
      description: 'งาน A สำหรับทดสอบคิวช่าง',
      reporterId: 'usr_reporter_01',
    });
    const ticketB = await TicketService.createTicket({
      locationId: 'loc_02',
      description: 'งาน B สำหรับทดสอบคิวช่าง',
      reporterId: 'usr_reporter_01',
    });
    const ticketC = await TicketService.createTicket({
      locationId: 'loc_03',
      description: 'งาน C สำหรับทดสอบคิวช่าง',
      reporterId: 'usr_reporter_01',
    });

    // 1. Assign all 3 tickets to the same technician (usr_tech_02)
    const assignA = await TicketService.assignTicket(ticketA.id, 'usr_tech_02', ['งานเร่งด่วน']);
    const assignB = await TicketService.assignTicket(ticketB.id, 'usr_tech_02', ['งานเร่ง']);
    const assignC = await TicketService.assignTicket(ticketC.id, 'usr_tech_02', ['งานทั่วไป']);

    assert(assignA?.status === 'ASSIGNED' && assignA.assignedTechnician?.id === 'usr_tech_02', 'Admin assigned Ticket A to tech 02 successfully');
    assert(assignB?.status === 'ASSIGNED' && assignB.assignedTechnician?.id === 'usr_tech_02', 'Admin assigned Ticket B to tech 02 successfully');
    assert(assignC?.status === 'ASSIGNED' && assignC.assignedTechnician?.id === 'usr_tech_02', 'Admin assigned Ticket C to tech 02 successfully (unlimited queue)');

    // 2. Verify all 3 appear in tech's queue from DB
    const techTickets = await TicketService.getTickets({ technicianId: 'usr_tech_02' });
    const queuedIds = techTickets.map((t) => t.id);
    assert(queuedIds.includes(ticketA.id) && queuedIds.includes(ticketB.id) && queuedIds.includes(ticketC.id), 'All 3 tickets exist in technician queue from PostgreSQL');

    // 3. Technician accepts Ticket A
    const acceptedA = await TicketService.acceptTicket(ticketA.id, 'usr_tech_02');
    assert(acceptedA?.status === 'IN_PROGRESS', 'Technician successfully accepted Ticket A into IN_PROGRESS');

    // 4. While Ticket A is IN_PROGRESS, attempt to accept Ticket B or C -> MUST BE REJECTED
    let acceptBRejected = false;
    try {
      await TicketService.acceptTicket(ticketB.id, 'usr_tech_02');
    } catch (err: any) {
      acceptBRejected = true;
      assert(err.message.includes('คุณมีงานที่กำลังดำเนินการอยู่'), 'Error message warns about existing ongoing task');
    }
    assert(acceptBRejected, 'Accepting Ticket B while Ticket A is IN_PROGRESS is strictly rejected by Backend');

    // 5. Verify Ticket B status is still ASSIGNED and unchanged
    const ticketBCheck = await TicketService.getTicketById(ticketB.id);
    assert(ticketBCheck?.status === 'ASSIGNED', 'Ticket B status remains ASSIGNED and undisturbed');

    // 6. Concurrency test: simulate two concurrent accept calls
    let concurrentRejections = 0;
    const concurrentResults = await Promise.allSettled([
      TicketService.acceptTicket(ticketB.id, 'usr_tech_02'),
      TicketService.acceptTicket(ticketC.id, 'usr_tech_02'),
    ]);
    concurrentResults.forEach((r) => {
      if (r.status === 'rejected') concurrentRejections++;
    });
    assert(concurrentRejections === 2, 'Concurrent accept requests while task active are safely rejected');

    // 7. Close Ticket A -> Technician is now free to accept next task
    const closedA = await TicketService.closeTicket(
      ticketA.id,
      'ปิดงาน A เรียบร้อย',
      ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'],
      'usr_tech_02'
    );
    assert(closedA?.status === 'COMPLETED', 'Ticket A successfully COMPLETED');

    // 8. Now technician can accept Ticket B
    const acceptedB = await TicketService.acceptTicket(ticketB.id, 'usr_tech_02');
    assert(acceptedB?.status === 'IN_PROGRESS', 'Technician successfully accepted Ticket B after closing Ticket A');

    // 9. Ticket C remains in queue
    const ticketCCheck = await TicketService.getTicketById(ticketC.id);
    assert(ticketCCheck?.status === 'ASSIGNED', 'Ticket C still in queue waiting');

    // 10. Admin can still assign additional ticket even while tech has an active task and queue
    const ticketD = await TicketService.createTicket({
      locationId: 'loc_04',
      description: 'งาน D มอบหมายเพิ่มขณะช่างกำลังทำงาน B',
      reporterId: 'usr_reporter_01',
    });
    const assignD = await TicketService.assignTicket(ticketD.id, 'usr_tech_02', ['งานจำเป็น']);
    assert(assignD?.status === 'ASSIGNED', 'Admin can assign additional ticket D while tech is busy');

    // Clean up extra queue test tickets
    await TicketService.closeTicket(ticketB.id, 'ปิดงาน B', [], 'usr_tech_02');
    await prisma.ticket.delete({ where: { id: ticketA.id } });
    await prisma.ticket.delete({ where: { id: ticketB.id } });
    await prisma.ticket.delete({ where: { id: ticketC.id } });
    await prisma.ticket.delete({ where: { id: ticketD.id } });

    // Continue with original single lifecycle flow for newTicket
    const assignedTicket = await TicketService.assignTicket(
      newTicket.id,
      'usr_tech_02',
      ['งานเร่งด่วน'],
      '2026-10-15T14:00:00Z',
      'จนท. มอบหมายงานด่วนให้ช่างสมศักดิ์'
    );
    assert(assignedTicket !== null, 'Ticket assigned successfully');
    assert(assignedTicket?.status === 'ASSIGNED', 'Ticket status updated to ASSIGNED');

    const acceptedTicket = await TicketService.acceptTicket(newTicket.id, 'usr_tech_02');
    assert(acceptedTicket !== null && acceptedTicket.status === 'IN_PROGRESS', 'Technician accept status is IN_PROGRESS');

    const closedTicket = await TicketService.closeTicket(
      newTicket.id,
      'ซ่อมแซมและเปลี่ยนชิ้นส่วนเรียบร้อยแล้ว ทดสอบใช้งานได้ปกติ',
      ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'],
      'usr_tech_02'
    );
    assert(closedTicket !== null && closedTicket.status === 'COMPLETED', 'Ticket closed status is COMPLETED');
    assert(closedTicket?.completedAt !== undefined, 'completedAt timestamp is recorded in database');
    assert(closedTicket?.attachments.length === 2, 'After-repair proof photo added to attachments');

    // -----------------------------------------------------------------
    // TEST 7: Satisfaction Evaluation (BR10, UC-6)
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Evaluation & Duplicate Rejection ---');
    const evaluation = await TicketService.submitEvaluation(
      newTicket.id,
      5,
      'บริการดีเยี่ยม ช่างมาตรงเวลาและสุภาพมาก',
      'usr_reporter_01'
    );
    assert(evaluation !== null && evaluation.rating === 5, 'Evaluation submitted and persisted');

    // Duplicate evaluation rejection check
    let duplicateRejected = false;
    try {
      await TicketService.submitEvaluation(newTicket.id, 4, 'ประเมินซ้ำ');
    } catch {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Duplicate evaluation on same ticket is strictly rejected');

    // -----------------------------------------------------------------
    // TEST 8: Ticket Cancellation (UC-5)
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Cancellation Workflow ---');
    // Create separate ticket to test cancellation
    const cancelCandidate = await TicketService.createTicket({
      locationId: 'loc_01',
      description: 'คำร้องสำหรับทดสอบการยกเลิก',
      reporterId: 'usr_reporter_01',
    });
    const cancelledTicket = await TicketService.cancelTicket(cancelCandidate.id, 'ผู้แจ้งแก้ปัญหาเองได้แล้ว');
    assert(cancelledTicket !== null && cancelledTicket.status === 'CANCELLED', 'Ticket cancelled successfully');

    // Verify completed ticket cannot be cancelled
    let cancelCompletedRejected = false;
    try {
      await TicketService.cancelTicket(newTicket.id, 'พยายามยกเลิกงานที่เสร็จแล้ว');
    } catch {
      cancelCompletedRejected = true;
    }
    assert(cancelCompletedRejected, 'Completed ticket cannot be cancelled');

    // -----------------------------------------------------------------
    // TEST 9: Spare Part Requisition & Atomic Stock Decrement (UC-10)
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Inventory & Transactional Safety ---');
    const initialPart = await prisma.sparePartInventory.findUnique({
      where: { id: 'prt_01' },
    });
    const initialStock = initialPart?.stockQuantity || 0;

    const requisition = await SparePartService.createRequisition({
      ticketId: newTicket.id,
      technicianId: 'usr_tech_01',
      items: [{ partId: 'prt_01', quantity: 3 }],
      notes: 'ขอเบิกหัว RJ-45 จำนวน 3 ชิ้นสำหรับงานซ่อม',
    });
    assert(requisition !== null && requisition.status === 'PENDING', 'Requisition created with PENDING status');

    // Approve requisition
    const approvedReq = await SparePartService.approveRequisition(requisition.id, 'usr_admin_01');
    assert(approvedReq !== null && approvedReq.status === 'APPROVED', 'Requisition status updated to APPROVED');

    // Verify atomic decrement in PostgreSQL
    const updatedPart = await prisma.sparePartInventory.findUnique({
      where: { id: 'prt_01' },
    });
    assert(
      updatedPart?.stockQuantity === initialStock - 3,
      `Inventory decremented atomically from ${initialStock} to ${updatedPart?.stockQuantity}`
    );

    // Verify insufficient stock rejection
    let insufficientRejected = false;
    try {
      const hugeReq = await SparePartService.createRequisition({
        ticketId: newTicket.id,
        technicianId: 'usr_tech_01',
        items: [{ partId: 'prt_01', quantity: 99999 }],
      });
      await SparePartService.approveRequisition(hugeReq.id, 'usr_admin_01');
    } catch {
      insufficientRejected = true;
    }
    assert(insufficientRejected, 'Approval with insufficient stock is rejected and rolled back');

    // -----------------------------------------------------------------
    // TEST 10: Live Technicians & Workload Calculation
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Technician Workloads & Statistics ---');
    const technicians = await UserService.getTechnicians();
    assert(technicians.length >= 3, `UserService returns real technicians from PostgreSQL (${technicians.length} found)`);

    // -----------------------------------------------------------------
    // TEST 11: Real Executive Stats Aggregation
    // -----------------------------------------------------------------
    const execStats = await StatsService.getExecutiveStats();
    assert(execStats.totalTickets > 0, `StatsService aggregates real tickets (Total: ${execStats.totalTickets})`);
    assert(execStats.completedTickets > 0, `StatsService aggregates completed tickets (Completed: ${execStats.completedTickets})`);
    assert(execStats.categoryBreakdown.length > 0, 'StatsService computes category breakdown from DB');

    // -----------------------------------------------------------------
    // TEST 12: Audit Log Trail
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: Audit Trail ---');
    const auditLogs = await AuditService.getAuditLogs();
    assert(auditLogs.length > 0, `Audit logs recorded in PostgreSQL (${auditLogs.length} logs found)`);

    // Clean up test tickets
    await prisma.ticket.delete({ where: { id: cancelCandidate.id } });
    await prisma.ticket.delete({ where: { id: newTicket.id } });
    // Restore stock for prt_01
    await prisma.sparePartInventory.update({
      where: { id: 'prt_01' },
      data: { stockQuantity: initialStock },
    });

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Unexpected test runner error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
