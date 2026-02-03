# 🏛️ Church Dues Tracker

A full-stack **Nuxt 4 + Supabase** application for tracking weekly dues collected from church officers.

---

## Features

| Page | What it does |
|---|---|
| **Dashboard** | Live overview — stat cards (officers, paid, unpaid, collected) + one-click "Record Payment" per officer for the current week |
| **Officers** | Full CRUD — add, edit, deactivate, and delete officers. Includes search & active/inactive filter |
| **Payments** | Week-picker to browse any week's payments. Record new payments, review, or delete entries |
| **Reports** | Year-to-date summary per officer: total paid, weeks paid/owed, color-coded progress bars, CSV export |

---

## Quick Start

### 1. Prerequisites

- Node.js 18+ and a package manager (`npm` / `pnpm` / `yarn`)
- A free [Supabase](https://supabase.com) account and project

### 2. Clone & install

```bash
git clone <this-repo-url>
cd church-dues-tracker
npm install
```

### 3. Set up Supabase schema

1. Go to your Supabase project → **SQL Editor**
2. Open `supabase_schema.sql` and paste the entire contents into the editor
3. Click **Run** — this creates the `officers` and `payments` tables plus indexes and policies

### 4. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase **URL** and **anon key** (found in your project Settings → API):

```
NUXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=YOUR_ANON_PUBLIC_KEY
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
├── assets/css/main.css          # Tailwind entry + component classes
├── composables/useDues.ts       # All Supabase data logic (officers, payments, reports)
├── layouts/default.vue          # Sidebar navigation layout
├── pages/
│   ├── index.vue                # Dashboard
│   ├── officers.vue             # Officers CRUD
│   ├── payments.vue             # Payments management
│   └── reports.vue              # Year-to-date report + CSV export
├── supabase_schema.sql          # Database schema (run in Supabase SQL editor)
├── nuxt.config.ts               # Nuxt 4 config
├── tailwind.config.ts           # Tailwind theme (fonts, colors, animations)
├── package.json
└── .env.example
```

## Database Tables

**officers**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, auto-generated |
| full_name | text | Required |
| role | text | Pastor, Deacon, Elder, etc. |
| email | text | Optional |
| phone | text | Optional |
| monthly_dues | numeric | The weekly due amount (in your currency) |
| is_active | boolean | Toggle without deleting |
| created_at / updated_at | timestamptz | Auto-managed |

**payments**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| officer_id | uuid | FK → officers |
| amount | numeric | Amount paid |
| week_start | date | Monday of the payment week (ISO) |
| paid_at | timestamptz | When the record was created |
| notes | text | Optional (cash, transfer, etc.) |

---

## Production Deployment

1. **Vercel / Netlify** — push to GitHub, connect repo, set the two `NUXT_PUBLIC_*` env vars in the dashboard, and deploy.
2. **Supabase RLS** — the current policies allow open read/write. Tighten them by adding authenticated-user checks before going live.

---

## Tech Stack

- [Nuxt 4](https://nuxt.com)
- [@nuxtjs/supabase](https://supabase.nuxtjs.com)
- [Tailwind CSS](https://tailwindcss.com) via `@nuxtjs/tailwindcss`
- Playfair Display + DM Sans (Google Fonts)
