# BloodBank Release v2.0.0

## 🚀 Firebase Architecture Migration
We are thrilled to announce a major architectural shift for BloodBank! To increase the platform's reliability, speed, and real-time capabilities for rural Bangladesh, we have successfully migrated the application from MongoDB to a fully serverless architecture using Firebase Firestore and Firebase Authentication.

### Key Changes
- **Database Schema Shift**: All Mongoose models have been replaced with TypeScript interfaces mapping to NoSQL document structures in Firestore.
- **Serverless APIs**: Next.js API routes (Donors, Blood Requests, Organizations, Donations, Events, Feedback, Dashboard, Admin) have been rewritten to utilize the `firebase-admin` SDK. This replaces complex MongoDB queries with NoSQL-optimized filtering.
- **Authentication Overhaul**: NextAuth callbacks and credential providers (Email & Phone) now read and persist user profiles natively against Firestore, stepping entirely away from MongoDB.
- **Firebase Cloud Messaging (FCM)**: Replaced legacy `web-push` code with native Firebase Messaging to dispatch real-time emergency blood requests directly to verified donor devices.
- **Live Event Sockets**: Refactored the Organization Request Dashboard (`app/[orgSlug]/dashboard/requests/page.tsx`) to pull live data updates instantly using Firebase's `onSnapshot` real-time socket listener, moving away from polled REST fetches.
- **Codebase Cleansing**: Mongoose legacy code dependencies have been cleanly pruned from the project, reducing architectural overhead.

### Why Firebase?
- **Low Maintenance Cost**: Serverless deployment with a heavy free tier.
- **Real-Time Data**: Instantaneous updates on the web dashboards.
- **Stronger Push Notifications**: Industry-standard FCM ensures life-saving messages get delivered rapidly.
