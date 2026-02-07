# Astro Calculator

A full-stack astrology web application built with Next.js, Supabase, and Stripe. It combines three powerful astrological calculators with a professional consultation booking system, subscription billing, and a stunning 3D celestial background.

---

## Table of Contents

- [Overview](#overview)
- [Calculators](#calculators)
  - [Spark Calculator](#spark-calculator)
  - [True Placement Calculator](#true-placement-calculator)
    - [Basic](#basic)
    - [Ruler (BPHDDS/R)](#ruler-bphdds-r)
    - [YoYo](#yoyo)
    - [PHS (Planet-House-Sign)](#phs-planet-house-sign)
    - [PHSR (Planet-House-Sign-Ruler)](#phsr-planet-house-sign-ruler)
    - [Mix & Match](#mix--match)
  - [Profection Year Calculator](#profection-year-calculator)
- [Study Notes](#study-notes)
- [Consultation Booking](#consultation-booking)
- [Subscriptions & Pricing](#subscriptions--pricing)
- [Authentication](#authentication)
- [Admin & Superuser Roles](#admin--superuser-roles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Routes](#api-routes)

---

## Overview

Astro Calculator lets users explore their birth chart through three different calculation tools, each approaching the chart from a unique angle. Free users get 10 calculations per day (3 for anonymous visitors). Upgrading to Astro Pro removes all limits. The app also offers one-on-one astrology consultations with a built-in scheduling and payment system.

---

## Calculators

### Spark Calculator

The Spark Calculator determines which "Spark" sign a planet occupies based on its exact degree position within a zodiac sign.

**How it works:**

1. You select a **planet** (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, South Node, Chiron, Lilith, or Part of Fortune).
2. You select the **zodiac sign** that planet is in (from your natal chart).
3. You enter the **degree** (0-29) of the planet within that sign.

**What it calculates:**

- **Spark Sign** - Each degree of each zodiac sign maps to a specific Spark sign. The app looks up the exact degree in a database of 360 entries (30 degrees x 12 signs) to find which Spark sign that degree corresponds to. This reveals a secondary layer of influence on the planet.
- **Decan** - Each sign is divided into three 10-degree sections called decans (0-9, 10-19, 20-29). The calculator determines which decan the degree falls in.
- **Decan Ruling Planets** - Each decan is ruled by specific planets. The calculator shows which planets govern that particular decan, adding context to the interpretation.

**The logic:** The calculator uses `sparkDatabase` - a lookup table where every combination of sign + degree maps to a Spark sign and decan information. When you click Calculate, it finds the matching row and returns the result.

---

### True Placement Calculator

The True Placement Calculator reveals where a planet actually expresses its energy by combining the planet's sign position with your rising sign (Ascendant). It contains **6 sub-calculators**, each offering a different way to build interpretations from the same underlying data.

All sub-calculators pull from two lookup databases: `truePlacementDB1` (1,440 entries covering every planet + sign + rising sign combination) and `truePlacementDB2` (additional dual-base data for Venus and Mercury). The rising sign shifts which house each sign rules in your chart, so the same planet-sign combo produces different results depending on your Ascendant.

Every sub-calculator also includes keyword selection. Planets, signs, and houses each have associated keywords stored in the database. After calculating, you pick words from each element to build a personalized interpretation sentence.

---

#### Basic

The foundational True Placement calculation. Start here if you're new.

**Inputs:** Planet, zodiac sign, rising sign, and optionally the planet's degree.

**What it calculates:**

- **IS House & Sign** - The house the planet sits in and the sign associated with that house. This tells you the area of life the planet is actively influencing.
- **Expressing Sign** - The sign through which the planet expresses its energy outwardly.
- **Base House & Sign** - The foundational house and sign, representing the planet's core energy. Venus and Mercury can have dual bases (two base positions), which the calculator handles separately using a second lookup database.
- **Through Sign** - The sign the planet works "through" to manifest its effects.
- **Spark Data** - If you entered a degree, the Spark sign, decan, and ruling planets are included.

After the calculation, you select keywords from dropdowns for the planet, house, and sign, and the app builds an interpretation sentence from your selections.

---

#### Ruler (BPHDDS/R)

Short for "Base Planet House Determined by Sign with Ruler follow-through." This calculator takes the Basic result one step further by also calculating the placement of the planet's **ruler**.

**Inputs:** Planet, sign, rising sign, degree (optional), plus the **ruler's sign** and optionally the ruler's degree. A toggle lets you enable or disable the ruler panel.

**How the ruler is determined:** The calculator automatically derives the ruling planet based on the sign using modern rulerships (Aries = Mars, Taurus = Venus, Gemini = Mercury, Cancer = Moon, Leo = Sun, Virgo = Mercury, Libra = Venus, Scorpio = Pluto, Sagittarius = Jupiter, Capricorn = Saturn, Aquarius = Uranus, Pisces = Neptune). You then enter what sign that ruler planet is in from your chart.

**What it calculates:** Two full True Placement results side by side - one for the main planet and one for its ruler. The app combines both into a cosmological sentence that connects the planet's placement to where its ruler directs that energy.

---

#### YoYo

A creative interpretation tool that builds a symmetrical "bounce" pattern from three elements.

**Inputs:** Planet, house number (1st through 12th), and zodiac sign.

**What it calculates:** The calculator generates a vertical 6-row table arranged in a mirror pattern:

```
Planet keyword    (top)
  House keyword
    Sign keyword
    Sign keyword
  House keyword
Planet keyword    (bottom)
```

The top half descends (Planet, House, Sign) and the bottom half ascends back (Sign, House, Planet), creating a "YoYo" bounce. You select a keyword for each of the 6 positions, then combine them into a sentence that reads like a loop.

**Example:** "My family's sense of design is detached, and that detachment by design because of my family."

The YoYo calculator has its own custom sentence builder where you click words to add them in order, or toggle to manual typing.

---

#### PHS (Planet-House-Sign)

The simplest sentence builder. Three elements, one sentence.

**Inputs:** Planet, zodiac sign, and rising sign.

**What it calculates:** The planet's house placement (derived from sign + rising sign). It then presents three result boxes and walks you through building a sentence in two steps:

1. **Step 1** - Select a keyword for the planet, choose a connector phrase, and select a keyword for the house. Connector options include: "direct through," "is focused into," "relates to," "contributes to," "is based on," and "may come through."
2. **Step 2** (unlocks after step 1) - Select a keyword for the sign.

**Result format:** "[Planet keyword] [connector] [House keyword] expressed through [Sign keyword]"

---

#### PHSR (Planet-House-Sign-Ruler)

Extends PHS by chaining in the ruler planet and its placement.

**Inputs:** Planet, zodiac sign, rising sign, and the ruler's sign (the ruler planet is automatically derived from the sign's modern rulership).

**What it calculates:** The main planet's house placement plus the ruler planet's house placement. It builds a longer interpretation sentence through 5 sequential steps:

1. Select a planet keyword + connector + house keyword.
2. Select a sign keyword (unlocks after step 1).
3. Select a ruler keyword (unlocks after step 2).
4. Select the ruler's connector + ruler's house keyword (unlocks after step 3).
5. Select the ruler's sign keyword (unlocks after step 4).

**Result format:** "[Planet] [connector] [House], expressed through [Sign] going into [Ruler] [connector] [Ruler's House] expressed through [Ruler's Sign]"

---

#### Mix & Match

The most advanced calculator. It combines the planet's placement with bi-rulers (dual base data) and the ruler chain into one comprehensive sentence.

**Inputs:** Planet, zodiac sign, rising sign, and the ruler's sign.

**What it calculates:** The main planet's placement including bi-ruler data (dual bases when they exist), plus the ruler planet's placement. The sentence builder has 5 steps:

1. Select a planet keyword + connector + house keyword.
2. Select bi-ruler keyword(s). If the planet has a dual base, you select **two** keywords that appear together in parentheses (e.g., "Planet (base1 & base2)"). If there's only one base, you select one.
3. Select a sign keyword (unlocks after step 2).
4. Select a ruler keyword + connector + ruler's house keyword (unlocks after step 3).
5. Select the ruler's sign keyword (unlocks after step 4).

**Result format:** "[Planet] ([Bi-Ruler] & [Bi-Ruler2]) [connector] [House], expressed through [Sign] going into [Ruler] [connector] [Ruler's House] expressed through [Ruler's Sign]"

This is the most layered interpretation available, combining every data point the system can produce for a single planet.

---

**Sub-calculator comparison:**

| Tab | Inputs | Complexity | What makes it different |
|-----|--------|-----------|------------------------|
| Basic | 4 | Entry-level | Foundation calculation, full result breakdown |
| Ruler | 6 | Medium | Adds the ruler planet's placement alongside the main planet |
| YoYo | 3 | Creative | Mirror-pattern keyword bounce for poetic interpretations |
| PHS | 3 | Minimal | Simplest sentence: planet + house + sign with a connector |
| PHSR | 4 | Advanced | Chains the ruler into a 5-step sentence |
| Mix & Match | 4 | Most advanced | Adds bi-rulers (dual bases) to the full ruler chain |

---

### Profection Year Calculator

The Profection Year Calculator maps out a 24-year cycle showing which house and sign is activated each year of your life based on your rising sign.

**How it works:**

1. You enter your **birth date**.
2. You select your **rising sign**.
3. You enter your **first activation year** (the year you want the cycle to begin).

**What it calculates:**

- **24-year profection cycle** - Starting from your 1st house (your rising sign), each year of life activates the next house in sequence. Year 1 activates the 1st house, year 2 activates the 2nd house, and so on. After the 12th house, the cycle repeats.
- **Current profection year** - The calculator highlights which house and sign are active for your current age.
- **Age and year mapping** - Each row shows your age, the calendar year, the activated house number, and the zodiac sign ruling that house.

**The logic:** The calculator takes your birth date to determine your current age, then counts forward from your rising sign through the zodiac. Each year advances one house. Since there are 12 houses, the pattern repeats every 12 years, so the full 24-year table shows two complete cycles. The profection wheel component renders this visually as a circular diagram.

---

## Study Notes

The Study Notes section is an in-app learning area where premium members can access curated educational materials about astrology. It lives at `/notes` and is only accessible to logged-in users.

**What it contains:**

Study notes are image-based educational materials covering topics like "The Four Elements," "Aspects," "Houses," "Fundamentals," and "Planetary Dignities." Each note has a title, description, category tag, and a full-resolution image that serves as the study material itself.

**Access tiers:**

| Access Level | What you see |
|-------------|-------------|
| **Free user** | Note cards are visible but locked. Images are blurred and a gold lock icon is displayed. A prompt encourages upgrading to Pro. |
| **Pro subscriber** | Full access. View images at full resolution, zoom in and out (0.5x to 3x), and download any material as a PNG file. |
| **Superuser** | Full viewing access plus the ability to create new notes, upload images, and delete existing notes. |

**Viewing experience (Pro users):**

- Notes are displayed in a responsive grid (2 columns on desktop, 1 on mobile).
- Each card shows a category badge, image preview, title, and description.
- Clicking "View Study Material" opens a fullscreen modal with:
  - Zoom controls (zoom in, zoom out, reset to 100%, and a percentage display).
  - A download button that saves the image as a PNG named after the note title.
  - Scrollable image display with the title and category shown.

**Managing notes (Superusers):**

Superusers see an "Add Note" button at the top of the page. The creation form includes:

- **Title** - Name of the study material.
- **Description** - Brief explanation of what the material covers.
- **Category** - Free-form text tag (e.g., "Fundamentals," "Aspects").
- **Image** - Upload a file (PNG, JPEG, or WebP, max 5MB) or paste a URL. Images are stored in a Supabase Storage bucket. A preview is shown before saving.

Superusers can also delete notes directly from the card view with a confirmation prompt.

**How notes are organized:**

Notes are displayed in a defined sort order. New notes are automatically placed at the end (highest sort order + 1). Categories are free-form text, so superusers can create any category structure they want.

---

## Consultation Booking

The app includes a full consultation booking system at `/good-vibes-astrology` where users can schedule one-on-one astrology sessions.

**How it works for users:**

1. **Browse availability** - Available time slots are displayed in a date picker. Slots are created by superusers (astrologers).
2. **Select a slot** - Pick a date and time that works for you.
3. **Fill in your details** - Name, email, phone, birth date, birth time, birth place, and preferred consultation topic.
4. **Choose a topic** - Natal Chart Reading, Transit Reading, Relationship Compatibility, Career & Life Path, Yearly Forecast, or General Consultation.
5. **Authorize payment** - The app creates a Stripe PaymentIntent and authorizes your card without charging it immediately. This hold ensures the consultation is reserved.
6. **Wait for approval** - Your booking is submitted as "pending." The astrologer reviews and approves or rejects it.
7. **Consultation happens** - Once approved, you meet at the scheduled time. Payment is captured after the session.

**How it works for superusers (astrologers):**

1. **Create availability** - Set available time windows with start time, end time, and slot duration (30, 60, or 90 minutes).
2. **Manage bookings** - View incoming booking requests, approve or reject them, and add notes.
3. **Track status** - Bookings flow through: pending, approved, rejected, cancelled, or completed.

**Consultation pricing:**

| Duration | Price |
|----------|-------|
| 30 min   | $30   |
| 60 min   | $40   |
| 90 min   | $55   |

**Payment security:** The server verifies that the PaymentIntent belongs to the authenticated user, that the amount matches the selected duration, and that the payment intent hasn't already been used for another booking. Overlapping bookings for the same time slot are blocked.

---

## Subscriptions & Pricing

| Plan | Price | Includes |
|------|-------|----------|
| Free | $0 | 10 calculations/day (3 for anonymous users) |
| Astro Pro Monthly | $9/month | Unlimited calculations, avatar customization |
| Astro Pro Annual | $79/year | Same as monthly, saves ~27% (2 months free) |

**How usage tracking works:**

- Each calculation increments a counter stored in the database.
- The counter resets automatically at midnight UTC each day.
- Anonymous users are tracked by IP address with a lower daily limit.
- When you're close to your limit, a banner appears showing remaining calculations and a countdown to reset.
- Subscribing to Astro Pro removes all limits.

**How subscriptions work:**

1. Click Upgrade on the pricing page.
2. Select monthly or annual billing.
3. The app creates a Stripe Checkout session and redirects you to Stripe's hosted payment page.
4. Complete payment and return to the app.
5. A Stripe webhook fires and updates your subscription status in the database in real time.
6. You can manage your subscription (cancel, change plan, update payment method) through the Stripe Customer Portal, accessible from your account page.

---

## Authentication

The app supports two authentication methods:

- **Email & Password** - Standard signup with email verification, login, and password reset.
- **Google OAuth** - One-click sign-in with your Google account.

**What happens on signup:**

1. An account is created in Supabase Auth.
2. A database trigger (`handle_new_user`) automatically creates a user profile row with your name, email, and a random avatar.
3. Your daily calculation counter is initialized.

**Session management:**

- Sessions are stored in HTTP-only cookies via Supabase SSR.
- Middleware on every request validates the session and refreshes tokens as needed.
- Protected pages (account, bookings, admin) redirect to login if no valid session exists.
- Auth pages (login, signup) redirect to home if you're already logged in.

---

## Admin & Superuser Roles

The app has three access levels:

| Role | Capabilities |
|------|-------------|
| **User** | Use calculators, book consultations, manage their own account |
| **Admin** | Everything a user can do, plus manage users and view submitted suggestions/feedback |
| **Superuser** | Everything a user can do, plus create availability slots and manage consultation bookings |

Roles are stored in the `user_roles` table with `is_admin` and `is_superuser` boolean flags. Row Level Security (RLS) policies enforce access at the database level.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 with App Router |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Radix UI |
| 3D Background | Three.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email, Google OAuth) |
| Payments | Stripe (Checkout, PaymentIntents, Webhooks, Customer Portal) |
| Notifications | Sonner (toast notifications) |
| Icons | Lucide React |
| Theming | next-themes (light/dark mode) |

---

## Project Structure

```
src/
  app/
    page.tsx                        # Home page with calculators
    layout.tsx                      # Root layout (fonts, providers, footer)
    pricing/                        # Subscription pricing page
    login/                          # Login page
    signup/                         # Signup page
    forgot-password/                # Password reset request
    reset-password/                 # Password reset form
    account/                        # User profile & subscription management
    good-vibes-astrology/           # Consultation booking page
    admin/                          # Admin dashboard
    superuser/                      # Superuser management
    suggestions/                    # User suggestions
    notes/                          # Study notes
    (legal)/                        # Legal pages (privacy, terms, cookies)
    api/
      auth/                         # Auth callback & signout
      bookings/                     # Booking CRUD & payment intents
      availability/                 # Slot management
      create-checkout-session/      # Stripe subscription checkout
      create-portal-session/        # Stripe customer portal
      webhooks/                     # Stripe webhook handler
      track-calculation/            # Usage tracking
      keywords/                     # Astrology keyword data
      suggestions/                  # Feedback submissions
      admin/                        # Admin endpoints
      notes/                        # Study notes endpoints
  components/
    ui/                             # Base UI components (Button, Card, Input, etc.)
    auth/                           # AuthProvider, FloatingAuth, UserMenu
    calculator/                     # All calculator components
    booking/                        # Booking flow components
    stripe/                         # StripeProvider, PaymentForm
    CelestialBackground.tsx         # Three.js star field
    CookieConsent.tsx               # Cookie banner
    Footer.tsx                      # Site footer
    UsageLimitBanner.tsx            # Daily limit warnings
  lib/
    supabase/                       # Supabase client (browser & server)
    stripe.ts                       # Stripe client initialization
    utils.ts                        # Utility functions
  data/
    sparkDatabase.ts                # 360-entry Spark lookup table
    truePlacementDB1.ts             # 1,440-entry True Placement lookups
    truePlacementDB2.ts             # Venus/Mercury dual-base lookups
  hooks/
    useUsageLimit.ts                # Calculation tracking hook
  types/
    supabase.ts                     # Generated database types
supabase/
  migrations/                       # Database migration SQL files
```

---

## Database Schema

**Core tables:**

| Table | Purpose |
|-------|---------|
| `users` | User profiles (name, email, avatar, calculation count, reset date) |
| `customers` | Maps user IDs to Stripe customer IDs |
| `products` | Synced from Stripe (subscription products) |
| `prices` | Synced from Stripe (pricing tiers) |
| `subscriptions` | Active subscription records with billing period |
| `user_roles` | Admin and superuser flags |
| `profiles` | User avatar preferences |
| `keywords` | Astrology keywords for planets and signs |
| `availability_slots` | Consultation time windows created by superusers |
| `consultation_bookings` | Booking records with user info, payment status, and scheduling |
| `study_notes` | Educational content (title, description, category, image) |

**Key database functions:**

- `increment_calculation_count(user_uuid)` - Adds 1 to the user's daily calculation count, automatically resetting if a new day has started.
- `handle_new_user()` - Trigger that fires on signup to create a user profile row.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Getting Started

**Prerequisites:** Node.js 18+, a Supabase project, and a Stripe account.

```bash
# Clone the repository
git clone <repo-url>
cd Astro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe credentials

# Run database migrations
# Apply the SQL files in supabase/migrations/ to your Supabase project
# in order (001_init.sql through 008_superuser_note.sql)

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

**Stripe webhook setup (for local development):**

```bash
# Install the Stripe CLI, then:
stripe listen --forward-to localhost:3000/api/webhooks
```

This forwards Stripe events (subscription changes, payment updates) to your local server.

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/callback` | OAuth callback handler |
| GET | `/api/auth/signout` | Sign out and clear session |
| POST | `/api/create-checkout-session` | Create Stripe Checkout for subscriptions |
| POST | `/api/create-portal-session` | Open Stripe Customer Portal |
| GET | `/api/bookings` | List user's bookings |
| POST | `/api/bookings` | Create a new booking |
| PATCH | `/api/bookings/[id]` | Update booking status (approve/reject/cancel) |
| POST | `/api/bookings/create-payment-intent` | Create Stripe PaymentIntent for consultation |
| GET | `/api/availability` | List available consultation slots |
| POST | `/api/availability` | Create an availability slot (superuser) |
| DELETE | `/api/availability` | Remove an availability slot (superuser) |
| GET | `/api/availability/times` | Get time options for a specific date |
| POST | `/api/webhooks` | Stripe webhook receiver |
| POST | `/api/track-calculation` | Record a calculation for usage tracking |
| GET | `/api/keywords` | Fetch planet/sign keywords |
| POST | `/api/suggestions` | Submit user feedback |
| GET | `/api/admin/users` | List all users (admin only) |
| POST | `/api/admin/users` | Update user roles (admin only) |
| GET | `/api/admin/suggestions` | View all suggestions (admin only) |
| GET | `/api/notes` | List all study notes |
| POST | `/api/notes` | Create a study note (superuser only) |
| PATCH | `/api/notes` | Update a study note (superuser only) |
| DELETE | `/api/notes?id={id}` | Delete a study note (superuser only) |
| POST | `/api/notes/upload` | Upload a study note image (superuser only) |

---

## Browser Support

Works on all modern browsers (Chrome, Edge, Firefox, Safari, Opera). The Three.js celestial background requires WebGL support.

---

## License

All rights reserved.
