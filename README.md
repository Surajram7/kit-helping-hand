# KIT Helping Hand — Academic Resource Platform

> **Khanpur Institute of Technology (KIT), Pakistan**  
> *"Your Academic Resources, All in One Place."*

KIT Helping Hand is a production-ready, centralized institutional academic resource management platform engineered for Khanpur Institute of Technology. The system enables students to register, authenticate securely, and access lecture notes, course handouts, semester slides, and university past examination papers (solved and unsolved) across multiple degree affiliations (such as University of the Punjab and UET).

Authorized department administrators and faculty can manage academic programs, batches, semesters, subjects, document vaults, student requests, and user permissions through an integrated Administrative Control Center without touching application source code.

---

## 1. System Architecture & Tech Stack

- **Frontend:** React 18 with TypeScript, Tailwind CSS, Lucide Icons, React Router v7.
- **Backend:** Node.js with Express.js, TypeScript, and strict Zod runtime validation.
- **Database & ORM:** PostgreSQL (production) / SQLite (zero-config local runtime), Prisma ORM.
- **Security & RBAC:** Argon2/Bcrypt password hashing (salt rounds = 12), JWT authorization tokens, HTTP security headers (Helmet), Rate Limiting (`express-rate-limit`), Sanitized disk uploads with path-traversal prevention.
- **File Storage:** Private authenticated vault storage (`storage_vault/`) with controlled inline streaming for PDF previews and direct downloads.
- **Integrated PDF Viewing:** Responsive viewport with zoom controls (50%–200%), fullscreen toggle, solution verification badges, and secure download triggers.

---

## 2. Institutional Academic Hierarchy

The database strictly enforces the official institutional hierarchy:

$$\text{Institution (KIT)} \longrightarrow \text{Academic Program} \longrightarrow \text{Admission Batch} \longrightarrow \text{Semester} \longrightarrow \text{Subject} \longrightarrow \text{Resource File}$$

### Supported Academic Categories
1. **Lecture Notes & Slides**
2. **Lecture PDFs & Handouts**
3. **Midterm Past Papers**
4. **Final-Term Past Papers**
5. **Mock Examination Papers**
6. **Previous Board Examination Papers**
7. **Solved Papers** (with verified answer keys)
8. **Unsolved Papers** (raw examination papers for revision practice)
9. **ELADE Materials & Assessments**

---

## 3. Quick Start & Development Setup

### Prerequisites
- Node.js `v18+` or `v22+`
- npm `10+`

### Installation
Clone or navigate to the repository directory and install all workspace dependencies:
```bash
npm install
```

### Initial Database Sync & Admin Provisioning
The application is pre-configured with local zero-dependency SQLite for immediate out-of-the-box operation on any workstation:

```bash
# Push database schema
npm run prisma:push --workspace=server

# Provision the initial Super Administrator and platform settings
npm run seed --workspace=server
```

> **Default Provisioned Super Administrator:**
> - **Email:** `admin@kit.edu.pk`
> - **Password:** `AdminKit@2025!`
> - *(Configurable in `server/.env` via `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`)*

### Start Full Application (Backend + Frontend)
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **REST API Backend:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 4. End-to-End Administrator & Student Workflow

The platform delivers a verified, complete workflow:

1. **Administrator Sign In:**
   - Navigate to `/login` and sign in with `admin@kit.edu.pk` and `AdminKit@2025!`.
   - Access the **Admin Panel** via the top navigation bar.
2. **Configure Academic Structure:**
   - Under **Academic Hierarchy**, create an Academic Program (e.g., `BS Computer Science` / `BSCS`).
   - Create an Admission Batch (e.g., `Fall 2024 (F24)`).
   - Create Semesters (e.g., `Semester 1` to `Semester 8`).
   - Configure University Affiliations (e.g., `University of the Punjab (PU)`).
   - Create Subjects linked to the program and semester (e.g., `Programming Fundamentals` `CS-101`).
3. **Upload Academic Material:**
   - In **Upload & Resources**, enter document title, attach the PDF, select the subject, and choose category (Lecture Note or Past Paper).
   - Toggle **Solved Paper** if answer keys are included.
   - Click **Upload & Publish Resource**.
4. **Student Experience:**
   - A student navigates to `/register`, enters their details, and selects their program, semester, and batch.
   - On the **Student Dashboard**, the student sees recently uploaded notes and examination papers.
   - On the **Past Papers** page, the student can filter papers by university affiliation (e.g. PU), semester, and solved/unsolved status.
   - Clicking **Preview** opens the document in the integrated PDF viewer with zoom and fullscreen controls.
   - The student can safely download the file.
5. **Student Inquiries & Faculty Feedback:**
   - The student submits a missing paper request on the **Student Requests** desk (`/requests`).
   - The administrator inspects the request in the Admin Panel, posts an official faculty answer, and updates the status to `IN_PROGRESS` or `COMPLETED`.
   - The student sees the live resolution on their dashboard.

---

## 5. Automated Testing Suite

Comprehensive unit and integration test suites are included using Vitest and Supertest:
```bash
npm test --workspace=server
```

**Covered Test Scenarios (18 Automated Tests):**
- Student account registration, duplicate checks, and password validation.
- User authentication, JWT issuance, and profile retrieval.
- Unauthorized access rejection on privileged administrative endpoints.
- Academic Program, Semester, Affiliation, and Subject CRUD operations.
- Lecture note PDF upload with multipart metadata storage.
- Solved/unsolved past paper examination classification.
- Document retrieval, search queries, and affiliation filtering.
- Student request submission, administrator status updates, and discussion comment threads.

---

## 6. Production Deployment with Docker & PostgreSQL

A multi-container `docker-compose.yml` configuration is provided for enterprise deployment with PostgreSQL:

```bash
# Start PostgreSQL, Express API, and NGINX Frontend
docker-compose up --build -d
```

### PostgreSQL Environment Configuration
To use PostgreSQL directly in non-Docker environments:
1. Update `server/prisma/schema.prisma` datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your connection string in `server/.env`:
   ```env
   DATABASE_URL="postgresql://kit_user:kit_password@localhost:5432/kit_helping_hand?schema=public"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

---

## 7. Database Backup & Disaster Recovery

### SQLite Backup (Local / Staging)
```bash
# Backup
cp server/dev.db server/backups/dev_$(date +%F).db
# File Vault Backup
tar -czvf storage_vault_$(date +%F).tar.gz server/storage_vault/
```

### PostgreSQL Backup (Production)
```bash
# Database Dump
pg_dump -U kit_admin -d kit_helping_hand -F c -b -v -f /backups/kit_db_$(date +%F).dump

# Database Restoration
pg_restore -U kit_admin -d kit_helping_hand -v /backups/kit_db_2025-01-01.dump
```

---

## 8. REST API Reference

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Register new student account |
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile |
| `/api/academic/hierarchy` | `GET` | Public | Get programs, semesters, affiliations, subjects |
| `/api/academic/programs` | `GET` / `POST` | Public / Admin | List or create academic programs |
| `/api/resources` | `GET` / `POST` | Public / Staff | Search resources or upload new files |
| `/api/resources/files/:id/view` | `GET` | Public/Staff | Stream PDF document for preview |
| `/api/resources/files/:id/download` | `GET` | Public/Staff | Download document & increment counters |
| `/api/past-papers` | `GET` | Public | Filter exam papers by affiliation & solved status |
| `/api/requests` | `POST` / `GET` | Student / Staff | Submit or list resource inquiries |
| `/api/admin/stats` | `GET` | Admin | Real calculated platform statistics |
| `/api/admin/users` | `GET` | Admin | User management directory |
| `/api/settings` | `GET` / `PUT` | Public / Admin | Platform branding & institutional policies |
