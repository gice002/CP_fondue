import { PrismaClient } from '@prisma/client';
import { AssetService } from '../services/assetService';

const prisma = new PrismaClient();

async function runAssetTests() {
  console.log('====================================================');
  console.log('CP FONDUE: ASSET MANAGEMENT & STATUS HISTORY TESTS');
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
    // TEST GROUP 1: Asset CRUD Operations
    // -----------------------------------------------------------------
    console.log('--- TEST GROUP 1: Asset CRUD Operations ---');

    // 1. Create status records if needed
    const statusAvail = await prisma.assetStatus.upsert({
      where: { name: 'AVAILABLE' },
      update: {},
      create: { name: 'AVAILABLE' },
    });
    const statusMaint = await prisma.assetStatus.upsert({
      where: { name: 'UNDER_MAINTENANCE' },
      update: {},
      create: { name: 'UNDER_MAINTENANCE' },
    });
    const statusInUse = await prisma.assetStatus.upsert({
      where: { name: 'IN_USE' },
      update: {},
      create: { name: 'IN_USE' },
    });

    assert(Boolean(statusAvail.id && statusMaint.id), 'AssetStatus records exist with autoincrement IDs');

    // Unique code for testing
    const testCode = `TEST-AST-${Date.now()}`;
    const testCode2 = `TEST-AST-2-${Date.now()}`;

    // 2. Create asset with valid code and status
    const createdAsset = await AssetService.createAsset({
      assetCode: testCode,
      name: 'Automated Test Asset Server',
      statusId: statusAvail.id,
    });

    assert(Boolean(createdAsset.id), 'Asset created successfully with persisted ID');
    assert(createdAsset.assetCode === testCode, 'Asset code matches input');
    assert(createdAsset.statusId === statusAvail.id, 'Asset initial statusId is correct');

    // 3. Reject duplicate assetCode
    let duplicateRejected = false;
    try {
      await AssetService.createAsset({
        assetCode: testCode,
        name: 'Duplicate Code Asset',
        statusId: statusAvail.id,
      });
    } catch (err: any) {
      duplicateRejected = true;
      assert(err.message.includes('ซ้ำในระบบ'), 'Duplicate asset code error message received');
    }
    assert(duplicateRejected, 'Duplicate asset code creation strictly rejected');

    // 4. Reject nonexistent status ID
    let invalidStatusRejected = false;
    try {
      await AssetService.createAsset({
        assetCode: `INVALID-STATUS-${Date.now()}`,
        name: 'Invalid Status Asset',
        statusId: 999999,
      });
    } catch (err: any) {
      invalidStatusRejected = true;
      assert(err.message.includes('ไม่พบสถานะสินทรัพย์'), 'Invalid statusId error message received');
    }
    assert(invalidStatusRejected, 'Creating asset with nonexistent statusId strictly rejected');

    // 5. Retrieve all assets
    const allAssets = await AssetService.getAssets();
    assert(Array.isArray(allAssets) && allAssets.length > 0, 'AssetService.getAssets returns asset array');
    const foundInList = allAssets.find((a) => a.id === createdAsset.id);
    assert(Boolean(foundInList), 'Newly created asset found in getAssets list');

    // 6. Retrieve asset by ID
    const retrievedById = await AssetService.getAssetById(createdAsset.id);
    assert(retrievedById !== null, 'AssetService.getAssetById returns asset record');
    assert(retrievedById?.name === 'Automated Test Asset Server', 'Retrieved asset name matches');

    // 7. Reject retrieval of nonexistent ID
    const notFound = await AssetService.getAssetById(9999999);
    assert(notFound === null, 'getAssetById for nonexistent ID returns null');

    // 8. Update non-status asset information (name only)
    const updatedNameAsset = await AssetService.updateAsset(
      createdAsset.id,
      { name: 'Updated Server Name' },
      'usr_admin_01'
    );
    assert(updatedNameAsset.name === 'Updated Server Name', 'Asset name updated successfully');
    assert(updatedNameAsset.histories?.length === 0, 'No history record created when status did not change');

    // -----------------------------------------------------------------
    // TEST GROUP 2: Asset Status History & Atomicity
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Asset Status History & Atomicity ---');

    // 1. Change asset from AVAILABLE to UNDER_MAINTENANCE
    const statusChangedAsset = await AssetService.updateAsset(
      createdAsset.id,
      { statusId: statusMaint.id },
      'usr_admin_01'
    );

    assert(statusChangedAsset.statusId === statusMaint.id, 'Asset statusId changed to UNDER_MAINTENANCE');
    assert(statusChangedAsset.histories?.length === 1, 'Exactly one history record returned in updated asset');

    // Check direct PostgreSQL database record
    const dbHistoryRecords = await prisma.assetStatusHistory.findMany({
      where: { assetId: createdAsset.id },
    });
    assert(dbHistoryRecords.length === 1, 'Exactly 1 history record committed to PostgreSQL database');
    assert(dbHistoryRecords[0].oldStatus === 'AVAILABLE', `oldStatus recorded correctly (${dbHistoryRecords[0].oldStatus})`);
    assert(dbHistoryRecords[0].newStatus === 'UNDER_MAINTENANCE', `newStatus recorded correctly (${dbHistoryRecords[0].newStatus})`);
    assert(dbHistoryRecords[0].changedById === 'usr_admin_01', `changedById recorded correctly (${dbHistoryRecords[0].changedById})`);
    assert(Boolean(dbHistoryRecords[0].changedAt), 'changedAt timestamp recorded in PostgreSQL');

    // 2. Submit update with SAME status (UNDER_MAINTENANCE -> UNDER_MAINTENANCE)
    const sameStatusAsset = await AssetService.updateAsset(
      createdAsset.id,
      { statusId: statusMaint.id, name: 'Renamed Server' },
      'usr_admin_01'
    );
    const dbHistoryAfterSame = await prisma.assetStatusHistory.findMany({
      where: { assetId: createdAsset.id },
    });
    assert(dbHistoryAfterSame.length === 1, 'No redundant history record created when status remains unchanged');

    // 3. Second status change: UNDER_MAINTENANCE -> IN_USE by tech
    const statusChangedToInUse = await AssetService.updateAsset(
      createdAsset.id,
      { statusId: statusInUse.id },
      'usr_tech_01'
    );
    const dbHistoryAfterInUse = await prisma.assetStatusHistory.findMany({
      where: { assetId: createdAsset.id },
      orderBy: { changedAt: 'desc' },
    });
    assert(dbHistoryAfterInUse.length === 2, 'Second status change created second history record in sequence');
    assert(dbHistoryAfterInUse[0].oldStatus === 'UNDER_MAINTENANCE', 'Second change oldStatus is UNDER_MAINTENANCE');
    assert(dbHistoryAfterInUse[0].newStatus === 'IN_USE', 'Second change newStatus is IN_USE');
    assert(dbHistoryAfterInUse[0].changedById === 'usr_tech_01', 'Second change changedById is usr_tech_01');

    // 4. Update rejection on invalid target statusId (rollback test)
    let invalidTargetStatusRejected = false;
    try {
      await AssetService.updateAsset(
        createdAsset.id,
        { statusId: 888888 },
        'usr_admin_01'
      );
    } catch (err: any) {
      invalidTargetStatusRejected = true;
    }
    assert(invalidTargetStatusRejected, 'Status update to nonexistent statusId rejected');

    const dbHistoryAfterInvalid = await prisma.assetStatusHistory.findMany({
      where: { assetId: createdAsset.id },
    });
    assert(dbHistoryAfterInvalid.length === 2, 'History count remains unchanged after failed update transaction');

    const dbAssetAfterInvalid = await prisma.asset.findUnique({
      where: { id: createdAsset.id },
    });
    assert(dbAssetAfterInvalid?.statusId === statusInUse.id, 'Asset status remains unchanged after failed transaction rollback');

    // 5. Update rejection for nonexistent asset
    let nonExistentAssetRejected = false;
    try {
      await AssetService.updateAsset(999999, { statusId: statusAvail.id }, 'usr_admin_01');
    } catch (err: any) {
      nonExistentAssetRejected = true;
    }
    assert(nonExistentAssetRejected, 'Updating nonexistent asset strictly rejected');

    // -----------------------------------------------------------------
    // TEST GROUP 3: Historical Data Preservation & Deletion Rules
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Historical Data Preservation & Deletion Rules ---');

    // 1. Attempt to delete asset with histories -> MUST BE REJECTED
    let deleteWithHistoryRejected = false;
    try {
      await AssetService.deleteAsset(createdAsset.id);
    } catch (err: any) {
      deleteWithHistoryRejected = true;
      assert(err.message.includes('ประวัติการเปลี่ยนสถานะ'), 'Deletion error mentions history retention policy');
    }
    assert(deleteWithHistoryRejected, 'Asset with historical status records cannot be deleted (audit protection)');

    // 2. Create fresh asset without history and delete it -> MUST SUCCEED
    const tempAsset = await AssetService.createAsset({
      assetCode: testCode2,
      name: 'Temporary Clean Asset',
      statusId: statusAvail.id,
    });
    const deleteCleanResult = await AssetService.deleteAsset(tempAsset.id);
    assert(deleteCleanResult.success === true, 'Asset with no history can be safely deleted');

    const checkDeleted = await prisma.asset.findUnique({ where: { id: tempAsset.id } });
    assert(checkDeleted === null, 'Asset successfully removed from database');

    // Clean up test histories and asset
    await prisma.assetStatusHistory.deleteMany({ where: { assetId: createdAsset.id } });
    await prisma.asset.delete({ where: { id: createdAsset.id } });

    // -----------------------------------------------------------------
    // TEST GROUP 4: Regression & Non-interference with Tickets/Equipment
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Regression & Existing Entity Verification ---');

    const userCount = await prisma.user.count();
    assert(userCount > 0, `Existing User table preserved (${userCount} users found)`);

    const equipmentCount = await prisma.equipment.count();
    assert(equipmentCount > 0, `Existing Equipment table preserved (${equipmentCount} equipments found)`);

    const ticketCount = await prisma.ticket.count();
    assert(ticketCount > 0, `Existing Ticket table preserved (${ticketCount} tickets found)`);

    console.log('\n====================================================');
    console.log(`ASSET TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAssetTests();
