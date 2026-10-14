import { SparePart, Ticket, Equipment } from '@/types';

export interface PartWithCompatibility extends SparePart {
  isCompatible: boolean;
  matchReason?: string;
}

/**
 * Maps and identifies compatible spare parts based on the equipment and problem context of a ticket.
 */
export function getCompatibleSpareParts(
  ticket: Ticket | null | undefined,
  allParts: SparePart[]
): {
  compatibleParts: PartWithCompatibility[];
  allPartsWithCompatibility: PartWithCompatibility[];
  equipmentLabel: string;
  hasEquipment: boolean;
} {
  if (!ticket) {
    const list = allParts.map((p) => ({ ...p, isCompatible: true }));
    return {
      compatibleParts: list,
      allPartsWithCompatibility: list,
      equipmentLabel: 'งานทั่วไป (ไม่ระบุครุภัณฑ์)',
      hasEquipment: false,
    };
  }

  const equipment = ticket.equipment;
  const eqName = (equipment?.name || '').toLowerCase();
  const eqCode = (equipment?.assetCode || '').toUpperCase();
  const category = (ticket.category || equipment?.categoryName || '').toLowerCase();
  const problemDesc = (ticket.description || '').toLowerCase();

  const hasEquipment = Boolean(equipment && (eqCode || eqName));
  const equipmentLabel = hasEquipment
    ? `[${equipment?.assetCode}] ${equipment?.name}`
    : `งานทั่วไป - ${ticket.category || 'ระบบอาคาร'}`;

  // Helper matching rule
  const isPartMatch = (part: SparePart): { matched: boolean; reason?: string } => {
    const code = part.partCode.toUpperCase();
    const name = part.name.toLowerCase();

    // 1. PC / Desktop Workstation / Server
    if (
      eqName.includes('desktop') ||
      eqName.includes('workstation') ||
      eqName.includes('precision') ||
      eqName.includes('hp z4') ||
      eqName.includes('computer') ||
      eqName.includes('คอมพิวเตอร์') ||
      eqCode === 'KKU-CP-67-0891' ||
      eqCode === 'KKU-CP-67-0892'
    ) {
      if (code === 'MAT-PWR-001' || name.includes('พาวเวอร์ซัพพลาย')) {
        return { matched: true, reason: 'ตรงรุ่น: แหล่งจ่ายไฟสำหรับ Workstation/PC' };
      }
      if (code === 'MAT-RAM-016' || name.includes('ram')) {
        return { matched: true, reason: 'ตรงรุ่น: หน่วยความจำสำหรับ Workstation/PC' };
      }
      if (code === 'MAT-SSD-512' || name.includes('ssd')) {
        return { matched: true, reason: 'ตรงรุ่น: สื่อจัดเก็บข้อมูล SSD NVMe' };
      }
      if (code === 'MAT-FAN-120' || name.includes('พัดลมระบายความร้อน')) {
        return { matched: true, reason: 'ตรงรุ่น: พัดลมระบายความร้อนเคส 120mm' };
      }
      if (code === 'MAT-NET-012' || code === 'MAT-NET-008' || code === 'MAT-DISP-003') {
        return { matched: true, reason: 'อุปกรณ์เชื่อมต่อมาตรฐานสำหรับ Workstation' };
      }
    }

    // 2. Server (Dell PowerEdge)
    if (eqName.includes('server') || eqName.includes('poweredge') || eqCode === 'KKU-CP-66-0121') {
      if (code === 'MAT-PWR-001' || code === 'MAT-RAM-016' || code === 'MAT-SSD-512' || code === 'MAT-FAN-120') {
        return { matched: true, reason: 'ตรงรุ่น: อะไหล่เซิร์ฟเวอร์ Rack Server' };
      }
      if (code === 'MAT-NET-024' || code === 'MAT-NET-012' || code === 'MAT-NET-008') {
        return { matched: true, reason: 'การ์ดและสายเครือข่ายความเร็วสูงสำหรับ Server' };
      }
    }

    // 3. Network Switch / Router (Cisco)
    if (
      eqName.includes('cisco') ||
      eqName.includes('catalyst') ||
      eqName.includes('switch') ||
      eqCode === 'KKU-CP-66-0120'
    ) {
      if (code === 'MAT-NET-008' || code === 'MAT-NET-012') {
        return { matched: true, reason: 'ตรงรุ่น: สายสัญญาณและหัวเชื่อมต่อสวิตช์เครือข่าย' };
      }
      if (code === 'MAT-NET-024' || code === 'MAT-PWR-001') {
        return { matched: true, reason: 'โมดูล Fiber SFP+ และแหล่งจ่ายไฟสวิตช์' };
      }
    }

    // 4. Air Conditioners (Daikin, Mitsubishi, Carrier)
    if (
      eqName.includes('แอร์') ||
      eqName.includes('ปรับอากาศ') ||
      eqName.includes('daikin') ||
      eqName.includes('mitsubishi') ||
      eqName.includes('carrier') ||
      eqCode === 'KKU-CP-65-0315' ||
      eqCode === 'KKU-CP-66-0112' ||
      eqCode === 'KKU-CP-66-0350'
    ) {
      if (code === 'MAT-AIR-009' || name.includes('แผ่นกรอง')) {
        return { matched: true, reason: 'ตรงรุ่น: แผ่นกรองอากาศคอยล์เย็นเครื่องปรับอากาศ' };
      }
      if (code === 'MAT-AIR-004' || name.includes('ท่อน้ำทิ้ง')) {
        return { matched: true, reason: 'ตรงรุ่น: ท่อน้ำทิ้งแอร์และระบบระบายน้ำ' };
      }
      if (code === 'MAT-AIR-015' || name.includes('แคปรัน')) {
        return { matched: true, reason: 'ตรงรุ่น: คาปาซิเตอร์คอมเพรสเซอร์แอร์' };
      }
      if (code === 'MAT-AIR-020' || name.includes('มอเตอร์พัดลม')) {
        return { matched: true, reason: 'ตรงรุ่น: มอเตอร์โบลเวอร์พัดลมแอร์' };
      }
    }

    // 5. Projector (Epson Laser)
    if (eqName.includes('projector') || eqName.includes('epson') || eqCode === 'KKU-CP-66-0442') {
      if (code === 'MAT-DISP-003' || code === 'MAT-DISP-008') {
        return { matched: true, reason: 'ตรงรุ่น: สายสัญญาณ HDMI และรีโมทโปรเจกเตอร์' };
      }
      if (code === 'MAT-NET-012' || code === 'MAT-NET-008') {
        return { matched: true, reason: 'สาย LAN สำหรับระบบควบคุมเครือข่ายโปรเจกเตอร์' };
      }
    }

    // 6. Interactive Display (Maxhub)
    if (eqName.includes('maxhub') || eqName.includes('จอสัมผัส') || eqName.includes('display') || eqCode === 'KKU-CP-66-0210') {
      if (code === 'MAT-DISP-003' || code === 'MAT-DISP-008') {
        return { matched: true, reason: 'ตรงรุ่น: สาย HDMI 4K และรีโมทควบคุมจออัจฉริยะ' };
      }
      if (code === 'MAT-NET-012' || code === 'MAT-PWR-001') {
        return { matched: true, reason: 'อุปกรณ์เชื่อมต่อสัญญาณและไฟจออัจฉริยะ' };
      }
    }

    // 7. Microphone (Shure Wireless)
    if (eqName.includes('ไมโครโฟน') || eqName.includes('shure') || eqCode === 'KKU-CP-67-0222') {
      if (code === 'MAT-AUD-001' || name.includes('ถ่านชาร์จ')) {
        return { matched: true, reason: 'ตรงรุ่น: ถ่านชาร์จสำหรับชุดไมโครโฟนไร้สาย Shure' };
      }
      if (code === 'MAT-AUD-005' || name.includes('xlr')) {
        return { matched: true, reason: 'ตรงรุ่น: สายสัญญาณเสียง Balanced XLR เครื่องรับสัญญาณ' };
      }
    }

    // 8. Laser Printer (HP LaserJet)
    if (eqName.includes('laserjet') || eqName.includes('เครื่องพิมพ์') || eqName.includes('printer') || eqCode === 'KKU-CP-67-0105') {
      if (code === 'MAT-PRN-001' || name.includes('ตลับหมึก')) {
        return { matched: true, reason: 'ตรงรุ่น: ตลับหมึกแท้ HP LaserJet Enterprise' };
      }
      if (code === 'MAT-NET-012' || code === 'MAT-PWR-001') {
        return { matched: true, reason: 'สายเชื่อมต่อเครือข่ายและไฟเครื่องพิมพ์' };
      }
    }

    // 9. UPS (APC Smart-UPS)
    if (eqName.includes('ups') || eqName.includes('สำรองไฟ') || eqName.includes('apc') || eqCode === 'KKU-CP-65-0455') {
      if (code === 'MAT-UPS-001' || name.includes('แบตเตอรี่')) {
        return { matched: true, reason: 'ตรงรุ่น: แบตเตอรี่สำรองไฟสำหรับ APC Smart-UPS' };
      }
      if (code === 'MAT-PWR-001' || code === 'MAT-NET-012') {
        return { matched: true, reason: 'ชุดอุปกรณ์ไฟและการตรวจวัดเครือข่าย UPS' };
      }
    }

    // Fallback: If no direct equipment match, check category or problem description
    if (!hasEquipment) {
      if (category.includes('คอมพิวเตอร์') || category.includes('เครือข่าย')) {
        if (code.startsWith('MAT-NET') || code.startsWith('MAT-PWR') || code.startsWith('MAT-RAM') || code.startsWith('MAT-SSD') || code.startsWith('MAT-FAN')) {
          return { matched: true, reason: 'หมวดหมู่: ระบบคอมพิวเตอร์และเครือข่าย' };
        }
      } else if (category.includes('ปรับอากาศ')) {
        if (code.startsWith('MAT-AIR')) {
          return { matched: true, reason: 'หมวดหมู่: ระบบปรับอากาศและการระบายอากาศ' };
        }
      } else if (category.includes('ไฟฟ้า') || category.includes('โสต')) {
        if (code.startsWith('MAT-DISP') || code.startsWith('MAT-AUD') || code.startsWith('MAT-UPS') || code.startsWith('MAT-PWR')) {
          return { matched: true, reason: 'หมวดหมู่: ระบบไฟฟ้าและโสตทัศนูปกรณ์' };
        }
      }
    }

    // If description mentions specific part keyword (e.g. "พาวเวอร์ซัพพลาย", "แอร์", "สายแลน")
    if (problemDesc.includes('พาวเวอร์ซัพพลาย') && code === 'MAT-PWR-001') {
      return { matched: true, reason: 'ตรวจพบจากอาการแจ้งซ่อม: พาวเวอร์ซัพพลาย' };
    }
    if (problemDesc.includes('แผ่นกรอง') && code === 'MAT-AIR-009') {
      return { matched: true, reason: 'ตรวจพบจากอาการแจ้งซ่อม: แผ่นกรองแอร์' };
    }
    if ((problemDesc.includes('lan') || problemDesc.includes('แลน')) && (code === 'MAT-NET-008' || code === 'MAT-NET-012')) {
      return { matched: true, reason: 'ตรวจพบจากอาการแจ้งซ่อม: สายแลน/พอร์ต LAN' };
    }

    return { matched: false };
  };

  const allWithComp: PartWithCompatibility[] = allParts.map((part) => {
    const match = isPartMatch(part);
    return {
      ...part,
      isCompatible: match.matched,
      matchReason: match.reason,
    };
  });

  const compatible = allWithComp.filter((p) => p.isCompatible);

  // If equipment was specified but nothing matched (edge case), fallback to all parts with flag
  return {
    compatibleParts: compatible.length > 0 ? compatible : allWithComp,
    allPartsWithCompatibility: allWithComp,
    equipmentLabel,
    hasEquipment,
  };
}
