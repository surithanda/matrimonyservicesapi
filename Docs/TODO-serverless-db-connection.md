# TODO: Serverless Database Connection Fix

> **Created**: 2026-03-16  
> **Status**: Planned  
> **Priority**: High  
> **Affects**: `matrimonyservicesapi` deployed on Vercel

---

## Problem

The API is deployed on **Vercel serverless functions** (`@vercel/node`) but uses a traditional **persistent connection pool** (`mysql2/promise` with `connectionLimit: 20`). This causes:

1. **Zombie pools** — each cold start creates a new 20-connection pool; frozen instances hold stale connections
2. **ECONNRESET / PROTOCOL_CONNECTION_LOST** — thawed Lambda instances try to use server-side-killed connections
3. **Connection exhaustion** — concurrent invocations multiply connections (20 × N instances), hitting Azure MySQL's `max_connections` cap
4. **keepAlive is counterproductive** — `enableKeepAlive: true` keeps dead connections alive in frozen instances

### Current Config (`src/config/database.ts`)

```typescript
connectionLimit: 20,
enableKeepAlive: true,
keepAliveInitialDelay: 10000,
```

### Impact

- 99 call sites across 19 files use `pool.getConnection()` or `pool.execute()`
- Intermittent connection errors in production under moderate load

---

## Options Evaluated

### Option A: PlanetScale (MySQL-compatible, serverless-native)

| Aspect | Details |
|---|---|
| Protocol | HTTP-based (`@planetscale/database`), no TCP sockets |
| Zombie pools | Impossible — stateless HTTP requests |
| Stored Procs | ❌ **NOT SUPPORTED** (Vitess engine) |
| Transactions | Limited (interactive txns require paid Boost) |
| Migration effort | 🔴 Very High — rewrite all 40+ `CALL sp_name(...)` patterns |
| Cost | Free tier → $39+/mo (Scaler) |

**Verdict: ❌ REJECTED** — Our codebase is heavily stored-procedure-based. PlanetScale's Vitess engine does not support `CALL` syntax. Migration would require rewriting the entire data access layer.

### Option B1: Serverless-safe `mysql2` config ✅ RECOMMENDED

| Aspect | Details |
|---|---|
| Change scope | Only `src/config/database.ts` — all 99 call sites untouched |
| Stored procs | ✅ Fully supported |
| Zombie pools | Mitigated — pool size 1, short idle timeout, connection validation |
| Cold start latency | ~80ms (TCP+TLS handshake) |
| Cost | $0 additional |
| Migration effort | 🟢 Minimal — one file change |

### Option B2: Connection Proxy (ProxySQL / Azure Flexible Server pooling)

| Aspect | Details |
|---|---|
| How it works | Proxy holds warm pool; Lambda opens short-lived connection to proxy |
| Stored procs | ✅ Fully supported |
| Migration effort | 🟢 Config change (`DB_HOST` → proxy endpoint) |
| Cost | Azure Flexible Server pooling: free; standalone ProxySQL: needs a VM |

**Verdict: Consider as follow-up if B1 is insufficient under high concurrency.**

### Option C: Neon / Supabase (PostgreSQL)

**Verdict: ❌ REJECTED** — Requires full MySQL → PostgreSQL migration including all stored procedures. Not viable.

---

## Chosen Approach: Option B1

### Changes Required

**File**: `src/config/database.ts`

```typescript
// BEFORE (long-lived server pattern)
const dbConfig = {
  connectionLimit: 20,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // ...
};

// AFTER (serverless-safe pattern)
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

const dbConfig = {
  // ... existing fields ...
  connectionLimit: isServerless ? 1 : 20,
  maxIdle: isServerless ? 0 : 10,
  idleTimeout: isServerless ? 60000 : 300000,
  enableKeepAlive: !isServerless,
  keepAliveInitialDelay: 10000,
  // ...
};
```

### Key Principles

1. **Pool of 1** — each Lambda instance holds at most 1 real connection
2. **No keepAlive** — prevents holding dead connections in frozen instances
3. **Short idle timeout** — connections killed quickly when unused
4. **maxIdle: 0** — don't retain idle connections in the pool
5. **Auto-detect serverless** — use `VERCEL` env var so local dev still uses full pool
6. **Skip `testConnection()` in serverless** — avoid blocking cold start with a connection test that may timeout

### Additional Considerations

- Remove `process.exit(1)` in `testConnection()` for serverless — it kills the Lambda
- Set MySQL server-side `wait_timeout` low (60s) to clean up from the server side
- Consider adding `pool.on('error')` handler for graceful error logging

---

## Comparison Summary

| | PlanetScale | mysql2 serverless config | Connection Proxy |
|---|---|---|---|
| Fixes zombie pools | ✅ | ✅ | ✅ |
| Stored proc support | ❌ | ✅ | ✅ |
| Migration effort | 🔴 Very High | 🟢 1 file | 🟢 Config change |
| Cold start latency | ~5ms (HTTP) | ~80ms (TCP+TLS) | ~50ms |
| Cost | $39+/mo | $0 | $0–$20/mo |
| Transactions | Limited | ✅ Full | ✅ Full |
| SP calls work | ❌ No | ✅ Yes | ✅ Yes |

---

## Implementation Checklist

- [ ] Update `src/config/database.ts` with serverless-safe pool config
- [ ] Auto-detect serverless environment via `process.env.VERCEL`
- [ ] Guard `testConnection()` / `process.exit(1)` for serverless
- [ ] Add `pool.on('error')` handler for connection error logging
- [ ] Test locally with full pool (dev mode unchanged)
- [ ] Deploy to Vercel and verify no connection errors under load
- [ ] (Future) Evaluate Azure MySQL Flexible Server pooling if needed at scale
