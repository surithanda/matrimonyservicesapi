# Roadmap: Mobile App (iOS & Android)

> **Priority:** 🔴 High  
> **Target Release:** V1.2  
> **Effort Estimate:** 8–12 weeks (1–2 developers)  
> **Preferred Cost:** Free (Expo / React Native — open source)

---

## 1. Why This Feature

95%+ of matrimony platform usage in India happens on mobile. Shaadi.com, BharatMatrimony, and Jeevansathi all have native apps. Without a mobile app, MATA cannot compete for the primary usage context.

**Key advantages of launching a mobile app:**
- Push notifications dramatically increase engagement and re-activation
- Camera access enables direct photo uploads from phone
- WhatsApp/SMS deep links work natively
- App store presence builds brand credibility
- Background verification ID scan (Aadhaar, PAN) can use camera directly

---

## 2. Technology Recommendation: **React Native + Expo**

### Why React Native?
- **Single codebase** for iOS and Android — ~40% cost saving vs. building two native apps
- **Same language (TypeScript)** as the existing Next.js UI — developer skills are transferable
- **Expo** handles the build toolchain, OTA updates, and push notifications without native Xcode/Android Studio complexity
- **API compatibility** — the existing MATA API works identically for mobile; no backend changes for core features

### React Native vs. Flutter Comparison

| Aspect | **React Native + Expo** ✅ | Flutter |
|---|---|---|
| Language | TypeScript (same as current codebase) | Dart (new language to learn) |
| Code reuse from web UI | High — shared logic, hooks, API client | Low — separate UI layer |
| Community | Massive (Meta-backed) | Growing (Google-backed) |
| UI libraries | Many (React Native Paper, NativeBase) | Many (Material, Cupertino) |
| OTA updates | ✅ Expo EAS Update | ❌ App store release required |
| Performance | Good (JS bridge, improving with New Architecture) | Excellent (compiled to native) |
| Build cost (Expo EAS) | Free tier available | Requires native tooling |
| **Verdict** | ✅ **Recommended — skills overlap, faster to ship** | ❌ New skill set required |

---

## 3. Expo EAS (Build & Deploy) — Cost

| Service | Free Tier | Paid |
|---|---|---|
| **EAS Build** (compile app for iOS/Android) | 30 builds/month | $99/month (Production plan) |
| **EAS Update** (OTA JS updates without App Store) | 1,000 updates/month | $99/month |
| **EAS Submit** (submit to App Store / Play Store) | Included | Included |
| **Apple Developer Account** (required for iOS) | ❌ $99/year mandatory | — |
| **Google Play Developer Account** | ❌ $25 one-time | — |
| **Recommendation** | Start on free tier — sufficient for development and beta | Upgrade when live users exceed limits |

---

## 4. Feature Scope

### Phase 1 — Feature Parity with Web (V1.2)
All features available on the web app:
- Login / Register / OTP verification
- Profile creation and editing (all tabs)
- Photo upload (camera + gallery)
- Search & browse profiles
- Favourites
- Recommendations
- Payments (Stripe in-app via WebView or Stripe Mobile SDK)
- Account management

### Phase 2 — Mobile-First Features (V1.3)
- **Push notifications** (FCM via Expo Notifications)
  - New match interest received
  - New message received
  - Profile view alert
  - Subscription expiry reminder
- **Camera-direct photo upload** — open camera, crop, upload directly
- **Biometric login** (Face ID / fingerprint via Expo LocalAuthentication)
- **Deep links** — share a profile link, opens in app

### Phase 3 — Advanced (V1.4+)
- Background verification ID scan (Aadhaar/PAN photo via camera)
- Video calls (in-app, see voice messaging roadmap)
- WhatsApp deep link integration

---

## 5. Architecture

### Code Structure (Monorepo Recommended)

```
gravitymata/
├── matrimonyservicesapi/    ← existing API (NO changes needed)
├── matamatrimony/           ← existing Next.js web UI
└── mata-mobile/             ← NEW: React Native Expo app
    ├── app/                 ← Expo Router (file-based routing)
    │   ├── (auth)/
    │   │   ├── login.tsx
    │   │   ├── register.tsx
    │   │   └── otp.tsx
    │   ├── (tabs)/
    │   │   ├── dashboard.tsx
    │   │   ├── search.tsx
    │   │   ├── favourites.tsx
    │   │   ├── messages.tsx
    │   │   └── profile.tsx
    │   └── profile/[id].tsx
    ├── components/          ← Shared UI components
    ├── hooks/               ← Shared hooks (reuse from web where possible)
    ├── lib/
    │   └── api.ts           ← Same Axios API client as web (copy + adapt)
    ├── store/               ← Redux store (copy from web)
    └── app.json             ← Expo config
```

### Shared Logic Between Web & Mobile

| Item | Share? | Approach |
|---|---|---|
| Axios API client (`lib/api.ts`) | ✅ Yes | Copy + update base URL config |
| Redux store (`store/`) | ✅ Yes | Direct copy — Redux is platform-agnostic |
| TypeScript types/interfaces | ✅ Yes | Copy from `types/` folder |
| Business logic hooks | ✅ Mostly | Adapt where browser APIs are used |
| UI components | ❌ No | React Native uses `<View>` not `<div>` |
| CSS / Tailwind styles | ❌ No | React Native uses StyleSheet |

---

## 6. Push Notifications Setup

**Technology:** Expo Notifications + Firebase Cloud Messaging (FCM) + Apple APNs

```
User action on device A triggers notification for user B
        │
        ▼
MATA API: new event (new message, new interest, etc.)
        │
        ▼
POST https://fcm.googleapis.com/fcm/send
  { to: user_B_fcm_token, notification: { title, body } }
        │
        ▼
Firebase delivers to:
  - Android: via FCM directly
  - iOS: via FCM → APNs → iPhone
        │
        ▼
Expo Notifications library receives and displays banner
```

**Cost:** FCM is completely **free** — no limits on push notifications.

---

## 7. Payments in Mobile App

Two options:

### Option A: WebView for Stripe Checkout (Easier)
- Open Stripe Checkout URL in an in-app WebView
- After payment, Stripe redirects to deep link → app handles
- **Pros:** No Stripe Mobile SDK, works immediately
- **Cons:** Less polished UX

### Option B: Stripe Mobile SDK (@stripe/stripe-react-native)
- Native Stripe payment sheet in the app
- Supports Apple Pay and Google Pay
- **Pros:** Premium UX, native payment methods
- **Cons:** Additional setup: configure in Stripe dashboard, handle webhooks for mobile
- **Cost:** Free SDK; Stripe processing fees apply (same as web)

**Recommendation:** Start with Option A (WebView) in V1.2, upgrade to Option B in V1.3.

---

## 8. App Store Submission Requirements

### Apple App Store (iOS)
- **Account required:** Apple Developer Program — **$99/year**
- Required: Privacy Nutrition Labels (data collection disclosure)
- Required: App Privacy Policy URL
- Review time: 1–3 days average
- Photo/matrimony apps can be sensitive — need to demonstrate real identity verification in listing

### Google Play Store (Android)
- **Account required:** Google Play Developer — **$25 one-time**
- Required: Privacy Policy URL
- Target SDK must be API 33+ (Android 13)
- Review time: 2–7 days for new apps

---

## 9. Cost Summary

| Item | Cost |
|---|---|
| React Native + Expo (framework) | **Free** |
| Expo EAS Build (free tier: 30 builds/month) | **Free** for dev/beta |
| Expo EAS Update (OTA) | **Free** up to 1,000 updates/month |
| Apple Developer Account | **$99/year** (mandatory for iOS) |
| Google Play Developer Account | **$25 one-time** |
| FCM Push Notifications | **Free** |
| **Total to launch** | **~$124 first year** (Apple + Google accounts) |
| **Ongoing per year** | **~$99/year** (Apple renewal) |

---

## 10. Implementation Milestones

| Week | Task |
|---|---|
| 1–2 | Project setup: `mata-mobile/`, Expo Router, shared API client + Redux store |
| 3–4 | Auth screens: login, register, OTP, forgot password |
| 5–6 | Dashboard, search, profile view, favourites |
| 7–8 | Profile edit tabs (personal, education, employment, photos) |
| 9 | Photo upload with camera + gallery picker |
| 10 | Payments (WebView Stripe) + account management |
| 11 | Push notifications (FCM + Expo Notifications) |
| 12 | Testing (iOS simulator + Android emulator), EAS build, App Store submission |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Apple rejection of matrimony app | Ensure moderation policy is documented; add privacy policy to listing |
| React Native performance lags for photo-heavy gallery | Use `FlashList` (Shopify) instead of `FlatList` for virtualized rendering |
| API session management differs on mobile | Use secure token storage (`expo-secure-store`) instead of cookies |
| OTA update pushes a broken release | Test on staging channel before promoting to production channel |
| iOS in-app purchase rules (30% commission) | Stripe subscription via web — direct users to rechargeatrimony.com for payment; Apple cannot take commission on external web purchases |
