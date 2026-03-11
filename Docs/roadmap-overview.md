# MATA Matrimony — Roadmap Overview

> **Document Type:** Product Roadmap Index  
> **Version:** V1.1+ Planning — March 2026  
> **Status:** Pre-Planning — For Review

---

## Roadmap Summary Table

| Feature | Priority | Effort | Cost Model | Target Release |
|---|---|---|---|---|
| [In-App Messaging](#1-in-app-messaging) | 🔴 High | Medium | Free (Firebase) | V1.1 |
| [Mobile App (iOS & Android)](#2-mobile-app) | 🔴 High | High | Free (Expo) | V1.2 |
| [WhatsApp Integration](#3-whatsapp-integration) | 🟡 Medium | Low–Medium | Pay-per-message | V1.1 |
| [Voice Messaging](#4-voice-messaging) | 🟡 Medium | Medium | Free up to 10k min/mo (Agora) | V1.2 |
| [Background Verification](#5-background-verification) | 🔴 High | Medium | Pay-per-check (₹799–₹1,599/person) | V1.2 |

---

## Detailed Documents

Each feature has its own dedicated document in this folder:

| Document | Feature |
|---|---|
| [roadmap-in-app-messaging.md](./roadmap-in-app-messaging.md) | Real-time chat between matched profiles |
| [roadmap-mobile-app.md](./roadmap-mobile-app.md) | React Native / Expo iOS & Android app |
| [roadmap-whatsapp-integration.md](./roadmap-whatsapp-integration.md) | WhatsApp group join button + notifications |
| [roadmap-voice-messaging.md](./roadmap-voice-messaging.md) | In-app voice notes and voice calls |
| [roadmap-background-verification.md](./roadmap-background-verification.md) | Address, employment, education, criminal, credit, family checks |

---

## Architecture Principle for All Roadmap Features

Since MATA is **API-first**, every roadmap feature follows this pattern:

```
UI (Next.js / React Native)
        │
        ▼
MATA API (Express — new route group per feature)
        │
        ├── Third-party API (Firebase, Agora, WhatsApp Cloud API, etc.)
        ├── MySQL (store results, preferences, states)
        └── Azure Blob (store voice messages as files)
```

All new features will be:
- Protected by existing `validateApiKey` + `authenticateJWT` middleware
- Documented in Swagger
- Implemented via stored procedures for DB operations
- Deployed serverless on Vercel (API) and Vercel (UI)
