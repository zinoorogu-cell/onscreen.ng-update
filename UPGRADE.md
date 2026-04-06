# Updating Your Existing Vercel Deployment

If you already deployed the first version of Onscreen.ng, follow these steps to apply the Film Factor update.

## Step 1 — Pull the new code into GitHub

Replace your project files with the new zip contents, then:

```bash
git add .
git commit -m "Add Film Factor feature - Now Showing, schedules, audience demographics"
git push origin main
```

Vercel will automatically redeploy when you push.

## Step 2 — Update the Database Schema

The new version adds 3 new models (`Film`, `FilmSchedule`, `FilmAudienceLog`) and new enums.

Run this from your local terminal with your Neon DATABASE_URL:

```bash
export DATABASE_URL="postgresql://...@...neon.tech/onscreen_ng?sslmode=require"

# Push the updated schema (safe - adds new tables, doesn't drop existing)
npx prisma db push

# Seed the 12 new films
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

> Note: `prisma db push` is additive — it won't delete your existing data.

## Step 3 — Verify

After redeployment:

1. Go to your live site — you should see **"What's Playing This Week"** section on the homepage
2. Log in as Admin → **Film Programme** should appear in the sidebar
3. Add a film and assign it to a cinema screen

## What Changed

| Area | Change |
|------|--------|
| `prisma/schema.prisma` | Added `Film`, `FilmSchedule`, `FilmAudienceLog` models + 5 new enums |
| `prisma/seed.ts` | 12 film records seeded |
| Landing page | New `FilmsShowcase` section between Cinema Carousel and How It Works |
| Admin sidebar | New **Film Programme** link → `/admin/films` |
| Advertiser sidebar | New **What's On** link → `/advertiser/schedule` |
| Campaign detail | New **Audience & Film Intelligence** section with charts |
| New API routes | `/api/films`, `/api/films/[id]`, `/api/films/schedules`, `/api/films/audience` |
| New components | `FilmsShowcase`, `AudienceDemographics` |
| New pages | `admin/films`, `advertiser/schedule` |
