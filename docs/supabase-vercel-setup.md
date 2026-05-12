# Supabase and Vercel Setup

## Supabase

Project URL:

```text
https://vfeibbskailbdbzysqan.supabase.co
```

Apply the migration in:

```text
supabase/migrations/202605120001_admin_schema.sql
```

The migration creates:

- `profiles`
- `clients`
- `diet_plans`
- `intake_links`
- `templates`
- `payments`
- `followups`
- row-level security policies for admin-owned data

Create the admin user in Supabase Auth:

- Email: `nutricareu4@gmail.com`
- Password: set in the Supabase dashboard, do not commit it to git

## Vercel

Set these environment variables in the Vercel project:

```text
VITE_API_BASE_URL=https://nutri-care-api.aryanat1911.workers.dev
VITE_BASE_PATH=/
VITE_SUPABASE_URL=https://vfeibbskailbdbzysqan.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase anon public key>
```

Build settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

The included `vercel.json` keeps all routes on `index.html`, which is useful for the app shell and any future non-hash routes.
