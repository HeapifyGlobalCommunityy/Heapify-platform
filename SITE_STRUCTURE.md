# Heapify Global Community Platform — Site Structure & Architectural Guide

This document serves as an authoritative structural reference for human developers, team members, and AI agents working on the **Heapify Global Community Platform** codebase.

---

## 1. Executive Summary & Tech Stack

**Heapify** is a product-grade community operating system built to scale chapters, events, hackathons, open-source projects, challenges, and partner programs.

- **Framework**: Next.js 15 (App Router, React Server Components `RSC`, Server Actions)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security `RLS`, `@supabase/ssr` cookies)
- **Styling & UI**: TailwindCSS, Vanilla CSS, Glassmorphism, HSL color tokens, Framer Motion
- **Icons**: Lucide React (`lucide-react`)
- **Security**: Cloudflare Turnstile Captcha token verification on authentication & submission APIs

---

## 2. Directory & Route Hierarchy

```
heapify/
├── app/                              # Next.js App Router routes & pages
│   ├── layout.tsx                    # Root layout (Navbar, Footer, Providers, Fonts)
│   ├── page.tsx                      # Landing page (Hero, Stats, Announcements, Featured Events)
│   ├── events/                       # Events Directory Subsystem
│   │   ├── page.tsx                  # Public Events Explorer (/events) with ISR (revalidate=60)
│   │   ├── loading.tsx               # Skeleton loading UI for events list
│   │   ├── build-with-gemma/         # Flagship Event Success Story Page (/events/build-with-gemma)
│   │   │   └── page.tsx              # Detailed Gemma Sprint recap, keynote, gallery & collaborators
│   │   └── [slug]/                   # Dynamic Event Detail & Registration Page (/events/[slug])
│   │       ├── page.tsx              # Event server component & ISR fetch
│   │       └── loading.tsx           # Event detail skeleton
│   ├── challenges/                   # Community Challenges & Bounties (/challenges)
│   │   └── page.tsx
│   ├── open-source/                  # Open Source Projects Hub (/open-source)
│   │   ├── page.tsx                  # Projects grid
│   │   └── [slug]/                   # Individual project detail page
│   │       └── page.tsx
│   ├── resources/                    # Learning Resources & Guides (/resources)
│   │   ├── page.tsx
│   │   └── [category]/               # Categorized resource lists
│   │       └── page.tsx
│   ├── forms/                        # Dynamic Form Submission Engine
│   │   ├── page.tsx                  # Forms overview
│   │   └── [type]/                   # Dynamic form handler (/forms/join, /forms/contact, etc.)
│   │       ├── page.tsx
│   │       └── DynamicForm.tsx
│   ├── login/                        # Sign In page (Email + Google OAuth + Captcha)
│   │   └── page.tsx
│   ├── signup/                       # Account Registration page
│   │   └── page.tsx
│   ├── reset-password/               # Password Recovery page (/reset-password)
│   │   └── page.tsx
│   ├── dashboard/                    # Member Personal Workspace (/dashboard)
│   │   └── page.tsx                  # Auth-protected session, stats, registered events
│   ├── profile/                      # User Profile Subsystem
│   │   ├── page.tsx                  # Public / Personal Profile view
│   │   └── edit/                     # Profile Editor (/profile/edit)
│   │       └── page.tsx
│   ├── chapter/                      # Chapter Lead Management Portal (/chapter)
│   │   ├── page.tsx
│   │   └── events/
│   │       ├── new/page.tsx          # Chapter Event Creation Form
│   │       └── [slug]/edit/page.tsx  # Chapter Event Editor
│   ├── admin/                        # Global Platform Admin Panel (/admin)
│   │   └── page.tsx
│   ├── auth/callback/                # Supabase Auth Code Exchange Callback API
│   │   └── route.ts
│   └── api/                          # Server API Endpoints
│       ├── captcha/route.ts          # Turnstile captcha verification
│       └── events/[slug]/register/   # Event registration API endpoint
│
├── components/                       # UI & Feature Components
│   ├── auth/                         # Sign In, Sign Up, OAuth & Card components
│   ├── captcha/                      # Cloudflare Turnstile widget
│   ├── challenges/                   # Challenge cards & bounties UI
│   ├── chapter/                      # Event creation & editing forms
│   ├── events/                       # EventDetailClient & Explorer UI
│   ├── layout/                       # Navbar, Footer, Logo & Navigation
│   ├── profile/                      # Profile forms, history, leaderboard UI
│   ├── registration/                 # Event multi-step registration forms
│   ├── site/                         # Landing page sections & site UI primitives
│   └── ui/                           # Primitive UI elements (Button, Input, Dropdown, Skeleton)
│
├── lib/                              # Core Utility Libraries & Business Logic
│   ├── actions/                      # Next.js Server Actions (events, forms, profile, challenges)
│   ├── auth/                         # Authorization rules & role checks
│   ├── captcha/                      # Turnstile verification backend logic
│   ├── site-content.ts               # Global content structures, navigation links, event fallback catalog
│   ├── supabase/                     # Supabase client, server, admin, & query utilities
│   │   ├── client.ts                 # Browser Supabase client creator
│   │   ├── server.ts                 # Server Component & Server Action Supabase client creator
│   │   ├── admin.ts                  # Service Role bypass client creator
│   │   └── queries.ts                # Shared database fetch functions (events, profiles, badges)
│   └── types/                        # TypeScript type declarations & database schemas
│
├── public/                           # Static Media Assets
│   └── images/                       # Event banners, speaker photos, gallery images
│
├── supabase/                         # Database Schema & SQL Migrations
│   ├── schema.sql                    # Main database schema initialization script
│   └── migrations/                   # SQL migration scripts (001 through 007)
│
├── README.md                         # Product & deployment documentation
└── SITE_STRUCTURE.md                # AI Agent & Developer site map reference (this file)
```

---

## 3. Core Data Schemas & Content Flow

### A. Events Data Architecture
- **Primary Source**: Database table `events` queried via [lib/supabase/queries.ts](file:///c:/Coding/heapify/lib/supabase/queries.ts).
- **Fallback Catalog**: Static catalog defined in `eventCatalog` inside [lib/site-content.ts](file:///c:/Coding/heapify/lib/site-content.ts).
- **Special Dedicated Route**: Flagship event `/events/build-with-gemma` has a rich, dedicated retrospective page at [app/events/build-with-gemma/page.tsx](file:///c:/Coding/heapify/app/events/build-with-gemma/page.tsx).

### B. Precursor & Independent Events Catalog
Independent events conducted under community initiatives (e.g. *Web3 to GSoC'27*, *Mission BAH'26*, *Builder Talks*) are registered in `eventCatalog` within [lib/site-content.ts](file:///c:/Coding/heapify/lib/site-content.ts) so they appear on the main `/events` page as standalone past events.

---

## 4. Production Stage Flags (`NEXT_PUBLIC_STAGE`)

To maintain clean public releases, scaffolded or in-development features are controlled via environment flags:

```typescript
const isProd = process.env.NEXT_PUBLIC_STAGE === "production" || process.env.NODE_ENV === "production";
```

### Production Behavior:
- **Hidden Links in Navigation/Footer/Hero**:
  - `Dashboard` (`/dashboard`)
  - `Challenges` (`/challenges`)
  - `Projects / Open Source` (`/open-source`)
  - `Resources` (`/resources`)
- **Development Behavior**:
  - In non-production environments (`npm run dev`), all pages and navigation links remain fully visible for testing.

---

## 5. Guidelines for AI Agents & Contributors

When performing edits on this repository, AI agents and developers must strictly adhere to the following rules:

1. **Type Safety & Strictness**:
   - Always run `npx tsc --noEmit` after writing code.
   - Do NOT introduce unused variables or unused imports (triggers ESLint failure on Vercel builds).
2. **Preserve Fixed Bug Solutions**:
   - Keep `isolation: "isolate"` removed from [components/ui/dropdown.tsx](file:///c:/Coding/heapify/components/ui/dropdown.tsx) so dropdown menus float correctly above sibling cards.
   - Keep `pt-40 lg:pt-44` top padding on event detail wrappers to prevent navbar overlap.
3. **Media & Image Assets**:
   - Always store event photos under `public/images/`.
   - Use `<Image fill className="object-cover" />` inside relative containers for responsive media layouts.
   - Provide clean, styled image placeholder cards (`[Image Placeholder: ... ]`) when media assets are pending user upload.
