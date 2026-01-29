/**
 * Database Seed Script for Blood Bank Application
 * 
 * Run this script to create test organizations, users, donors, and blood requests:
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
dotenv.config({ path: resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
}

// Organization Schema
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
        phone: { type: String, unique: true, sparse: true },
        email: { type: String, unique: true, sparse: true },
        password: { type: String },
        role: { type: String, default: "patient" },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
        image: { type: String },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// DonorProfile Schema
const DonorProfileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
        bloodGroup: { type: String, required: true },
        district: { type: String, required: true },
        upazila: { type: String, required: true },
        village: { type: String },
        lastDonationDate: { type: Date },
        isAvailable: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const DonorProfile = mongoose.models.DonorProfile || mongoose.model("DonorProfile", DonorProfileSchema);

// BloodRequest Schema
const BloodRequestSchema = new mongoose.Schema(
    {
        patientName: { type: String, required: true },
        bloodGroup: { type: String, required: true },
        location: { type: String, required: true },
        district: { type: String, required: true },
        upazila: { type: String, required: true },
        urgency: { type: String, default: "normal" },
        requiredDate: { type: Date, required: true },
        contactNumber: { type: String, required: true },
        additionalNotes: { type: String },
        status: { type: String, default: "pending" },
        requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    },
    { timestamps: true }
);

const BloodRequest = mongoose.models.BloodRequest || mongoose.model("BloodRequest", BloodRequestSchema);

// Dummy Data
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const genders = ["Male", "Female"];

const districts = [
    { name: "Dhaka", upazilas: ["Savar", "Dhamrai", "Keraniganj", "Nawabganj", "Dohar"] },
    { name: "Gazipur", upazilas: ["Gazipur Sadar", "Kaliakair", "Kapasia", "Sreepur", "Kaliganj"] },
    { name: "Narayanganj", upazilas: ["Narayanganj Sadar", "Araihazar", "Bandar", "Rupganj", "Sonargaon"] },
];

const villages = [
    "Balurpar", "Shimulia", "Hemayetpur", "Kathgara", "Nobinagar",
    "Aminbazar", "Birulia", "Tetultala", "Ashulia", "Jamgara"
];

const firstNames = [
    "Rahim", "Karim", "Jamal", "Faruk", "Hasan", "Rashed", "Kabir", "Nasir", "Zakir", "Aziz",
    "Fatima", "Ayesha", "Khadija", "Sultana", "Roksana", "Nasreen", "Parveen", "Shirin", "Mina", "Rina"
];

const lastNames = [
    "Uddin", "Hossain", "Rahman", "Khan", "Chowdhury", "Ahmed", "Islam", "Miah", "Sikder", "Sarker"
];

const patientNames = [
    "Abdul Karim", "Mohammad Hasan", "Fatima Begum", "Rahim Uddin", "Kamal Ahmed",
    "Nasreen Akter", "Jahanara Begum", "Rashed Khan", "Salma Khatun", "Aminul Islam"
];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(daysAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date;
}

function getFutureDate(daysAhead: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
    return date;
}

function generatePhone(): string {
    const prefixes = ["017", "018", "019", "016", "015"];
    const prefix = getRandomElement(prefixes);
    const number = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${number}`;
}

async function seed() {
    console.log("🌱 Starting database seed...\n");

    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("✅ Connected to MongoDB");

        // Clear existing data
        console.log("🧹 Clearing existing data...");
        await Promise.all([
            Organization.deleteMany({}),
            User.deleteMany({}),
            DonorProfile.deleteMany({}),
            BloodRequest.deleteMany({}),
        ]);
        console.log("✅ Collections cleared\n");

        // Create test organizations
        const organizations = [
            {
                name: "Savar Blood Bank",
                slug: "savar-blood-bank",
                primaryColor: "#D32F2F",
                contactPhone: "01711111111",
                contactEmail: "savar@bloodbank.org",
                address: "Savar Bus Stand, Savar, Dhaka",
            },
            {
                name: "Uttara Donors",
                slug: "uttara-donors",
                primaryColor: "#1976D2",
                contactPhone: "01722222222",
                contactEmail: "uttara@bloodbank.org",
                address: "Sector 10, Uttara, Dhaka",
            },
            {
                name: "Mirpur Life Savers",
                slug: "mirpur-life-savers",
                primaryColor: "#388E3C",
                contactPhone: "01733333333",
                contactEmail: "mirpur@bloodbank.org",
                address: "Mirpur-10, Dhaka",
            },
        ];

        const createdOrgs: any[] = [];

        for (const org of organizations) {
            let existingOrg = await Organization.findOne({ slug: org.slug });
            if (!existingOrg) {
                existingOrg = await Organization.create(org);
                console.log(`✅ Created organization: ${org.name}`);
            } else {
                console.log(`⏭️  Organization already exists: ${org.name}`);
            }
            createdOrgs.push(existingOrg);
        }

        // Create super admin user
        const superAdminExists = await User.findOne({ phone: "01700000000" });
        let superAdmin;
        if (!superAdminExists) {
            superAdmin = await User.create({
                name: "Super Admin",
                phone: "01700000000",
                email: "admin@bloodbank.org",
                role: "super_admin",
            });
            console.log("✅ Created super admin (phone: 01700000000, password: demo123)");
        } else {
            superAdmin = superAdminExists;
            console.log("⏭️  Super admin already exists");
        }

        // Create donors and blood requests for each organization
        for (const org of createdOrgs) {
            console.log(`\n📍 Seeding data for ${org.name}...`);

            // Create admin for this org
            const adminPhone = `0171${Math.floor(1000000 + Math.random() * 9000000)}`;
            let orgAdmin = await User.findOne({ phone: adminPhone });
            if (!orgAdmin) {
                orgAdmin = await User.create({
                    name: `${org.name.split(' ')[0]} Admin`,
                    phone: adminPhone,
                    role: "admin",
                    organization: org._id,
                });
                console.log(`   ✅ Created org admin: ${orgAdmin.name}`);
            }

            // Create 15-25 donors per organization
            const donorCount = 15 + Math.floor(Math.random() * 11);
            let createdDonors = 0;

            for (let i = 0; i < donorCount; i++) {
                const firstName = getRandomElement(firstNames);
                const lastName = getRandomElement(lastNames);
                const name = `${firstName} ${lastName}`;
                const phone = generatePhone();
                const district = getRandomElement(districts);
                const upazila = getRandomElement(district.upazilas);
                const bloodGroup = getRandomElement(bloodGroups);

                // Check if user exists
                const existingUser = await User.findOne({ phone });
                if (existingUser) continue;

                // Create user
                const user = await User.create({
                    name,
                    phone,
                    role: "donor",
                    organization: org._id,
                });

                // Create donor profile
                await DonorProfile.create({
                    user: user._id,
                    organization: org._id,
                    bloodGroup,
                    district: district.name,
                    upazila,
                    village: Math.random() > 0.3 ? getRandomElement(villages) : undefined,
                    lastDonationDate: Math.random() > 0.4 ? getRandomDate(180) : undefined,
                    isAvailable: Math.random() > 0.2,
                    isVerified: Math.random() > 0.4,
                });

                createdDonors++;
            }
            console.log(`   ✅ Created ${createdDonors} donors`);

            // Create 5-10 blood requests per organization
            const requestCount = 5 + Math.floor(Math.random() * 6);
            let createdRequests = 0;

            for (let i = 0; i < requestCount; i++) {
                const district = getRandomElement(districts);
                const upazila = getRandomElement(district.upazilas);
                const urgencies = ["normal", "urgent", "emergency"];
                const statuses = ["pending", "pending", "pending", "fulfilled", "canceled"];

                await BloodRequest.create({
                    patientName: getRandomElement(patientNames),
                    bloodGroup: getRandomElement(bloodGroups),
                    location: `${getRandomElement(villages)}, ${upazila}`,
                    district: district.name,
                    upazila,
                    urgency: getRandomElement(urgencies),
                    requiredDate: getFutureDate(7),
                    contactNumber: generatePhone(),
                    additionalNotes: Math.random() > 0.5
                        ? "Please call before coming. Patient is in ICU."
                        : undefined,
                    status: getRandomElement(statuses),
                    requester: superAdmin._id,
                    organization: org._id,
                });

                createdRequests++;
            }
            console.log(`   ✅ Created ${createdRequests} blood requests`);
        }

        // Summary
        const totalDonors = await DonorProfile.countDocuments({});
        const totalRequests = await BloodRequest.countDocuments({});
        const totalUsers = await User.countDocuments({});

        console.log("\n" + "=".repeat(50));
        console.log("🎉 Seed completed successfully!");
        console.log("=".repeat(50));
        console.log(`\n📊 Database Summary:`);
        console.log(`   Organizations: ${createdOrgs.length}`);
        console.log(`   Users: ${totalUsers}`);
        console.log(`   Donors: ${totalDonors}`);
        console.log(`   Blood Requests: ${totalRequests}`);

        console.log("\n📌 Test URLs:");
        console.log("   - Super Admin: http://localhost:3000/admin");
        console.log("   - Savar Blood Bank: http://localhost:3000/savar-blood-bank");
        console.log("   - Uttara Donors: http://localhost:3000/uttara-donors");
        console.log("   - Mirpur Life Savers: http://localhost:3000/mirpur-life-savers");

        console.log("\n🔐 Login Credentials:");
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
