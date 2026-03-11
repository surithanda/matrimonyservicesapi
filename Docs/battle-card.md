# MATA Matrimony — Competitive Battle Card

> **Purpose:** Sales & product reference for understanding how MATA Matrimony compares to leading matrimony platforms.  
> **Competitors:** Shaadi.com · BharatMatrimony · Jeevansathi  
> **Version:** V1.0 — March 2026  
> **Audience:** Developers, Sales, Product Team

---

## Quick Snapshot

| | **MATA Matrimony** | **Shaadi.com** | **BharatMatrimony** | **Jeevansathi** |
|---|---|---|---|---|
| **Founded** | 2026 | 1997 | 2000 | 1996 |
| **Model** | Partner-managed (B2B2C) | Direct-to-consumer | Direct-to-consumer | Direct-to-consumer |
| **Target Market** | Diaspora + Premium niche | Global Indian community | India-first | North India focus |
| **Pricing** | Partner-defined | $99–$1,095/yr | ₹999–₹4,999 (~$12–$60)/mo | ₹722–₹4,865 plan-based |
| **Platform** | Web (Next.js) | Web + App | Web + App | Web + App |
| **API-first** | ✅ Yes — headless | ❌ Monolithic | ❌ Monolithic | ❌ Monolithic |
| **Photo Security** | ✅ Watermarked + SAS URLs | ❌ No watermark | ❌ No watermark | ❌ No watermark |
| **Data Breach History** | ✅ None (new) | ⚠️ Reported incidents | ❌ 2020 SQL injection breach | ⚠️ Reported incidents |

---

## Feature Comparison Matrix

### Core Matchmaking Features

| Feature | **MATA** | **Shaadi.com** | **BharatMatrimony** | **Jeevansathi** |
|---|---|---|---|---|
| Profile creation | ✅ | ✅ | ✅ | ✅ |
| Advanced search filters | ✅ | ✅ | ✅ | ✅ |
| Partner preferences | ✅ | ✅ | ✅ | ✅ |
| Favourites / Shortlist | ✅ | ✅ | ✅ | ✅ |
| Profile view tracking | ✅ | ✅ | ✅ | ✅ |
| Recommendations | ✅ | ✅ | ✅ | ✅ |
| Hobbies & interests | ✅ | ⚠️ Limited | ⚠️ Limited | ❌ |
| Profile completion score | ✅ | ❌ | ❌ | ❌ |
| Multi-profile per account | ✅ | ❌ | ❌ | ❌ |
| Multiple sections (education, employment, property, family) | ✅ All | ✅ Most | ✅ Most | ⚠️ Basic |

### Photo Management

| Feature | **MATA** | **Shaadi.com** | **BharatMatrimony** | **Jeevansathi** |
|---|---|---|---|---|
| Max photos | **7 (categorised)** | 20+ | 20+ | 20+ |
| Photo categories / slots | ✅ Named slots (Headshot, Full-body, Casual, Family, Candid, Hobby, Other) | ❌ Generic gallery | ❌ Generic gallery | ❌ Generic gallery |
| **Watermark on photos** | ✅ Auto-applied | ❌ | ❌ | ❌ |
| Time-limited SAS URLs | ✅ (Azure — 1hr expiry) | ❌ Permanent CDN URL | ❌ Permanent CDN URL | ❌ Permanent CDN URL |
| Thumbnail generation | ✅ Auto | ⚠️ Manual resize | ⚠️ Manual resize | ⚠️ Manual resize |
| Format normalisation (PNG→JPEG) | ✅ | ❌ | ❌ | ❌ |
| Cloud storage | ✅ Azure Blob Storage | AWS S3/CDN | AWS/CDN | AWS/CDN |
| Photo replacement (same category) | ✅ | ❌ (re-upload) | ❌ (re-upload) | ❌ (re-upload) |

### Security & Authentication

| Feature | **MATA** | **Shaadi.com** | **BharatMatrimony** | **Jeevansathi** |
|---|---|---|---|---|
| OTP login (2FA) | ✅ Required | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional |
| JWT-based sessions | ✅ | ✅ | ✅ | ✅ |
| API Key per client | ✅ (every request) | ❌ | ❌ | ❌ |
| Rate limiting on auth | ✅ | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic |
| HttpOnly cookies for session | ✅ | ❌ | ❌ | ❌ |
| Password strength policy enforced | ✅ (8+ chars, upper, lower, number, special) | ❌ Weak | ❌ Weak | ❌ Weak |
| Photo URL expiry (prevents hotlinking) | ✅ (1-hour SAS) | ❌ | ❌ | ❌ |
| Known data breach | ✅ None | ⚠️ Incidents reported | ❌ 2020 breach (SQL injection, 1M+ records) | ⚠️ Incidents reported |

### Architecture & Technical

| Feature | **MATA** | **Shaadi.com** | **BharatMatrimony** | **Jeevansathi** |
|---|---|---|---|---|
| API-first / headless | ✅ | ❌ | ❌ | ❌ |
| Partner admin portal (B2B) | ✅ (ekam-admin-api) | ❌ | ❌ | ❌ |
| Stored procedure data layer | ✅ (audit log on every operation) | ❌ | ❌ | ❌ |
| Activity logging on all DB ops | ✅ | ❌ | ❌ | ❌ |
| Serverless deployment | ✅ (Vercel) | ❌ Traditional servers | ❌ Traditional servers | ❌ Traditional servers |
| Swagger / OpenAPI documented | ✅ | ❌ | ❌ | ❌ |

### Payments

| Feature | **MATA** | **Shaadi.com** | **BharatMatrimony** | **Jeevansathi** |
|---|---|---|---|---|
| Online payments | ✅ Stripe Checkout | ✅ Razorpay/CC | ✅ Razorpay/CC | ✅ Various |
| Subscription model | ✅ | ✅ Tiered (Silver-Platinum+) | ✅ Tiered (Gold-Platinum) | ✅ Tiered (Pro-Pro Supreme) |
| Webhook-authoritative payment | ✅ | ⚠️ | ⚠️ | ⚠️ |

### Communication

| Feature | **MATA** | **Shaadi.com** | **BharatMatrimony** | **Jeevansathi** |
|---|---|---|---|---|
| In-app messaging | 🔲 Roadmap | ✅ (paid) | ✅ (paid) | ✅ (paid) |
| Video calls | 🔲 Roadmap | ✅ (Shaadi Live) | ✅ (paid) | ✅ (paid) |
| Voice messaging | 🔲 Roadmap | ❌ | ✅ (paid) | ✅ (Pro plans) |
| Mobile app | 🔲 Roadmap | ✅ iOS + Android | ✅ iOS + Android | ✅ iOS + Android |

---

## MATA's Key Differentiators (Win Themes)

### 🔐 1. Security-First Architecture

> *"Your photos are protected. Your data is safe."*

- **Watermarked photos** — every photo has "MataMatrimony" stamped before storage. Photos cannot be saved and reused on other platforms without attribution.
- **Time-limited photo URLs** — Azure SAS tokens expire after 1 hour. Photo links shared outside the platform become invalid, preventing hotlinking and scraping.
- **OTP mandatory** — every login requires a 6-digit OTP to the registered email. No session without 2FA.
- **API Key per client** — no API endpoint can be called without a valid client key. Prevents unauthorized access even if JWT tokens leak.
- **No known breach history** — BharatMatrimony suffered a major SQL injection breach in 2020 exposing 1M+ records. MATA's stored-procedure data layer provides a structured, parameterised barrier against SQL injection.

---

### 👨‍👩‍👧 2. Multi-Profile Per Account

> *"Register yourself, your sibling, or your child — one account, multiple profiles."*

Shaadi, BharatMatrimony, and Jeevansathi support only **one profile per account**. MATA allows a single account to manage **multiple profiles** — ideal for family members helping their relatives find a match, or matrimony agencies managing client profiles.

---

### 📸 3. Structured Photo Gallery (Categorised Slots)

> *"Tell your story, not just show your face."*

Competitors offer a generic photo gallery. MATA's 7 **named photo slots** guide users to present themselves holistically:

```
1. Clear Headshot      — Primary profile photo
2. Full-body shot      — Full length photo
3. Casual/Lifestyle    — You in your element
4. Family Photo        — With your family
5. Candid/Fun Moment   — A natural, happy moment
6. Hobby/Activity      — Doing what you love
7. Other               — Any other photo
```

This structured approach gives match-seekers a **richer, more authentic view** of the person — not just a posed profile picture.

---

### 🏢 4. Partner (Agency) Management — B2B2C Model

> *"Power matrimony agencies with your own branded platform."*

Unlike Shaadi/BharatMatrimony which are direct-to-consumer, MATA operates as a **B2B2C platform**:
- **Partner Admin API** (`ekam-admin-api`) allows registered matrimony agencies to manage profiles, photos, and members on behalf of clients
- Agencies get their own admin portal with full profile CRUD capabilities
- Partner-specific data isolation (`partner_id` scoping on all blobs and data)

This B2B2C model creates **stickier enterprise relationships** and expands reach through established agency networks.

---

### 📊 5. Profile Completion Tracking

> *"Know exactly what's missing — and fill it."*

MATA exposes a profile completion percentage (`/profile/profile-completion/:profile_id`) broken down by section. Users see exactly which tabs are incomplete. Competitors do not expose a structured completion score — users are left guessing why they are not getting matches.

---

### 🔧 6. API-First, Headless Architecture

> *"Built for the future. Easy to integrate and extend."*

- All features exposed as documented REST APIs (Swagger)
- UI is fully decoupled from the API → easy to build mobile apps later
- Stored procedure data layer enforces business rules at the DB level (photo limits, validation, audit logging)
- Fully serverless on Vercel → scales automatically, zero infrastructure management

---

## Common Competitor Weaknesses to Call Out

| Weakness | Shaadi.com | BharatMatrimony | Jeevansathi |
|---|---|---|---|
| **Data breach history** | ⚠️ Reported | ❌ 2020 SQL injection breach | ⚠️ Reported |
| **Permanent photo URLs** (can be scraped/hotlinked) | ❌ Yes | ❌ Yes | ❌ Yes |
| **Photos can be downloaded and misused** | ❌ No watermark | ❌ No watermark | ❌ No watermark |
| **Single profile per account** | ❌ Yes | ❌ Yes | ❌ Yes |
| **Opaque privacy policies** | ❌ Generic | ❌ Generic | ❌ Generic |
| **No B2B partner portal** | ❌ | ❌ | ❌ |
| **Generic photo gallery (no categories)** | ❌ | ❌ | ❌ |
| **Aggressive upsell / freemium gate** | ❌ Many features paywalled | ❌ Very limited free tier | ❌ Limited free tier |

---

## Objection Handling

| Objection | Response |
|---|---|
| *"Shaadi.com has millions of users."* | **MATA is B2B2C.** We grow through partner agencies who bring their existing client bases — not by competing head-to-head in consumer advertising. |
| *"BharatMatrimony has a mobile app."* | **True — mobile app is on the roadmap.** Because we are API-first, the app is a UI layer away. We can ship it without any backend changes. |
| *"Established platforms have horoscope matching."* | **Planned for V1.1.** Our lookup table and stored procedure architecture make adding new profile sections very low-effort. |
| *"Users won't trust a new platform."* | **Our security posture is stronger from Day 1.** BharatMatrimony suffered a 1M+ record breach. We launched with mandatory 2FA, photo watermarking, time-limited URLs, and parameterised stored procedures. |
| *"Competitors have video calls."* | **In-app messaging and video are on our roadmap.** We chose to get the core profile and photo experience right first — the foundation competitors skipped and later patched. |

---

## Roadmap (V1.1 and Beyond)

| Feature | Priority | Status |
|---|---|---|
| Mobile App (React Native) | High | 🔲 Roadmap |
| In-app Messaging | High | 🔲 Roadmap |
| Video Calls | Medium | 🔲 Roadmap |
| Horoscope / Astro Match | Medium | 🔲 Roadmap |
| AI-based Match Recommendations | Medium | 🔲 Roadmap |
| Profile Verification / KYC | High | 🔲 Roadmap |
| Push Notifications | Medium | 🔲 Roadmap |
| Assisted Matchmaking (Relationship Manager) | Low | 🔲 Roadmap |

---

## Summary: Why MATA Wins

| Scenario | MATA Advantage |
|---|---|
| **Agency wants to offer matrimony services** | Only MATA has a Partner Admin system |
| **User worried about photo misuse** | Only MATA watermarks photos + uses expiring URLs |
| **User has multiple family members to register** | Only MATA supports multi-profile per account |
| **Enterprise buyer evaluating security** | Only MATA has mandatory 2FA, API keys, SP-based data layer |
| **Technical evaluator reviewing architecture** | Only MATA is API-first, Swagger-documented, serverless |
| **User wants structured, authentic photo presentation** | Only MATA has 7 structured, named photo categories |

---

*Document maintained in `Docs/battle-card.md`. Update roadmap section when features ship.*
