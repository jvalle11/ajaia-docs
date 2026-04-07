# Architecture Notes

## Stack

| Layer | Tool | Reason |
|---|---|---|
| Frontend + Backend | Next.js 16 | One framework, one repo, one deployment |
| Rich text editor | TipTap | Most modern React editor, ProseMirror underneath |
| Database + Storage | Supabase (Postgres) | Free hosted SQL, visual dashboard, easy to demo |
| Primary deployment | Vercel | Zero-config for Next.js, live URL in minutes |
| Secondary deployment | Cloudflare Workers | Explicitly requested — attempted after Vercel |
| Styling | Tailwind CSS | Fast to write, no separate CSS files |
| Language | TypeScript | Type safety, readable for reviewers |

## Data Model

Three tables:

**users** — Simulated accounts. Seeded with alice and bob instead of 
building real auth. Auth alone is 2-3 hours and is not the skill being 
evaluated here.

**documents** — Stores title, content as HTML, and owner_id. Content is 
stored as HTML because TipTap outputs HTML natively and it round-trips 
cleanly — save HTML, reload HTML, formatting is preserved exactly.

**document_shares** — Join table between documents and user emails. 
Intentionally simple — sharing is binary, no roles or expiry.

## API Design

All API routes live inside Next.js under `app/api/`. This keeps 
everything in one codebase with no separate server.

- `GET/POST /api/documents` — list and create
- `GET/PATCH/DELETE /api/documents/[id]` — single document operations
- `GET/POST /api/share` — sharing, with ownership verification
- `POST /api/upload` — file to document conversion
- `GET /api/users` — returns seeded users for the login picker

## Autosave

The editor page debounces saves — waits 1.5 seconds after the last 
keystroke before writing to the database. This avoids hammering the API 
on every keypress while still feeling instant to the user.

## What I Prioritized

1. A genuinely usable editing experience — TipTap with a clean toolbar
2. Working sharing model that can be demonstrated end to end
3. Clear persistence — documents survive refresh, formatting intact
4. Deployment — a live URL reviewers can click immediately

## What I Deliberately Cut

| Feature | Reason |
|---|---|
| Real authentication | 2-3 hours alone, not the skill being tested |
| Real-time collaboration | Requires WebSockets, out of timebox |
| Version history | Stretch goal — would snapshot content on each save |
| Role-based permissions | Binary sharing is sufficient to demonstrate the model |
| Mobile optimization | Document editors are desktop-first products |

## Deployment Notes

Deployed to Vercel first because it is zero-config for Next.js and 
guarantees a live URL quickly. Cloudflare Workers was attempted 
subsequently as requested. Vercel is correct for a Next.js prototype. 
Cloudflare Workers would be the right choice for the API/edge layer in 
a production system requiring global low-latency performance.

## Known Limitations

- userId is passed as a URL query parameter rather than a session cookie.
  In production this would be replaced by proper session management.
- No Row Level Security on Supabase tables — acceptable for a prototype 
  with seeded users, would be required before any real user data.