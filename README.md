# Ajaia Docs

A lightweight collaborative document editor built with Next.js, TipTap, and Supabase.

## Live Demo

[Add your Vercel URL here]

**Test accounts:**
- alice@test.com
- bob@test.com

## Features

- Create, rename, edit, and reopen documents
- Rich text formatting — bold, italic, underline, H1/H2/H3, bullet and numbered lists
- Autosave with timestamp feedback
- Upload .txt or .md files and convert them into editable documents
- Share documents with other users by email
- Owned and shared documents displayed separately
- Persistent storage via Supabase Postgres

## Supported File Upload Types

.txt and .md only. Unsupported types are rejected with a clear error message.

## Local Setup

**Requirements:**
- Node.js v18 or higher
- A Supabase project (free tier works)

**Steps:**

1. Clone the repo
```bash
git clone https://github.com/yourusername/ajaia-docs.git
cd ajaia-docs
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the project root
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key

4. Set up the database — go to your Supabase project, open the SQL Editor,
and run the following:
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled Document',
  content text default '',
  owner_id uuid references users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  shared_with_email text not null,
  created_at timestamp with time zone default now()
);

insert into users (email) values
  ('alice@test.com'),
  ('bob@test.com');
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Running Tests

Make sure the dev server is running first, then in a second terminal:
```bash
npm test
```

6 integration tests covering document creation, retrieval, update, 
listing, sharing validation, and deletion.

## What Is Not Included

- Real authentication — replaced with two seeded test accounts to 
  keep scope focused on document editing and sharing logic
- Real-time collaboration — would require WebSockets or Supabase Realtime
- Version history — would add a document_versions table with snapshots on save
- Role-based permissions — sharing is binary (access or no access)