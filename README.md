# CP Fondue Online Repair System (ระบบแจ้งซ่อมออนไลน์ วิทยาลัยการคอมพิวเตอร์ มข.)

A full-stack, database-ready Next.js prototype designed and built according to:
1. **Software Requirements & Diagrams (`fullreport-03-1.pdf`)**: Business Rules (BR1 - BR12), Use Case Scenarios (UC-1 to UC-11), Sequence & Activity Diagrams, and UI Prototypes.
2. **Conceptual Database Schema (`ER_diagram.png`)**: Chen's Notation in Thai translated into modern relational PostgreSQL entities via Prisma ORM.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React Icons
- **Backend & API**: Next.js App Router API Route Handlers (`/app/api/...`)
- **Service Layer**: Modular decoupled services (`/services`) with mock state and native Prisma ORM calls
- **Database ORM**: Prisma ORM with comprehensive relational schema (`/prisma/schema.prisma`)
- **Authentication Simulation**: KKU Single Sign-On (KKU Mail `@kkumail.com`) with role-based portal switching

---

## 🏛️ System Architecture & Folder Structure

```
.
├── prisma/
│   └── schema.prisma         # Relational schema translated from ER_diagram.png
├── lib/
│   └── prisma.ts             # Prisma client singleton instance
├── services/                 # Decoupled business logic & ORM integration
│   ├── ticketService.ts      # CRUD, dispatch, accept, close, and evaluate tickets
│   ├── sparePartService.ts   # Inventory stock & UC-10 material requisitions
│   ├── userService.ts        # Technician workload roster & user profiles
│   ├── auditService.ts       # BR7, BR11, EdPEx compliance audit trails
│   └── statsService.ts       # Executive SLA & EdPEx quality assurance stats
├── types/
│   └── index.ts              # TypeScript models, enums, DTOs & view models
├── data/
│   └── mockData.ts           # Realistic CP KKU dataset mirroring the prototypes
├── components/
│   ├── common/               # Navbar (SSO user profile & tabs), Footer (Hotline 44444)
│   ├── reporter/             # UC-1 Form, UC-2 Stepper Tracker, UC-6 Rating, UC-4 History
│   ├── admin/                # BR4 Queue, UC-9 Dispatch Drawer, UC-10 Approval, Walk-in
│   ├── technician/           # BR5/6 New Job, Wi-Fi Check-in, Requisition, Before/After Proof
│   └── executive/            # SLA Donut/Bar charts, Tech Leaderboard, Audit Compliance
├── app/
│   ├── api/                  # RESTful API Endpoints
│   │   ├── tickets/          # GET, POST /api/tickets, PATCH /api/tickets/[id]
│   │   ├── spare-parts/      # GET inventory, GET/POST/PATCH requisitions
│   │   ├── technicians/      # GET technician roster & real-time workloads
│   │   ├── audit-logs/       # GET EdPEx compliance logs
│   │   └── analytics/        # GET executive KPI & SLA metrics
│   ├── reporter/page.tsx     # Reporter Portal (UI Prototype Page 89)
│   ├── admin/page.tsx        # Admin Dispatch Desk (UI Prototype Page 90)
│   ├── technician/page.tsx   # Technician Portal (UI Prototype Page 91)
│   ├── executive/page.tsx    # Executive Suite (UI Prototype Page 92)
│   └── page.tsx              # Portal Switcher & System Architecture Hub
```

---

## 🗄️ Database Mapping: `diagram.txt` (mxGraphModel) to Prisma Relational Schema

| Entity in `diagram.txt` | English Model & Table | Exact Attributes & Constraints from `diagram.txt` |
|---|---|---|
| **ผู้ใช้** | [`User`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L20-L55) (`users`) | `[PK] รหัสผู้ใช้`, `ชื่อจริง`, `นามสกุล`, `KKU_MAIL` (unique), `เบอร์โทรศัพท์`, `เวลาที่สร้างผู้ใช้`, `เวลาที่แก้ไขข้อมูลผู้ใช้`, `เวลาที่ลบข้อมูลผู้ใช้` |
| **ตำแหน่ง** | [`Position`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L60-L70) (`positions`) | `[PK] รหัสตำแหน่ง`, `ชื่อตำแหน่ง` |
| **แผนก** | [`Department`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L75-L85) (`departments`) | `[PK] รหัสแผนก`, `ชื่อแผนก` |
| **สถานที่** | [`Location`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L90-L103) (`locations`) | `[PK] รหัสสถานที่`, `ชื่อห้อง`, `เลขห้อง`, `ชั้น` |
| **ครุภัณฑ์** | [`Equipment`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L108-L125) (`equipments`) | `[PK] ลำดับครุภัณฑ์ในระบบ` (underlined PK), `รหัสครุภัณฑ์`, `ชื่อครุภัณฑ์`, `สถานะครุภัณฑ์`, `locationId` |
| **หมวดหมู่ปัญหา** | [`ProblemCategory`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L130-L140) (`problem_categories`) | `[PK] รหัสหมวดหมู่`, `ชื่อหมวดหมู่` |
| **สถานะงาน** | [`WorkStatus`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L145-L156) (`work_statuses`) | `[PK] รหัสสถานะ`, `ชื่อสถานะ`, `รายละเอียดสถานะ` |
| **ใบแจ้งซ่อม** | [`Ticket`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L161-L200) (`tickets`) | `[PK] รหัสใบแจ้งซ่อม`, `รายละเอียดปัญหา`, `สถานะปัจจุบัน`, `เวลาที่สร้างใบแจ้งซ่อม`, `เวลาที่อัปเดตใบแจ้งซ่อม`, `เวลาที่ยกเลิกใบแจ้งซ่อม`, `reporterUserId`, `categoryId`, `equipmentId`, `statusId` |
| **รูปภาพประกอบ** | [`TicketAttachment`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L205-L218) (`ticket_attachments`) | `[PK] รหัสรูปภาพ`, `รหัสใบแจ้งซ่อม` (FK), `ที่อยู่ของไฟล์รูปภาพ`, `เวลาที่อัปโหลด`, `ประเภทไฟล์` |
| **ประวัติการเปลี่ยนสถานะใบแจ้งซ่อม** | [`TicketStatusHistory`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L223-L240) (`ticket_status_histories`) | `[PK] รหัสประวัติการเปลี่ยนสถานะใบแจ้งซ่อม`, `รหัสใบแจ้งซ่อม` (FK), `สถานะใบแจ้งซ่อมเดิม`, `ผู้ที่เปลี่ยนสถานะใบแจ้งซ่อม` (FK), `เวลาที่เปลี่ยนสถานะใบแจ้งซ่อม`, `หมายเหตุใบแจ้งซ่อม` |
| **แบบประเมิน** | [`Evaluation`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L245-L259) (`evaluations`) | `[PK] รหัสแบบประเมิน`, `รหัสใบแจ้งซ่อม` (FK), `คะแนนการประเมิน`, `ข้อเสนอแนะ`, `เวลาที่ทำแบบประเมิน` |
| **ประวัติการส่งอีเมลแจ้งเตือน** | [`EmailNotificationLog`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L264-L277) (`email_notification_logs`) | `[PK] รหัสประวัติการส่งอีเมลแจ้งเตือน`, `รหัสใบแจ้งซ่อม` (FK), `สถานะการส่งอีเมล`, `ข้อความแจ้งเตือนกรณีส่งไม่สำเร็จ` |
| **แท็ก** | [`Tag`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L282-L292) (`tags`) | `[PK] Tag_ID`, `ชื่อแท็ก` |
| **ติดแท็กให้ใบแจ้งซ่อม** | [`TicketTagMap`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L297-L306) (`ticket_tag_maps`) | Associative M:N table between `Ticket` and `Tag` (`ticket_id`, `tag_id`) |
| **คลังเก็บอะไหล่** | [`SparePartInventory`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L311-L322) (`spare_part_inventories`) | `[PK] รหัสอะไหล่`, `ชื่ออะไหล่`, `จำนวนอะไหล่` |
| **ใบเบิกอะไหล่** | [`SparePartRequisition`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L327-L347) (`spare_part_requisitions`) | `[PK] รหัสใบเบิกอะไหล่`, `รหัสใบแจ้งซ่อม` (FK), `รหัสอะไหล่` (FK), `ผู้ที่ขอเบิกอะไหล่` (FK), `จำนวนที่เบิก`, `หมายเหตุใบเบิกอะไหล่`, `เวลาที่สร้างใบเบิกอะไหล่`, `เวลาที่แก้ไขใบเบิกอะไหล่` |
| **ประวัติการเปลี่ยนสถานะใบเบิกอะไหล่** | [`SparePartStatusHistory`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L352-L368) (`spare_part_status_histories`) | `[PK] รหัสประวัติการเบิกอะไหล่`, `รหัสใบเบิกอะไหล่` (FK), `สถานะใบเบิกอะไหล่เดิม`, `สถานะใบเบิกอะไหล่ใหม่`, `ผู้อนุมัติการเบิก` (FK), `เวลาที่อนุมัติ` |
| **ประวัติการแก้ไขข้อมูลเชิงลึก** | [`AuditLog`](file:///home/notsiri/university/projects/database/prisma/schema.prisma#L373-L390) (`audit_logs`) | `[PK] รหัสของประวัติการแก้ไขข้อมูลเชิงลึก`, `ชื่อตารางที่มีถูกแก้ไข`, `คำสั่งที่ใช้`, `ข้อมูลเก่า`, `ข้อมูลใหม่ของตาราง`, `ผู้ที่แก้ไขตาราง` (FK), `เวลาที่แก้ไขตาราง` |

---

## 📋 Business Rules Implementation (BR1 - BR12)

- **BR1 & BR12**: User authentication via KKU Mail Single Sign-On (displayed in header badge and user profile).
- **BR2**: Reporter must specify room/location, problem details, and upload 1-3 damage photos before submitting.
- **BR3**: Automatic sequential ticket generation (`REQ-YYYYMM-XXXX`) routed immediately to Admin Dispatch Queue.
- **BR4**: Admin dispatch checklist (ownership verification, duplicate check in last 24h, technician assignment).
- **BR5 & BR6**: Technician must accept job before commencing; status transitions to "กำลังปฏิบัติงาน (In Progress)" and displays technician's name and contact number to reporter.
- **BR7 & BR11**: Real-time status tracking and audit trail logging for all status transitions and edits.
- **BR8**: Technician must upload proof photos (Before & After comparison) and repair notes before closing job.
- **BR9**: Closing job updates status to "ดำเนินการเสร็จสิ้น (Completed)".
- **BR10**: Automated satisfaction evaluation trigger with 5-star rating and improvement feedback form.

---

## 💻 Running the Application

### 1. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Available Routes
- **Portal Hub & Landing**: `http://localhost:3000/`
- **Reporter Portal**: `http://localhost:3000/reporter`
- **Admin Dispatch Desk**: `http://localhost:3000/admin`
- **Technician Portal**: `http://localhost:3000/technician`
- **Executive Suite**: `http://localhost:3000/executive`

### 3. Database Connection
To connect a live PostgreSQL database:
1. Set `DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"` in `.env`.
2. Set `USE_MOCK_DATA="false"` in `.env`.
3. Run `npx prisma db push` or `npx prisma migrate dev`.
4. The service layer (`/services`) will automatically execute direct queries against Prisma ORM.
