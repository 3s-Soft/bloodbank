# Bangladesh Blood Bank 🩸

A community-powered, multi-tenant blood donation platform connecting blood donors with patients in rural areas of Bangladesh. Built with modern web technologies and designed for organizations to manage their own blood bank networks.

![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-Drizzle_ORM-4479A1?logo=mysql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwindcss)

---

## 🌟 Key Features

### Multi-Tenant Architecture
- **Organization-Scoped URLs**: Each organization gets its own branded blood bank (e.g., `/savar-blood-bank`, `/uttara-donors`)
- **Custom Branding**: Organizations can have custom primary colors, logos, and contact information
- **Isolated Data**: Donors and requests are scoped to their respective organizations

### Super Admin Dashboard
- **Platform-Wide Control**: Manage all organizations from `/admin`
- **Organization CRUD**: Create, edit, and delete blood bank organizations
- **Statistics Overview**: View total donors, requests, and fulfillment rates across all orgs
- **Branding Control**: Set primary colors and contact info per organization
- **Status Management**: Activate or deactivate organizations

### Donor Management
- **Donor Registration**: Simple, validated forms for donors to register with essential information
- **Donor Discovery**: Search donors by blood group, district, and upazila (sub-district)
- **Donor Verification**: Admin-controlled donor verification system
- **Availability Tracking**: Track donor availability status

### Blood Request System
- **Post Blood Requests**: Users can post urgent blood requests with detailed information
- **Urgency Levels**: Support for Normal, Urgent, and Emergency priority levels
- **Request Management**: Admins can update request status (Pending, Fulfilled, Canceled)
- **Filter by Status/Urgency**: Easy filtering of requests based on priority and status

### Admin Dashboard
- **Real-Time Statistics**: View total donors, active requests, lives helped, and villages covered
- **Donor Verification Panel**: Verify and manage donor profiles
- **Request Management**: Track and manage blood requests
- **Quick Action Buttons**: Fast access to common admin tasks

### Authentication & Security
- **Phone-Based Authentication**: Uses phone numbers as the primary identifier (common in rural Bangladesh)
- **NextAuth.js Integration**: Secure session management with JWT strategy
- **Role-Based Access**: Support for multiple user roles (Donor, Patient, Volunteer, Admin, Super Admin)

### Progressive Web App (PWA)
- **Offline Support**: Works offline for better accessibility in areas with poor connectivity
- **Installable**: Can be installed on mobile devices for a native-like experience

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript 5.x |
| **Database** | MySQL / MariaDB with Drizzle ORM |
| **Authentication** | NextAuth.js 4.x |
| **Styling** | Tailwind CSS 4.x |
| **Forms** | React Hook Form + Zod Validation |
| **Notifications** | Sonner (Toast notifications) |
| **Icons** | Lucide React |
| **PWA** | @ducanh2912/next-pwa |

---

### Architecture Notes

- **Layered data access.** API routes validate and authorize, services hold business rules and transactions, repositories own every SQL query, and `lib/db/schema.ts` is the single source of truth for types. Routes never write SQL.
- **Multi-tenancy.** Every request resolves `orgSlug` to an organization row and filters on `organization_id`; an organization id is never accepted from the client.
- **Firebase is push-only.** Cloud Messaging delivers urgent blood requests. All application data is in MySQL.
- **No realtime channel.** The requests dashboard polls every 15 seconds; the time-critical path (emergency alerts) goes over FCM push instead.

## 📁 Project Structure

```
bloodbank/
├── app/
│   ├── (auth)/                    # Auth route group (empty, uses /login)
│   ├── (dashboard)/               # Dashboard route group (empty, uses org-scoped)
│   ├── [orgSlug]/                 # Organization-scoped pages
│   │   ├── layout.tsx             # Org layout with Navbar & Footer
│   │   ├── page.tsx               # Org landing page
│   │   ├── dashboard/             # Admin dashboard
│   │   │   ├── page.tsx           # Dashboard overview
│   │   │   ├── donors/page.tsx    # Donor management
│   │   │   └── requests/page.tsx  # Request management
│   │   ├── donors/page.tsx        # Public donor discovery
│   │   ├── register/page.tsx      # Donor registration
│   │   └── requests/              # Blood requests
│   │       ├── page.tsx           # Requests listing
│   │       └── new/page.tsx       # New request form
│   ├── api/                       # API routes
│   │   ├── auth/[...nextauth]/    # NextAuth.js handler
│   │   ├── donors/                # Donor APIs
│   │   │   ├── route.ts           # GET: List donors
│   │   │   ├── register/route.ts  # POST: Register donor
│   │   │   └── verify/route.ts    # POST: Verify donor
│   │   ├── requests/              # Request APIs
│   │   │   ├── route.ts           # GET: List requests
│   │   │   ├── new/route.ts       # POST: Create request
│   │   │   └── status/route.ts    # POST: Update status
│   │   └── org/stats/route.ts     # GET: Organization stats
│   ├── login/page.tsx             # Global login page
│   ├── page.tsx                   # Main landing page
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── AuthProvider.tsx           # NextAuth session provider
│   ├── Navbar.tsx                 # Organization-aware navbar
│   ├── Footer.tsx                 # Organization-aware footer
│   └── ui/                        # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   ├── authOptions.ts             # NextAuth configuration
│   ├── orgUtils.ts                # Organization utilities
│   ├── context/
│   │   └── OrganizationContext.tsx  # Organization React context
│   ├── db/
│   │   ├── index.ts               # MySQL connection pool (serverless-shaped)
│   │   ├── schema.ts              # Drizzle tables — source of truth for types
│   │   └── enums.ts               # Enum values shared by schema and app
│   └── models/
│       ├── User.ts                # User & DonorProfile models
│       ├── BloodRequest.ts        # Blood request model
│       └── Organization.ts        # Organization model
├── scripts/
│   └── seed.ts                    # Database seeder
└── public/                        # Static assets
```

---

## 🗄 Database Schema

Defined in `lib/db/schema.ts` (Drizzle), which is the single source of truth — TypeScript
types are inferred from it, and migrations are generated from it with `npm run db:generate`.

| Table | Purpose | Notable constraints |
|-------|---------|---------------------|
| `organizations` | One row per tenant | `slug` unique |
| `users` | Accounts across all roles | `phone` and `email` unique; bcrypt `password` |
| `donor_profiles` | A person's donor record within one organization | **unique(`user_id`, `organization_id`)** — makes re-registration an update, not a duplicate |
| `blood_requests` | Requests, with status and urgency | indexed on (`organization_id`, `status`) |
| `blood_request_matches` | Donors matched to a request | composite primary key |
| `donations` | Donation history | drives points and badges |
| `events` | Organization events | |
| `audit_logs` | Administrative actions | actor always taken from the session |
| `feedback` | Submitted feedback | `organization_id` nullable (platform-level form) |
| `push_subscriptions` | FCM tokens with optional delivery filters | `token` unique |

All foreign keys cascade on delete, so removing an organization removes its donors,
requests, events, donations and audit trail with it.

**Passwords are bcrypt-hashed with no plaintext fallback.** An earlier build compared the
submitted password against the stored value when the hash comparison failed, which allowed
signing in as any account whose password had been stored unhashed; that path has been removed.

## 🔌 API Endpoints

### Donors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/donors?orgSlug=X&bloodGroup=Y&district=Z&upazila=W` | List donors with optional filters |
| `POST` | `/api/donors/register` | Register a new donor |
| `POST` | `/api/donors/verify` | Verify/unverify a donor (admin) |

### Blood Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/requests?orgSlug=X&urgency=Y&status=Z` | List requests with optional filters |
| `POST` | `/api/requests/new` | Create a new blood request |
| `POST` | `/api/requests/status` | Update request status |

### Organization
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/org/stats?orgSlug=X` | Get organization statistics |

### Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/organizations` | List all organizations |
| `POST` | `/api/admin/organizations` | Create new organization |
| `GET` | `/api/admin/organizations/[id]` | Get organization by ID with stats |
| `PUT` | `/api/admin/organizations/[id]` | Update organization |
| `DELETE` | `/api/admin/organizations/[id]` | Delete organization |
| `GET` | `/api/admin/stats` | Get platform-wide statistics |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/[...nextauth]` | NextAuth.js authentication handler |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MySQL 8 or MariaDB 10.2+ database (local, or shared hosting such as Hostinger)
- npm or yarn

### 1. Run with Docker (Recommended)
The easiest way to get started is using Docker Compose:

```bash
docker compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 2. Manual Setup

If you prefer to run it manually:

#### I. Clone the Repository
```bash
git clone https://github.com/3s-Soft/bloodbank.git
cd bloodbank
```

#### II. Install Dependencies
```bash
npm install
```

#### III. Setup Environment Variables
Copy `.env.example` to `.env.local` and fill in your connection details.

#### IV. Create the Schema
```bash
npm run db:migrate
```

If your host does not allow remote DDL, paste `drizzle/0000_*.sql` into phpMyAdmin instead.

#### V. Seed the Database
```bash
npm run db:seed
```

#### VI. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Demo Credentials

### Test Admin User
| Field | Value |
|-------|-------|
| Phone | `01700000000` |
| Password | `demo123` |

### Test Organizations

| Organization | URL Slug | Primary Color |
|-------------|----------|---------------|
| Savar Blood Bank | `savar-blood-bank` | Red (#D32F2F) |
| Uttara Donors | `uttara-donors` | Blue (#1976D2) |
| Mirpur Life Savers | `mirpur-life-savers` | Green (#388E3C) |

### Test URLs (After Seeding)
- **Main Landing:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Super Admin Dashboard:** http://localhost:3000/admin
- **Manage Organizations:** http://localhost:3000/admin/organizations
- **Create Organization:** http://localhost:3000/admin/organizations/new
- **Savar Blood Bank:** http://localhost:3000/savar-blood-bank
- **Donor Registration:** http://localhost:3000/savar-blood-bank/register
- **Find Donors:** http://localhost:3000/savar-blood-bank/donors
- **Blood Requests:** http://localhost:3000/savar-blood-bank/requests
- **Dashboard:** http://localhost:3000/savar-blood-bank/dashboard

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/seed.ts` | Seed database with test data |

---

## 🤝 Contributing

We love contributions! Whether it's a bug fix, feature request, or documentation improvement, we welcome your help.

1. Read our [Contributing Guide](CONTRIBUTING.md).
2. Look for "Good First Issues" in our [Issue Tracker](https://github.com/3s-Soft/bloodbank/issues).
3. Join the community and help us save lives!

---

## ✨ Contributors

Thanks to these wonderful people who have contributed to this project:

<a href="https://github.com/3s-Soft/bloodbank/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=3s-Soft/bloodbank" />
</a>

Designed with ❤️ for humanity.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔒 Security

For security vulnerabilities, please refer to our [Security Policy](SECURITY.md).

---

## 🙏 Acknowledgments

- Built with ❤️ for rural communities in Bangladesh
- Designed to save lives by connecting blood donors with those in need
- Open source and free forever
