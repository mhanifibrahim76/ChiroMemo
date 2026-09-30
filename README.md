# ChiroMemo

Personal Learning and Knowledge Management System (PLKMS) for university students.

Next.js (App Router, full-stack) · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Supabase (Postgres, Auth, Storage) · Prisma · Gemini API · Recharts · Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Gemini values
npm run dev                  # http://localhost:3000
```

## Commands

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start the dev server           |
| `npm run build`     | Production build               |
| `npm run start`     | Serve the production build     |
| `npm run lint`      | ESLint                         |
| `npm run typecheck` | TypeScript without emit        |

## Project memory

This project is designed to be continued without chat history. Read, in order:

1. `AGENTS.md`
2. `docs/PROJECT_CONTEXT.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATABASE.md`
5. `docs/ROADMAP.md`
6. `docs/SESSION_LOG.md`

Work one phase at a time. The current phase is marked in `docs/ROADMAP.md`.

## Rules that matter

- Gemini is called from server code only; keys never reach the client.
- Server secrets are read only through `src/lib/env.ts`.
- Every database read/write is scoped to the signed-in user.
- No lecturer, admin, collaboration, or social features.
