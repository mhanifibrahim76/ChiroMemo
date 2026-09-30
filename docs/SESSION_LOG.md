# Session Log

Newest entry at the bottom. Keep entries short.

## Format

```
## <date> — <title>
Completed: ...
Files: ...
Decisions: ...
Phase: ...
Next: ...
Issues: ...
```

---

## 2026-09-30 — Phase 1: project foundation

Completed: Created the Next.js project foundation. App Router + `src/` dir +
`@/*` alias, TypeScript strict, Tailwind CSS v4, shadcn/ui initialised (Radix
base, `nova` style) with core UI primitives. Added env template, zod-validated
server env module, and the full `docs/` memory set. Placeholder home page.
No application features implemented.

Files: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`,
`components.json`, `.gitignore`, `.env.example`, `AGENTS.md`, `README.md`,
`src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/env.ts`, `src/lib/utils.ts`,
`src/hooks/.gitkeep`, `src/components/ui/*` (button, card, input, label,
textarea, badge, progress, separator, dialog, select, tabs, dropdown-menu,
skeleton, table, tooltip), `docs/*.md`.

Decisions:
- Next.js is the only backend; no Express server.
- Versions: next 16.3.7, react 19.2.8, tailwindcss 4.3.3, prisma 7.10.0,
  @google/genai 2.24.0, @supabase/supabase-js 2.117.2, @supabase/ssr 0.12.7,
  recharts 3.10.1, zod 4.6.5, lucide-react 1.49.0.
- Gemini is called through `@google/genai` (current SDK), server-side only.
- Server secrets are read only via `src/lib/env.ts` (`server-only` + zod), which
  fails fast at startup rather than at first use.
- The generated `CLAUDE.md` from create-next-app was deleted; `AGENTS.md` is the
  single agent-instruction file.
- `npm run typecheck` script added (`tsc --noEmit`).
- The npm package name is `chiromemo` (lowercase) because npm rejects capitals.
- The design in `docs/DATABASE.md` is a plan; the Prisma schema is Phase 2.

Phase: 1 (complete) — next is Phase 2.

Next: Phase 2 — write `prisma/schema.prisma` from `docs/DATABASE.md`, add the
Prisma client singleton `src/lib/db.ts`, configure `DATABASE_URL` for Supabase
Postgres, run the initial migration. Read the Prisma 7 upgrade notes first
(Prisma 7 changed generator output and config handling).

Issues:
- `npm audit` reports 4 high-severity advisories in `prisma` -> `@prisma/config`
  -> `deepmerge-ts` and `prisma` -> `mysql2` (unused with PostgreSQL). They are
  dev-CLI only and `npm audit fix --force` would downgrade to Prisma 6. Left as
  is; re-check in Phase 13.
- `next-env.d.ts` is git-ignored (create-next-app default).
- No real Supabase project or Gemini key configured yet, so no runtime AI/auth
  verification is possible.
- No test runner installed yet (deferred to Phase 13).
