# Blood Bank Management System

A comprehensive web application for managing blood donation and distribution in rural areas of Bangladesh, specifically designed for Chittagong region.

## 🩸 Features

### Core Functionality
- **User Registration & Authentication** - Firebase-powered auth with Google OAuth
- **Donor Management** - Search and filter blood donors by type, location, availability
- **Blood Request System** - Submit and track blood donation requests
- **Blood Drive Events** - Organize and participate in community blood drives
- **Real-time Notifications** - Instant alerts for matching blood requests
- **Dashboard** - Personalized user dashboard with donation history
- **Mobile Responsive** - Optimized for all devices

### Advanced Features
- **Dark/Light Theme** - Persistent theme switching
- **Real-time Search** - Live donor filtering with database queries
- **Notification System** - Smart matching and alert system
- **Protected Routes** - Secure authentication-based navigation
- **Error Handling** - Graceful fallbacks and user feedback
- **Database Integration** - Full MongoDB integration with optimized queries

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite 6.3.5** - Fast build tool and dev server
- **TailwindCSS 4.1.10** - Utility-first CSS framework
- **DaisyUI 5.0.43** - Beautiful component library
- **React Router 7.6.2** - Client-side routing
- **Firebase Auth** - Authentication and Google OAuth
- **SweetAlert2** - Beautiful alerts and modals

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **MongoDB Driver** - Official MongoDB client
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control
- **Firebase Account** for authentication

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/blood-bank-management.git
cd blood-bank-management
```

### 2. Environment Setup

#### Server Environment Variables
1. Copy the example environment file:
```bash
cd Server
cp .env.example .env
```

2. Update `Server/.env` with your configuration:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bloodbank
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodbank

# Server Configuration
PORT=3000
NODE_ENV=development

# Add your other configuration variables...
```

#### Client Environment Variables
1. Copy the example environment file:
```bash
cd Client
cp .env.example .env
```

2. Update `Client/.env` with your Firebase configuration:
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Firebase Configuration (Get from Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase configs
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and set up:
   - Email/Password provider
   - Google provider (optional)
4. Get your Firebase configuration from Project Settings
5. Update your `Client/.env` file with the Firebase config

### 4. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. The application will create the database automatically

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `Server/.env`

### 5. Install Dependencies

#### Install Server Dependencies
```bash
cd Server
npm install
```

#### Install Client Dependencies
```bash
cd Client
npm install
```

### 6. Run the Application

#### Start the Backend Server
```bash
cd Server
npm start
# or for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:3000`

#### Start the Frontend
```bash
cd Client
npm run dev
```

The client will start on `http://localhost:5173`

## 📁 Project Structure

```
blood-bank-management/
├── Client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── services/       # API services
│   │   ├── firebase/       # Firebase configuration
│   │   └── Layout/         # Layout components
│   ├── .env                # Environment variables
│   ├── .env.example        # Environment template
│   └── package.json
├── Server/                 # Backend Node.js application
│   ├── .env                # Environment variables
│   ├── .env.example        # Environment template
│   ├── index.js            # Main server file
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

### Collections

#### Users
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  phone: String,
  bloodType: String,
  city: String,
  role: String, // 'donor', 'recipient', 'both'
  isAvailable: Boolean,
  totalDonations: Number,
  lastDonation: Date,
  profileComplete: Number,
  createdAt: Date
}
```

#### Blood Requests
```javascript
{
  _id: ObjectId,
  patientName: String,
  bloodType: String,
  units: Number,
  urgency: String, // 'emergency', 'urgent', 'normal'
  hospital: Object,
  requesterInfo: Object,
  status: String, // 'active', 'fulfilled', 'expired'
  respondents: Array,
  createdAt: Date
}
```

#### Events
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  location: String,
  organizer: String,
  targetDonors: Number,
  registeredDonors: Number,
  status: String, // 'upcoming', 'completed', 'cancelled'
  participants: Array,
  createdAt: Date
}
```

## 🔧 API Endpoints

### User Routes
- `GET /api/users` - Get all users with filtering
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user

### Blood Request Routes
- `GET /api/requests` - Get blood requests
- `POST /api/requests` - Create blood request
- `PUT /api/requests/:id` - Update request status

### Event Routes
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `POST /api/events/:id/register` - Register for event

### Notification Routes
- `GET /api/notifications/:userId` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Statistics Routes
- `GET /api/stats` - Get dashboard statistics

## 🎨 UI Components

The application uses a modern, responsive design with:
- **DaisyUI Components** - Pre-built, accessible components
- **Custom Styling** - TailwindCSS for custom designs
- **Dark/Light Theme** - Persistent theme switching
- **Mobile First** - Responsive design for all devices
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages

## 🔒 Security Features

- **Firebase Authentication** - Secure user authentication
- **Protected Routes** - Route-level access control
- **Input Validation** - Server-side data validation
- **CORS Configuration** - Proper cross-origin setup
- **Environment Variables** - Sensitive data protection
- **Rate Limiting** - API protection (configurable)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the production version:
```bash
cd Client
npm run build
```

2. Deploy the `dist` folder to your hosting service

### Backend (Railway/Heroku)
1. Set up environment variables on your hosting platform
2. Deploy the `Server` folder
3. Ensure MongoDB connection string is properly configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@bloodbank.org
- **Phone**: +880-1234-567890 / 01627323206
- **Emergency**: +880-911-000000

## 🙏 Acknowledgments

- Designed for rural healthcare improvement in Bangladesh
- Built with modern web technologies for reliability
- Community-focused approach to blood donation
- Responsive design for accessibility across devices

---

**Made with ❤️ for humanity**
