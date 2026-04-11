# AI Search API — Developer Guide

> Natural-language profile search powered by OpenAI / Google Gemini.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Request / Response](#request--response)
6. [Quick Test (Node.js)](#quick-test-nodejs)
7. [Quick Test (curl / bash)](#quick-test-curl--bash)
8. [Error Codes](#error-codes)
9. [Cost & Premium Pricing](#cost--premium-pricing)
10. [AI Search Credit System](#ai-search-credit-system)
11. [Credit Purchase Flow (Stripe)](#credit-purchase-flow-stripe)
12. [Environment Variables](#environment-variables)
13. [Database Tables](#database-tables)
14. [Unit Tests](#unit-tests)

---

## Overview

The AI Search feature converts a plain-English query into structured filters, resolves text values to database IDs via lookup tables, builds a parameterized SQL query, executes it, and returns matching profiles — all in a single API call.

**Pipeline:**

```
User query (English)
  → AI Provider (OpenAI / Gemini) → JSON intent
  → IntentValidator → sanitized filters
  → LookupResolver → numeric IDs
  → QueryBuilder → parameterized SQL
  → MySQL → profile results
```

---

## Architecture

```
src/
├── interfaces/
│   ├── aiSearch.interface.ts        # TypeScript contracts (incl. ICreditStatus)
│   └── stripe.interface.ts          # IStripeBody (purchase_type, credits)
├── services/aiSearch/
│   ├── providers/
│   │   ├── openai.provider.ts       # OpenAI GPT adapter
│   │   └── gemini.provider.ts       # Google Gemini adapter
│   ├── aiProviderFactory.ts         # Provider factory
│   ├── schemaContext.ts             # DB-driven system prompt builder
│   ├── intentValidator.ts           # Sanitize & validate AI output
│   ├── lookupResolver.ts            # Text → numeric ID resolution
│   ├── queryBuilder.ts              # Parameterized SQL builder
│   ├── creditChecker.ts             # Credit balance enforcement (replaces quotaChecker)
│   └── aiSearch.service.ts          # Orchestrator
├── controllers/
│   └── aiSearch.controller.ts       # Request handling + credit check/deduct
├── repositories/
│   └── stripe.repository.ts         # Stripe sessions + credit grants on payment
├── routes/
│   └── aiSearch.routes.ts           # Routes + Swagger + rate limiting
└── __tests__/aiSearch/
    ├── intentValidator.test.ts      # 30 tests
    ├── lookupResolver.test.ts       # 18 tests
    ├── queryBuilder.test.ts         # 24 tests
    ├── aiProviderFactory.test.ts    # 10 tests
    └── aiSearchController.test.ts   # 13 tests
```

---

## API Endpoints

| Method | Path                          | Description                        |
|--------|-------------------------------|------------------------------------|
| POST   | `/api/ai-search`              | Execute AI-powered profile search  |
| POST   | `/api/ai-search/refresh-cache`| Refresh lookup cache               |
| GET    | `/api/ai-search/provider-info`| Current AI provider info           |
| GET    | `/api/ai-search/history`      | Search history for a profile       |

All endpoints require **API key** (`x-api-Key` header) and **JWT auth** (`matrimony-token` cookie).

---

## Authentication

1. **API Key** — passed via `x-api-Key` header, validated against the `api_clients` table.
2. **JWT Token** — `matrimony-token` cookie containing a signed JWT with `account_id`, `account_code`, and `email`.

---

## Request / Response

### POST `/api/ai-search`

**Request body:**

```json
{
  "query": "Find Hindu women between 25-30 from Hyderabad",
  "profile_id": 2
}
```

| Field        | Type   | Required | Constraints              |
|--------------|--------|----------|--------------------------|
| `query`      | string | Yes      | 1–500 characters         |
| `profile_id` | number | Yes      | Caller's profile ID      |

**Successful response (200):**

```json
{
  "success": true,
  "message": "Profiles fetched successfully",
  "data": {
    "profiles": [ /* ... profile objects ... */ ],
    "interpretation": "Searching for Hindu women aged 25 to 30 in Hyderabad.",
    "filters_applied": {
      "gender": "Female",
      "religion": "Hindu",
      "city": "Hyderabad",
      "min_age": 25,
      "max_age": 30
    },
    "resolved_ids": {
      "gender": 10,
      "religion": 131
    },
    "confidence": 0.9,
    "result_count": 0,
    "credits": {
      "allowed": true,
      "credits_remaining": 9,
      "free_credits_granted": true
    },
    "ai_provider": "openai",
    "ai_model": "gpt-4o-mini",
    "tokens_used": 2178,
    "response_time_ms": 3937
  }
}
```

---

## Quick Test (Node.js)

Run this from the **project root** (requires the server running on `localhost:8080`):

```bash
node -e "
  const http = require('http');
  const jwt  = require('jsonwebtoken');
  require('dotenv').config();

  // 1. Generate a test JWT token
  const token = jwt.sign(
    { account_code: '20251006-052700-2', account_id: 2, email: 'ramesh.bindu@hotmail.com' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 2. Build request
  const body = JSON.stringify({
    query: 'Find Hindu women between 25-30 from Hyderabad',
    profile_id: 2
  });

  const req = http.request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/ai-search',
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'x-api-Key':     'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      'Cookie':        'matrimony-token=' + token,
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.write(body);
  req.end();
"
```

---

## Quick Test (curl / bash)

> For **Git Bash**, **WSL**, or **macOS/Linux** terminals. Replace `<JWT_TOKEN>` with a valid token.

```bash
# Generate token first (one-liner)
TOKEN=$(node -e "require('dotenv').config(); \
  console.log(require('jsonwebtoken').sign( \
    { account_code:'20251006-052700-2', account_id:2, email:'ramesh.bindu@hotmail.com' }, \
    process.env.JWT_SECRET, { expiresIn:'1h' }))")

# AI Search
curl -s -X POST http://localhost:8080/api/ai-search \
  -H "Content-Type: application/json" \
  -H "x-api-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -b "matrimony-token=$TOKEN" \
  -d '{
    "query": "Find Hindu women between 25-30 from Hyderabad",
    "profile_id": 2
  }' | node -e "process.stdin.on('data',d=>console.log(JSON.stringify(JSON.parse(d),null,2)))"

# Refresh lookup cache
curl -s -X POST http://localhost:8080/api/ai-search/refresh-cache \
  -H "x-api-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -b "matrimony-token=$TOKEN" | node -p "JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8')),null,2)"

# Provider info
curl -s http://localhost:8080/api/ai-search/provider-info \
  -H "x-api-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -b "matrimony-token=$TOKEN"
```

---

## Quick Test (PowerShell)

```powershell
# Generate JWT
$token = node -e "require('dotenv').config(); console.log(require('jsonwebtoken').sign({ account_code:'20251006-052700-2', account_id:2, email:'ramesh.bindu@hotmail.com' }, process.env.JWT_SECRET, { expiresIn:'1h' }))"

# AI Search
$headers = @{
  "Content-Type" = "application/json"
  "x-api-Key"    = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  "Cookie"        = "matrimony-token=$token"
}
$body = '{"query":"Find Hindu women between 25-30 from Hyderabad","profile_id":2}'

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$cookie = New-Object System.Net.Cookie("matrimony-token", $token, "/", "localhost")
$session.Cookies.Add($cookie)

Invoke-RestMethod -Uri "http://localhost:8080/api/ai-search" `
  -Method POST -Headers $headers -WebSession $session -Body $body |
  ConvertTo-Json -Depth 10
```

---

## Error Codes

| HTTP | Condition                                     |
|------|-----------------------------------------------|
| 200  | Success — profiles returned                   |
| 400  | Missing/invalid `query` or `profile_id`       |
| 401  | No JWT token or invalid/expired token         |
| 403  | Invalid API key                               |
| 422  | AI confidence too low (unrelated query)        |
| 429  | AI search credits exhausted OR rate limit (10 req/min per IP) |
| 502  | AI returned invalid JSON                      |
| 504  | AI provider timed out                         |
| 500  | Unexpected server error                       |

---

## Cost & Premium Pricing

### Token Usage per API Call

Token consumption varies by query complexity. The system prompt (schema context with all lookup values) is the dominant cost — it's sent on every call.

| Component         | Approx. Tokens | Notes                                    |
|-------------------|----------------|------------------------------------------|
| System prompt     | ~1,800–2,000   | Schema context + lookup values (cached)  |
| User query        | ~20–60         | Varies by query length                   |
| AI response (JSON)| ~100–250       | Structured intent output                 |
| **Total per call**| **~2,000–2,300** | Based on live testing (~2,178 observed)|

### Cost per Call by Provider

> Pricing as of March 2026. Check provider dashboards for current rates.

| Provider | Model | Input (per 1M tokens) | Output (per 1M tokens) | Approx. Cost per Call | Monthly Cost (1K calls) |
|----------|-------|-----------------------|------------------------|-----------------------|-------------------------|
| **OpenAI** | gpt-4o-mini | $0.15 | $0.60 | **~$0.00042** | **~$0.42** |
| **OpenAI** | gpt-4o | $2.50 | $10.00 | **~$0.0070** | **~$7.00** |
| **Google** | gemini-2.0-flash | $0.10 | $0.40 | **~$0.00028** | **~$0.28** |
| **Google** | gemini-2.0-pro | $1.25 | $5.00 | **~$0.0035** | **~$3.50** |

**Cost breakdown example (gpt-4o-mini):**
```
Input:  2,000 tokens × ($0.15 / 1,000,000) = $0.000300
Output:   200 tokens × ($0.60 / 1,000,000) = $0.000120
                                     Total = $0.000420 per call
```

### API Cost Summary

| API Endpoint | AI Call? | Tokens per Call | Cost per Call (gpt-4o-mini) | Cost per Call (gemini-2.0-flash) |
|---|---|---|---|---|
| `POST /api/ai-search` | **Yes** | ~2,000–2,300 | ~$0.00042 | ~$0.00028 |
| `POST /api/ai-search/refresh-cache` | No | 0 | $0.00 (DB only) | $0.00 (DB only) |
| `GET /api/ai-search/provider-info` | No | 0 | $0.00 | $0.00 |
| `GET /api/ai-search/history` | No | 0 | $0.00 (DB only) | $0.00 (DB only) |

### AI Search Credit Packs (Implemented)

AI Search is monetized via **one-time credit packs** (not subscriptions). Credits are persistent, stackable, and never expire. Membership ($100/yr) is required to purchase credit packs and grants 10 free credits on activation.

| | � Free (with membership) | 🥉 Starter Pack | 🥈 Value Pack | 🥇 Power Pack |
|---|---|---|---|---|
| **Price** | Included | $10 | $25 | $30 |
| **Credits** | 10 | 50 | 250 | 1,000 |
| **Cost per Search** | Free | $0.20 | $0.10 | $0.03 |
| **Expiry** | Never | Never | Never | Never |
| **Stackable** | — | ✓ | ✓ | ✓ |
| **Est. AI cost to us** | ~$0.004 | ~$0.021 | ~$0.105 | ~$0.42 |
| **Gross Margin** | — | ~99.8% | ~99.6% | ~98.6% |

### Revenue Projections

| Scenario | Members | Pack Mix (Free-only / Starter / Value / Power) | Monthly Revenue | Monthly AI Cost | Net Margin |
|---|---|---|---|---|---|
| **Small** | 500 | 70/15/10/5% | $1,575 | $4.50 | 99.7% |
| **Medium** | 5,000 | 60/20/12/8% | $18,900 | $52.00 | 99.7% |
| **Large** | 50,000 | 50/25/15/10% | $217,500 | $600.00 | 99.7% |

> **Key insight:** AI cost per search is **sub-penny** ($0.0003–$0.0004). Even with generous credit packs, AI infrastructure cost is negligible compared to credit pack revenue. The primary value is the **user experience** of natural-language search.

### Cost Optimization Tips

- **Use `gemini-2.0-flash` as default** — 33% cheaper than gpt-4o-mini with comparable quality for structured extraction.
- **Cache the schema context** — already implemented; avoids re-fetching lookups on every call.
- **Set low `AI_TEMPERATURE` (0.1)** — deterministic output = fewer retries.
- **Set `AI_MAX_TOKENS=500`** — caps output cost; intent JSON rarely exceeds 200 tokens.
- **Rate limit** — 10 req/min/IP already enforced to prevent abuse.
- **Monitor via `ai_search_log`** — track `tokens_used` and `response_time_ms` to detect anomalies.

---

## AI Search Credit System

> **Replaces** the previous monthly-quota model. Credits are persistent, stackable, and never expire.

### How It Works

```
POST /api/ai-search
  → 1. Authenticate user (JWT + API key)
  → 2. creditChecker.check(accountId) → get credit balance
  → 3. If credits_remaining <= 0 → return 429 with buy-credits message
  → 4. If credits available → proceed with AI search
  → 5. creditChecker.deduct(accountId) → subtract 1 credit
  → 6. Append credits info to response
```

### Credit Acquisition

| Source | Credits | Trigger |
|---|---|---|
| **Membership activation** | 10 free | Automatic on first payment (idempotent) |
| **Starter Pack** | 50 | Purchase via Stripe ($10) |
| **Value Pack** | 250 | Purchase via Stripe ($25) |
| **Power Pack** | 1,000 | Purchase via Stripe ($30) |

### Credits in Every Response

**Successful search (200):**

```json
{
  "success": true,
  "data": {
    "profiles": [...],
    "confidence": 0.9,
    "credits": {
      "allowed": true,
      "credits_remaining": 9,
      "free_credits_granted": true
    }
  }
}
```

**Credits exhausted (429):**

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

### No Credits Row = Fail-Open

If a user has no row in `ai_search_credits` (or a DB error occurs), the system **fails open** — allows the search but logs a warning. `credits_remaining: -1` signals this state to the frontend.

### Database Tables

**`ai_search_credits`** — one row per account:

| Column | Type | Description |
|---|---|---|
| `account_id` | INT (PK) | FK to accounts table |
| `credit_balance` | INT | Current credit balance (default 0) |
| `free_credits_granted` | TINYINT(1) | Whether 10 free credits have been granted |
| `created_at` | TIMESTAMP | Row creation time |
| `updated_at` | TIMESTAMP | Last modification time |

**`ai_search_credit_log`** — audit trail:

| Column | Type | Description |
|---|---|---|
| `log_id` | INT (PK, AI) | Auto-increment ID |
| `account_id` | INT | FK to accounts table |
| `credits_change` | INT | Positive = grant/purchase, negative = usage |
| `transaction_type` | ENUM | `free_grant`, `purchase`, `usage` |
| `description` | VARCHAR(255) | Human-readable description |
| `stripe_session_id` | VARCHAR(255) | Stripe session ID (for purchases) |
| `balance_after` | INT | Balance after this transaction |
| `created_at` | TIMESTAMP | Transaction timestamp |

### Stored Procedures

| SP | Purpose |
|---|---|
| `ai_search_get_credits(p_account_id)` | Returns `credit_balance` + `free_credits_granted` |
| `ai_search_grant_free_credits(p_account_id, p_credits)` | Idempotent: grants free credits only if not already granted |
| `ai_search_add_credits(p_account_id, p_credits, p_description, p_stripe_session_id)` | Adds purchased credits + logs the transaction |
| `ai_search_use_credit(p_account_id)` | Deducts 1 credit + logs usage; returns new balance |

### Migration

SQL file: `Docs/migrations/003_ai_search_credits.sql` — creates both tables and all 4 SPs.

### Implementation Files

| File | Change |
|---|---|
| `Docs/migrations/003_ai_search_credits.sql` | **New** — tables + SPs |
| `src/services/aiSearch/creditChecker.ts` | **New** — check, deduct, grantFreeCredits, addCredits |
| `src/interfaces/aiSearch.interface.ts` | Add `ICreditStatus` interface + `credits` field on response |
| `src/controllers/aiSearch.controller.ts` | Replace quotaChecker with creditChecker |
| `src/interfaces/stripe.interface.ts` | Add `purchase_type`, `credits` to IStripeBody |
| `src/repositories/stripe.repository.ts` | Add credit grants on payment success |

---

## Credit Purchase Flow (Stripe)

### Stripe Session Metadata

When creating a checkout session, the frontend passes `purchase_type` and `credits`:

```json
{
  "amount": 25,
  "currency": "usd",
  "plan": "Value Pack",
  "purchase_type": "ai_credits",
  "credits": 250,
  "front_end_success_uri": "...",
  "front_end_failed_uri": "..."
}
```

These are stored as Stripe session metadata: `purchase_type`, `credits`, `account_id`.

### On Payment Success

Both the webhook handler and `verifySession` call `handleCreditGrants()`:

```
1. Read metadata.purchase_type from Stripe session
2. If "membership" → creditChecker.grantFreeCredits(accountId)  // 10 free, idempotent
3. If "ai_credits" → creditChecker.addCredits(accountId, metadata.credits, ...)
```

### Frontend Flow

```
/payments page
  ├── Section 1: Account Membership ($100/yr)  → /payments/billings?type=membership
  └── Section 2: AI Search Credit Packs        → /payments/billings?type=ai_credits&credits=N
       ├── Starter Pack (50 / $10)
       ├── Value Pack (250 / $25)   ← "Best Value"
       └── Power Pack (1000 / $30)
```

When navigating from AI Search (`?source=ai-search`), the page auto-scrolls to the credit packs section.

---

## Environment Variables

Add these to your `.env` file:

```env
# Provider: openai | gemini
AI_PROVIDER=openai

# OpenAI
AI_OPENAI_API_KEY=sk-...
AI_OPENAI_MODEL=gpt-4o-mini

# Google Gemini
AI_GEMINI_API_KEY=AIza...
AI_GEMINI_MODEL=gemini-2.0-flash

# Shared AI settings
AI_MAX_TOKENS=500
AI_TEMPERATURE=0.1
AI_TIMEOUT_MS=15000
```

---

## Database Tables

### `ai_search_log`

Every AI search is logged for analytics and debugging:

| Column            | Type         | Description                     |
|-------------------|--------------|---------------------------------|
| `search_id`       | INT (PK, AI) | Auto-increment ID               |
| `profile_id`      | INT          | Caller's profile ID             |
| `account_id`      | INT          | Caller's account ID             |
| `user_query`      | TEXT         | Original natural-language query  |
| `ai_provider`     | VARCHAR(50)  | openai / gemini                 |
| `ai_model`        | VARCHAR(100) | Model name                      |
| `tokens_used`     | INT          | Total tokens consumed            |
| `response_time_ms`| INT          | AI response time in ms          |
| `confidence`      | DECIMAL(3,2) | AI confidence score (0–1)       |
| `filters_json`    | JSON         | Extracted filters                |
| `resolved_ids_json`| JSON        | Resolved lookup IDs             |
| `sql_query`       | TEXT         | Generated parameterized SQL      |
| `result_count`    | INT          | Number of profiles returned     |
| `created_at`      | TIMESTAMP    | Log timestamp                   |

### `ai_search_credits`

Persistent credit balance per account (replaces monthly quota model):

| Column               | Type         | Description                              |
|----------------------|--------------|------------------------------------------|
| `account_id`         | INT (PK)     | FK to accounts table                     |
| `credit_balance`     | INT          | Current credit balance (default 0)       |
| `free_credits_granted`| TINYINT(1)  | Whether 10 free credits have been granted|
| `created_at`         | TIMESTAMP    | Row creation time                        |
| `updated_at`         | TIMESTAMP    | Last modification time (auto-updates)    |

### `ai_search_credit_log`

Audit trail for all credit transactions:

| Column              | Type          | Description                              |
|---------------------|---------------|------------------------------------------|
| `log_id`            | INT (PK, AI)  | Auto-increment ID                        |
| `account_id`        | INT           | FK to accounts table                     |
| `credits_change`    | INT           | +N = grant/purchase, -1 = usage          |
| `transaction_type`  | ENUM          | `free_grant`, `purchase`, `usage`        |
| `description`       | VARCHAR(255)  | Human-readable (e.g. "Purchased 250 AI search credits") |
| `stripe_session_id` | VARCHAR(255)  | Stripe checkout session ID (purchases)   |
| `balance_after`     | INT           | Balance after this transaction           |
| `created_at`        | TIMESTAMP     | Transaction timestamp                    |

---

## Supported Filters

The AI extracts these filters from natural language:

| Category    | Filters                                                                 |
|-------------|-------------------------------------------------------------------------|
| **Personal** | gender, min_age, max_age, religion, caste, marital_status, nationality, height, weight, complexion, profession |
| **Location** | city, state, country                                                   |
| **Education**| education_level, field_of_study, institution_name                      |
| **Employment**| occupation, company, min_salary, max_salary                           |
| **Lifestyle**| eating_habit, diet_habit, drinking, smoking, physical_activity          |
| **Other**    | hobbies, disability                                                    |

**Sort options:** `age_asc`, `age_desc`, `newest`, `salary_desc`, `height_desc`

---

## Example Queries

| Natural Language Query                                      | Extracted Filters                                         |
|-------------------------------------------------------------|-----------------------------------------------------------|
| "Find Hindu women between 25-30 from Hyderabad"             | gender=Female, religion=Hindu, min_age=25, max_age=30, city=Hyderabad |
| "Doctors with MBA earning above 20 lakhs"                   | profession=Doctor, education_level=MBA, min_salary=2000000 |
| "Vegetarian Brahmin men, non-smoker, 170+ cm tall"          | gender=Male, caste=Brahmin, eating_habit=Vegetarian, smoking=Non-Smoker, min_height_cms=170 |
| "Software engineers from Bangalore working at Google"        | occupation=Software Engineer, city=Bangalore, company=Google |

---

## Unit Tests

```bash
# Run all AI search tests
npx jest --config jest.config.ts --verbose

# Run a specific suite
npx jest --config jest.config.ts --testPathPattern="intentValidator"
npx jest --config jest.config.ts --testPathPattern="lookupResolver"
npx jest --config jest.config.ts --testPathPattern="queryBuilder"
npx jest --config jest.config.ts --testPathPattern="aiProviderFactory"
npx jest --config jest.config.ts --testPathPattern="aiSearchController"
```

**Test summary: 93 tests, 5 suites, all passing.**

| Suite                  | Tests | Coverage                                    |
|------------------------|-------|---------------------------------------------|
| intentValidator        | 30    | Validation, sanitization, clamping, edge cases |
| lookupResolver         | 18    | Exact/fuzzy match, country/state, hobbies    |
| queryBuilder           | 24    | Filters, JOINs, sorting, SQL injection safety |
| aiProviderFactory      | 10    | Provider creation, env config, error handling |
| aiSearchController     | 13    | Input validation, HTTP codes, error mapping  |
