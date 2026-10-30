# ChiroMemo

**Personal Learning and Knowledge Management System (PLKMS) for University Students**

ChiroMemo is a full-stack academic web application designed to help university students organize, track, and optimize their independent study journeys. It integrates structured goal setting, learning roadmaps, study resources with PDF text extraction, markdown notes, and AI-assisted knowledge synthesis (summarization, multi-entity search, and personalized recommendations).

---

## Key System Modules & Features

- **🎯 Learning Goals & Milestones**: Define academic targets with priority rankings, target completion dates, and bi-directional links to learning roadmaps.
- **🗺️ Learning Roadmaps & Steps**: Create sequential study curricula with reorderable milestone steps and real-time progress status tracking.
- **📚 Resource Management & Document Upload**: Manage external reference links (articles, books, courses, videos) and upload academic PDF documents with automated server-side text extraction.
- **📝 Personal Markdown Notes**: Split-pane study journal with live Markdown preview, auto-save status, and direct association to roadmap milestones.
- **🤖 AI Document Summarizer**: Automated structural extraction and academic synthesis powered by Google Gemini.
- **🔍 AI-Powered Intelligent Search**: Cross-entity search indexing notes, resources, and roadmap steps, augmented with AI-synthesized findings.
- **💡 Personalized Recommendations**: Context-aware suggestions analyzing student workload, active roadmaps, and approaching goal deadlines.
- **📊 Analytics Dashboard**: Visual progress tracking and activity distribution powered by interactive charts.

---

## Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Full-stack React framework utilizing Server Components & Server Actions |
| **Language** | TypeScript | Strict type safety across client and server boundaries |
| **UI & Styling** | Tailwind CSS v4 + shadcn/ui | Accessible UI primitives styled with the *Warm Academic Studio* design system |
| **Database & Auth** | Supabase PostgreSQL 17 | Relational database with Row Level Security (RLS) and cookie-based SSR authentication |
| **Data Access** | Supabase Data API (PostgREST) | Direct, typed database access under authenticated user sessions |
| **Object Storage** | Supabase Storage | Private bucket for uploaded academic documents and PDFs |
| **Artificial Intelligence** | Google Gemini API (`@google/genai`) | Server-side LLM integration for text summarization, search synthesis, and study advice |
| **Visualization** | Recharts & Lucide React | Interactive progress charts and consistent icon set |

---

## Setup & Installation Guide

Follow these steps to run the application locally for evaluation or development.

### 1. Prerequisites
- **Node.js**: version `20.x` or higher
- **npm**: version `10.x` or higher
- A **Supabase** project account ([supabase.com](https://supabase.com))
- A **Google Gemini API Key** ([aistudio.google.com](https://aistudio.google.com/apikey))

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/<your-username>/ChiroMemo.git
cd ChiroMemo
npm install
```

### 3. Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
Fill in the required values in `.env.local`:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
GEMINI_API_KEY=<your-google-gemini-api-key>
```

> **Security Note:** Secrets like `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are strictly guarded on the server via `import "server-only";` and validated through `src/lib/env.ts`. They are never sent to the client browser.

### 4. Database Setup (Supabase)
1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor**.
3. Execute the migration scripts located in `supabase/migrations/` in chronological order:
   - `20260930000000_init_schema_and_rls.sql`
   - `20261002000000_learning_goals_relationships_and_priority.sql`
   - `20261013000000_reorder_roadmap_steps_rpc.sql`
   - `20261013000001_delete_and_reorder_roadmap_step_rpc.sql`
   - `20261021000000_phase_6_learning_resources.sql`
   - `20261022000000_phase_9_storage_and_documents.sql`
4. Under **Storage**, create a new **private** bucket named `documents` (allowed MIME types: `application/pdf`, `text/plain`, `text/markdown`).

### 5. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Testing Scripts

| Command | Description |
| :--- | :--- |
| `npm run typecheck` | Validates TypeScript types across the entire codebase (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint to verify code quality and style standards |
| `npm test` | Executes the automated test suite (validations, security, AI helpers) |
| `npm run build` | Compiles the production build |

---

## Application Structure & Routes

| Route | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Landing page introducing ChiroMemo |
| `/login` | Public | User authentication login screen |
| `/register` | Public | New student account registration screen |
| `/dashboard` | Protected | Learning metrics, progress charts, and recent activity |
| `/goals` | Protected | Goal setting, priority tracking, and detail views |
| `/roadmaps` | Protected | Step-by-step curricula and milestone management |
| `/resources` | Protected | Study materials, link bookmarks, and PDF uploads |
| `/notes` | Protected | Markdown note editor and journal archive |
| `/summaries` | Protected | AI-generated document summaries and key takeaways |
| `/search` | Protected | Cross-entity keyword & AI-synthesized knowledge search |
| `/recommendations` | Protected | AI study advisor and prioritized task suggestions |

---

## Technical Documentation

For in-depth architectural and database specifications, refer to:
- [System Architecture](file:///docs/ARCHITECTURE.md) (`docs/ARCHITECTURE.md`): Request lifecycle, SSR authentication, and security boundaries.
- [Database Schema & RLS](file:///docs/DATABASE.md) (`docs/DATABASE.md`): Relational data models, foreign keys, and Row Level Security policies.
- [Deployment Guide](file:///docs/DEPLOYMENT.md) (`docs/DEPLOYMENT.md`): Production deployment guidelines for Vercel and Supabase.
- [Project Context & Scope](file:///docs/PROJECT_CONTEXT.md) (`docs/PROJECT_CONTEXT.md`): Functional requirements and scope boundaries.
- [Design System Guide](file:///DESIGN.md) (`DESIGN.md`): Color palette, typography, and UI component styling tokens.
