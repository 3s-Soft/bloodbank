# Project TODO & Real Issues 🛠️

This document lists specific, actionable issues and technical debt that need addressing. These are "real" issues derived from the current codebase.

## 🛡️ Security & Authentication

### 1. Implement Proper Password Hashing
- **Issue**: `lib/authOptions.ts` currently has a demo bypass that allows any password if it matches a temporary string or is just ignored.
- **Task**: Use `bcryptjs` to hash passwords during registration and compare them during authorization.
- **Files**: `lib/authOptions.ts`, `api/donors/register/route.ts`

### 2. Global Route Protection Middleware
- **Issue**: There is no root `middleware.ts`. Authentication checks are performed manually in some components.
- **Task**: Create a root `middleware.ts` using `next-auth/middleware` to protect `/admin` and `/[orgSlug]/dashboard` routes centrally.
- **Files**: `middleware.ts` (New)

### 3. SMS/OTP Verification
- **Issue**: The system uses phone numbers as IDs but lacks actual verification.
- **Task**: Integrate a local Bangladeshi SMS gateway (like SSLWireless or similar) to verify phone numbers during registration.

## 📊 API & Data Accuracy

### 4. Dynamic Village Coverage Calculation
- **Issue**: The `api/org/stats` endpoint currently returns a hardcoded value of `45` for `villagesCovered`.
- **Task**: Update the logic to count unique `village` fields from the `DonorProfile` model for the specific organization.
- **Files**: `app/api/org/stats/route.ts`

### 5. Remove Mock Stat Fallbacks
- **Issue**: The stats API returns strings like "250+" or "1,200+" if no data is found, which can be misleading.
- **Task**: Return `0` or actual counts, and handle empty states gracefully in the UI.
- **Files**: `app/api/org/stats/route.ts`

## 🎨 UI & UX Improvements

### 6. Location Autocomplete/Dropdowns
- **Issue**: Districts and Upazilas are currently free-text inputs, leading to data inconsistency (e.g., "Dhaka" vs "dhaka").
- **Task**: Replace text inputs with searchable dropdowns using a standardized list of Bangladesh districts and upazilas.
- **Files**: `app/organizations/new/page.tsx`, `app/[orgSlug]/register/page.tsx`

### 7. TypeScript Session Augmentation
- **Issue**: The codebase uses `(session.user as any)` frequently because the NextAuth Session type isn't extended.
- **Task**: Create a `types/next-auth.d.ts` file to properly augment the `Session` and `User` interfaces with `role` and `id` tags.

## 📱 Mobile & PWA

### 8. Push Notifications for Urgent Requests
- **Issue**: PWA is installable but users aren't notified when a new "Emergency" blood request is posted in their area.
- **Task**: Implement Web Push API to send notifications to donors in the same district/upazila as a new emergency request.

---
*Found a new issue? Use our [Issue Templates](.github/ISSUE_TEMPLATE) to report it!*
