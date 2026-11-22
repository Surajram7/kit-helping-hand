# 🚀 KIT HELPING HAND — LIVE DEPLOYMENT RUNBOOK

This document details the tested deployment architecture for **KIT Helping Hand** so that it can be hosted live on the internet with persistent database storage, document serving, and zero hosting fees.

---

## 🌟 Option A: 100% Free Vercel Full-Stack Deployment (NO CREDIT CARD REQUIRED)

Vercel provides free, high-performance hosting with zero credit card requirements. The repository includes an automated `vercel.json` and a serverless API adapter (`api/index.ts`).

### Step 1: Sign in to Vercel
1. Open **[vercel.com](https://vercel.com)**.
2. Click **Log In** / **Sign Up** and select **Continue with GitHub**.
3. Authorize Vercel to access your GitHub repositories.

### Step 2: Import the Repository
1. On your Vercel Dashboard, click **Add New...** (top right) ➔ **Project**.
2. Under "Import Git Repository", find **`kit-helping-hand`** (under `Surajram7`).
3. Click the blue **Import** button.

### Step 3: Configure Project Settings
1. **Project Name:** `kit-helping-hand` (or leave default).
2. **Framework Preset:** `Vite` (detected automatically).
3. **Root Directory:** `./` (default).
4. **Build and Output Settings:** Leave default (Vercel automatically detects `npm run build` and `client/dist` from `vercel.json`).
5. **Environment Variables:** Expand the **Environment Variables** section and add:
   * `NODE_ENV` = `production`
   * `JWT_SECRET` = `kit_helping_hand_super_secure_production_secret_2025`
   * `JWT_EXPIRES_IN` = `7d`
   * `INITIAL_ADMIN_EMAIL` = `admin@kit.edu.pk`
   * `INITIAL_ADMIN_PASSWORD` = `Admin@12345`
   * `INITIAL_ADMIN_NAME` = `KIT System Administrator`

### Step 4: Deploy!
1. Click the blue **Deploy** button.
2. Vercel will install dependencies, compile the TypeScript backend and React frontend, bundle Prisma and the storage vault, and deploy globally across Edge CDN in ~45 seconds.
3. You will receive your public live URL, e.g.:
   ```text
   https://kit-helping-hand.vercel.app
   ```

---

## ⚡ Option B: Render Deployment (Alternative PaaS)

Render is pre-configured via `render.yaml` if you have an account with card authorization completed.

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Select `Surajram7/kit-helping-hand`.
3. Set **Build Command:** `npm install && npm run build`
4. Set **Start Command:** `npm start`
5. Set **Instance Type:** Free ($0/mo).

---

## 🔑 Production Access Credentials

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@kit.edu.pk` | `Admin@12345` | Institutional CMS, Program & Batch control, Resource approvals, Audit logs, System Settings |
| **Class Representative (CR)** | `k241017@thekit.edu.pk` | `Student@12345` | Student dashboard, resource upload, request management, note viewing |
| **General Student** | *Self-register via `/register`* | *Custom* | Browse notes, download past papers, submit requests |

---

## 📋 Post-Deployment Verification Checklist

Once your live URL is active, verify the following endpoints:

- [ ] **Home Page:** Opens cleanly with hero section and KIT branding.
- [ ] **API Health:** `https://<YOUR-APP-URL>/api/health` returns `{ status: 'healthy', platform: 'KIT Helping Hand API' }`.
- [ ] **Academic Programs:** `https://<YOUR-APP-URL>/academics` displays DAE Civil, Electrical, CIT, Mechanical, etc.
- [ ] **Past Papers / Notes:** Past papers and subject resources load and PDFs stream/download.
- [ ] **Admin CMS:** Log in at `/login` with `admin@kit.edu.pk` and verify sidebar, stats, and audit logs.
- [ ] **LinkedIn Post:** Update [`LINKEDIN_SHOWCASE.md`](./LINKEDIN_SHOWCASE.md) with your live Vercel URL and share!
