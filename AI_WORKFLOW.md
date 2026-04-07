# AI Workflow Notes

## Tools Used

- Claude (claude.ai) — primary tool throughout the build

## Where AI Materially Sped Up Work

**Database schema** — Generated the three-table schema and seed SQL in 
seconds. Thinking through the right foreign key relationships and 
constraints manually would have taken 15-20 minutes.

**TipTap editor component** — The toolbar with active state highlighting 
across 8 formatting options is about 80 lines of code. AI generated a 
working version on the first attempt.

**API route boilerplate** — All four route files followed the same 
pattern. AI generated the structure consistently, I reviewed the logic 
in each one.

**TypeScript types** — Auto-generated from the schema, no manual typing 
needed.

**Documentation** — README, architecture note, and this file were 
drafted from the running notes kept throughout the build, with AI 
organizing them into a coherent structure.

## What AI Generated That Required Manual Fixes

**Next.js params API change** — AI generated route handlers using the 
old synchronous params pattern. Next.js made params a Promise that 
must be awaited. The app crashed on every document open until this was 
caught and fixed manually in all three handlers in 
`app/api/documents/[id]/route.ts`.

**TipTap SSR hydration error** — AI did not include `immediatelyRender: false` 
in the useEditor config. Next.js pre-renders on the server where browser 
APIs do not exist, causing a crash. Identified from the error message and 
fixed by adding one line.

**Test runner compatibility** — AI suggested Jest which had a binary 
incompatibility with Node 20.9. Switched to Node's built-in test runner 
(node:test) which is more modern and requires no dependencies. Then 
converted the test file from TypeScript to .mjs because the native runner 
cannot execute TypeScript directly without a compiler.

## What AI Output I Rejected or Changed

- Kept the sharing model simpler than AI initially suggested — AI proposed 
  role-based permissions (viewer/editor/owner). Rejected in favor of binary 
  access to stay in scope and explain the tradeoff clearly.
- AI suggested using Supabase Auth for the login flow. Rejected in favor of 
  seeded users and an email picker — faster to build and cleaner to demo.

## How I Verified Correctness

- Ran the app locally after every file was created before moving to the next
- Checked the Supabase dashboard after each database operation to confirm 
  writes were actually happening
- Tested every user-facing flow manually — create, rename, format, save, 
  reopen, upload, share, switch user, verify shared badge
- Ran 6 automated integration tests against the live local server
- Deployed to Vercel and retested the full flow against the live URL

## Summary

AI handled speed — boilerplate, structure, and first drafts. Every piece 
was run, tested, and verified before moving forward. The three bugs caught 
during testing were all framework-specific issues that required knowing 
what to look for, not just accepting what was generated.