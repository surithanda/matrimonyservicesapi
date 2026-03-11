# Roadmap: Background Verification

> **Priority:** 🔴 High  
> **Target Release:** V1.2  
> **Effort Estimate:** 4–6 weeks (1 developer)  
> **Cost:** ₹799–₹1,599 per person verified (Springverify); or pay-per-check model (IDfy)

---

## 1. Why This Feature

Background verification is the **#1 trust differentiator** in the matrimony industry:

- **2020 BharatMatrimony data breach** exposed 1M+ profiles — fake profiles are rampant
- Families routinely ask: *"Has this person's job/education/address been verified?"*
- Police reports of matrimony fraud (financial scams, bigamy, fake identity) are increasing year on year across India
- BharatMatrimony's "Prime Membership" (₹1,499–₹2,499/month extra) specifically markets **verified profiles** as its key differentiator
- A verified badge on a MATA profile is a **premium upsell opportunity** (charge ₹999–₹2,499 for verification package)

---

## 2. Verification Types

### 2.1 Identity Verification
**What:** Confirm the person is who they claim to be.
**Documents:** Aadhaar card, PAN card, Passport, Voter ID
**Method:** OCR extraction + liveness check (selfie match)
**Result:** Name, DOB, gender confirmed ✅

### 2.2 Address Verification
**What:** Confirm current residential address is genuine.
**Method:** 
- **Digital:** Aadhaar-linked address cross-check
- **Physical:** Field agent visits address (for premium verification)
**Result:** Address confirmed ✅ / Discrepancy found ⚠️

### 2.3 Employment Verification
**What:** Confirm current employer, job title, and employment status.
**Method:** 
- Email-based: Verification email sent to official company email
- Database check: Cross-check against EPFO / salary slip OCR
- Direct HR contact (for premium)
**Result:** Employed at [Company] as [Title] — Verified ✅

### 2.4 Education Verification
**What:** Confirm degree, institution, and year of graduation.
**Method:**
- Digital: University/board certificate OCR + database lookup (DigiLocker)
- API check: National Academic Depository (NAD) API (Government — free for individuals)
**Result:** B.Tech from [University], 2018 — Verified ✅

### 2.5 Criminal Record Check
**What:** Confirm no pending criminal cases or convictions.
**Method:** 
- Court record database lookup
- Police verification (physical, for premium)
**Note:** In India, no single centralised criminal database exists. Checks are done against available High Court and eCourts databases.
**Result:** No criminal records found ✅ / Records found ⚠️

### 2.6 Credit Check
**What:** Assess financial responsibility (CIBIL score).
**Method:** CIBIL / Experian / Equifax API query (requires user consent and PAN)
**Result:** CIBIL Score: 750 (Good) ✅
**Note:** Matrimony credit checks are for **character assessment**, not loan approval. Requires explicit user consent per RBI guidelines.

### 2.7 Family Background Check
**What:** Basic verification that family information is accurate.
**Method:**
- Cross-reference parent names against Aadhaar/voter ID
- Physical verification by field agent (premium)
**Result:** Family background confirmed ✅

---

## 3. Verification Packages (Recommended Tiers)

| Package | Checks Included | Estimated Cost (API) | Suggested Retail Price |
|---|---|---|---|
| **Basic (Silver)** | Identity + Address | ₹400–₹600 | ₹999 |
| **Standard (Gold)** | Identity + Address + Employment + Education | ₹800–₹1,200 | ₹1,999 |
| **Comprehensive (Platinum)** | Identity + Address + Employment + Education + Criminal | ₹1,300–₹1,800 | ₹2,999 |
| **Premium (Diamond)** | All of above + Credit + Family Background + Physical Visit | ₹2,500–₹4,000 | ₹4,999 |

---

## 4. API Provider Analysis

### 4.1 Springverify (Recommended for V1.2)

**Website:** springverify.com  
**Best for:** SMBs, startups — transparent pricing, self-service

| Package | Price | Included Checks |
|---|---|---|
| Upstart Verifier | ₹799/person | Identity + 1 Employment + 1 Education + Address |
| Master Verifier | ₹1,299/person | Identity + 2 Employment + 2 Education + Address + Criminal DB |
| Elite Verifier | ₹1,599/person | All checks including reference + court records |

**Pros:**
- Transparent pricing (no need to "contact sales")
- Free trial available
- REST API with webhook callbacks (async — checks take 2–7 days)
- Dashboard for tracking verification status
- SOC 2 Type II certified

**Cons:**
- Turnaround time can be 3–7 days for comprehensive checks
- Physical verification adds time and cost

**API Integration:**
```typescript
// Submit verification request
POST https://api.springverify.com/v2/employee
Authorization: Bearer {SPRINGVERIFY_API_KEY}
{
  "name": "Suresh Kumar",
  "email": "suresh@example.com",
  "phone": "+919....",
  "package": "master_verifier",
  "consent": true,
  "identity": { "type": "aadhaar", "number": "XXXX" }
}

// Webhook callback on completion
POST /api/verification/webhook
{
  "employee_id": "sp_emp_001",
  "status": "completed",
  "checks": {
    "identity": "verified",
    "employment": "verified",
    "education": "discrepancy",
    "address": "verified"
  }
}
```

---

### 4.2 IDfy

**Website:** idfy.com  
**Best for:** Enterprises, high-volume verification

| Aspect | Details |
|---|---|
| **Pricing** | Consumption-based credits (contact sales for rates) |
| **Checks** | Identity, Address, Employment, Education, Criminal, Court |
| **API style** | REST + Webhooks |
| **Free trial** | Yes (sandbox environment) |
| **India expertise** | Very strong — Aadhaar, PAN, GST, EPFO integrations |

**Best for MATA if:** You prefer granular per-check pricing and need EPFO (PF database) employment verification without needing employer cooperation.

**Estimated rates (typical market):**
- Aadhaar identity check: ₹5–₹15 per check
- PAN verification: ₹3–₹8 per check
- Employment (EPFO): ₹15–₹30 per check
- Education (NAD/DigiLocker): ₹10–₹20 per check
- Criminal/court check: ₹50–₹150 per check
- Address (digital): ₹20–₹50 per check

---

### 4.3 HyperVerge

**Website:** hyperverge.co  
**Best for:** KYC and identity verification (liveness + face match)

| Aspect | Details |
|---|---|
| **Pricing** | Tiered; Start plan has free sandbox (15-day POC after NDA) |
| **Speciality** | AI-powered face verification, liveness detection, Aadhaar OCR |
| **Checks** | Identity, face match, liveness (anti-spoofing) |
| **Best for MATA** | Onboarding KYC — selfie vs. ID document match |

**Use case for MATA:** Verify that the profile photo matches the Aadhaar photo (prevent fake profile photos).

---

### 4.4 Government Free APIs (India)

| API | Check Type | Cost | Notes |
|---|---|---|---|
| **DigiLocker API** | Education certificates | **Free** (for users who consent) | User must have DigiLocker account with certificates |
| **National Academic Depository (NAD)** | Degree verification | **Free** | Government-run; covers universities linked to NAD |
| **EPFO Passbook API** | Employment history | **Free** (for UAN holders) | Requires employee's UAN number and consent |
| **Aadhaar e-KYC (UIDAI)** | Identity + Address | Requires AUA/KUA license | Complex regulatory setup; not recommended for startups |

---

### 4.5 CIBIL (Credit Check)

| Provider | API | Cost |
|---|---|---|
| **TransUnion CIBIL** | CIBIL Member API (B2B) | ₹50–₹100 per check (requires enterprise agreement) |
| **Experian India** | Experian API | Similar pricing; contact sales |
| **Perfios** | Consumer bureau integration | ₹30–₹80 per check |

**Requirement:** User must provide written consent AND PAN number before CIBIL check. Regulated by RBI.

---

## 5. Architecture Design

### Verification State Machine

```
User requests verification package
        │
        ▼
User consents (legal consent modal recorded in DB)
        │
        ▼
User uploads documents (Aadhaar, PAN, Degree certificate)
  → Uploaded to Azure Blob (encrypted, access-restricted container)
        │
        ▼
MATA API submits verification request to Provider API (Springverify/IDfy)
        │
        ▼
Provider processes asynchronously (2–7 days)
        │
        ▼
Provider calls MATA webhook with result
        │
        ├── All checks PASSED → profile gets "Verified" badge
        ├── Some checks DISCREPANCY → partner admin notified for manual review
        └── Check FAILED → user notified; can re-submit with correct documents
```

### Profile Verification Badge Display

A verified profile shows badges indicating which checks passed:

```
✅ Identity Verified
✅ Address Verified
✅ Employment Verified (TCS, Software Engineer)
✅ Education Verified (B.Tech, VIT University, 2019)
⚠️ Criminal Check Pending
```

---

## 6. Data Model

### New MySQL Tables

```sql
-- Verification request log
CREATE TABLE profile_verification (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    package_type ENUM('silver', 'gold', 'platinum', 'diamond'),
    provider ENUM('springverify', 'idfy', 'hyperverge'),
    provider_reference_id VARCHAR(100),  -- Provider's internal ID
    status ENUM('submitted', 'in_progress', 'completed', 'failed'),
    payment_amount DECIMAL(10,2),
    submitted_at DATETIME,
    completed_at DATETIME,
    created_user VARCHAR(45),
    FOREIGN KEY (profile_id) REFERENCES profile_personal(profile_id)
);

-- Individual check results
CREATE TABLE profile_verification_check (
    check_id INT AUTO_INCREMENT PRIMARY KEY,
    verification_id INT NOT NULL,
    check_type ENUM('identity', 'address', 'employment', 'education', 'criminal', 'credit', 'family'),
    status ENUM('verified', 'discrepancy', 'failed', 'pending', 'not_checked'),
    result_summary VARCHAR(500),  -- e.g., "Employed at TCS as Software Engineer"
    verified_at DATETIME,
    FOREIGN KEY (verification_id) REFERENCES profile_verification(verification_id)
);

-- User consent log (REQUIRED for compliance)
CREATE TABLE verification_consent_log (
    consent_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    consent_type ENUM('data_processing', 'cibil_check', 'background_check'),
    consent_given BOOLEAN,
    consent_at DATETIME,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255)
);
```

### New Stored Procedures

| SP | Purpose |
|---|---|
| `eb_verification_create(profile_id, package, provider, reference_id)` | Create verification request |
| `eb_verification_update_check(verification_id, check_type, status, summary)` | Update individual check result |
| `eb_verification_complete(verification_id, overall_status)` | Mark verification complete, update profile badge |
| `eb_verification_consent_log(profile_id, consent_type, ip_address)` | Record consent |

---

## 7. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/verification/packages` | Returns available packages and pricing |
| POST | `/verification/consent` | Record user consent (REQUIRED before submission) |
| POST | `/verification/submit` | Submit verification request to provider |
| GET | `/verification/status/:profile_id` | Check verification status |
| POST | `/verification/webhook` | Provider callback with check results |
| GET | `/verification/badge/:profile_id` | Public — returns badge display data |

---

## 8. UI Changes

### For Users (matamatrimony)

1. **Dashboard** — "Get Verified" call-to-action banner for unverified profiles
2. **Verification page** — Package selection with comparison table
3. **Document upload** — Secure upload for Aadhaar, PAN, degree certificate
4. **Consent modal** — Legal language, checkbox, timestamp recorded
5. **Status tracker** — Progress indicator showing status of each check
6. **Profile display** — Verified badges on profile card and full profile view

### For Partner Admins (ekam-admin-api)

1. Verification dashboard — list of all pending/completed verifications
2. Manual review queue — for discrepancy cases
3. Override capability — admin can manually approve/reject after review
4. Aggregate reporting — verification rates, common discrepancy types

---

## 9. Legal & Compliance Requirements

| Requirement | Action |
|---|---|
| **User consent** | Show consent modal with clear language before any check. Log consent timestamp + IP. |
| **Data minimisation** | Do not store raw Aadhaar number in DB; store only masked version |
| **Document storage security** | Documents in separate Azure container with no public access; SAS URLs for temp access only |
| **CIBIL compliance** | RBI mandates written consent; implement digital consent with audit log |
| **DPDPA 2023 (India)** | Right to access, right to delete verification data; implement data deletion endpoint |
| **Retention** | Verification documents: delete after 90 days post-verification |

---

## 10. Cost Summary

| Package | API Cost | Suggested Retail | Margin |
|---|---|---|---|
| Silver (Identity + Address) | ₹400–₹600 | ₹999 | ₹399–₹599 (~40–60%) |
| Gold (+ Employment + Education) | ₹800–₹1,200 | ₹1,999 | ₹799–₹1,199 (~40–60%) |
| Platinum (+ Criminal) | ₹1,300–₹1,800 | ₹2,999 | ₹1,199–₹1,699 (~40–57%) |
| Diamond (+ Credit + Family + Physical) | ₹2,500–₹4,000 | ₹4,999 | ₹999–₹2,499 (~25–50%) |

**Background verification can be a profitable revenue stream, not just a cost centre.**

---

## 11. Implementation Milestones

| Week | Task |
|---|---|
| 1 | Springverify account setup, API key, sandbox testing for each check type |
| 1 | DB schema: `profile_verification`, `profile_verification_check`, `verification_consent_log` |
| 2 | API: consent recording, document upload to Azure (restricted container) |
| 2 | API: submit verification request to Springverify |
| 3 | API: webhook handler for check results, update DB, trigger notifications |
| 3 | Profile badge logic — show verified badges based on check results |
| 4 | UI: "Get Verified" page, package selection, document upload, consent modal |
| 4 | UI: status tracker, badge display on profile cards |
| 5 | Partner admin: verification dashboard, manual review queue |
| 6 | CIBIL integration (optional Phase 2), DigiLocker API for education (free tier) |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Provider turnaround too slow (7+ days) | Set user expectations clearly; send WhatsApp update when each check completes |
| Fraudulent documents submitted | Physical field visit in Platinum/Diamond plan; Aadhaar liveness check (HyperVerge) |
| Aadhaar API regulatory complexity | Use Springverify's pre-integrated Aadhaar OCR — not direct UIDAI API |
| CIBIL refuses enterprise agreement | Start without credit check; add in V1.3 after scale is demonstrated |
| User drops off during document upload | Save progress; allow resume later; send reminder via WhatsApp/email |
| Data breach of uploaded documents | Separate Azure container, no public access, automatic deletion after 90 days |
| Verification reveals criminal record — user complains | Clear disclaimer at consent: "Results are based on available public data and partner databases." |

---

## 13. Recommended Starting Point (V1.2 MVP)

Start with the **minimum viable verification** for maximum impact at lowest cost:

1. **Identity + liveness** via HyperVerge (selfie + Aadhaar OCR) — builds trust instantly
2. **Education** via DigiLocker API — **free** for users who have DigiLocker certificates
3. **Employment** via EPFO UAN — **free** for users with UAN number
4. **Address** via Aadhaar-linked address through Springverify — low cost

This approach keeps API costs at **₹200–₹400 per profile** for basic verification, with a retail price of ₹999 — creating immediate revenue and competitive differentiation.
