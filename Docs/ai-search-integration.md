# AI Search — Frontend Integration Guide

> Integration plan for the AI Search page in the **matamatrimony** Next.js frontend.  
> **API backend:** matrimonyservicesapi  
> **Prepared:** March 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [API Contract](#3-api-contract)
4. [Page Design](#4-page-design)
5. [Component Breakdown](#5-component-breakdown)
6. [Redux State Management](#6-redux-state-management)
7. [Navigation Integration](#7-navigation-integration)
8. [UX States & Transitions](#8-ux-states--transitions)
9. [Implementation Plan](#9-implementation-plan)
10. [File Inventory](#10-file-inventory)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  matamatrimony (Next.js 14)                                 │
│                                                             │
│  app/(dashboard)/ai-search/page.tsx                         │
│       │                                                     │
│       ├─ AISearchInput.tsx      ← natural language input    │
│       ├─ SuggestedQueries.tsx   ← clickable example chips   │
│       ├─ InterpretationCard.tsx ← what AI understood        │
│       ├─ QuotaBadge.tsx         ← usage counter + progress  │
│       └─ Profile cards          ← reuse search grid pattern │
│                                                             │
│  app/store/features/aiSearchSlice.ts  ← Redux state         │
│       │                                                     │
│       └─ POST /api/ai-search  ──────────────────────────┐   │
│                                                          │   │
└──────────────────────────────────────────────────────────┼───┘
                                                           │
┌──────────────────────────────────────────────────────────┼───┐
│  matrimonyservicesapi (Express + TypeScript)              │   │
│                                                          ▼   │
│  POST /api/ai-search                                         │
│       │                                                      │
│       ├─ auth.middleware (JWT cookie)                         │
│       ├─ apiKey.middleware (x-api-key)                        │
│       ├─ creditChecker.check(accountId)                      │
│       │      └─ CALL ai_search_get_credits(?)                │
│       ├─ AISearchService.search(query, profileId, accountId) │
│       │      ├─ AI Provider (OpenAI / Gemini)                │
│       │      ├─ IntentValidator                              │
│       │      ├─ LookupResolver                               │
│       │      ├─ QueryBuilder                                 │
│       │      └─ MySQL query execution                        │
│       ├─ creditChecker.deduct(accountId)                     │
│       └─ Response with profiles + credits                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

The AI Search page follows the same patterns as the existing `/search` page.

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14.2.5 (App Router) | `app/(dashboard)/ai-search/page.tsx` |
| State | Redux Toolkit | New `aiSearchSlice.ts` |
| HTTP | Axios (`app/lib/axios.ts`) | Cookie auth + `x-api-key` auto-attached |
| Styling | Tailwind CSS | Brand colors: `primary` (#800000), `secondary` (#f7ac03) |
| Components | shadcn/ui (Radix-based) | Button, Card, Dialog, Tooltip |
| Icons | Lucide + react-icons | `Sparkles` (lucide) for AI branding |
| Animation | Framer Motion + Lottie | Loading states, transitions |
| Auth guard | `AuthGuard` + `PaymentGuard` | Same as `/search` |

---

## 3. API Contract

### POST /api/ai-search

**Request:**
```json
{
  "query": "Find Hindu women between 25-30, MBA, from Hyderabad",
  "profile_id": 42
}
```

**Headers** (auto-attached by `app/lib/axios.ts`):
- `x-api-key: <API_KEY>`
- Cookie: `matrimony-token=<JWT>` (HttpOnly, sent via `withCredentials: true`)

### Response — 200 (Success)

```json
{
  "success": true,
  "message": "Found 12 matching profiles",
  "data": {
    "profiles": [
      {
        "profile_id": 101,
        "first_name": "Priya",
        "last_name": "Sharma",
        "age": 27,
        "gender": "Female",
        "religion_id": 1,
        "city": "Hyderabad",
        "country_name": "India",
        "occupation": "Software Engineer"
      }
    ],
    "interpretation": "Searching for Hindu women aged 25-30 with MBA in Hyderabad",
    "filters_applied": {
      "gender": "Female",
      "religion": "Hindu",
      "age_min": 25,
      "age_max": 30,
      "education_level": "MBA",
      "city": "Hyderabad"
    },
    "resolved_ids": {
      "gender": 2,
      "religion": 1,
      "education_level": 5
    },
    "confidence": 0.92,
    "result_count": 12,
    "credits": {
      "allowed": true,
      "credits_remaining": 9,
      "free_credits_granted": true
    }
  }
}
```

### Response — 422 (Low Confidence)

```json
{
  "success": false,
  "message": "Could not interpret search. Try: 'Find Hindu women aged 25-30 in Hyderabad'",
  "data": {
    "interpretation": { "confidence": 0.3 },
    "credits": {
      "allowed": true,
      "credits_remaining": 9,
      "free_credits_granted": true
    }
  }
}
```

### Response — 429 (Credits Exhausted)

```json
{
  "success": false,
  "message": "AI search credits exhausted. Purchase a credit pack to continue.",
  "data": {
    "credits": {
      "allowed": false,
      "credits_remaining": 0,
      "free_credits_granted": true
    },
    "upgrade_url": "/payments?source=ai-search"
  }
}
```

### Other Errors

| Status | Meaning | UI Action |
|---|---|---|
| 400 | Missing/invalid query or profile_id | Show inline validation |
| 401 | Not authenticated | Redirect to `/login` (AuthGuard handles) |
| 429 | Credits exhausted | Show credits exhausted overlay with buy CTA |
| 422 | AI couldn't interpret query | Show suggestion card |
| 502 | AI returned invalid JSON | Show "try again" toast |
| 504 | AI timed out | Show "try again" toast |
| 500 | Server error | Show generic error toast |

---

## 4. Page Design

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Navbar (existing)                                           │
├──────────────────────────────────────────────────────────────┤
│  PaymentGuard + AuthGuard (existing wrappers)                │
│                                                              │
│  ┌─ Header ──────────────────────────────────────────────┐   │
│  │  ✨ AI Search                          QuotaBadge     │   │
│  │     Describe your ideal match in natural language      │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Search Input ────────────────────────────────────────┐   │
│  │  🔍 │ "Find Hindu women aged 25-30 in Hyderabad"  [→]│   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Suggested Queries (before first search) ─────────────┐   │
│  │  [Hindu brides 25-30] [Engineers in USA]              │   │
│  │  [Doctors from Bangalore] [Telugu speakers near me]   │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Interpretation Card (after search) ──────────────────┐   │
│  │  🤖 Searching for:                                    │   │
│  │  [Hindu] [Women] [25-30 yrs] [MBA] [Hyderabad]       │   │
│  │                              Confidence: 92% ✓        │   │
│  │  Not what you meant? → Use standard filters           │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Results Grid (4 cols) ───────────────────────────────┐   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │   │
│  │  │ Card │ │ Card │ │ Card │ │ Card │                 │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘                 │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │   │
│  │  │ Card │ │ Card │ │ Card │ │ Card │                 │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘                 │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Credits Footer ─────────────────────────────────────┐   │
│  │  ✨ 9 credits remaining · Credits never expire        │   │
│  │                          [Buy more] if ≤ 5 remaining  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Footer (existing)                                           │
└──────────────────────────────────────────────────────────────┘
```

### Color / Branding

| Element | Style |
|---|---|
| AI sparkle icon | `text-[#f7ac03]` (secondary/gold) |
| Search button gradient | `from-[#800000] to-[#4A0404]` (matches existing) |
| Interpretation tags | `bg-[#800000]/10 text-[#800000] border border-[#800000]/20` |
| Confidence badge ≥ 0.7 | `bg-green-100 text-green-800` |
| Confidence badge < 0.7 | `bg-amber-100 text-amber-800` |
| Credit status colors | Green (credits available) → Amber (≤ 5 remaining) → Red (0 credits) |
| Font | `fontFamily: "BR Cobane"` for headings (matches existing) |

---

## 5. Component Breakdown

### 5.1 AISearchInput

```
Location: app/(dashboard)/ai-search/_components/AISearchInput.tsx
```

- Full-width input with sparkle icon prefix
- Placeholder rotates through examples (typewriter effect optional)
- Submit on Enter or button click
- Loading spinner in button during search
- Max 500 characters (matches API limit)
- Auto-focus on mount

**Props:**
```typescript
interface AISearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  disabled?: boolean;  // true when quota exhausted
}
```

### 5.2 SuggestedQueries

```
Location: app/(dashboard)/ai-search/_components/SuggestedQueries.tsx
```

- Grid of clickable chips with example queries
- Disappears after first search (shows again on clear)
- Chips styled as outlined pills with hover effect

**Suggested queries:**
```
"Hindu brides aged 25-30"
"Engineers working in USA"
"Doctors from Bangalore"
"Telugu-speaking professionals"
"MBA graduates under 35"
"Vegetarian women in Hyderabad"
```

**Props:**
```typescript
interface SuggestedQueriesProps {
  onSelect: (query: string) => void;
  visible: boolean;
}
```

### 5.3 InterpretationCard

```
Location: app/(dashboard)/ai-search/_components/InterpretationCard.tsx
```

- Shows after search completes
- Displays resolved filters as color-coded tags
- Confidence score with visual indicator (checkmark / warning)
- "Not what you meant?" link → navigates to `/search`
- Framer Motion fade-in animation

**Props:**
```typescript
interface InterpretationCardProps {
  interpretation: {
    gender?: string;
    religion?: string;
    age_min?: number;
    age_max?: number;
    education_level?: string;
    city?: string;
    confidence: number;
    [key: string]: any;
  };
  resultCount: number;
}
```

### 5.4 QuotaBadge (Credit-Based)

```
Location: app/(dashboard)/ai-search/_components/QuotaBadge.tsx
```

Three display variants:

**Inline badge** (header area):
```
✨ 9 credits left
```

**Footer bar** (bottom of results):
```
✨ 9 credits remaining · Credits never expire       [Buy more credits →]
```
The "Buy more credits" link appears only when ≤ 5 credits remain.

**Credits exhausted overlay** (replaces search input area):
```
┌─────────────────────────────────────────────────┐
│  🔒 AI Search Credits Exhausted                  │
│                                                  │
│  You've used all your AI search credits.         │
│  Purchase a credit pack to continue using        │
│  AI Search.                                      │
│                                                  │
│  [Buy Credits]          [Use Standard Search →]  │
└─────────────────────────────────────────────────┘
```

If `free_credits_granted` is false, the heading changes to "No AI Search Credits" with a message to complete membership first.

**Props:**
```typescript
interface CreditData {
  credits_remaining: number;   // -1 = fail-open / unknown
  free_credits_granted: boolean;
}

interface QuotaBadgeProps {
  credits: CreditData | null;
  variant: 'badge' | 'bar' | 'overlay';
}
```

### 5.5 Profile Cards (Reuse)

The existing `/search` page renders profile cards inline (lines 605–720 of `search/page.tsx`). Rather than extracting into a shared component immediately (risks regressions on the existing page), the AI Search page will **duplicate the card markup** initially, then refactor into a shared component in a follow-up.

This avoids touching the 747-line search page.

---

## 6. Redux State Management

### New Slice: `aiSearchSlice.ts`

```
Location: app/store/features/aiSearchSlice.ts
```

```typescript
interface AISearchCredits {
  allowed: boolean;
  credits_remaining: number;   // -1 = fail-open / unknown
  free_credits_granted: boolean;
}

interface AISearchState {
  query: string;
  results: any[];
  interpretation: {
    gender?: string;
    religion?: string;
    age_min?: number;
    age_max?: number;
    education_level?: string;
    city?: string;
    confidence: number;
    _interpretation_text?: string;
    [key: string]: any;
  } | null;
  resolvedFilters: Record<string, any> | null;
  resultCount: number;
  credits: AISearchCredits | null;   // replaces quota
  loading: boolean;
  error: string | null;
  errorType: 'validation' | 'quota' | 'interpretation' | 'timeout' | 'server' | null;
  hasSearched: boolean;  // controls suggested queries visibility
  upgradeUrl: string | null;
}
```

**Async thunk:**
```typescript
export const aiSearchAsync = createAsyncThunk(
  'aiSearch/search',
  async ({ query, profileId }: { query: string; profileId: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai-search', { query, profile_id: profileId });
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;

      // Extract credits from 429 responses
      if (status === 429) {
        return rejectWithValue({ type: 'quota', ...data });
      }
      if (status === 422) {
        return rejectWithValue({ type: 'interpretation', ...data });
      }
      if (status === 504) {
        return rejectWithValue({ type: 'timeout', message: 'AI service timed out' });
      }
      if (status === 502) {
        return rejectWithValue({ type: 'server', message: 'AI service returned an invalid response.' });
      }
      return rejectWithValue({ type: 'server', message: data?.message || 'Search failed' });
    }
  }
);
```

**Fulfilled handler field mapping:**
```typescript
// API returns:    data.profiles       → state.results
// API returns:    data.filters_applied → merged into state.interpretation
// API returns:    data.confidence      → state.interpretation.confidence
// API returns:    data.interpretation  → state.interpretation._interpretation_text (string)
// API returns:    data.resolved_ids    → state.resolvedFilters
// API returns:    data.credits         → state.credits
```

---

## 7. Navigation Integration

### Navbar Changes

In `app/_components/Navbar.tsx`, the dashboard links array (line ~219):

```typescript
const dashboardLinks = [
  { href: "/dashboard", label: "Dashboard", locked: false },
  { href: "/search", label: "Search", locked: !hasFullAccess },
  { href: "/ai-search", label: "AI Search", locked: !hasFullAccess },  // ← NEW
  { href: "/favourites", label: "Favourites", locked: !hasFullAccess },
  { href: "/profiles", label: "Profiles", locked: !hasFullAccess },
  { href: "/recommendations", label: "Recommendations", locked: !hasFullAccess },
  { href: "/payments", label: "Donation", locked: false },
];
```

Also add to:
- `isDashboardRoute` check (line ~49): add `pathname.startsWith("/ai-search")`
- `darkPages` array (line ~173): add `"/ai-search"`
- `LOCKED_ROUTES` set (line ~217): add `"/ai-search"`

---

## 8. UX States & Transitions

### State Machine

```
                 ┌──────────────┐
                 │   INITIAL    │
                 │ (empty page) │
                 └──────┬───────┘
                        │ user types + submits
                        ▼
                 ┌──────────────┐
                 │   LOADING    │
                 │  (skeleton)  │
                 └──────┬───────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐
     │ RESULTS  │ │  ERROR   │ │  EMPTY   │
     │ (cards)  │ │ (toast)  │ │ (no hits)│
     └──────────┘ └──────────┘ └──────────┘
            │                       │
            │   user types again    │
            └───────────┬───────────┘
                        ▼
                 ┌──────────────┐
                 │   LOADING    │
                 └──────────────┘

  Special states:
  ┌────────────────────┐
  │ CREDITS_EXHAUSTED  │ → overlay blocks input, shows "Buy Credits" CTA
  └────────────────────┘
  ┌────────────────────┐
  │ LOW_CONFIDENCE     │ → shows interpretation card with warning + suggestions
  └────────────────────┘
```

### State Details

| State | Search Input | Suggested Queries | Interpretation Card | Results Grid | Credits Badge |
|---|---|---|---|---|---|
| **Initial** | Enabled, auto-focused | Visible | Hidden | Hidden | Badge (top) |
| **Loading** | Disabled, spinner | Hidden | Hidden | 8 skeleton cards | Badge (top) |
| **Results** | Enabled | Hidden | Visible | Profile cards | Badge + Bar (bottom) |
| **Empty** | Enabled | Show again | Visible (if interpreted) | "No matches" message | Badge |
| **Error (422)** | Enabled | Show again | Warning card with suggestions | Hidden | Badge |
| **Error (429)** | Disabled | Hidden | Hidden | Hidden | Overlay (full) — "Buy Credits" |
| **Error (5xx)** | Enabled | Preserved | Hidden | Preserved | Badge |

---

## 9. Implementation Plan

### Step-by-step execution order:

| # | Task | File(s) | Est. Lines |
|---|---|---|---|
| 1 | Create `aiSearchSlice.ts` | `app/store/features/aiSearchSlice.ts` | ~120 |
| 2 | Register slice in store | `app/store/store.ts` | ~3 |
| 3 | Create `AISearchInput` component | `app/(dashboard)/ai-search/_components/AISearchInput.tsx` | ~80 |
| 4 | Create `SuggestedQueries` component | `app/(dashboard)/ai-search/_components/SuggestedQueries.tsx` | ~50 |
| 5 | Create `InterpretationCard` component | `app/(dashboard)/ai-search/_components/InterpretationCard.tsx` | ~90 |
| 6 | Create `QuotaBadge` component | `app/(dashboard)/ai-search/_components/QuotaBadge.tsx` | ~120 |
| 7 | Create AI Search page | `app/(dashboard)/ai-search/page.tsx` | ~350 |
| 8 | Add nav link + route registration | `app/_components/Navbar.tsx` | ~10 |
| 9 | Test end-to-end | Manual + Playwright | — |

### Dependencies
- Backend API must be running (`POST /api/ai-search`)
- User must be logged in (JWT cookie)
- `selectedProfileID` must be set (from profile context)

---

## 10. File Inventory

### New Files (AI Search Page)

| File | Purpose |
|---|---|
| `app/store/features/aiSearchSlice.ts` | Redux slice + async thunk. `credits` replaces `quota` |
| `app/(dashboard)/ai-search/page.tsx` | Main AI Search page — uses credits for gating |
| `app/(dashboard)/ai-search/_components/AISearchInput.tsx` | Search input with AI sparkle |
| `app/(dashboard)/ai-search/_components/SuggestedQueries.tsx` | Clickable example chips |
| `app/(dashboard)/ai-search/_components/InterpretationCard.tsx` | Filter tags + confidence |
| `app/(dashboard)/ai-search/_components/QuotaBadge.tsx` | Credit display (badge/bar/overlay) — `credits` prop |

### New/Modified Files (Payments & Credit Purchase)

| File | Purpose |
|---|---|
| `app/(dashboard)/payments/_components/PricingCard.tsx` | Exports `MembershipCard` + `CreditPackCards` (separate components) |
| `app/(dashboard)/payments/page.tsx` | Two-section layout: Membership + AI Credit Packs, auto-scroll on `?source=ai-search` |
| `app/(dashboard)/payments/billings/page.tsx` | Handles both `type=membership` and `type=ai_credits&credits=N` |
| `app/(dashboard)/payments/_components/BillingForm.tsx` | Passes `purchaseType` + `credits` to Stripe API |
| `app/(dashboard)/payments/_components/SuccessModal.tsx` | Credit-specific success message when `duration="Credits"` |

### Modified Files

| File | Change |
|---|---|
| `app/_components/Navbar.tsx` | Add "AI Search" to dashboard links, dark pages, locked routes |
| `app/store/store.ts` | Register `aiSearch` reducer |

### Not Modified (Intentionally)

| File | Why |
|---|---|
| `app/(dashboard)/search/page.tsx` | No changes to existing search — zero regression risk |
| `app/(dashboard)/_components/ProfileCard.tsx` | Existing component has different card style; AI search uses inline cards matching the `/search` grid |
| `app/store/features/searchSlice.ts` | Completely separate state — no cross-contamination |

---

## Appendix A: Credit Purchase Flow (Frontend)

### Payments Page (`/payments`)

Two-section layout:

```
┌──────────────────────────────────────────────────────────────┐
│  Section 1: Account Membership                                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  MATA Membership · $100/yr                            │     │
│  │  ✓ Address Verification  ✓ Unlimited Search           │     │
│  │  ✓ Profile Views  ✓ 10 Free AI Search Credits         │     │
│  │  [Get Started]                                        │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
│  ─────────────── separator ───────────────                    │
│                                                               │
│  Section 2: AI Search Credits                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ Starter  │  │  Value   │  │  Power   │                    │
│  │ 50/$10   │  │ 250/$25  │  │ 1000/$30 │                    │
│  │ $0.20/ea │  │ $0.10/ea │  │ $0.03/ea │                    │
│  │ [Buy]    │  │ [Buy] ★  │  │ [Buy]    │                    │
│  └──────────┘  └──────────┘  └──────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

When URL includes `?source=ai-search`, auto-scrolls to Section 2.

### Billings Page (`/payments/billings`)

Query params determine which plan to show:
- `?type=membership` → Membership checkout card
- `?type=ai_credits&credits=250` → Credit pack checkout card (looks up pack by credit count)

`BillingForm` sends to `POST /stripe/create-session`:
```json
{
  "amount": 25,
  "plan": "Value Pack",
  "purchase_type": "ai_credits",
  "credits": 250,
  "currency": "usd",
  "front_end_success_uri": "...?type=ai_credits&credits=250&status=success&session_id={CHECKOUT_SESSION_ID}",
  "front_end_failed_uri": "...?type=ai_credits&credits=250&status=failed"
}
```

### Success Modal

| `duration` value | Message |
|---|---|
| `"Credits"` | "{name} credits have been added to your account!" / "One-time purchase — credits never expire" |
| `"Annual"` | "Your {name} plan has been activated. Welcome to MATA Matrimony!" / "1 year (365 days from purchase)" |

### Data Exports (from `PricingCard.tsx`)

```typescript
import { MembershipCard, CreditPackCards } from './_components/PricingCard';
import { membershipPlan, creditPacks, allPlans } from './_components/PricingCard';
// Types: MembershipPlan, CreditPack
```

---

## Appendix B: Existing Patterns to Follow

### Auth pattern (from `axios.ts`)
```typescript
import { api } from '@/app/lib/axios';
// Cookie + API key auto-attached. Just call:
const res = await api.post('/ai-search', { query, profile_id });
```

### Profile context (from `search/page.tsx`)
```typescript
import { useProfileContext } from '@/app/utils/useProfileContext';
const { selectedProfileID } = useProfileContext();
```

### Payment guard (from `search/page.tsx`)
```typescript
import PaymentGuard from '@/app/(dashboard)/_components/PaymentGuard';
return <PaymentGuard>{/* page content */}</PaymentGuard>;
```

### Photo loading (from `search/page.tsx`)
```typescript
// POST /profiles/photos/get → returns SAS-signed URLs
const res = await api.post('/profiles/photos/get', { profile_id: pid });
```

### Metadata lookups (from `search/page.tsx`)
```typescript
import { useMetaDataLoader } from '@/app/utils/useMetaDataLoader';
const { findReligionName, findGenderName } = useMetaDataLoader();
```
