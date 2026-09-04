# Personal OS (Phase 1)

A single-page personal dashboard for tracking AI/tool usage limits, certifications in progress, and side projects — deployed as static assets + Vercel serverless functions, backed by Supabase.

## What it does

- **Overview** — greeting, AI usage stat cards, upcoming/in-progress certificates, active project count.
- **AI Usage** — progress rings showing consumption against a service's limit (e.g. Claude messages, Figma quota) with reset dates.
- **Certificates** — track certifications with platform, status, progress percentage, target date, and notes (add/edit/delete/filter).
- **Projects** — a simple board of personal projects with a status you can cycle (active/paused/done) and delete.

All actual data (usage entries, certificates, projects) lives in a Supabase Postgres database — nothing is hardcoded or seeded in this repository.

## Tech stack

- **Frontend:** vanilla JavaScript (no framework/build step), native ES modules, a hand-rolled hash-based router (`app.js`), plain CSS.
- **Backend:** Vercel serverless functions under `api/` (`auth`, `certificates`, `projects`, `usage`), using the `@supabase/supabase-js` client (`lib/db.js`) with the Supabase **service role** key — these functions only run server-side.
- **Database:** Supabase (Postgres).
- **Auth:** a single shared password checked against `AUTH_PASSWORD` server-side; on success the client just sets a `localStorage` flag. This is a lightweight gate, not a real session/auth system — don't rely on it to protect sensitive data.
- **Hosting:** Vercel (`vercel.json` rewrites `/api/*` to functions and everything else to `index.html`).

## Project structure

```
index.html              entry HTML, auth gate + app shell
app.js                  router, auth-state check, page loader
style.css               global styles
components/             sidebar, modal, progress-ring (shared UI)
pages/                  home, usage, certificates, projects (per-route render logic)
api/                    Vercel serverless functions (auth, usage, certificates, projects)
lib/db.js               Supabase client (server-side only)
vercel.json             routing config
```

## Running locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** and set up tables: `certificates`, `projects`, `usage_entries` (columns match the fields read/written in `api/certificates.js`, `api/projects.js`, `api/usage.js`).

3. **Set environment variables** (e.g. in a local `.env` used by the Vercel CLI, or `vercel env`):
   ```
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_KEY=your-supabase-service-role-key
   AUTH_PASSWORD=choose-a-password
   ```
   Never commit real values — `.env` and `.env.local` are already gitignored.

4. **Run with the Vercel CLI** (needed for the `api/` serverless functions to work locally):
   ```bash
   npx vercel dev
   ```

5. Open the printed local URL, enter the password you set as `AUTH_PASSWORD`, and use the dashboard.

## Notes

- This is Phase 1: a functional shell with no build tooling, no tests, and a minimal auth gate. Treat it as a personal-use tool rather than a hardened multi-user app.
