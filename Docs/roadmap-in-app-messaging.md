# Roadmap: In-App Messaging

> **Priority:** 🔴 High  
> **Target Release:** V1.1  
> **Effort Estimate:** 3–5 weeks (1 developer)  
> **Preferred Cost:** Free tier (Firebase Firestore)

---

## 1. Why This Feature

Currently, matched users have no way to communicate inside MATA. They are forced to go off-platform (WhatsApp, phone), which:
- Breaks trust and safety controls
- Eliminates audit trail
- Reduces platform stickiness and subscription value
- Enables fake-profile fraud to continue unchecked

In-app messaging creates a **controlled, safe communication channel** — a core requirement for any premium matrimony platform.

---

## 2. Feature Scope

### Phase 1 — Basic Text Chat (V1.1)
- One-to-one messaging between two profiles that have both expressed interest
- Real-time message delivery (no polling)
- Message history stored and paginated
- Unread message count badge on nav
- Read receipts (✓✓)
- Typing indicator

### Phase 2 — Rich Chat (V1.2)
- Send photos (profile gallery or camera roll)
- Send voice notes (see voice messaging roadmap)
- Block / report user from chat
- Message templates for ice-breakers ("Would you like to connect?")

### Phase 3 — Admin Visibility (V1.3)
- Partner admin can view flagged/reported conversations
- Moderation queue for inappropriate content
- Auto-flag keywords (NSFW, financial requests, etc.)

---

## 3. Business Rules

| Rule | Detail |
|---|---|
| **Who can message?** | Only profiles where **both sides** have sent/accepted interest |
| **Premium gate** | Free users can receive messages but cannot reply without a subscription |
| **Spam protection** | Rate limit: max 10 new conversation initiations per day per profile |
| **Blocking** | Either party can block; blocked users cannot send messages |
| **Data retention** | Messages retained for 90 days (configurable) |
| **Encryption** | Messages encrypted at rest in Firebase; transport over HTTPS/WSS |

---

## 4. Recommended API / Technology

### Primary Recommendation: **Firebase Firestore + Firebase Cloud Messaging (FCM)**

**Why Firebase:**
- Native real-time sync — no polling, no WebSocket management
- Free tier ("Spark Plan") is very generous:
  - 50,000 document reads/day
  - 20,000 document writes/day
  - 1 GiB storage
  - 10 GiB/month network
- Works perfectly with Next.js and React Native (same SDK)
- FCM push notifications are completely free
- Battle-tested at massive scale (Google-backed)
- Offline support built-in (messages cached locally)

**Free Tier Sufficiency:**
- At 50,000 reads/day, the free tier supports ~500–1,000 daily active chatters
- Upgrade to Blaze (pay-as-you-go) needed when scaling — estimated $12–$15/month for 5,000 DAU

### Alternative: **self-hosted Socket.io**

| Aspect | Firebase | Socket.io (self-hosted) |
|---|---|---|
| Setup effort | Low — SDK only | High — server + Redis + scaling |
| Cost | Free until scale | Server cost ~$5–$20/month (VPS) |
| Reliability | Google SLA | Self-managed |
| Offline sync | ✅ Built-in | ❌ Manual |
| Push notifications | ✅ FCM included | ❌ Separate (FCM or APNs) |
| Verdict | ✅ **Recommended** | ❌ Overkill for V1.1 |

### Alternative: **Ably**

| Aspect | Details |
|---|---|
| Free tier | 200 concurrent connections, 6M messages/month |
| Paid | From $2.50/million messages |
| Best for | When you need guaranteed message ordering + enterprise SLA |
| Verdict | ✅ Good option if Firebase data model is a concern |

---

## 5. Architecture Design

### Data Model (Firestore)

```
/conversations/{conversationId}
  - profile_ids: [profileA_id, profileB_id]
  - created_at: timestamp
  - last_message: string
  - last_message_at: timestamp
  - unread_count: { profileA_id: 0, profileB_id: 2 }

/conversations/{conversationId}/messages/{messageId}
  - sender_profile_id: int
  - content: string
  - type: 'text' | 'image' | 'voice'
  - sent_at: timestamp
  - read_at: timestamp | null
```

### API Endpoints (new route group: `/messages`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/messages/conversation/start` | Start or retrieve existing conversation between two profiles |
| GET | `/messages/conversation/:conversationId` | Get paginated message history |
| POST | `/messages/send` | Send a message (writes to Firestore; API validates permission) |
| POST | `/messages/read` | Mark messages as read |
| GET | `/messages/conversations` | List all conversations for a profile (with unread counts) |
| POST | `/messages/block` | Block a user from messaging |

### Flow Diagram

```
Profile A clicks "Send Message" on Profile B
        │
        ▼
POST /messages/conversation/start
  → API validates: both profiles have mutual interest
  → Creates Firestore conversation doc (if not exists)
  → Returns conversationId
        │
        ▼
Chat UI opens (React component subscribes to Firestore real-time listener)
        │
Profile A types and sends message
        │
        ▼
Firestore write: /conversations/{id}/messages/new_message
        │
        ▼ (real-time)
Profile B's listener fires → message appears instantly
        │
        ▼
FCM push notification sent to Profile B (if app is in background)
```

---

## 6. Required Code Changes

### API (`matrimonyservicesapi`)
- New file: `src/controllers/messages.controller.ts`
- New file: `src/routes/messages.routes.ts`
- New file: `src/config/firebase.ts` — Firebase Admin SDK initialisation
- New SP: `eb_conversation_validate(profile_a_id, profile_b_id)` — checks mutual interest
- New SP: `eb_conversation_block(blocker_id, blocked_id)`
- Environment variable: `FIREBASE_SERVICE_ACCOUNT_JSON`

### UI (`matamatrimony`)
- New page: `app/(dashboard)/messages/page.tsx` — conversation list
- New page: `app/(dashboard)/messages/[conversationId]/page.tsx` — chat view
- New component: `_components/ChatBubble.tsx`
- New component: `_components/ConversationList.tsx`
- Install: `firebase` npm package

### Database (MySQL)
- New table: `conversation_block` (blocker_profile_id, blocked_profile_id, created_at)
- New SP: `eb_conversation_validate`
- New SP: `eb_conversation_block`

---

## 7. Cost Summary

| Service | Free Tier | Cost When Scaling |
|---|---|---|
| **Firebase Firestore** | 50K reads + 20K writes/day | ~$12–15/month at 5,000 DAU |
| **Firebase Cloud Messaging (FCM)** | Completely free | Free (no limit) |
| **Firebase Storage** (for images in chat) | 5 GB storage, 1 GB/day download | $0.026/GB storage |
| **Total at V1.1 launch** | **$0/month** | Scales with users |

---

## 8. Implementation Milestones

| Week | Task |
|---|---|
| 1 | Firebase project setup, Admin SDK in API, Firestore rules |
| 2 | API endpoints: start conversation, validate mutual interest |
| 3 | UI: conversation list + chat view with real-time Firestore listener |
| 4 | FCM push notifications, read receipts, typing indicator |
| 5 | Block/report flow, rate limiting, testing |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Fake profiles send spam via chat | Mutual interest gate + daily limit |
| Sensitive personal info shared in chat (phone numbers, payment) | Phase 3: keyword auto-flag + moderation |
| Firebase costs spike unexpectedly | Set Firebase budget alert at $20/month |
| Message delivery failure on poor connection | Firebase offline cache handles this automatically |
