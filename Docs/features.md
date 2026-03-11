# MATA Matrimony — Feature Documentation

> **Platform:** MATA Matrimony  
> **API:** `matrimonyservicesapi` (Node.js / TypeScript / Express — deployed on Vercel)  
> **UI:** `matamatrimony` (Next.js 14 App Router — deployed on Vercel)  
> **Database:** MySQL (stored procedures for all data access)  
> **Last Updated:** March 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication & Security](#2-authentication--security)
3. [Account Management](#3-account-management)
4. [Profile Management](#4-profile-management)
5. [Photo Management (Azure)](#5-photo-management-azure)
6. [Search & Discovery](#6-search--discovery)
7. [Favourites](#7-favourites)
8. [Recommendations](#8-recommendations)
9. [Payments (Stripe)](#9-payments-stripe)
10. [Metadata / Lookup Tables](#10-metadata--lookup-tables)
11. [API Security & Middleware](#11-api-security--middleware)
12. [Image Processing Pipeline](#12-image-processing-pipeline)
13. [UI Pages & Navigation](#13-ui-pages--navigation)
14. [Database Design Conventions](#14-database-design-conventions)

---

## 1. Architecture Overview

```
Browser (Next.js UI)
        │  HTTPS + X-API-Key header + JWT Bearer token
        ▼
Express API (Vercel Serverless)
        │
        ├── JWT Authentication Middleware
        ├── API Key Validation Middleware
        ├── Rate Limiter Middleware
        │
        ├── MySQL (via Stored Procedures — eb_* / partner_admin_*)
        ├── Azure Blob Storage (profile photos)
        ├── Azure Blob Storage (thumbnails)
        └── Stripe (payments)
```

**Key conventions:**
- All database operations go through **stored procedures** (no raw INSERT/UPDATE/DELETE queries except for `relative_path` update)
- All SP results are checked for `status: 'success'` before proceeding
- All photos go through an **image processing pipeline** before being stored in Azure

---

## 2. Authentication & Security

### Features
| Feature | Endpoint | Description |
|---|---|---|
| Login | `POST /auth/login` | Validates credentials and sends a 6-digit OTP to the user's email |
| OTP Verification | `POST /auth/verify-otp` | Verifies OTP and returns a signed JWT access token |
| Resend OTP | `POST /auth/resend-otp` | Sends a fresh OTP (rate-limited) |
| Forgot Password | `POST /auth/forgot-password` | Sends a password-reset OTP to the user's email |
| Reset Password | `POST /auth/reset-password` | Resets password using OTP + new password |
| Change Password | `POST /auth/change-password` | Changes password while authenticated (requires current password) |
| Logout | `POST /auth/logout` | Clears the server-side session / HttpOnly cookie |

### Security Layers
- **API Key** (`X-API-Key` header) — required on every request
- **JWT Bearer Token** — required on all protected routes; returned after OTP verification
- **Rate Limiter** — applied to all auth endpoints to prevent brute-force attempts
- **Password Policy** — minimum 8 characters, requires uppercase, lowercase, number, and special character

### OTP Flow
```
Login → credentials validated → 6-digit OTP emailed → verify-otp → JWT issued
```

---

## 3. Account Management

### Features
| Feature | Endpoint | Description |
|---|---|---|
| Register | `POST /account/register` | Creates a new user account with personal information |
| Get Details | `POST /account/details` | Returns full account details for the logged-in user |
| Update Account | `PUT /account/update` | Updates personal information (name, phone, address, etc.) |
| Upload Photo | `POST /account/photo` | Uploads a profile/account photo |
| Get Photo | `GET /account/photo` | Returns the account photo URL |

### Registration Fields
Email, password, phone (primary + optional secondary), name, date of birth, gender, address (line1, line2, city, state, zip, country), optional driving license, secret question/answer, optional photo.

---

## 4. Profile Management

Profiles are the core entity of the matrimony platform. A user account can have **multiple profiles** (e.g., registering on behalf of a family member). Each profile has the following sections:

### 4.1 Personal Details
- Full name, date of birth, gender, religion, mother tongue
- Marital status, physical attributes (height, weight, complexion)
- CRUD via: `GET/POST/PUT/DELETE /profile/personalDetails`

### 4.2 Contact / Primary Contact
- Phone numbers, email addresses, address details
- CRUD via: `GET/POST/PUT/DELETE /profile/addressDetails`

### 4.3 Education
- Degree, institution, field of study, graduation year
- Multiple entries supported per profile
- CRUD via: `GET/POST/PUT/DELETE /profile/educationDetails`

### 4.4 Employment / Profession
- Employer, job title, industry, annual income, employment type
- Multiple entries supported per profile
- CRUD via: `GET/POST/PUT/DELETE /profile/employmentDetails`

### 4.5 Property
- Property type, ownership status, location details
- CRUD via: `GET/POST/PUT/DELETE /profile/propertyDetails`

### 4.6 Family
- Father/mother details, siblings, family type (nuclear/joint), family values
- CRUD via: `GET/POST/PUT/DELETE /profile/family-referenceDetails`

### 4.7 Lifestyle
- Diet preference, smoking/drinking habits, exercise frequency
- CRUD via: `GET/POST/PUT/DELETE /profile/lifestyleDetails`

### 4.8 Hobbies
- Tag-based hobby selection from lookup table
- Add/remove individual hobbies: `POST /profile/hobby`, `DELETE /profile/hobby`
- Get all: `POST /profile/hobbiesDetails`

### 4.9 Partner Preferences
- Preferred age range, height, religion, education, location
- CRUD via: `GET/POST/PUT /profile/userPreferences`

### 4.10 References
- Contact references for profile verification
- CRUD via profile references endpoints

### 4.11 Profile Completion Tracking
- Endpoint: `GET /profile/profile-completion/:profile_id`
- Returns a percentage score and which sections are incomplete
- Displayed in the UI as a progress indicator

### 4.12 Complete Profile
- `POST /profile/completeProfile` — returns all sections in a single call

---

## 5. Photo Management (Azure)

> Profile photos are stored in **Azure Blob Storage** and served with time-limited **SAS (Shared Access Signature) URLs**.

### Photo Slots
Each profile has exactly **7 fixed photo slots**, one per category:

| Slot | Caption | `photo_type` (lookup_table id) | SP Limit |
|---|---|---|---|
| 1 | Clear Headshot | 450 | Max **1** per profile |
| 2 | Full-body shot | 451 | Max **1** per profile |
| 3 | Casual or Lifestyle Shot | 452 | Max **1** per profile |
| 4 | Family Photo | 453 | Max **1** per profile |
| 5 | Candid or Fun Moment | 454 | Max **1** per profile |
| 6 | Hobby or Activity Photo | 455 | Max **1** per profile |
| 7 | Other | 456 | Max **2** per profile |

### API Endpoints
| Action | Endpoint | Description |
|---|---|---|
| Get Photos | `POST /profiles/photos/get` | Returns all photos with time-limited SAS URLs and thumbnail SAS URLs |
| Upload / Replace | `POST /profiles/photos/upload` | Uploads a new photo or replaces an existing one (same caption = replace) |
| Delete | `POST /profiles/photos/delete` | Deletes photo from DB (via SP) and Azure Blob Storage |
| Set Primary | `POST /profiles/photos/set-primary` | Promotes a photo to the primary (Clear Headshot / type 450) slot |

### Upload / Replace Flow
```
1.  Query existing photos for the profile (eb_profile_photo_get)
2a. Caption match found (REPLACE):
      → Call eb_profile_photo_delete SP  (drops count: N → N-1)
      → Upload new file to Azure         (same blob name → auto-overwrites)
2b. No match (NEW):
      → Enforce max-7 limit before upload
      → Upload new file to Azure
3.  Process image (watermark + thumbnail generation)
4.  Call eb_profile_photo_create SP
      → Check status === 'success'; on fail → delete Azure blob + return 400
5.  Update relative_path column in profile_photo table
6.  Return 201 success
```

### Delete Flow
```
1. Call eb_profile_photo_delete SP first (validates photo exists, logs activity)
2. If SP succeeds → delete blob (main + thumbnail) from Azure
```

### Azure Blob Naming Convention
```
{partner_id}/{profile_id}/{caption_slug}.jpg
{partner_id}/{profile_id}/{caption_slug}_thumb.jpg

Example: 2/17/casual_or_lifestyle_shot.jpg
         2/17/casual_or_lifestyle_shot_thumb.jpg
```

### Image Processing Pipeline
Every uploaded photo is processed **before** being stored in Azure:
1. **Resize** — standardized dimensions
2. **Watermark** — "MataMatrimony" text overlay applied
3. **Thumbnail** — smaller version generated for grid views
4. **Format** — all outputs forced to JPEG regardless of input format (PNG, WebP, etc.)

### `resolveBlobName` Helper
Used in all get/delete operations. Priority order:
1. `relative_path` column — always canonical (set after every upload)
2. Full `url` column — extract blob portion, force `.jpg` extension (handles legacy truncated URLs)
3. Raw value — use as blob path, force `.jpg`

### Stored Procedures Used
| SP | Purpose |
|---|---|
| `eb_profile_photo_get(profile_id)` | Get all photos for a profile |
| `eb_profile_photo_create(profile_id, url, photo_type, caption, description, created_user)` | Insert a new photo record |
| `eb_profile_photo_delete(photo_id, profile_id, user_deleted)` | Hard delete with validation and activity log |

---

## 6. Search & Discovery

### Features
- Full-text profile search with filters: age, gender, religion, education, location, income range
- Endpoint: `POST /profile/search`
- Returns paginated results with primary photo thumbnail
- Profile view tracking: `POST /profile/track-view` — records who viewed which profile

### Browse All Profiles
- `POST /profile/allProfiles` — returns all active profiles (admin/browse use case)
- `POST /profile/getProfilesByAccountId` — returns all profiles owned by the current account

---

## 7. Favourites

| Feature | Endpoint | Description |
|---|---|---|
| Add Favourite | `POST /profile/favourite` | Adds a profile to the user's favourites list |
| Get Favourites | `POST /profile/favourites` | Returns all favourite profiles |
| Remove Favourite | `DELETE /profile/favourite` | Removes a profile from favourites |

---

## 8. Recommendations

- `GET /dashboard/recommendations` (UI route)
- Returns suggested profiles based on the user's partner preferences (age, religion, education, location)

---

## 9. Payments (Stripe)

> Payments use **Stripe Checkout** (redirect-based flow) with webhook verification.

### Features
| Feature | Endpoint | Description |
|---|---|---|
| Create Session | `POST /stripe/create-session` | Creates a Stripe Checkout session and returns the redirect URL |
| Verify Session | `GET /stripe/verify-session?session_id=cs_xxx` | Polls session status after Stripe redirect (safety check only — webhook is authoritative) |
| Webhook | Stripe → API | Stripe sends payment events; webhook updates subscription/payment status in DB |

### Payment Flow
```
User clicks "Subscribe" in UI
→ POST /stripe/create-session → Stripe Checkout URL returned
→ User completes payment on Stripe hosted page
→ Stripe redirects to /payments?session_id=...
→ GET /stripe/verify-session (optimistic UI update)
→ Stripe sends webhook → DB updated (authoritative)
```

---

## 10. Metadata / Lookup Tables

- `GET /metadata/*` — serves lookup data used to populate dropdown fields in the UI
- Categories include: religion, mother tongue, marital status, education level, employment type, photo types, hobbies, etc.
- All values are stored in the `lookup_table` MySQL table with `category` and `id` fields
- Photo types specifically use `category = 'photo_type'` with IDs 450–456

---

## 11. API Security & Middleware

| Middleware | Applied To | Purpose |
|---|---|---|
| `validateApiKey` | All routes | Validates `X-API-Key` header — rejects unknown clients |
| `authenticateJWT` | All protected routes | Verifies Bearer token — populates `req.user` |
| `authLimiter` | Auth routes | Rate limits login/OTP/password endpoints |
| `uploadProfilePhotoMiddleware` | `/profiles/photos/upload` | Multer middleware — validates file type (jpeg/png/webp) and size (max 5MB) |

---

## 12. Image Processing Pipeline

**File:** `src/utils/imageProcessor.util.ts`

The `processImage(buffer, null, "MataMatrimony")` function performs:
1. Decode input (accepts JPEG, PNG, WebP)
2. Resize to standard profile photo dimensions
3. Apply "MataMatrimony" watermark text
4. Generate full-size output as JPEG buffer
5. Generate thumbnail as JPEG buffer
6. Return `{ main: Buffer, thumbnail: Buffer }`

**Azure utility:** `src/utils/azure.util.ts`
- `uploadToBlobStorage(buffer, blobName, contentType)` — uploads to configured container
- `deleteFromBlobStorage(blobName)` — deletes blob
- `generateSASUrl(blobName, hours)` — returns a time-limited read SAS URL
- `AZURE_CONFIG.generateBlobName(partnerId, profileId, filename, caption)` — deterministic blob name from caption slug

---

## 13. UI Pages & Navigation

**Framework:** Next.js 14 App Router  
**State:** Redux Toolkit (`store/features/`)  
**HTTP Client:** Axios instance with JWT auto-attach (`lib/axios.ts`)

### Auth Pages (`app/(auth)/`)
| Page | Route | Description |
|---|---|---|
| Login | `/login` | Email + password → OTP flow |
| Register | `/register` | New account registration form |
| OTP Verification | `/otp` | 6-digit OTP entry |
| Forgot Password | `/forgotpassword` | Sends reset OTP via email |
| Reset Password | `/reset-password` | OTP + new password |

### Dashboard (`app/(dashboard)/`)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Overview with primary profile photo, completion %, recent activity |
| Search | `/search` | Profile search with filters |
| Profiles | `/profiles` | Browse all profiles |
| Favourites | `/favourites` | Saved favourite profiles |
| Recommendations | `/recommendations` | Suggested matches |
| Payments | `/payments` | Subscription management |
| Account | `/account` | Account details and settings |
| Change Password | `/changepassword` | Password change form |
| Settings | `/settings` | App settings |

### Profile Edit Tabs (`app/(dashboard)/[mode]/`)
Each tab is a separate route segment under the profile editing layout:

| Tab | Route | Sections |
|---|---|---|
| Primary Contact | `/[mode]/primarycontact` | Names, DOB, gender, phone, address |
| Education | `/[mode]/education` | Degrees, institution, field of study |
| Employment / Profession | `/[mode]/profession`, `/[mode]/employment` | Job title, employer, income |
| Family | `/[mode]/family` | Parents, siblings, family type |
| Hobbies | `/[mode]/hobbies` | Tag-based hobby selection |
| Lifestyle | `/[mode]/lifestyle` | Diet, habits |
| Property | `/[mode]/property` | Property ownership details |
| Photos | `/[mode]/photos` | 7-slot photo gallery (upload, replace, delete, set primary) |
| Partner Preferences | `/[mode]/partner` | Preferred partner criteria |
| References | `/[mode]/references` | Contact references |

---

## 14. Database Design Conventions

- **All reads/writes use stored procedures** named `eb_profile_*` for core tables
- SPs return a standard result set:
  ```json
  { "status": "success" | "fail", "error_type": null, "error_message": null }
  ```
- **`profile_photo` table** (singular) — core photo table
  - `profile_photo_id` — primary key
  - `url` — full Azure blob URL (`VARCHAR(500)` after the March 2026 SP fix)
  - `relative_path` — short blob path (e.g., `2/17/clear_headshot.jpg`) — used as canonical blob reference
  - `caption` — matches `lookup_table.name` for `category = 'photo_type'`
  - `photo_type` — foreign key to `lookup_table.id`
  - `softdelete` — soft-delete flag (SP-managed)
- **`lookup_table`** — central reference table for all dropdown/enum values
  - Fields: `id`, `name`, `description`, `category`, `isactive`
- **`activity_log`** — all SP operations write audit entries with timing and user info
- **`profile_personal`** — root profile table; all other profile tables reference `profile_id`

---

## Known Bugs Fixed (March 2026)

| Bug | Root Cause | Fix Applied |
|---|---|---|
| Photos not displaying (404) | SP `p_url VARCHAR(100)` truncated long URLs | SP updated to `VARCHAR(500)`; `resolveBlobName` handles legacy truncated rows |
| Replace creating duplicates | Direct SQL used wrong table name `profile_photos` (plural) | All deletes now use `eb_profile_photo_delete` SP |
| Upload silently succeeding but not saving to DB | SP result never checked | `checkSpResult()` added; on fail: Azure blobs cleaned up + 400 returned |
| Delete button doing nothing | `window.confirm()` silently blocked in Next.js/Vercel | Removed `confirm()`; direct API call with toast feedback |
| Photo type collisions (5 slots all = type 456) | Wrong type IDs in `FIXED_SLOTS` | Each slot now maps to its correct `lookup_table` ID (450–455) |
| Delete button throwing "photo_id required" | SP returns `profile_photo_id`; UI expected `photo_id` | Normalized in `getPhotos` response: `photo_id: p.profile_photo_id \|\| p.photo_id` |
