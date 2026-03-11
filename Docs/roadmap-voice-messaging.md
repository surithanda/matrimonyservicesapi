# Roadmap: Voice Messaging & Voice / Video Calls

> **Priority:** 🟡 Medium  
> **Target Release:** V1.2  
> **Effort Estimate:** 3–4 weeks (1 developer)  
> **Preferred Cost:** Free tier (Agora — 10,000 min/month free)

---

## 1. Why This Feature

Voice messaging and voice/video calls are the natural evolution of in-app messaging. For a matrimony platform:

- **Voice notes** let users communicate personality and warmth in a way text cannot
- **Voice calls** replace the awkward step of sharing phone numbers (privacy concern)
- **Video calls** enable the "virtual meeting" that increasingly replaces first in-person meetings
- Competitors (BharatMatrimony, Jeevansathi) already offer video calls — this is a **table-stakes** feature for premium subscriptions

**This feature depends on In-App Messaging (V1.1) being implemented first.**

---

## 2. Feature Scope

### Phase 1 — Voice Notes (V1.2)

Voice notes are **recorded audio clips** sent inside the chat, like WhatsApp voice messages:

- User holds a microphone button in the chat UI → records voice note (max 2 minutes)
- Note is uploaded to Azure Blob Storage
- Other user receives message with audio player widget
- Playback scrubber, duration display

### Phase 2 — Voice Calls (V1.2)

Real-time voice calls initiated from chat:

- "Call" button in chat header
- Outgoing ring → incoming ring on other device
- Accept / Decline / End
- Mute / Speaker toggle
- In-call duration timer

### Phase 3 — Video Calls (V1.3)

Real-time video calls:
- Camera on/off toggle
- Front/back camera switch (mobile)
- Picture-in-picture (mobile)
- Screen share (future)

---

## 3. Recommended APIs

### For Voice Notes — **Azure Blob Storage** (Already Integrated)

Voice notes are just audio blobs. Since MATA already uses Azure Blob Storage for photos, voice notes can use the same infrastructure:

- Record audio on device → upload to Azure as `.webm` or `.m4a`
- Store blob path in Firestore chat message (`type: 'voice'`, `voice_url: 'sas_url'`)
- **Cost: Free** — voice notes are small files (<1MB each); Azure Blob Storage is already provisioned

**No new external API needed for voice notes.**

### For Voice & Video Calls — **Agora**

Agora is purpose-built for real-time voice/video and is **the industry standard** for matrimony and dating apps (used by MeetMe, Hinge, etc.).

#### Why Agora Over Alternatives

| Aspect | **Agora** ✅ | Daily.co | Twilio | WebRTC (Self-hosted) |
|---|---|---|---|---|
| Free tier | **10,000 min/month** | Dev only (no production free) | $0.004/min | No hosted infra |
| Voice quality | Excellent | Excellent | Excellent | Variable (infra-dependent) |
| React Native SDK | ✅ Official | ✅ Official | ✅ | Manual build |
| Web SDK | ✅ | ✅ | ✅ | ✅ |
| TURN servers included | ✅ | ✅ | ✅ | ❌ ($20–100/mo self-managed) |
| India CDN presence | ✅ Strong | ⚠️ Limited | ✅ | N/A |
| Pricing after free | $0.99/1,000 min | $0.00099/min | ~$0.004/min | ~$20+/mo infra |
| Setup complexity | Low | Low | Medium | High |
| **Verdict** | ✅ **Best choice** | ✅ Good alternative | ❌ More expensive | ❌ Overkill |

#### Agora Pricing Detail

| Tier | Minutes | Cost |
|---|---|---|
| **Free** | 10,000 HD minutes/month | **$0** |
| **Pay-as-you-go** | Beyond 10,000 min | $0.99/1,000 min ($0.00099/min) |
| **At 1,000 calls × 10 min each/month** | 10,000 min | **Free** |
| **At 5,000 calls × 10 min each/month** | 50,000 min | ~$40/month |

**For the first 6–12 months post-launch, usage will comfortably stay within the free tier.**

---

## 4. Architecture Design

### Voice Notes Flow

```
User opens chat → holds microphone button → records audio
        │
        ▼
Browser/App MediaRecorder API → creates audio Blob (webm/m4a)
        │
        ▼
POST /messages/voice/upload
  → Upload to Azure Blob: {partner_id}/{profile_id}/voice/{uuid}.m4a
  → Generate SAS URL (1-hour expiry)
  → Write Firestore message: { type: 'voice', voice_url: sas_url, duration: 45 }
        │
        ▼ (real-time)
Recipient's Firestore listener fires → renders audio player widget
  → User taps Play → fetches SAS URL → plays audio
```

### Voice / Video Call Flow (Agora)

```
User A clicks "Call" in chat with User B
        │
        ▼
POST /calls/initiate
  → MATA API calls Agora Token Server (or generates token server-side)
  → Returns: { channelName, agoraToken, appId }
  → Writes Firestore: /calls/{callId} { status: 'ringing', caller: A, callee: B }
        │
        ▼ (Firestore real-time)
User B sees incoming call screen (ring animation, Accept / Decline buttons)
        │
        ├── User B DECLINES → Firestore: status: 'declined' → A sees "Call declined"
        └── User B ACCEPTS
                │
                ▼
        Both devices join Agora channel (channelName) using agoraToken
        Agora infrastructure handles WebRTC media relay
                │
                ▼
        Real-time voice/video established
                │
        User A or B ends call
                │
                ▼
        POST /calls/end
          → Firestore: status: 'ended', duration: 342
          → MySQL: log call record for billing/audit
```

### Agora Token — Security

Agora channels require a **server-generated token** (not the App ID alone) for production security. Tokens expire after a set time.

- New endpoint: `POST /calls/token` — generates Agora token server-side
- Uses Agora's Node.js token builder: `agora-access-token` npm package (free)
- Token includes: `appId`, `appCertificate`, `channelName`, `uid`, `expiryTime`

---

## 5. Required Code Changes

### API (`matrimonyservicesapi`)

**New files:**
- `src/controllers/calls.controller.ts`
- `src/routes/calls.routes.ts`
- `src/utils/agora.util.ts` — token generation

**New endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/calls/token` | Generate Agora RTC token for a call channel |
| POST | `/calls/initiate` | Start a call, write to Firestore, notify callee |
| POST | `/calls/end` | End a call, log duration |
| POST | `/messages/voice/upload` | Upload voice note to Azure Blob |

**New environment variables:**
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

**MySQL:**
- New table: `call_log` (call_id, caller_profile_id, callee_profile_id, channel_name, started_at, ended_at, duration_seconds, call_type: 'voice'|'video', status)
- New SP: `eb_call_log_create`

### UI (`matamatrimony` + mobile)

**Chat UI additions:**
- Microphone button (hold to record voice note)
- Audio player widget for received voice notes (waveform, scrubber, play/pause)
- Call button in chat header (phone icon = voice, camera icon = video)
- Incoming call overlay (ring screen with Accept/Decline)
- In-call UI (avatar/video, mute, end call, duration timer)

**Libraries needed:**
- Web: `agora-rtc-react` (official Agora React SDK)
- Mobile: `react-native-agora` (official Agora React Native SDK)

---

## 6. Voice Note Specifications

| Spec | Value | Reason |
|---|---|---|
| Max duration | 2 minutes | Consistent with WhatsApp; longer = too large |
| Max file size | ~2MB per note | ~1MB/min for compressed m4a |
| Format | `.webm` (browser) / `.m4a` (mobile) | Browser MediaRecorder outputs webm; iOS prefers m4a |
| Blob storage path | `{partner_id}/{profile_id}/voice/{uuid}.{ext}` | Same pattern as photos |
| SAS URL expiry | 1 hour | Same as photo SAS URLs |
| Azure container | `mata-voice` (separate from photos) | Clean separation |

---

## 7. Premium Feature Gating

| Feature | Free Users | Subscribed Users |
|---|---|---|
| Receive voice notes | ✅ Can listen, cannot reply | ✅ Full |
| Send voice notes | ❌ | ✅ |
| Voice calls | ❌ | ✅ |
| Video calls | ❌ | ✅ Premium plan only |
| Call duration limit | — | 30 min per call (prevent abuse) |

---

## 8. Cost Summary

| Service | Free Tier | Cost When Scaling |
|---|---|---|
| **Agora Voice/Video** | **10,000 min/month** | $0.99/1,000 min (~$0.001/min) |
| **Azure Blob — Voice Notes** | Existing storage | ~$0.018/GB stored |
| **Agora Token Builder npm** | **Free** | Free |
| **Total at V1.2 launch** | **$0/month** | ~$40/month at 5,000 call sessions |

---

## 9. Implementation Milestones

| Week | Task |
|---|---|
| 1 | Agora account setup, App ID + Certificate, Token Server implementation |
| 1 | Voice note: MediaRecorder API in browser, upload to Azure Blob Storage |
| 2 | Voice note: Firestore message type `voice`, audio player widget in chat UI |
| 2 | Call initiation: Firestore `/calls/{id}` structure, token endpoint |
| 3 | Agora RTC integration: join channel, audio publish/subscribe, end call |
| 3 | Incoming call overlay UI, ring tone (via Tone.js or Howler.js) |
| 4 | Video call: camera capture, video rendering, in-call UI (mobile) |
| 4 | Call log MySQL table + SP, duration tracking |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Agora free tier exceeded unexpectedly | Set Agora budget alert; enforce 30-min call duration limit |
| iOS Safari MediaRecorder incompatibility for voice note | Use `opus-recorder` polyfill or force `.webm` on Chrome / use mobile app |
| Poor call quality on mobile data (2G/3G) | Agora automatically adjusts codec bitrate (Adaptive Bitrate, built-in) |
| Malicious users recording calls | Add disclaimer: "Do not share personal information. Calls are not recorded by MATA." |
| Token expiry mid-call | Set token expiry to 2 hours (longer than max call duration) |
