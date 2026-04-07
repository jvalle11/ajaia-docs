# Submission

## Live URL

https://ajaia-docs-gules.vercel.app/

## Test Accounts

| Email | Role |
|---|---|
| alice@test.com | Test user — create and share documents |
| bob@test.com | Test user — receive shared documents |

Select either account from the login screen. No password required.

## What Is Included

| File | Description |
|---|---|
| `app/` | All Next.js pages and API routes |
| `components/` | Editor, DocumentList, ShareModal |
| `lib/` | Supabase client and TypeScript types |
| `__tests__/` | 6 integration tests |
| `README.md` | Setup and run instructions |
| `ARCHITECTURE.md` | Stack decisions and tradeoffs |
| `AI_WORKFLOW.md` | How AI was used throughout the build |
| `SUBMISSION.md` | This file |
| `BUILD_TRACKER.md` | Running notes kept during the build |

## What Is Working

- Document creation, renaming, editing, saving, reopening
- Rich text formatting — bold, italic, underline, H1/H2/H3, bullet and numbered lists
- Autosave with visible timestamp feedback
- File upload — .txt and .md files converted to editable documents
- Sharing — owner can share with any registered user by email
- Owned vs shared documents displayed in separate labeled sections
- Full persistence — all data survives refresh
- 6/6 automated integration tests passing
- Live deployment on Vercel

## What Is Incomplete

- Cloudflare Workers deployment — attempted, noted in architecture doc
- Real authentication — deliberately replaced with seeded accounts

## What I Would Build Next With 2-4 More Hours

1. Cloudflare Workers deployment with proper edge runtime config
2. Supabase Auth replacing the simulated login
3. Document version history — snapshot content on each save
4. Export to Markdown or PDF
5. Row Level Security policies on all Supabase tables