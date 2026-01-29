# Rural Blood Bank 🩸

A community-powered, multi-tenant blood donation platform connecting blood donors with patients in rural areas of Bangladesh. Built with modern web technologies and designed for organizations to manage their own blood bank networks.

![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-green?logo=mongodb)
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
| **Database** | MongoDB with Mongoose 9 |
| **Authentication** | NextAuth.js 4.x |
| **Styling** | Tailwind CSS 4.x |
| **Forms** | React Hook Form + Zod Validation |
| **Notifications** | Sonner (Toast notifications) |
| **Icons** | Lucide React |
| **PWA** | @ducanh2912/next-pwa |

---

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
│   │   └── mongodb.ts             # MongoDB connection
│   └── models/
│       ├── User.ts                # User & DonorProfile models
│       ├── BloodRequest.ts        # Blood request model
│       └── Organization.ts        # Organization model
├── scripts/
│   └── seed.ts                    # Database seeder
└── public/                        # Static assets
```

---

## 🗄 Database Models

### User
```typescript
{
  name: string;           // Required
  phone: string;          // Required, unique identifier
  email?: string;         // Optional
  password?: string;      // Optional (for demo, uses simple bypass)
  role: UserRole;         // donor | patient | volunteer | admin | super_admin
  organization?: ObjectId;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### DonorProfile
```typescript
{
  user: ObjectId;           // Reference to User
  organization: ObjectId;   // Reference to Organization
  bloodGroup: string;       // A+, A-, B+, B-, O+, O-, AB+, AB-
  district: string;
  upazila: string;
  village?: string;
  lastDonationDate?: Date;
  isAvailable: boolean;     // Default: true
  isVerified: boolean;      // Default: false (requires admin verification)
}
```

### BloodRequest
```typescript
{
  patientName: string;
  bloodGroup: string;
  location: string;
  district: string;
  upazila: string;
  urgency: UrgencyLevel;     // normal | urgent | emergency
  requiredDate: Date;
  contactNumber: string;
  additionalNotes?: string;
  status: RequestStatus;     // pending | fulfilled | canceled
  requester: ObjectId;       // Reference to User
  organization: ObjectId;    // Reference to Organization
  createdAt: Date;
  updatedAt: Date;
}
```

### Organization
```typescript
{
  name: string;
  slug: string;              // Unique, lowercase URL slug
  logo?: string;
  primaryColor?: string;     // Default: #D32F2F (red)
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;         // Default: true
  createdAt: Date;
  updatedAt: Date;
}
```

---

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
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/3s-Soft/bloodbank.git
cd bloodbank
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/bloodbank

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl
```

### 4. Seed the Database
Run the seed script to create test organizations and users:

```bash
npx tsx scripts/seed.ts
```

### 5. Run Development Server
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

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

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
