# Roadmap: WhatsApp Integration

> **Priority:** 🟡 Medium  
> **Target Release:** V1.1  
> **Effort Estimate:** 2–3 weeks (1 developer)  
> **Cost:** Per-message (first 1,000 conversations/month free via Meta)

---

## 1. Why This Feature

WhatsApp has **500M+ users in India** — it is the primary communication tool for the target demographic. Providing WhatsApp integration gives MATA three powerful capabilities:

1. **Member-to-WhatsApp Group**: Verified members can join a curated WhatsApp group specific to their preferences (e.g., "MATA Matrimony — Tamil Nadu" group) by clicking a button on their dashboard.
2. **Visitor Landing Page Group**: Non-members visiting the MATA website can join a "general enquiry" group to learn more before registering.
3. **WhatsApp Notifications**: Profile alerts, match interest notifications, and subscription reminders sent via WhatsApp instead of (or in addition to) email.

---

## 2. Use Cases

### Use Case A — Member Group Join

> "I am a registered MATA member. I want to connect with other genuine members in a group."

- Member logs in → goes to Dashboard
- Clicks **"Join WhatsApp Community"** button
- API generates a WhatsApp group invite link
- Member is redirected: `https://chat.whatsapp.com/{invite_code}`
- WhatsApp opens on their device automatically and shows the group invite

**Groups to create:**
- Regional groups (e.g., "MATA – Tamil Nadu", "MATA – Karnataka")
- Interest-based groups (e.g., "MATA – Software Professionals")
- General member community group

### Use Case B — Visitor / Non-Member Group

> "I am exploring MATA and want to ask questions before registering."

- Visitor lands on MATA marketing/landing page
- Clicks **"Join our WhatsApp Community"** button
- No login required
- Redirected to a public "Visitor Enquiry" WhatsApp group invite link
- This link is a static invite link — no API required for this case

### Use Case C — WhatsApp Notifications (Transactional)

> "Someone showed interest in my profile. I want a WhatsApp message, not just an email."

- Profile A sends interest to Profile B
- API sends WhatsApp template message to Profile B:
  `"Someone has shown interest in your MATA Matrimony profile! Log in to view: {link}"`
- Profile B taps link → opens MATA profile page

---

## 3. WhatsApp Business Cloud API — How It Works

Meta (WhatsApp) provides the **WhatsApp Business Cloud API** (free infrastructure, pay-per-message):

```
Your API → META Cloud API → WhatsApp → User's phone
```

No third-party middleman required. Meta hosts the infrastructure.

### Setup Requirements
1. Facebook Business Account (free)
2. WhatsApp Business Account (free)
3. Phone number verified with Meta (NOT already on personal WhatsApp)
4. Meta App with `WhatsApp Business` product added
5. Permanent access token (from Meta Developer Console)

### Groups API
Meta provides a **WhatsApp Groups API** that allows programmatic creation and management of WhatsApp groups and invite links.

---

## 4. Message Categories & Pricing (from July 1, 2025)

| Message Type | When Used | Cost |
|---|---|---|
| **Service Messages** | Reply within 24h of customer-initiated message | **Free** |
| **Utility Messages** | Transactional alerts (e.g., "New interest received") | ~$0.004–$0.008 per message (India) |
| **Authentication Messages** | OTP / login codes | ~$0.003–$0.006 per message (India) |
| **Marketing Messages** | Promotional (e.g., "Upgrade your plan") | ~$0.007–$0.012 per message (India) |
| **Free Entry Point** | Customer clicks "Click-to-WhatsApp" button | **Free for 72 hours** |

### Free Tier
- **First 1,000 service conversations/month are free** (customer-initiated window)
- All replies within 24 hours of user-initiated conversation = **free**
- Static group invite links (Use Case B) = **completely free** — no API needed

### Estimated Monthly Cost at Scale

| Volume | Est. Monthly Cost |
|---|---|
| 500 notification messages/month | ~$2–4 |
| 5,000 notification messages/month | ~$20–40 |
| 50,000 notification messages/month | ~$200–400 |

---

## 5. Architecture Design

### Use Case A & B — Group Invite Link (Simple)

For the group join button, you do not need the Groups API to auto-add users. The simplest and most reliable approach is:

1. Create WhatsApp groups manually (via WhatsApp application on a verified business number)
2. Copy the group invite link (valid until revoked): `https://chat.whatsapp.com/XXXXX`
3. Store the link in the DB: `whatsapp_groups` table with (group_name, invite_link, region, type: 'member'|'visitor')
4. API endpoint returns the correct link based on user's profile region
5. UI renders a button: → opens invite link in browser/WhatsApp

This approach requires **zero WhatsApp API calls** and is **completely free**.

```
Member clicks "Join WhatsApp Group"
        │
        ▼
GET /api/whatsapp/group-link?profile_id=17
  → Lookup profile region from DB
  → Return invite_link for matching regional group
        │
        ▼
UI opens: https://chat.whatsapp.com/{code}
  → WhatsApp opens on device
  → User accepts invite
```

### Use Case C — Transactional Notifications (WhatsApp Cloud API)

```
Event occurs (new interest, new message, subscription expiry)
        │
        ▼
MATA API: POST to Meta Cloud API
  URL: https://graph.facebook.com/v18.0/{phone_number_id}/messages
  Headers: Authorization: Bearer {META_ACCESS_TOKEN}
  Body:
  {
    "messaging_product": "whatsapp",
    "to": "{user_phone_with_country_code}",
    "type": "template",
    "template": {
      "name": "new_interest_received",
      "language": { "code": "en" },
      "components": [{ "type": "body", "parameters": [{ "type": "text", "text": "Profile Name" }] }]
    }
  }
        │
        ▼
WhatsApp delivers message to user's phone
```

---

## 6. Message Templates (Pre-approval Required)

WhatsApp **requires pre-approval** of all outbound message templates (Utility/Marketing). Templates are submitted via Meta Business Manager and typically approved in 24–48 hours.

**Templates to create:**

| Template Name | Type | Content |
|---|---|---|
| `new_interest_received` | Utility | "{{name}} has expressed interest in your MATA profile! Login to view: {{link}}" |
| `subscription_expiry_reminder` | Utility | "Your MATA subscription expires in {{days}} days. Renew now: {{link}}" |
| `otp_verification` | Authentication | "Your MATA OTP is {{otp}}. Valid for 10 minutes." |
| `profile_view_alert` | Utility | "Your MATA profile was viewed {{count}} times this week! {{link}}" |
| `welcome_message` | Utility | "Welcome to MATA Matrimony, {{name}}! Complete your profile: {{link}}" |

---

## 7. Required Code Changes

### API (`matrimonyservicesapi`)
- New file: `src/controllers/whatsapp.controller.ts`
- New file: `src/routes/whatsapp.routes.ts`
- New file: `src/utils/whatsapp.util.ts` — Meta API wrapper
- New table: `whatsapp_groups` (group_id, name, invite_link, region, type, is_active)
- New table: `whatsapp_notification_log` (profile_id, template_name, sent_at, status)
- Environment variables: `WHATSAPP_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN`, `META_VERIFY_TOKEN` (for webhook)

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/whatsapp/group-link` | Returns the correct group invite link for the user's region |
| POST | `/whatsapp/notify` | Internal — sends a WhatsApp notification to a user |
| POST | `/whatsapp/webhook` | Meta webhook endpoint — receive incoming messages / delivery receipts |

### UI Changes
- Dashboard: Add **"Join WhatsApp Community"** button with WhatsApp icon
- Landing Page: Add **"Join Our Visitor Group"** button (static link, no API)
- Profile settings: Add opt-in/opt-out toggle for WhatsApp notifications
- Notification preferences: "Email only / WhatsApp only / Both"

---

## 8. Opt-In / Compliance Requirements

WhatsApp requires explicit user consent before sending Utility/Marketing messages.

**Implementation:**
- During registration: checkbox "I agree to receive WhatsApp notifications from MATA Matrimony"
- In settings: toggle to enable/disable WhatsApp notifications
- All templates must include an opt-out instruction: "Reply STOP to unsubscribe"
- Unsubscribe handler in webhook: flag `whatsapp_opted_out = 1` in DB on STOP reply

---

## 9. Cost Summary

| Feature | API Used | Cost |
|---|---|---|
| Group invite link for members | No API (static link from DB) | **Free** |
| Group join for visitors | No API (static link in HTML) | **Free** |
| Transactional notifications (new interest, expiry) | Meta Cloud API — Utility | ~$0.004–$0.008/msg (India) |
| OTP via WhatsApp | Meta Cloud API — Authentication | ~$0.003/msg |
| First 1,000 conversations/month | Meta free tier | **Free** |
| **Total at V1.1 launch (low volume)** | | **$0–$5/month** |

---

## 10. Implementation Milestones

| Week | Task |
|---|---|
| 1 | Meta Business Account + WhatsApp Business Account setup, phone number registration |
| 1 | Create WhatsApp groups manually (regional), copy invite links, seed DB |
| 1 | Template submission to Meta (5 templates — 24–48h approval) |
| 2 | API: `/whatsapp/group-link` endpoint, `whatsapp.util.ts` Meta API wrapper |
| 2 | API: webhook endpoint for delivery receipts and opt-out handling |
| 2 | Integrate notification triggers into existing events (interest, messages) |
| 3 | UI: group join button on Dashboard, visitor landing page button |
| 3 | UI: notification preferences in settings, opt-in checkbox in registration |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| WhatsApp bans business number for spam | Always use approved templates; honour opt-outs immediately |
| Template approval rejected by Meta | Make templates factual and transactional; avoid promotional language |
| Group invite link becomes invalid | Store link in DB; admin can update via partner portal if group is reset |
| User's WhatsApp number differs from registration number | Add "WhatsApp number" field to account settings |
| India regulations on WhatsApp marketing (TCPA/TRAI) | Implement double opt-in; maintain consent logs |
