# Rural Blood Bank

A community-powered blood donation platform connecting blood donors with patients in rural areas of Bangladesh.

## Features

- 🩸 **Multi-tenant Architecture** - Each organization has its own branded blood bank
- 👥 **Donor Registration** - Simple form with validation and verification
- 🔍 **Donor Discovery** - Search by blood group, district, and upazila
- 📋 **Blood Requests** - Post and manage urgent blood requests
- 📊 **Dashboard** - Stats, donor verification, and request management
- 📱 **PWA Support** - Works offline and installable on mobile

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/bloodbank

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 3. Seed Database

Run the seed script to create test organizations and users:

```bash
npx tsx scripts/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Demo Credentials

### Test Admin User

| Field    | Value         |
|----------|---------------|
| Phone    | `01700000000` |
| Password | `demo123`     |

### Test Organizations

| Organization Name    | URL Slug              | Primary Color |
|---------------------|-----------------------|---------------|
| Savar Blood Bank    | `savar-blood-bank`    | Red           |
| Uttara Donors       | `uttara-donors`       | Blue          |
| Mirpur Life Savers  | `mirpur-life-savers`  | Green         |

### Test URLs (After Seeding)

- **Main Landing:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Savar Blood Bank:** http://localhost:3000/savar-blood-bank
- **Donor Registration:** http://localhost:3000/savar-blood-bank/register
- **Find Donors:** http://localhost:3000/savar-blood-bank/donors
- **Blood Requests:** http://localhost:3000/savar-blood-bank/requests
- **Dashboard:** http://localhost:3000/savar-blood-bank/dashboard

## Tech Stack

- **Framework:** Next.js 16
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod
- **Notifications:** Sonner

## Project Structure

```
bloodbank/
├── app/
│   ├── [orgSlug]/          # Organization-scoped pages
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── donors/         # Donor discovery
│   │   ├── register/       # Donor registration
│   │   └── requests/       # Blood requests
│   ├── api/                # API routes
│   └── login/              # Authentication
├── components/             # Reusable UI components
├── lib/
│   ├── db/                 # Database connection
│   └── models/             # Mongoose models
└── scripts/
    └── seed.ts             # Database seeder
```

## License

MIT License - See [LICENSE](LICENSE) for details.
