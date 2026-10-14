/**
 * CP Fondue - Mock AI Image Analysis Service (Demo Simulation)
 *
 * This service simulates visual AI inspection for maintenance tickets.
 * Strictly local simulation - NO external AI providers, NO API keys, NO external network calls.
 *
 * Rules:
 * AI will ONLY fill:
 * 1. Category (หมวดหมู่)
 * 2. Equipment Code (เลขครุภัณฑ์)
 * 3. Location (สถานที่ ดึงอัตโนมัติจากเลขครุภัณฑ์)
 * AI will NOT overwrite user's problem description.
 */

export interface MockAiScenario {
  id: string;
  name: string;
  category: string;
  equipmentCode: string;
  equipmentName: string;
  locationId: string;
  locationName: string;
  description: string;
  suggestedLocationDetail?: string;
  confidenceScore: number;
  detectedObjects: string[];
}

export const VALID_CATEGORIES = [
  'ระบบคอมพิวเตอร์และเครือข่าย',
  'ระบบปรับอากาศ',
  'ระบบไฟฟ้าและแสงสว่าง',
  'โสตทัศนูปกรณ์',
  'อาคารสถานที่และเฟอร์นิเจอร์',
] as const;

export type ValidCategory = (typeof VALID_CATEGORIES)[number];

export const MOCK_SCENARIOS: MockAiScenario[] = [
  {
    id: 'scenario_pc',
    name: 'ตรวจพบความผิดปกติของคอมพิวเตอร์เวิร์กสเตชัน',
    category: 'ระบบคอมพิวเตอร์และเครือข่าย',
    equipmentCode: 'KKU-CP-67-0891',
    equipmentName: 'Desktop Workstation HP Z4 G4',
    locationId: 'loc_03',
    locationName: 'SC-09 ชั้น 3 • ห้อง 304 (Lab High-Performance Computing)',
    description:
      'เครื่องคอมพิวเตอร์เปิดสวิตช์แล้วไม่ติด พัดลมด้านหลังเคสไม่หมุน มีกลิ่นไหม้ผิดปกติ ตรวจสอบปลั๊กไฟ AC เสียบแน่นหนาดีแล้ว',
    suggestedLocationDetail: 'โต๊ะคอมพิวเตอร์แถวที่ 3 เครื่องริมหน้าต่าง',
    confidenceScore: 0.94,
    detectedObjects: ['PC Desktop Case', 'Power Supply Unit', 'Asset QR Code Tag'],
  },
  {
    id: 'scenario_ac',
    name: 'ตรวจพบคราบน้ำรั่วซึมจากเครื่องปรับอากาศ',
    category: 'ระบบปรับอากาศ',
    equipmentCode: 'KKU-CP-65-0315',
    equipmentName: 'เครื่องปรับอากาศ Daikin Inverter 36000 BTU',
    locationId: 'loc_02',
    locationName: 'SC-09 ชั้น 2 • ห้อง 202 (ห้องบรรยาย Smart Classroom 202)',
    description:
      'เครื่องปรับอากาศมีน้ำหยดรั่วซึมลงมาบนพื้นและโต๊ะเรียนอย่างต่อเนื่อง ลมแอร์ไม่เย็น และมีเสียงพัดลมคอยล์เย็นสั่นดังผิดปกติ',
    suggestedLocationDetail: 'เครื่องปรับอากาศติดผนังตัวที่ 2 ด้านหลังห้อง',
    confidenceScore: 0.91,
    detectedObjects: ['Air Conditioning Unit', 'Water Leakage', 'Asset Tag Label'],
  },
  {
    id: 'scenario_electric',
    name: 'ตรวจพบความผิดปกติของเครื่องสำรองไฟและระบบจ่ายไฟ',
    category: 'ระบบไฟฟ้าและแสงสว่าง',
    equipmentCode: 'KKU-CP-65-0455',
    equipmentName: 'เครื่องสำรองไฟ APC Smart-UPS RT 10kVA On-Line',
    locationId: 'loc_04',
    locationName: 'SC-09 ชั้น 4 • ห้อง 405 (Network Operation Center & Server Room)',
    description:
      'เครื่องสำรองไฟมีสัญญาณเตือนสถานะแบตเตอรี่ผิดปกติและตัดไฟบ่อยครั้ง',
    suggestedLocationDetail: 'ตู้ Rack สำรองไฟแถว A ด้านซ้าย',
    confidenceScore: 0.89,
    detectedObjects: ['UPS Power Backup', 'Circuit Breaker', 'Asset Barcode Tag'],
  },
  {
    id: 'scenario_av',
    name: 'ตรวจพบโปรเจกเตอร์หรือระบบแสดงผลขัดข้อง',
    category: 'โสตทัศนูปกรณ์',
    equipmentCode: 'KKU-CP-66-0442',
    equipmentName: 'Projector Epson Laser EB-L520U',
    locationId: 'loc_01',
    locationName: 'SC-09 ชั้น 1 • ห้อง 101 (ห้องสำนักงานคณบดีและธุรการ)',
    description:
      'เครื่องฉายโปรเจกเตอร์เปิดแล้วภาพไม่ขึ้น มีไฟสีส้มเตือนสถานะหลอดภาพกะพริบ สาย HDMI เชื่อมต่อแล้วไม่มีสัญญาณภาพ',
    suggestedLocationDetail: 'โปรเจกเตอร์แขวนเพดานตรงกลางห้อง',
    confidenceScore: 0.87,
    detectedObjects: ['Overhead Projector', 'HDMI Cable', 'Warning Indicator LED'],
  },
  {
    id: 'scenario_facility',
    name: 'ตรวจพบจอสัมผัสอัจฉริยะห้องเรียนชำรุด',
    category: 'อาคารสถานที่และเฟอร์นิเจอร์',
    equipmentCode: 'KKU-CP-66-0210',
    equipmentName: 'จอสัมผัสอัจฉริยะ Maxhub Interactive Display 86 นิ้ว',
    locationId: 'loc_02',
    locationName: 'SC-09 ชั้น 2 • ห้อง 202 (ห้องบรรยาย Smart Classroom 202)',
    description:
      'จอสัมผัสอัจฉริยะหน้าห้องเรียนระบบสัมผัสไม่ตอบสนองและภาพกะพริบ',
    suggestedLocationDetail: 'ผนังหน้าห้องเรียนฝั่งเวทีผู้สอน',
    confidenceScore: 0.92,
    detectedObjects: ['Interactive Touch Display', 'Wall Mounting Frame', 'Asset Serial Label'],
  },
];

let globalScenarioCounter = 0;

/**
 * Simulates AI image analysis with deterministic cycle and 1.2 - 1.5s delay.
 */
export async function analyzePhotoMock(
  imageUrls: string[],
  overrideScenarioIndex?: number
): Promise<MockAiScenario> {
  if (!imageUrls || imageUrls.length === 0) {
    throw new Error('ไม่พบรูปภาพสำหรับวิเคราะห์ กรุณาแนบรูปภาพก่อนตรวจสอบ');
  }

  // Simulate network & inference latency: ~1350ms (within 1.2 - 1.5s requirement)
  await new Promise((resolve) => setTimeout(resolve, 1350));

  let scenarioIndex: number;
  if (typeof overrideScenarioIndex === 'number' && overrideScenarioIndex >= 0) {
    scenarioIndex = overrideScenarioIndex % MOCK_SCENARIOS.length;
  } else {
    // Deterministic selection based on image URL hash + counter cycle for repeatability
    const firstUrl = imageUrls[0] || '';
    let hash = 0;
    for (let i = 0; i < firstUrl.length; i++) {
      hash = (hash + firstUrl.charCodeAt(i)) % MOCK_SCENARIOS.length;
    }
    scenarioIndex = (hash + globalScenarioCounter) % MOCK_SCENARIOS.length;
    globalScenarioCounter++;
  }

  const selected = MOCK_SCENARIOS[scenarioIndex];

  // Double check category validity against system options
  if (!VALID_CATEGORIES.includes(selected.category as ValidCategory)) {
    throw new Error(`หมวดหมู่ที่จำลองไม่ตรงกับตัวเลือกระบบ: ${selected.category}`);
  }

  return selected;
}
