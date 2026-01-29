/**
 * Database Seed Script for Blood Bank Application
 * 
 * Run this script to create a test organization for local development:
 * npx tsx scripts/seed.ts
 * 
 * Prerequisites:
 * - MongoDB running locally or MONGODB_URI set in .env.local
 * - Node.js installed
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
}

// Organization Schema (inline to avoid import issues)
const OrganizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        logo: { type: String },
        primaryColor: { type: String, default: "#D32F2F" },
        contactEmail: { type: String },
        contactPhone: { type: String },
        address: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Organization = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);

// User Schema
const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        email: { type: String, unique: true, sparse: true },
        password: { type: String },
        role: { type: String, default: "patient" },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
        image: { type: String },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
    console.log("🌱 Starting database seed...\n");

    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("✅ Connected to MongoDB\n");

        // Create test organizations
        const organizations = [
            {
                name: "Savar Blood Bank",
                slug: "savar-blood-bank",
                primaryColor: "#D32F2F",
                contactPhone: "01711111111",
                address: "Savar, Dhaka",
            },
            {
                name: "Uttara Donors",
                slug: "uttara-donors",
                primaryColor: "#1976D2",
                contactPhone: "01722222222",
                address: "Uttara, Dhaka",
            },
            {
                name: "Mirpur Life Savers",
                slug: "mirpur-life-savers",
                primaryColor: "#388E3C",
                contactPhone: "01733333333",
                address: "Mirpur, Dhaka",
            },
        ];

        for (const org of organizations) {
            const exists = await Organization.findOne({ slug: org.slug });
            if (!exists) {
                await Organization.create(org);
                console.log(`✅ Created organization: ${org.name}`);
            } else {
                console.log(`⏭️  Organization already exists: ${org.name}`);
            }
        }

        // Create a test admin user
        const testOrg = await Organization.findOne({ slug: "savar-blood-bank" });
        if (testOrg) {
            const adminExists = await User.findOne({ phone: "01700000000" });
            if (!adminExists) {
                await User.create({
                    name: "Test Admin",
                    phone: "01700000000",
                    role: "admin",
                    organization: testOrg._id,
                });
                console.log("✅ Created test admin user (phone: 01700000000, password: demo123)");
            } else {
                console.log("⏭️  Test admin already exists");
            }
        }

        console.log("\n🎉 Seed completed successfully!");
        console.log("\n📌 You can now visit:");
        console.log("   - http://localhost:3000/savar-blood-bank");
        console.log("   - http://localhost:3000/uttara-donors");
        console.log("   - http://localhost:3000/mirpur-life-savers");
        console.log("\n📌 Login with:");
        console.log("   - Phone: 01700000000");
        console.log("   - Password: demo123");

    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
    }
}

seed();
