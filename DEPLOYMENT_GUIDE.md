# 🚀 KIT HELPING HAND — LIVE DEPLOYMENT RUNBOOK

This document details the exact, tested deployment architecture for **KIT Helping Hand** so that it can be hosted live on the internet with persistent database storage and document serving.

---

## 🏗️ 1. Architecture Overview

| Component | Technology | Recommended Host | Free Tier Capability |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide | **Vercel** / **Render** | Fast CDN, automatic HTTPS, zero configuration SPA routing |
| **Backend** | Node.js, Express, TypeScript, REST | **Render** / **Railway** | Web Service with automatic git-deploy, SSL, rate-limiting |
| **Database** | Prisma ORM, SQLite / PostgreSQL | **Render Disk** / **Neon Postgres** | Persistent relational storage |
| **File Vault** | Private storage disk, Multer | **Persistent Disk** / **AWS S3 compatible** | Multi-format uploads (PDFs, Images, DOCX, ZIPs) |

---

## ⚡ Option A: Recommended 1-Click All-in-One Deployment (Render)

Render supports hosting both the backend API and the static React build inside a single Node.js web service. A pre-configured `render.yaml` blueprint is already created in the repository.

### Step 1: Push Code to GitHub
1. Open GitHub (https://github.com/new) and create a repository named: `kit-helping-hand`.
2. In your terminal, link and push your local commits:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/kit-helping-hand.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint** (or **Web Service**).
2. Connect your `kit-helping-hand` repository.
3. Render will automatically detect `render.yaml` and configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Set the Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(Generate a random 32-character secret)*
   - `INITIAL_ADMIN_EMAIL`: `admin@kit.edu.pk`
   - `INITIAL_ADMIN_PASSWORD`: `Admin@12345`
   - `CORS_ORIGIN`: `*`
5. Click **Apply / Create Web Service**.
6. Render will assign you a live public URL (e.g., `https://kit-helping-hand.onrender.com`).

---

## 🌐 Option B: Decoupled Deployment (Vercel Frontend + Render Backend)

### Step 1: Deploy Backend (Render)
1. In Render, select **New +** -> **Web Service**.
2. Set Root Directory to `server` (or run from root with start script `npm start`).
3. Set environment variables (`PORT=5000`, `DATABASE_URL=file:./dev.db`, `JWT_SECRET=...`).
4. Once deployed, copy your backend URL: e.g. `https://kit-api.onrender.com`.

### Step 2: Deploy Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository `kit-helping-hand`.
3. Set:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://kit-api.onrender.com`
5. Click **Deploy**. Vercel will assign your public domain (e.g. `https://kit-helping-hand.vercel.app`).
6. Update the backend `CORS_ORIGIN` on Render to `https://kit-helping-hand.vercel.app`.

---

## 🧪 3. Post-Deployment Verification Checklist

Once your live URL is live, verify the following workflows:
- [ ] **Homepage & Navigation:** Visit the URL and confirm institutional branding, KIT crest, and drawer menu open smoothly.
- [ ] **Super Admin Access:**
  - Login at `/login` with `admin@kit.edu.pk` / `Admin@12345`.
  - Access `/admin` to verify Document Center, Academic Hierarchy, and User Management.
- [ ] **Student Registration & Login:**
  - Register a new student account at `/register`.
  - Verify the student dashboard loads personalized coursework.
- [ ] **Document Vault & PDF Viewer:**
  - Open `/resources` and preview an uploaded exam paper or handout.
  - Verify zoom, download, and Back button functionality.
- [ ] **CR / GR Permission:**
  - From the admin panel, promote a student to `CONTENT_MANAGER`.
  - Confirm the CR/GR sees the upload button on `/resources` and `/dashboard`.
