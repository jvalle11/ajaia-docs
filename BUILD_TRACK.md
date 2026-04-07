# Ajaia Docs — Build Tracker
---

## Stack Decisions & Why

| Layer | Tool | Why I Chose It |
|---|---|---|
| Frontend + Backend | Next.js | One framework handles both UI and API routes — no separate server needed, one repo, one deployment |
| Rich Text Editor | TipTap | Most modern React-based editor, handles bold/italic/underline/headings/lists out of the box, free, well documented |
| Database + Storage | Supabase | Free hosted Postgres with a visual dashboard, built-in file storage, easy to demo live |
| Primary Deployment | Vercel | Built by the Next.js team, zero-config deployment, live URL in 2 minutes |
| Secondary Deployment | Cloudflare Workers | Explicitly requested by boss — attempted after Vercel to compare approaches and speak to tradeoffs |
| Language | TypeScript | Type safety catches bugs early, makes the codebase more readable for reviewers |
| Styling | Tailwind CSS | Utility-first, fast to write, no separate CSS files needed |

---

## Vercel vs Cloudflare Workers

I deployed to Vercel first because it's zero-config for Next.js and guaranteed a live URL quickly. I then attempted Cloudflare Workers as requested. Vercel is the right call for a Next.js prototype — Cloudflare Workers would be my choice for the API/edge layer in a production system handling real global traffic, given their edge network performance and lower latency.

---

## What I Built

### Environment Setup
- **Node v20.9.0** — confirmed compatible, EBADENGINE warnings on ESLint are non-breaking and can be ignored
- **Git 2.53.0** — confirmed installed
- **GitHub repo** — created `ajaia-docs`, cloned locally
- **Supabase project** — created `ajaia-docs`, provisioned free Postgres database

### Database Schema (Supabase SQL Editor)
Ran SQL to create three tables:

**`users`** — Simulated user accounts (seeded these instead of building full auth to stay in scope)
- `id` (uuid, primary key)
- `email` (unique)
- `created_at`

**`documents`** — The core document store
- `id` (uuid, primary key)
- `title` — document name, editable
- `content` — rich text stored as HTML string
- `owner_id` — references users table, tracks who owns the doc
- `created_at`, `updated_at`

**`document_shares`** — Sharing model
- `document_id` — which document is being shared
- `shared_with_email` — who it's shared with
- No complex permissions — deliberately simple for scope

**Seeded two test users:** `alice@test.com` and `bob@test.com` — used to demonstrate sharing without building a full auth system

Building real authentication (signup, login, sessions, password reset) would consume hours, kept simple for demo sake. Seeding two users lets us demonstrate the sharing model clearly without sacrificing the core document editing features.

### Environment Variables (`.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL` — project URL from Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public/publishable key, safe to use in browser with RLS

### `lib/supabase.ts`
Creates a single reusable Supabase client instance that every other file imports.
- Avoids creating multiple database connections, standard practice

### `lib/types.ts`
Defines TypeScript interfaces for `User`, `Document`, and `DocumentShare`.
- TypeScript will catch mismatches between what the database returns and what the UI expects — fewer runtime bugs, more readable code for reviewing

### `app/globals.css`
Replaced boilerplate with Tailwind import + custom ProseMirror styles.
- `ProseMirror` is the class TipTap applies to the editor div — these styles make headings, lists, bold, italic, underline actually render correctly in the editor

### `app/layout.tsx`
Replaced boilerplate with clean root layout — sets page title to "Ajaia Docs", applies gray background, wraps all pages.

### API Routes

**`app/api/documents/route.ts`** — GET (fetch all owned + shared docs for a user) and POST (create new document)

**`app/api/documents/[id]/route.ts`** — GET (single doc), PATCH (update title or content), DELETE (remove document)

**`app/api/share/route.ts`** — POST (share a doc with a user by email, validates ownership first), GET (list who a doc is shared with). Includes duplicate share prevention and ownership verification.

**`app/api/upload/route.ts`** — Accepts .txt and .md files only (clearly stated), reads file text, converts line breaks to HTML paragraphs, creates a new document from the content. Unsupported file types return a 415 error with a clear message.

Keeps everything in one codebase and one deployment. No separate Express server needed.

### Frontend Components

**`components/Editor.tsx`** — TipTap rich text editor with toolbar. Supports bold, italic, 
underline, H1/H2/H3 headings, bullet lists, numbered lists. Active state highlighting 
on toolbar buttons shows current formatting. Accepts an `editable` prop so shared 
documents can be read-only if needed. Uses `@tiptap/extension-underline` as a separate 
package since it is not included in StarterKit.

**`components/ShareModal.tsx`** — Modal popup for sharing. Takes a document ID and owner ID, 
calls the /api/share endpoint, shows success or error feedback inline.

**`components/DocumentList.tsx`** — Renders owned and shared documents in separate labeled 
sections. Shared docs show a "Shared with you" badge. Owned docs show a delete button. 
Clicking any card navigates to the editor page for that document.

### Pages

**`app/page.tsx`** — Home screen. Shows a login screen first (user picker with Alice and 
Bob). After selecting a user, shows their owned documents and documents shared with them in separate sections. 
Has New Document button and file upload button. Upload is limited to .txt and .md files, 
clearly labelled in the UI.

**`app/doc/[id]/page.tsx`** — Editor page for a specific document. Editable title in the 
header. TipTap editor below. Autosaves after 1.5 seconds of no changes — shows 
"Saving..." then "Saved [time]" feedback. Share button only visible to the document 
owner. Non-owners see a banner noting it is a shared document.

**`app/api/users/route.ts`** — Simple endpoint that returns all seeded users so the home 
page can load real database IDs rather than hardcoding them.

### Bug Fix — Next.js 16 Params API Change
Next.js 16 changed dynamic route params to be a Promise rather than a plain 
object. Updated `app/api/documents/[id]/route.ts` to await params before 
accessing the id property in all three handlers (GET, PATCH, DELETE).

### Bug Fix — TipTap SSR Hydration Error
TipTap's useEditor hook requires `immediatelyRender: false` when used in 
Next.js because Next.js pre-renders components on the server before the 
browser takes over. Without this flag TipTap tries to render on the server 
where browser APIs don't exist, causing a hydration mismatch. Added the flag 
to the useEditor config in Editor.tsx. Another case where AI generated code 
needed a manual fix for a framework-specific constraint.

### Automated Tests — `__tests__/documents.test.ts`
Uses Node's built-in test runner (node:test) — no extra dependencies needed.
Switched from Jest due to a binary compatibility issue between Jest and 
Node 20.9. Node's native test runner is the more modern approach anyway.

Six integration tests covering the core API:
- POST /api/documents — creates a document and returns 201
- GET /api/documents/[id] — fetches a document by id
- PATCH /api/documents/[id] — updates document title
- GET /api/documents?userId — returns owned documents for a user
- POST /api/share — rejects requests with missing fields (400)
- DELETE /api/documents/[id] — deletes a document

Test file uses .mjs extension (ES Module JavaScript) rather than TypeScript 
because Node 20's built-in test runner cannot execute .ts files directly 
without a compiler. Converting to .mjs removes the need for any build step 
and keeps the test runnable with a single command.

### Tests — All Passing
6/6 integration tests pass against live local server:

✔ creates a new document (169ms)

✔ fetches a document by id (6257ms) 

✔ updates a document title (152ms)

✔ returns owned documents for a user (570ms)

✔ rejects share request with missing fields (361ms)

✔ deletes a document (157ms)

### Deployment
- GitHub repo pushed with full source code
- Deployed to Vercel — environment variables added via Vercel dashboard
- Live URL: https://ajaia-docs-gules.vercel.app/

### Documentation Files Created
- README.md — local setup, test instructions, feature list, what was cut
- ARCHITECTURE.md — stack decisions, data model, API design, tradeoffs
- AI_WORKFLOW.md — tools used, what was generated, what was fixed, 
  what was rejected
- SUBMISSION.md — what is included, what works, what is incomplete, 
  what comes next

---

## What I Intentionally Cut & Why

| Feature | Decision | Reason |
|---|---|---|
| Real authentication | Replaced with seeded users + email picker | Auth alone is 2-3 hours — not the skill being tested |
| Real-time collaboration | Not built | Would require WebSockets or Supabase Realtime — out of scope for timebox |
| Version history | Not built | Stretch goal — would add a `document_versions` table and snapshot on save |
| Role-based permissions | Not built | Sharing is binary (access or no access) — sufficient to demonstrate the model |
| Mobile optimization | Minimal | Document editors are desktop-first products |

---

