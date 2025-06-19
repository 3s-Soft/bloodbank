const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/bloodbank";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    
    // Create indexes for better performance
    await createIndexes();
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

async function createIndexes() {
  try {
    // Create indexes for better query performance
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ bloodType: 1 });
    await usersCollection.createIndex({ city: 1 });
    await requestsCollection.createIndex({ bloodType: 1 });
    await requestsCollection.createIndex({ status: 1 });
    await eventsCollection.createIndex({ date: 1 });
    await notificationsCollection.createIndex({ userId: 1 });
    console.log("Database indexes created successfully");
  } catch (error) {
    console.log("Index creation error (may already exist):", error.message);
  }
}

// Database collections
const db = client.db("bloodbank");
const usersCollection = db.collection("users");
const requestsCollection = db.collection("requests");
const eventsCollection = db.collection("events");
const notificationsCollection = db.collection("notifications");
const donationsCollection = db.collection("donations");

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Blood Bank Management System API' });
});

// ========== USER ROUTES ==========
// Get all users (donors)
app.get('/api/users', async (req, res) => {
  try {
    const { bloodType, city, availability } = req.query;
    let filter = {};
    
    if (bloodType) filter.bloodType = bloodType;
    if (city) filter.city = new RegExp(city, 'i');
    if (availability === 'available') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filter.$or = [
        { lastDonation: { $lt: threeMonthsAgo } },
        { lastDonation: { $exists: false } }
      ];
    }
    
    const users = await usersCollection.find(filter, {
      projection: { password: 0 } // Don't return passwords
    }).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    user.createdAt = new Date();
    user.isAvailable = true;
    user.totalDonations = 0;
    user.profileComplete = calculateProfileComplete(user);
    
    const result = await usersCollection.insertOne(user);
    res.status(201).json({ ...result, user: { ...user, _id: result.insertedId } });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();
    updates.profileComplete = calculateProfileComplete(updates);
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== BLOOD REQUEST ROUTES ==========
// Get blood requests
app.get('/api/requests', async (req, res) => {
  try {
    const { status, bloodType, urgency } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (bloodType) filter.bloodType = bloodType;
    if (urgency) filter.urgency = urgency;
    
    const requests = await requestsCollection.find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create blood request
app.post('/api/requests', async (req, res) => {
  try {
    const request = req.body;
    request.createdAt = new Date();
    request.status = 'active';
    request.respondents = [];
    
    const result = await requestsCollection.insertOne(request);
    
    // Create notification for matching donors
    await createNotificationForDonors(request);
    
    res.status(201).json({ ...result, request: { ...request, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update request status
app.put('/api/requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await requestsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ message: 'Request updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== BLOOD DRIVE EVENTS ROUTES ==========
// Get events
app.get('/api/events', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const events = await eventsCollection.find(filter)
      .sort({ date: 1 })
      .toArray();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event
app.post('/api/events', async (req, res) => {
  try {
    const event = req.body;
    event.createdAt = new Date();
    event.registeredDonors = 0;
    event.status = new Date(event.date) > new Date() ? 'upcoming' : 'completed';
    
    const result = await eventsCollection.insertOne(event);
    res.status(201).json({ ...result, event: { ...event, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register for event
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $inc: { registeredDonors: 1 },
        $addToSet: { participants: new ObjectId(userId) }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== NOTIFICATION ROUTES ==========
// Get user notifications
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const notifications = await notificationsCollection.find({
      userId: new ObjectId(req.params.userId)
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
    
    res.json(notifications);
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await notificationsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { unread: false, readAt: new Date() } }
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== DONATION HISTORY ROUTES ==========
// Get user donation history
app.get('/api/donations/:userId', async (req, res) => {
  try {
    const donations = await donationsCollection.find({
      donorId: new ObjectId(req.params.userId)
    })
    .sort({ date: -1 })
    .toArray();
    
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record new donation
app.post('/api/donations', async (req, res) => {
  try {
    const donation = req.body;
    donation.date = new Date();
    donation.donorId = new ObjectId(donation.donorId);
    
    const result = await donationsCollection.insertOne(donation);
    
    // Update user's donation count and last donation date
    await usersCollection.updateOne(
      { _id: donation.donorId },
      { 
        $inc: { totalDonations: 1 },
        $set: { lastDonation: donation.date }
      }
    );
    
    res.status(201).json({ ...result, donation: { ...donation, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== STATISTICS ROUTES ==========
// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      activeRequests,
      upcomingEvents,
      totalDonations
    ] = await Promise.all([
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ role: { $in: ['donor', 'both'] } }),
      requestsCollection.countDocuments({ status: 'active' }),
      eventsCollection.countDocuments({ status: 'upcoming' }),
      donationsCollection.countDocuments()
    ]);
    
    res.json({
      totalUsers,
      totalDonors,
      activeRequests,
      upcomingEvents,
      totalDonations,
      livesSaved: totalDonations * 3 // Approximate lives saved per donation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== HELPER FUNCTIONS ==========
function calculateProfileComplete(user) {
  const fields = ['fullName', 'email', 'phone', 'bloodType', 'city', 'age'];
  const completedFields = fields.filter(field => user[field] && user[field] !== '');
  return Math.round((completedFields.length / fields.length) * 100);
}

async function createNotificationForDonors(request) {
  try {
    // Find matching donors
    const matchingDonors = await usersCollection.find({
      bloodType: request.bloodType,
      city: new RegExp(request.hospital.city, 'i'),
      role: { $in: ['donor', 'both'] },
      isAvailable: true
    }).toArray();
    
    // Create notifications for matching donors
    const notifications = matchingDonors.map(donor => ({
      userId: donor._id,
      title: 'New Blood Request',
      message: `${request.bloodType} blood needed at ${request.hospital.name}`,
      type: 'blood_request',
      requestId: request._id,
      unread: true,
      createdAt: new Date()
    }));
    
    if (notifications.length > 0) {
      await notificationsCollection.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});
