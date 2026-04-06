# Onscreen.ng — Cinema & Outdoor Advertising Marketplace

A premium ad-tech marketplace for cinema and outdoor advertising in Nigeria and across Africa.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- (Optional) AWS S3, Paystack account

### 1. Clone & Install

```bash
git clone <repo>
cd onscreen-ng
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/onscreen_ng"
NEXTAUTH_SECRET="your-secret-32-chars-min"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_SECRET_KEY="sk_test_..."
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@onscreen.ng | Admin@123! |
| Advertiser | brand@example.com | Demo@123! |
| Media Owner | owner@silverbird.com | Media@123! |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (marketing)/          # Landing page
│   ├── (auth)/               # Login & Signup
│   ├── (dashboard)/
│   │   ├── advertiser/       # Advertiser dashboard
│   │   │   ├── dashboard/    # Overview
│   │   │   ├── rfq/          # RFQ management
│   │   │   ├── campaigns/    # Campaign tracking
│   │   │   └── marketplace/  # Browse cinemas
│   │   ├── admin/            # Admin panel
│   │   │   ├── dashboard/    # Admin overview
│   │   │   ├── rfq/          # Manage RFQs + Quote builder
│   │   │   ├── campaigns/    # Manage campaigns
│   │   │   └── cinemas/      # Cinema management
│   │   └── media-owner/      # Media owner portal
│   └── api/
│       ├── auth/             # Auth endpoints
│       ├── rfq/              # RFQ CRUD
│       ├── quotes/           # Quote management
│       ├── campaigns/        # Campaign tracking
│       ├── cinemas/          # Cinema CRUD
│       ├── impressions/      # Impressions calculator
│       ├── payments/         # Paystack integration
│       └── admin/stats/      # Dashboard analytics
├── components/
│   ├── landing/              # Marketing components
│   ├── dashboard/            # Dashboard layout & sidebar
│   └── providers.tsx         # Context providers
├── hooks/
│   └── useAuth.tsx           # Auth context
└── lib/
    ├── prisma.ts             # DB client
    ├── auth.ts               # JWT auth utilities
    ├── impressions.ts        # Impressions calculator
    └── middleware.ts         # API middleware
```

---

## 💰 Pricing Model

All quotes include transparent fee breakdown:

| Component | Rate |
|-----------|------|
| Media Cost | Based on cinema × slots × duration |
| Agency Fee | 10% of media cost |
| Ad Conversion Fee | ₦20,000 fixed |
| VAT | 7.5% of (media + agency + conversion) |
| **Grand Total** | **All-inclusive** |

---

## 📊 Impressions Model

Dynamic occupancy calculation based on:

| Time | Weekday | Weekend | Holiday | Festive |
|------|---------|---------|---------|---------|
| Morning | 20% | 40% | 55% | 70% |
| Afternoon | 35% | 70% | 85% | 95% |
| Evening | 65% | 90% | 95% | 99% |
| All Day | 40% | 67% | 78% | 88% |

**Formula:** `Impressions = Seats × Occupancy Rate × Showtimes/Day × Campaign Days`

---

## 🌍 Covered Locations

**Nigeria:** Lagos, Abuja, Port Harcourt, Ibadan, Kano, Enugu  
**Africa:** Nairobi (Kenya), Accra (Ghana)

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🎬 Film Factor Feature

### What's New
The Film Factor update adds full cinema programme intelligence to Onscreen.ng.

### Features Added

**Landing Page — Now Showing / Coming Soon**
- 4-column film grid with poster, title, category badge
- Filter by: All / Now Showing / Coming Soon
- Filter by: All / Nollywood 🇳🇬 / Hollywood 🇺🇸
- Hover reveals synopsis, duration, rating, genre
- Seeded with 12 real/representative Nigerian cinema titles
- Admin-only control — only shows what admin has published

**Admin — Film Programme (`/admin/films`)**
- Add / Edit / Delete films
- Fields: Title, Category (Nollywood/Hollywood/Bollywood/Animation/Documentary), Status (Now Showing / Coming Soon / Ended), Poster URL, Trailer URL, Synopsis, Director, Cast, Genre, Rating, Duration, Release Date, End Date
- Audience Profile per film: Gender split (Male/Female/Mixed) + Age group (Children/Teens/Young Adults/Adults/Mixed)
- Featured toggle — promotes film on homepage
- Sort Order — controls display sequence
- Live poster preview while entering URL

**Admin — Weekly Film Schedule (Cinema Inventory)**
- Assign any film to any screen for a specific week
- Set showtimes/day and time slots (Morning / Afternoon / Evening / All Day)
- Per-cinema, per-screen scheduling
- View and remove schedule assignments inline on each film card

**Advertiser — What's On (`/advertiser/schedule`)**
- Weekly schedule view — browse what films are playing at each cinema
- Week navigator (prev/next week)
- Filter by cinema
- Shows: film poster, screen name, showtimes per day, time slots

**Campaign Tracking — Audience & Film Intelligence**
- New "Audience & Film Intelligence" section on every campaign detail page
- Shows films currently running alongside the campaign
- Gender split pie chart (Male vs Female)
- Age breakdown bar chart (Under 18 / 18–35 / 36–50 / 50+)
- Based on FilmAudienceLog data logged by admin

### New Database Models
- `Film` — title, category, status, poster, audience profile, dates
- `FilmSchedule` — weekly assignments of films to cinema screens
- `FilmAudienceLog` — demographic attendance logs per film per cinema

### New API Endpoints
- `GET/POST /api/films` — list and create films
- `GET/PUT/DELETE /api/films/[id]` — single film operations
- `GET/POST/DELETE /api/films/schedules` — weekly screen assignments
- `GET/POST /api/films/audience` — audience demographic logs



- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (jose)
- **Charts:** Recharts
- **Payments:** Paystack
- **Storage:** AWS S3 (configured)
- **Fonts:** Playfair Display + DM Sans
