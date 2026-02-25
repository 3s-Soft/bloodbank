# Features

This file is the feature catalog for the Blood Bank platform.

## Status Legend
- [x] Implemented in the current codebase
- [ ] Not implemented yet (possible future feature)

---

## Implemented Features

### Multi-Organization Platform
- [x] Organization-scoped URLs (`/[orgSlug]/...`)
- [x] Organization-level branding (name, color, logo, contact details)
- [x] Organization-specific donor and request data scoping
- [x] Public organization request flow (`/organizations/new`)
- [x] Super admin organization approval/rejection workflow
- [x] Super admin organization CRUD (create, edit, delete, activate/deactivate)

### Authentication and Roles
- [x] NextAuth JWT session authentication
- [x] Phone + password login provider
- [x] Email + password login provider
- [x] Google sign-in (Firebase + NextAuth bridge)
- [x] Role model (`donor`, `patient`, `volunteer`, `admin`, `super_admin`)
- [x] Organization-aware login redirect to org dashboard

### Donor System
- [x] Donor registration per organization
- [x] Donor profile fields (blood group, district, upazila, village, last donation)
- [x] Donor availability tracking
- [x] Donor verification workflow
- [x] Public donor discovery page
- [x] Donor filtering by blood group and location
- [x] Donor management dashboard page
- [x] Bulk verify/unverify donors
- [x] Donor search in dashboard
- [x] Donor export to CSV
- [x] Donor export to JSON

### Blood Request System
- [x] Public blood request submission
- [x] Urgency levels (`normal`, `urgent`, `emergency`)
- [x] Request status lifecycle (`pending`, `fulfilled`, `canceled`)
- [x] Request listing by organization
- [x] Request filters (status, urgency, search)
- [x] Request management dashboard page
- [x] Reopen fulfilled/canceled requests
- [x] Request export to CSV
- [x] Request export to JSON

### Admin and Analytics
- [x] Organization dashboard overview
- [x] Organization analytics endpoint (`/api/org/analytics`)
- [x] Blood group distribution analytics
- [x] Urgency distribution analytics
- [x] District and upazila analytics
- [x] Recent donors and recent requests panels
- [x] Fulfillment and verification rate indicators
- [x] Super admin dashboard overview
- [x] Super admin analytics endpoint (`/api/admin/analytics`)
- [x] Platform-level org performance metrics

### User Management and Settings
- [x] Organization user management page
- [x] User search and role filtering
- [x] Add organization users
- [x] Update user roles
- [x] Delete users
- [x] Organization settings page
- [x] Live branding preview in settings
- [x] Custom color picker for org theme

### UX, Internationalization, and Platform
- [x] Theme toggle (light/dark/system)
- [x] Language toggle (English/Bangla)
- [x] Reusable UI component set (button, card, input, etc.)
- [x] Toast notifications for actions/errors
- [x] Mobile-responsive layouts
- [x] PWA setup (installable)
- [x] Offline support via service worker config

### API Surface (Implemented)
- [x] `/api/auth/[...nextauth]`
- [x] `/api/donors`, `/api/donors/register`, `/api/donors/verify`
- [x] `/api/requests`, `/api/requests/new`, `/api/requests/status`
- [x] `/api/org/stats`, `/api/org/analytics`, `/api/org/settings`
- [x] `/api/org/users`, `/api/org/users/[id]`
- [x] `/api/admin/stats`, `/api/admin/analytics`
- [x] `/api/admin/organizations`, `/api/admin/organizations/[id]`, `/api/admin/organizations/[id]/verify`
- [x] `/api/organizations` (public org request/list endpoint)

---

## Planned Enhancements

We are transitioning our feature roadmap to concrete issues. Please check [TODO.md](TODO.md) for specific tasks you can contribute to.

---