# Vercel & Supabase Production Deployment Guide

This guide details the deployment procedure for **ChiroMemo** on **Vercel** with **Supabase Postgres + Storage + Auth**.

---

## 1. Prerequisites & Environment Variables

Configure the following environment variables in your **Vercel Project Settings > Environment Variables** (for `Production` and `Preview` environments):

| Variable Name | Exposure | Purpose | Source in Supabase / Google |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client + Server) | Supabase project URL | Supabase Dashboard > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client + Server) | Client PostgREST anon key | Supabase Dashboard > Project Settings > API > `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret (Server Only)** | Elevated server tasks | Supabase Dashboard > Project Settings > API > `service_role` key |
| `GEMINI_API_KEY` | **Secret (Server Only)** | AI Summaries, Search, Recommendations | Google AI Studio > [API Keys](https://aistudio.google.com/apikey) |

> [!IMPORTANT]
> `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` must **NEVER** be prefixed with `NEXT_PUBLIC_`. In ChiroMemo, they are guarded by `import "server-only";` and validated exclusively at runtime via `src/lib/env.ts`.

---

## 2. Supabase Cloud Configuration

### A. Database Migrations
Ensure all authoritative SQL migrations in `supabase/migrations/` have been executed against your production database:
1. `supabase/migrations/20260930000000_init_schema_and_rls.sql`
2. `supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql`

Verify that all 10 tables have Row Level Security enabled with user-scoped policies (`auth.uid() = user_id`).

### B. Storage Bucket
Ensure the private storage bucket exists:
- **Bucket Name**: `documents`
- **Public**: `false` (Private)
- **Allowed MIME types**: `application/pdf`, `text/plain`, `text/markdown`
- **File size limit**: 10 MB

### C. Supabase Auth Redirect URLs
In Supabase Dashboard > **Authentication > URL Configuration**:
- **Site URL**: `https://<your-vercel-subdomain>.vercel.app` (or custom domain)
- **Redirect URLs**:
  - `https://<your-vercel-subdomain>.vercel.app/**`
  - `http://localhost:3000/**` (for local development)

---

## 3. Pre-Deployment Verification Pipeline

Before triggering a deployment, always run the full verification pipeline locally:

```bash
# 1. Run unit, validation & security tests
npm run test

# 2. Typecheck strict TypeScript
npm run typecheck

# 3. Lint code hygiene
npm run lint

# 4. Compile Next.js production build
npm run build
```

Expected result: All tests pass, 0 TypeScript errors, 0 ESLint warnings, all 16 routes statically and dynamically compiled.

---

## 4. Vercel Deployment Settings

In the Vercel Dashboard when importing the Git repository:

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build` (or Next.js default `next build`)
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: `20.x` or `22.x`

---

## 5. Post-Deployment Smoke Test Checklist

Once the production deployment is live:
1. [ ] **Authentication**: Register a new student account, log out, and log back in.
2. [ ] **Dashboard**: Verify greeting displays student name and metrics render without layout shift.
3. [ ] **Goals & Roadmaps**: Create a learning goal, create a roadmap, and advance a step to completed.
4. [ ] **Resources & Documents**: Upload a sample PDF document and verify server text extraction.
5. [ ] **AI Summaries**: Click "Summarize with Gemini AI" on a resource and verify structured summary output.
6. [ ] **AI Intelligent Search**: Perform a natural-language search query on `/search` and confirm AI synthesis.
7. [ ] **Personalized Recommendations**: Visit `/recommendations` and confirm Gemini study strategy cards.

