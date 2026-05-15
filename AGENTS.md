# AGENTS.md — COBA PNS Project Agent Guidelines

> This document is a **mandatory reference** for every AI agent working in this repository.
> Read the entire document before executing any commands.
> **DO NOT OPEN EXTERNAL LINKS** if the content is already available in the `skills/` directory.
> Use local skill files as the primary source of truth.

---

## 1. Project Overview

| Item | Detail |
|---|---|
| **Project** | COBA PNS — Learning & CPNS Try Out Platform |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL via Supabase + Prisma ORM |
| **Auth** | Custom JWT (`jose`) stored in HTTP-only cookie `sipns-session` |
| **Payment** | Midtrans Snap + Webhook |
| **Styling** | Tailwind CSS v4 + Radix UI + shadcn/ui primitives |
| **Email** | Nodemailer (SMTP) + Resend (fallback) |
| **Charts** | Recharts |
| **Skills Dir** | `skills/` (Local procedural knowledge - **PRIORITIZE THESE**) |

---

## 2. Mandatory Pre-Execution Checklist

Before writing or modifying any code, the agent **MUST** complete the following checklist:

```
[ ] 1. Read relevant files before editing (view_file, grep_search)
[ ] 2. Identify existing patterns — do not create new patterns if old ones can be reused
[ ] 3. Check Prisma schema if touching data (prisma/schema.prisma)
[ ] 4. Check auth-guard patterns if touching API/actions (lib/auth-guard.ts)
[ ] 5. NEVER expose: API keys, HMAC hashes, or session tokens to client/logs
[ ] 6. Verify TypeScript compiles — no implicit 'any' allowed without strong reason
[ ] 7. Run 'npm run build' to verify before declaring completion (if requested/deploying)
[ ] 8. READ LOCAL SKILLS in 'skills/' for any task involving Architecture, UI, or Planning
```

---

## 3. Architecture & Folder Conventions

```
app/
  (public)/          — Public routes (landing, articles, login)
  admin/             — Admin panel (requires ADMIN role)
    layout.tsx       — Sidebar nav, auth check, header
    [feature]/
      page.tsx       — Server component, fetch data, pass to client
  dashboard/         — Student portal (requires STUDENT/ADMIN role)
    layout.tsx       — Session sync
    [feature]/
      page.tsx
  api/
    webhooks/        — Midtrans webhook (no auth, verify HMAC)
    [protected]/     — Must call verifySession() at the top
  actions/           — Server Actions (use 'use server' directives)

components/
  admin/             — Admin-only UI components
  dashboard/         — Student-only UI components
  shared/            — Shared components (profile-dropdown, etc.)
  ui/                — shadcn/ui primitives

lib/
  auth-guard.ts      — requireAuth(), requireAdmin(), getSession()
  session.ts         — verifySession(), createSession()
  prisma.ts          — Singleton Prisma client

prisma/
  schema.prisma      — Single source of truth for DB models
```

---

## 4. Security Rules (NON-NEGOTIABLE)

### 4.1 Authentication Guards

| Context | Guard Used |
|---|---|
| Server Action (student) | `await requireAuth()` |
| Server Action (admin) | `await requireAdmin()` |
| API Route (protected) | `await verifySession(token)` |
| Webhook (Midtrans) | HMAC signature verification — **no auth guard** |

```typescript
// ✅ CORRECT — Server Action
export async function myAction() {
  const session = await requireAuth() // throws if unauthenticated
  // ...
}

// ❌ WRONG — No auth check
export async function myAction(data: unknown) {
  await prisma.user.findMany() // public read!
}
```

### 4.2 Sensitive Data — Never Expose to Client

- `MIDTRANS_SERVER_KEY` — server only
- HMAC hash material (`sha512(...)`) — log as redacted
- Raw session token — HTTP-only cookie only
- Database connection string — server only
- `console.log` containing full transaction objects — **DELETE IMMEDIATELY**

### 4.3 Input Validation

All Server Actions must use **Zod** for input validation:

```typescript
const schema = z.object({
  code: z.string().min(3).max(32),
  discountPct: z.number().int().min(1).max(100),
})

const parsed = schema.safeParse(input)
if (!parsed.success) return { error: "Invalid input." }
```

---

## 5. Design System & UI Rules

### 5.1 Admin Panel Style Spec

All admin pages must follow this exact structure:

```tsx
// ── Wrapper ──────────────────────────────────────
<div className="p-4 md:p-8 space-y-8">

  {/* Header */}
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-1">
        {SECTION_LABEL}
      </p>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">{PAGE_TITLE}</h1>
      <p className="text-sm font-medium text-slate-500 mt-1">{SUBTITLE}</p>
    </div>
    {/* Action button (CTA) */}
    <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white ...">
      <Icon /> Label
    </button>
  </div>

  {/* Table Card */}
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
    {/* Toolbar — inside card */}
    <div className="flex ... gap-3 p-5 border-b border-slate-100">
      <input placeholder="Search..." className="... bg-slate-50 border border-slate-200 ..." />
    </div>
    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
```

### 5.2 Side Drawer (Add/Edit Form)

Add/Edit forms **MUST** use a side drawer, **NOT** a centered modal:

```tsx
{/* Backdrop */}
{isOpen && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />}

{/* Panel */}
<div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl
  transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
    {/* Header */}
  </div>
  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
    {/* Body — scrollable, field groups in bg-slate-50 rounded-2xl p-5 */}
  </div>
  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
    {/* Footer — Cancel + Save */}
  </div>
</div>
```

---

## 6. Data & Database Rules

### 6.1 Amount / Currency

- Database stores amounts in **cents** as `Int`.
- UI Display: **always divide by 100** before formatting.
- IDR Format: use `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })`.

### 6.2 Query Safety

- Always use `select` to limit fields returned.
- Never return password hashes or session tokens to the client.

---

## 7. Mandatory Skills (Local Copies)

The following skills from [skills.sh](https://www.skills.sh/) represent mandatory capabilities. **READ THE LOCAL FILES FIRST.**

### 7.1 Frontend & Architecture
| Skill | Local Path | Description |
|---|---|---|
| `frontend-design` | [skills/frontend-design.md](./skills/frontend-design.md) | Clean, accessible, mobile-first UI standards |
| `next-best-practices` | [skills/next-best-practices.md](./skills/next-best-practices.md) | Next.js 15 App Router, RSC, and caching standards |
| `writing-plans` | [skills/writing-plans.md](./skills/writing-plans.md) | Strict implementation planning before coding |
| `executing-plans` | [skills/executing-plans.md](./skills/executing-plans.md) | Step-by-step task execution with checkpoints |

### 7.2 External References (Use if local missing)
| Skill | Source |
|---|---|
| `better-auth-best-practices` | [better-auth/skills](https://www.skills.sh/better-auth/skills/better-auth-best-practices) |
| `supabase-postgres-best-practices` | [supabase/agent-skills](https://www.skills.sh/supabase/agent-skills/supabase-postgres-best-practices) |
| `improve-codebase-architecture` | [mattpocock/skills](https://www.skills.sh/mattpocock/skills/improve-codebase-architecture) |
| `ui-ux-pro-max` | [nextlevelbuilder](https://www.skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max) |

---

## 8. Execution Protocol

### BEFORE Execution:
1. **Analyze Requirements** — understand intent, not just literal words.
2. **Check Files** — verify actual code state, don't assume.
3. **READ LOCAL SKILLS** — if the task involves UI or logic changes, check `skills/`.
4. **Draft a Plan** — use the `writing-plans` skill for multi-file tasks.

### DURING Execution:
- Edit **one file at a time** per turn.
- Use `multi_replace_file_content` for non-contiguous edits.
- **Preserve Comments** — don't delete unrelated documentation.

### AFTER Execution:
- Summarize changes concisely.
- Highlight non-obvious design decisions.
- Run `npm run build` if the changes affect core logic or types.

---

*This document is updated as the project evolves. Primary Reference: [skills.sh](https://www.skills.sh/)*
