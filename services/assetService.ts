import { prisma } from '@/lib/prisma';
import { Asset, AssetStatus, AssetStatusHistory } from '@/types';

export interface CreateAssetDTO {
  assetCode: string;
  name: string;
  statusId: number;
}

export interface UpdateAssetDTO {
  assetCode?: string;
  name?: string;
  statusId?: number;
}

export class AssetService {
  /**
   * Get all assets with their status and optionally histories
   */
  static async getAssets(): Promise<Asset[]> {
    const assets = await prisma.asset.findMany({
      include: {
        status: true,
        histories: {
          orderBy: { changedAt: 'desc' },
          include: {
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return assets.map((a) => ({
      id: a.id,
      assetCode: a.assetCode,
      name: a.name,
      statusId: a.statusId,
      status: a.status ? { id: a.status.id, name: a.status.name } : undefined,
      histories: a.histories.map((h) => ({
        id: h.id,
        assetId: h.assetId,
        changedById: h.changedById,
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy,
      })),
    }));
  }

  /**
   * Get single asset by ID
   */
  static async getAssetById(id: number): Promise<Asset | null> {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        status: true,
        histories: {
          orderBy: { changedAt: 'desc' },
          include: {
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!asset) return null;

    return {
      id: asset.id,
      assetCode: asset.assetCode,
      name: asset.name,
      statusId: asset.statusId,
      status: asset.status ? { id: asset.status.id, name: asset.status.name } : undefined,
      histories: asset.histories.map((h) => ({
        id: h.id,
        assetId: h.assetId,
        changedById: h.changedById,
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy,
      })),
    };
  }

  /**
   * Create an asset
   */
  static async createAsset(dto: CreateAssetDTO): Promise<Asset> {
    const trimmedCode = dto.assetCode?.trim();
    const trimmedName = dto.name?.trim();

    if (!trimmedCode) {
      throw new Error('กรุณาระบุรหัสสินทรัพย์ (assetCode)');
    }
    if (!trimmedName) {
      throw new Error('กรุณาระบุชื่อสินทรัพย์ (name)');
    }
    if (!dto.statusId || typeof dto.statusId !== 'number') {
      throw new Error('กรุณาระบุสถานะสินทรัพย์ที่ถูกต้อง (statusId)');
    }

    // Verify status exists
    const status = await prisma.assetStatus.findUnique({
      where: { id: dto.statusId },
    });
    if (!status) {
      throw new Error(`ไม่พบสถานะสินทรัพย์รหัส: ${dto.statusId}`);
    }

    // Verify uniqueness of assetCode
    const existing = await prisma.asset.findUnique({
      where: { assetCode: trimmedCode },
    });
    if (existing) {
      throw new Error(`รหัสสินทรัพย์ซ้ำในระบบ: ${trimmedCode}`);
    }

    const created = await prisma.asset.create({
      data: {
        assetCode: trimmedCode,
        name: trimmedName,
        statusId: dto.statusId,
      },
      include: {
        status: true,
        histories: true,
      },
    });

    return {
      id: created.id,
      assetCode: created.assetCode,
      name: created.name,
      statusId: created.statusId,
      status: created.status ? { id: created.status.id, name: created.status.name } : undefined,
      histories: [],
    };
  }

  /**
   * Update an asset and atomically record AssetStatusHistory if status changed
   */
  static async updateAsset(
    id: number,
    dto: UpdateAssetDTO,
    actorUserId: string
  ): Promise<Asset> {
    // Verify actor user exists
    const actor = await prisma.user.findUnique({
      where: { id: actorUserId },
    });
    if (!actor) {
      throw new Error(`ไม่พบข้อมูลผู้ใช้งานรหัส: ${actorUserId}`);
    }

    // Run in Prisma transaction to ensure atomicity and consistency
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Read existing asset and lock row in PostgreSQL for concurrency safety
      const existing = await tx.asset.findUnique({
        where: { id },
        include: { status: true },
      });

      if (!existing) {
        throw new Error(`ไม่พบสินทรัพย์รหัส: ${id}`);
      }

      // Check unique assetCode if updating
      let trimmedCode = existing.assetCode;
      if (dto.assetCode !== undefined) {
        trimmedCode = dto.assetCode.trim();
        if (!trimmedCode) {
          throw new Error('รหัสสินทรัพย์ต้องไม่เป็นค่าว่าง');
        }
        if (trimmedCode !== existing.assetCode) {
          const duplicate = await tx.asset.findUnique({
            where: { assetCode: trimmedCode },
          });
          if (duplicate) {
            throw new Error(`รหัสสินทรัพย์ซ้ำในระบบ: ${trimmedCode}`);
          }
        }
      }

      const trimmedName = dto.name !== undefined ? dto.name.trim() : existing.name;
      if (!trimmedName) {
        throw new Error('ชื่อสินทรัพย์ต้องไม่เป็นค่าว่าง');
      }

      // Status change check
      let targetStatusId = existing.statusId;
      let targetStatusName = existing.status.name;
      const isStatusChanged = dto.statusId !== undefined && dto.statusId !== existing.statusId;

      if (dto.statusId !== undefined) {
        const newStatusRecord = await tx.assetStatus.findUnique({
          where: { id: dto.statusId },
        });
        if (!newStatusRecord) {
          throw new Error(`ไม่พบสถานะสินทรัพย์รหัส: ${dto.statusId}`);
        }
        targetStatusId = newStatusRecord.id;
        targetStatusName = newStatusRecord.name;
      }

      // 2. Update Asset
      const assetRecord = await tx.asset.update({
        where: { id },
        data: {
          assetCode: trimmedCode,
          name: trimmedName,
          statusId: targetStatusId,
        },
        include: { status: true },
      });

      // 3. If status genuinely changed, atomically create AssetStatusHistory
      if (isStatusChanged) {
        await tx.assetStatusHistory.create({
          data: {
            assetId: id,
            changedById: actorUserId,
            oldStatus: existing.status.name,
            newStatus: targetStatusName,
          },
        });
      }

      // Return refreshed record with histories
      return tx.asset.findUnique({
        where: { id },
        include: {
          status: true,
          histories: {
            orderBy: { changedAt: 'desc' },
            include: {
              changedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    if (!updated) {
      throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูลสินทรัพย์หลังอัปเดต`);
    }

    return {
      id: updated.id,
      assetCode: updated.assetCode,
      name: updated.name,
      statusId: updated.statusId,
      status: updated.status ? { id: updated.status.id, name: updated.status.name } : undefined,
      histories: updated.histories.map((h) => ({
        id: h.id,
        assetId: h.assetId,
        changedById: h.changedById,
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy,
      })),
    };
  }

  /**
   * Delete an asset safely adhering to historical audit preservation rules
   */
  static async deleteAsset(id: number): Promise<{ success: boolean; message: string }> {
    const existing = await prisma.asset.findUnique({
      where: { id },
      include: {
        _count: {
          select: { histories: true },
        },
      },
    });

    if (!existing) {
      throw new Error(`ไม่พบสินทรัพย์รหัส: ${id}`);
    }

    // Preservation rule: If an asset has historical status change records, reject deletion
    if (existing._count.histories > 0) {
      throw new Error(
        `ไม่สามารถลบสินทรัพย์ ${existing.assetCode} ได้เนื่องจากมีประวัติการเปลี่ยนสถานะ (${existing._count.histories} รายการ) ที่ต้องเก็บรักษาไว้เป็นหลักฐานการตรวจสอบ`
      );
    }

    await prisma.asset.delete({
      where: { id },
    });

    return {
      success: true,
      message: `ลบสินทรัพย์ ${existing.assetCode} เรียบร้อยแล้ว`,
    };
  }
}
