# Payment & Subscription — Gaps and TODO

> Audit of the current payment pipeline: what exists, what's broken, and what needs to be built.

---

## 1. Current Tables

| Table | Rows | Purpose | Status |
|---|---|---|---|
| `partner_admin_payment_plans` | 4 | Plan definitions (Free/Bronze/Silver/Gold) with quotas | ✅ Working |
| `partner_admin_subscriptions` | 1 | Active subscription state per end user (plan, status, period) | ⚠️ Not populated from payments |
| `stripe_payment_intents` | 18 | Raw Stripe Checkout session log (amount, billing address, status) | ✅ Being written to |
| `partner_admin_payment_history` | 0 | Normalized payment history (has `payment_type` enum, Stripe IDs) | ❌ Never written to |

> **Naming note:** `partner_admin_*` tables are for **end users**, not partner organizations. Future TODO: rename for clarity.

---

## 2. Current Payment Flow (What Happens Today)

```
End User clicks "Subscribe to Bronze Plan"
  │
  ├─ 1. Frontend calls POST /api/stripe/checkout
  │     → stripe.repository.ts → createCheckoutSession()
  │     → Calls eb_payment_create() SP
  │     → Inserts into stripe_payment_intents (status='unpaid')
  │     → Returns Stripe Checkout URL
  │
  ├─ 2. User pays on Stripe Checkout page
  │
  ├─ 3a. Stripe webhook fires "checkout.session.completed"
  │     → handleWebhookEvent()
  │     → Calls eb_payment_update_status(client_ref_id, 'paid', 'webhook')
  │     → Updates stripe_payment_intents.payment_status = 'paid'
  │     → ❌ STOPS HERE — no subscription created
  │
  └─ 3b. Frontend calls GET /api/stripe/verify-session (fallback for local dev)
        → retrieveSession()
        → Calls eb_payment_update_status(client_ref_id, 'paid', 'verify-session')
        → Updates stripe_payment_intents.payment_status = 'paid'
        → ❌ STOPS HERE — no subscription created
```

### What's Missing After Payment

```
  ❌ 4. No call to partner_admin_upsert_subscription()  ← SP EXISTS but never called
  ❌ 5. No call to partner_admin_record_payment()        ← SP EXISTS but never called
  ❌ 6. No plan_id passed to checkout — can't know which plan was purchased
  ❌ 7. No partner_id/profile_id context in checkout flow
```

---

## 3. Existing SPs (Built but Unused)

| SP | Purpose | Called? |
|---|---|---|
| `eb_payment_create` | Insert into `stripe_payment_intents` | ✅ Yes — on checkout |
| `eb_payment_update_status` | Update `stripe_payment_intents.payment_status` | ✅ Yes — on webhook/verify |
| `partner_admin_upsert_subscription` | Create/update `partner_admin_subscriptions` (with UPSERT) | ❌ **Never called** |
| `partner_admin_record_payment` | Insert into `partner_admin_payment_history` | ❌ **Never called** |
| `partner_admin_get_subscription` | Get active subscription + plan details for account | ✅ Yes — used by quota checker |
| `partner_admin_get_payment_history` | Paginated payment history by partner/account/profile | ❌ No API route |
| `partner_admin_get_payment_plans` | List available plans | ❌ No API route |
| `partner_admin_get_payment_metrics` | Dashboard payment metrics | ❌ No API route |
| `partner_admin_get_stripe_customer` | Get Stripe customer ID for partner | ❌ Unknown |
| `partner_admin_set_stripe_customer` | Set Stripe customer ID on partner | ❌ Unknown |
| `partner_admin_get_subscriptions_by_partner` | List all subscriptions for a partner | ❌ No API route |

---

## 4. Table Relationship Gap

```
Current (BROKEN):
  stripe_payment_intents ──(no FK)──> partner_admin_subscriptions
  partner_admin_payment_history (empty, unused)

Expected:
  stripe_payment_intents (raw Checkout log)
       │
       │ on payment success (webhook)
       ▼
  partner_admin_payment_history (normalized, has payment_type + Stripe IDs)
       │
       │ if payment_type = 'subscription'
       ▼
  partner_admin_subscriptions (active plan state, quotas enforced from here)
       │
       └──> partner_admin_payment_plans (plan limits)
```

---

## 5. Fixes Required (Priority Order)

### P0 — Critical (Payments don't activate subscriptions)

- [ ] **5.1** Pass `plan_id` through the checkout flow
  - `IStripeBody` needs `plan_id` field
  - `createCheckoutSession()` must store `plan_id` in Stripe session metadata
  - Or store in `stripe_payment_intents` (add `plan_id` column)

- [ ] **5.2** After successful payment, call `partner_admin_upsert_subscription()`
  - In `handleWebhookEvent()` — after `eb_payment_update_status('paid')`
  - Also in `retrieveSession()` fallback
  - Needs: `partner_id`, `account_id`, `profile_id`, `plan_id`, `stripe_subscription_id`, `stripe_customer_id`, period dates
  - Decide: derive `plan_id` from Stripe metadata or from `stripe_payment_intents`

- [ ] **5.3** After successful payment, call `partner_admin_record_payment()`
  - Insert into `partner_admin_payment_history` for proper financial records
  - Needs: all Stripe IDs, `payment_type='subscription'`, `amount_cents`, `status='succeeded'`

### P1 — Important (Missing API routes)

- [ ] **5.4** `GET /api/plans` — List available payment plans
  - Calls `partner_admin_get_payment_plans`
  - Public or auth-required (for pricing page)

- [ ] **5.5** `GET /api/subscription/usage` — End-user subscription dashboard
  - Returns current plan + all quota usage (AI searches, views, exports, bg checks, profiles)
  - Calls `partner_admin_get_subscription` + usage counts

- [ ] **5.6** `GET /api/payments/history` — Payment history for end user
  - Calls `partner_admin_get_payment_history`
  - Paginated, filterable

### P2 — Improvements

- [ ] **5.7** Add `plan_id` column to `stripe_payment_intents`
  - So we can trace which plan a payment was for

- [ ] **5.8** Stripe Checkout mode should be `subscription` not `payment`
  - Current: `mode: "payment"` — one-time charge, no recurring billing
  - Expected: `mode: "subscription"` — creates Stripe subscription with recurring billing
  - This is why `stripe_subscription_id` is always NULL in `partner_admin_subscriptions`

- [ ] **5.9** Handle subscription lifecycle webhooks
  - `invoice.payment_succeeded` — renew subscription period
  - `invoice.payment_failed` — mark subscription as `past_due`
  - `customer.subscription.deleted` — mark as `canceled`
  - `customer.subscription.updated` — handle plan changes

- [ ] **5.10** Add index on `stripe_payment_intents.account_id`
  - Currently no index — will be slow for payment history lookups

### P3 — Future

- [ ] **5.11** Rename tables for clarity
  - `partner_admin_payment_plans` → `payment_plans` or `end_user_payment_plans`
  - `partner_admin_subscriptions` → `end_user_subscriptions`
  - `partner_admin_payment_history` → `end_user_payment_history`

- [ ] **5.12** Design partner-level subscription model
  - Separate tables for partner org billing
  - Different plans (by hosted profiles count, API calls, etc.)

- [ ] **5.13** Reconciliation: backfill subscriptions for existing paid users (accounts 54-59)
  - 18 payments exist with no subscriptions — need one-time data fix

---

## 6. Current Checkout `mode: "payment"` Problem

The checkout session uses `mode: "payment"` which creates a **one-time charge**:

```typescript
// stripe.repository.ts line 38
mode: "payment",  // ← one-time, not recurring
```

For subscription plans, this should be `mode: "subscription"` with a Stripe Price ID:

```typescript
// Expected for recurring subscriptions:
mode: "subscription",
line_items: [{
  price: plan.stripe_price_id,  // from partner_admin_payment_plans
  quantity: 1,
}],
```

The `partner_admin_payment_plans` table already has `stripe_product_id` and `stripe_price_id` columns — they're just not being used.

---

## 7. Summary

| What | Status |
|---|---|
| Plans table | ✅ Defined with quotas |
| Checkout creates Stripe session | ✅ Working |
| Payment recorded in DB | ✅ `stripe_payment_intents` |
| Webhook updates payment status | ✅ `eb_payment_update_status` |
| Payment activates subscription | ❌ **Broken — never called** |
| Payment history normalized | ❌ **Table empty — never written** |
| Recurring billing | ❌ **mode: "payment" not "subscription"** |
| Subscription lifecycle webhooks | ❌ **Not implemented** |
| End-user usage API | ❌ **Not built yet** |
| Plans listing API | ❌ **Not built yet** |
