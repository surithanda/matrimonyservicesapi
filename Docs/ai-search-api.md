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
10. [Monthly Quota Enforcement](#monthly-quota-enforcement)
11. [Environment Variables](#environment-variables)
12. [Database Tables](#database-tables)
13. [Unit Tests](#unit-tests)

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
│   └── aiSearch.interface.ts        # TypeScript contracts
├── services/aiSearch/
│   ├── providers/
│   │   ├── openai.provider.ts       # OpenAI GPT adapter
│   │   └── gemini.provider.ts       # Google Gemini adapter
│   ├── aiProviderFactory.ts         # Provider factory
│   ├── schemaContext.ts             # DB-driven system prompt builder
│   ├── intentValidator.ts           # Sanitize & validate AI output
│   ├── lookupResolver.ts            # Text → numeric ID resolution
│   ├── queryBuilder.ts              # Parameterized SQL builder
│   └── aiSearch.service.ts          # Orchestrator
├── controllers/
│   └── aiSearch.controller.ts       # Request handling + validation
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
| 429  | Monthly quota exceeded OR rate limit (10 req/min per IP) |
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

### Premium Pricing Cards

Suggested subscription tiers to monetize the AI Search feature:

| | 🆓 Free | 🥉 Basic | 🥈 Pro | 🥇 Premium |
|---|---|---|---|---|
| **Monthly Price** | $0 | $4.99 | $14.99 | $29.99 |
| **AI Searches / month** | 5 | 50 | 250 | Unlimited |
| **AI Provider** | gemini-2.0-flash | gemini-2.0-flash | gpt-4o-mini | gpt-4o-mini |
| **Response Quality** | Standard | Standard | Enhanced | Enhanced |
| **Search History** | Last 5 | Last 30 | Last 90 | Unlimited |
| **Priority Support** | — | — | — | ✓ |
| **Est. AI cost to you** | ~$0.0014 | ~$0.014 | ~$0.105 | ~$0.42 (at 1K calls) |
| **Gross Margin** | — | ~99.7% | ~99.3% | ~98.6% |

### Revenue Projections

| Scenario | Users | Mix (Free/Basic/Pro/Premium) | Monthly Revenue | Monthly AI Cost | Net Margin |
|---|---|---|---|---|---|
| **Small** | 500 | 80/10/7/3% | $1,775 | $3.50 | 99.8% |
| **Medium** | 5,000 | 70/15/10/5% | $21,495 | $42.00 | 99.8% |
| **Large** | 50,000 | 60/20/12/8% | $259,900 | $500.00 | 99.8% |

> **Key insight:** AI cost per search is **sub-penny** ($0.0003–$0.0004). Even with generous quotas, AI infrastructure cost is negligible compared to subscription revenue. The primary value is the **user experience** of natural-language search.

### Cost Optimization Tips

- **Use `gemini-2.0-flash` as default** — 33% cheaper than gpt-4o-mini with comparable quality for structured extraction.
- **Cache the schema context** — already implemented; avoids re-fetching lookups on every call.
- **Set low `AI_TEMPERATURE` (0.1)** — deterministic output = fewer retries.
- **Set `AI_MAX_TOKENS=500`** — caps output cost; intent JSON rarely exceeds 200 tokens.
- **Rate limit** — 10 req/min/IP already enforced to prevent abuse.
- **Monitor via `ai_search_log`** — track `tokens_used` and `response_time_ms` to detect anomalies.

---

## Monthly Quota Enforcement

Each subscription plan defines a monthly AI search limit. The system enforces this quota in real-time and returns remaining usage in every response.

### How It Works

```
POST /api/ai-search
  → 1. Authenticate user (JWT + API key)
  → 2. Look up user's active subscription → get plan
  → 3. Count AI searches this month from ai_search_log
  → 4. If used >= limit → return 429 with upgrade message
  → 5. If within limit → proceed with AI search
  → 6. Append quota info to response
```

### Quota Limits per Plan

Stored in `partner_admin_payment_plans.max_ai_searches_per_month`:

| Plan | plan_key | Monthly Price | AI Searches / Month | `-1` = Unlimited |
|---|---|---|---|---|
| **Free** | `free` | $0 | 5 | — |
| **Bronze** | `bronze` | $29 | 50 | — |
| **Silver** | `silver` | $59 | 250 | — |
| **Gold** | `gold` | $99 | Unlimited | ✓ |

### Auto-Reset (No Cron Needed)

Usage count is **derived in real-time** — not stored in a counter:

```sql
SELECT COUNT(*) AS used_this_month
FROM ai_search_log
WHERE account_id = ?
  AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01 00:00:00')
```

When a new calendar month starts, the `WHERE` clause naturally excludes old rows → quota **auto-resets to 0 usage**.

| Date | Searches This Month | Free Plan (limit=5) | Status |
|---|---|---|---|
| Mar 1 | 0 | remaining = 5 | ✅ Allowed |
| Mar 15 | 4 | remaining = 1 | ✅ Allowed |
| Mar 20 | 5 | remaining = 0 | ❌ Quota exceeded |
| Apr 1 | 0 (new month) | remaining = 5 | ✅ Auto-reset |

### Quota in Every Response

Every AI search response includes a `quota` object so the frontend always knows the remaining count:

**Successful search (200):**

```json
{
  "success": true,
  "data": {
    "profiles": [...],
    "interpretation": "Searching for Hindu women aged 25-30...",
    "confidence": 0.9,
    "quota": {
      "plan_name": "Bronze Plan",
      "monthly_limit": 50,
      "used_this_month": 12,
      "remaining": 38,
      "resets_at": "2026-04-01T00:00:00.000Z"
    }
  }
}
```

**Quota exceeded (429):**

```json
{
  "success": false,
  "message": "Monthly AI search limit reached. You have used all 5 searches for this month. Please use standard filters to search, or upgrade your plan for more AI searches.",
  "data": {
    "quota": {
      "plan_name": "Free Plan",
      "monthly_limit": 5,
      "used_this_month": 5,
      "remaining": 0,
      "resets_at": "2026-04-01T00:00:00.000Z"
    },
    "upgrade_url": "/plans"
  }
}
```

### No Subscription = Free Plan

If a user has no active subscription (or their subscription is expired/canceled), the system defaults to the **Free Plan** quota (5 searches/month) rather than blocking them entirely.

### Schema Change

One column added to the existing `partner_admin_payment_plans` table:

```sql
ALTER TABLE partner_admin_payment_plans
  ADD COLUMN max_ai_searches_per_month INT NOT NULL DEFAULT 5
  AFTER search_level;
```

This follows the same pattern as `max_bg_checks_per_month`, `max_exports_per_month`, and `max_views_per_day`.

### Stored Procedure: `ai_search_get_quota`

All quota logic lives in the database — no hardcoded plan limits in code.

```sql
CALL ai_search_get_quota(p_account_id);
```

**Returns one row:**

| Column | Type | Description |
|---|---|---|
| `plan_name` | VARCHAR(50) | e.g. "Bronze Plan" or "Free Plan" (fallback) |
| `monthly_limit` | INT | `-1` = unlimited |
| `used_this_month` | INT | COUNT from `ai_search_log` for current month |

**Logic:**
1. Look up active subscription for `p_account_id` → get plan
2. If none found → fall back to `plan_key = 'free'` from `partner_admin_payment_plans`
3. Count this month's searches from `ai_search_log`
4. Return all three values

> **Note:** `partner_admin_payment_plans` and `partner_admin_subscriptions` are **end-user** tables (not partner/org tables). Partner-level subscriptions are a future feature.

### Implementation Files

| File | Change |
|---|---|
| `ai_search_get_quota` SP | **New** — quota logic in DB (subscription lookup + free fallback + usage count) |
| `src/services/aiSearch/quotaChecker.ts` | **New** — thin wrapper, calls SP, computes `remaining` and `resets_at` |
| `src/interfaces/aiSearch.interface.ts` | Add `IQuotaStatus` interface |
| `src/controllers/aiSearch.controller.ts` | Add quota check before search + append quota to response |
| `src/routes/aiSearch.routes.ts` | Update Swagger for 429 + quota in response |
| `src/__tests__/aiSearch/quotaChecker.test.ts` | **New** — 10 quota tests |
| `src/__tests__/aiSearch/aiSearchController.test.ts` | 5 new quota-related tests (108 total) |

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
