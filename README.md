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

## 🗄️ Database Mapping: Chen's Notation to Prisma Schema

| Thai Entity in `ER_diagram.png` | English Table Name | Key Attributes & Relationships |
|---|---|---|
| **ผู้ใช้** | `User` (`users`) | `id`, `firstName`, `lastName`, `email` (KKU Mail), `phoneNumber`, `roleId`, `departmentId` |
| **ตำแหน่ง / ตำแหน่งผู้ใช้** | `Role` (`roles`) | `REPORTER`, `ADMIN_DISPATCH`, `TECHNICIAN`, `EXECUTIVE` |
| **แผนก** | `Department` (`departments`) | `departmentName`, `buildingRef` |
| **สถานที่** | `Location` (`locations`) | `building`, `floor`, `roomNumber`, `roomName` |
| **ครุภัณฑ์** | `Equipment` (`equipments`) | `assetCode`, `name`, `serialNumber`, `specDetails`, `warrantyStatus`, `locationId`, `categoryId` |
| **หมวดหมู่ปัญหา** | `Category` (`categories`) | `name` (คอมพิวเตอร์และเครือข่าย, ปรับอากาศ, ไฟฟ้า, etc.) |
| **ใบแจ้งซ่อม** | `Ticket` (`tickets`) | `ticketNumber` (`REQ-YYYYMM-XXXX`), `description`, `urgency`, `status`, `targetSlaDate`, `adminNotes`, `repairNotes` |
| **รูปภาพประกอบ** | `TicketAttachment` | `fileUrl`, `fileType`, `phase` (`BEFORE_REPAIR`, `AFTER_REPAIR`), `caption` |
| **ประวัติการเปลี่ยนสถานะใบแจ้งซ่อม** | `TicketStatusHistory` | `oldStatus`, `newStatus`, `notes`, `changedById`, `changedAt` |
| **แท็ก / ติดแท็กให้ใบแจ้งซ่อม** | `Tag` / `TicketTagMap` | Many-to-many relationship (`ticket_tags`) |
| **คลังอะไหล่** | `SparePart` (`spare_parts`) | `partCode`, `name`, `unit`, `stockQuantity`, `unitCost`, `storageRoom` |
| **ใบเบิกอะไหล่** | `SparePartRequest` | `requestNumber` (`REQ-INV-XXX`), `ticketId`, `requestedById`, `approvedById`, `status` |
| **รายการในใบเบิกอะไหล่** | `SparePartRequestItem` | `requestId`, `partId`, `quantity` |
| **แบบประเมิน** | `Evaluation` (`evaluations`) | `score` (1-5 stars), `feedback`, `evaluatedAt` |
| **ประวัติการแก้ไขข้อมูลเชิงลึก** | `AuditLog` (`audit_logs`) | `tableName`, `command_used`, `recordId`, `old_data`, `new_data`, `user_id` |
| **ประวัติการส่งอีเมลแจ้งเตือน** | `EmailNotificationLog` | `recipient_email`, `subject`, `send_status`, `error_message` |

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
