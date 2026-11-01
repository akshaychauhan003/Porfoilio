# Akshay Console — Repair Notes (2026-11-01)

## Root-cause analysis

### A) Contact / reviews not syncing across devices
1. **Same-browser tabs worked via `BroadcastChannel` / `localStorage`**, not via Supabase Realtime — so other devices never saw those events.
2. **Admin unlock was PIN-only** (`localStorage` flag). That does not create a Supabase Auth JWT. After proper RLS, inbox `SELECT` and Realtime for `contact_messages` require the `authenticated` role.
3. **Realtime publication / reconnect recovery was incomplete** — no authoritative refetch on `SUBSCRIBED` / auth token change.
4. **Inbox poll compared message counts only**, so devices with divergent local caches could miss new cloud rows.

### B) Projects not updating the live portfolio
1. New projects often used non-UUID ids (`proj-<timestamp>`). Cloud deletes/updates by UUID could miss rows; optimistic UI still reported success.
2. **Cloud write failures were swallowed** — dashboard showed success from local state even when PostgREST/RLS rejected the write.
3. **Local tombstones + `DEFAULT_FALLBACK_DATA`** could hide or resurrect projects after a successful cloud fetch.
4. Live DB already had a working `projects` table; the portfolio renderer (`project-portfolio.js`) already loads from `PortfolioData.getProjects()` — the failure was persistence honesty, not a hardcoded carousel.

### C) Experiences not updating the live portfolio
1. **Live `experiences` table is missing columns** the client always sent: `category`, `video_url`, `live_url`, `is_active`.
2. Every cloud insert/update with those fields returned **PostgREST `PGRST204`**, so only localStorage / BroadcastChannel updated.
3. Category was already encoded as location tags (`Remote [freelance]`) in existing rows — the UI parser understood that, but writes still failed because of the extra columns.

### Security
- Older SQL helpers (`quick_fix_permissions.sql`, `fix_rls_linter.sql`) granted **full anon access**. Live project currently allows anon read/write on messages/reviews/projects.
- `schema.sql` / repair migration restore **authenticated-only admin** policies. Public may only read published content and submit messages/pending reviews.

---

## Required manual step (database)

Run this migration once in the Supabase SQL Editor:

`supabase/migrations/20261101_akshay_console_repair.sql`

It will:
- Add missing `experiences` columns and backfill `category` from location tags
- Enable Realtime publication for all four tables
- Replace open anon policies with strict RLS
- Ensure `portfolio-media` storage policies
- Seed `password-hunter` if missing

Create an Auth user for the console (Authentication → Users) matching the email/password you use in **Supabase Auth** on the lock screen.

Until the migration runs, the client still saves experiences using **core columns + `[office]/[freelance]` location tags** (schema-tolerant). After migration, it uses proper `category` / media columns.

---

## Auth & cross-device sync model

| Path | Role |
|------|------|
| Public portfolio | Anon key — read active projects/experiences, approved reviews; insert messages/pending reviews |
| Dashboard / APK | Supabase Auth session (`authenticated`) — full CRUD + inbox read |
| PIN | Local UI gate **only after** a Cloud Auth session exists on that device |
| BroadcastChannel / localStorage | Same-browser responsiveness only — never the cross-device source of truth |
| Realtime `postgres_changes` + 12s poll + refetch on reconnect | Cross-device sync |

---

## Modified / created files

**Created**
- `supabase/migrations/20261101_akshay_console_repair.sql`
- `docs/AKSHAY_CONSOLE_REPAIR.md`

**Modified**
- `dashboard/supabase-config.js` (synced → `assets/js/supabase-config.js`, `android-app/www/supabase-config.js`)
- `dashboard/dashboard.js` (synced → `android-app/www/dashboard.js`)
- `dashboard/index.html` (synced → `android-app/www/index.html`)
- `sections/contact/contact.js`
- `index.html` (cache-bust query params)

---

## Run / build / sync commands

```bash
# Serve portfolio + dashboard locally (any static server)
npx serve . -p 4173
# Dashboard: http://localhost:4173/dashboard/

# Sync Capacitor web assets from dashboard/ → android-app/www and native project
cd android-app
npm run sync

# Build debug APK and copy to repo root + dashboard/
npm run build:apk
```

Deploy portfolio (GitHub Pages): commit and push the repo root (`index.html`, `sections/`, `assets/js/supabase-config.js`, …).

---

## Safe configuration checklist

1. Run `20261101_akshay_console_repair.sql` in Supabase SQL Editor.
2. Confirm Realtime: Database → Publications → `supabase_realtime` includes the four tables.
3. Create admin Auth user; sign in via dashboard **Supabase Auth** (not PIN-only).
4. Keep only the **publishable/anon** key in `supabase-keys.js` — never service-role.
5. After RLS, verify anon cannot `SELECT` `contact_messages` and cannot `UPDATE` projects.
6. Rebuild APK after dashboard changes (`npm run build:apk`).

---

## Verification performed in this session

| Check | Result |
|-------|--------|
| Live `experiences.category` missing | Confirmed (`PGRST204`) |
| Core-only experience insert (location tag) | Succeeds (HTTP 201) |
| Anon can currently read/write messages (pre-migration) | Confirmed — migration tightens this |
| Titan project description restored after probe | Done |
| Audit probe rows cleaned | Done |

Full acceptance criteria that need **your** migration + Auth user + multi-device smoke test are listed in the project brief §12.

---

## Known limitations

- Migration cannot be applied from the anon key; SQL Editor (or service role) is required.
- Until migration + Auth user exist, admin writes may still work via open anon policies on the live project — do not treat that as the final security posture.
- APK rebuild requires Android SDK / Gradle on the machine running `npm run build:apk`.
- GitHub Pages deploy of the public site is a separate push from the APK build.
