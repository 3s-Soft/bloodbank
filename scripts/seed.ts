/**
 * Database Seed Script for Blood Bank Application
 * 
 * Run this script to create test organizations, users, donors, and blood requests:
 * npx tsx scripts/seed.ts
 * 
 * Prerequisites:
 * - Firebase project credentials set in .env.local
 * - Node.js installed
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import { resolve } from "path";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

function initFirebaseAdmin() {
    if (!admin.apps.length) {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    }
    return admin.firestore();
}

const db = initFirebaseAdmin();

// Constants
const COLLECTIONS = {
    USERS: "users",
    DONOR_PROFILES: "donorProfiles",
    ORGANIZATIONS: "organizations",
    BLOOD_REQUESTS: "bloodRequests"
};

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

async function clearCollections() {
    console.log("🧹 Clearing existing Firestore data...");
    for (const collection of Object.values(COLLECTIONS)) {
        const snapshot = await db.collection(collection).get();
        const batchSize = snapshot.size;
        if (batchSize === 0) continue;
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`   - Cleared ${batchSize} documents from ${collection}`);
    }
}

async function seed() {
    console.log("🌱 Starting Firestore database seed...\n");

    try {
        await clearCollections();
        console.log("✅ Collections cleared\n");

        const hashedPassword = await bcrypt.hash("demo123", 10);

        // Create test organizations
        const organizations = [
            {
                name: "Savar Blood Bank",
                slug: "savar-blood-bank",
                primaryColor: "#D32F2F",
                contactPhone: "01711111111",
                contactEmail: "savar@bloodbank.org",
                address: "Savar Bus Stand, Savar, Dhaka",
                isActive: true,
                createdAt: new Date(),
            },
            {
                name: "Uttara Donors",
                slug: "uttara-donors",
                primaryColor: "#1976D2",
                contactPhone: "01722222222",
                contactEmail: "uttara@bloodbank.org",
                address: "Sector 10, Uttara, Dhaka",
                isActive: true,
                createdAt: new Date(),
            },
            {
                name: "Mirpur Life Savers",
                slug: "mirpur-life-savers",
                primaryColor: "#388E3C",
                contactPhone: "01733333333",
                contactEmail: "mirpur@bloodbank.org",
                address: "Mirpur-10, Dhaka",
                isActive: true,
                createdAt: new Date(),
            },
        ];

        const createdOrgs: Record<string, unknown>[] = [];

        for (const org of organizations) {
            const orgRef = db.collection(COLLECTIONS.ORGANIZATIONS).doc();
            await orgRef.set(org);
            console.log(`✅ Created organization: ${org.name}`);
            createdOrgs.push({ id: orgRef.id, ...org });
        }

        // Create super admin user
        const superAdminRef = db.collection(COLLECTIONS.USERS).doc();
        await superAdminRef.set({
            name: "Super Admin",
            phone: "01700000000",
            email: "admin@bloodbank.org",
            password: hashedPassword,
            role: "super_admin",
            createdAt: new Date(),
        });
        const superAdminId = superAdminRef.id;
        console.log("✅ Created super admin (phone: 01700000000, password: demo123)");

        // Create donors and blood requests for each organization
        for (const org of createdOrgs) {
            console.log(`\n📍 Seeding data for ${org.name}...`);

            // Create admin for this org
            const adminPhone = `0171${Math.floor(1000000 + Math.random() * 9000000)}`;
            const orgAdminRef = db.collection(COLLECTIONS.USERS).doc();
            await orgAdminRef.set({
                name: `${typeof org.name === 'string' ? org.name.split(' ')[0] : 'Org'} Admin`,
                phone: adminPhone,
                password: hashedPassword,
                role: "admin",
                organization: org.id,
                createdAt: new Date(),
            });
            console.log(`   ✅ Created org admin: ${(typeof org.name === 'string' ? org.name.split(' ')[0] : 'Org')} Admin`);

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
                
                // Create user
                const userRef = db.collection(COLLECTIONS.USERS).doc();
                await userRef.set({
                    name,
                    phone,
                    password: hashedPassword,
                    role: "donor",
                    organization: org.id,
                    createdAt: new Date(),
                });

                // Create donor profile
                await db.collection(COLLECTIONS.DONOR_PROFILES).doc().set({
                    user: userRef.id,
                    organization: org.id,
                    bloodGroup,
                    district: district.name,
                    upazila,
                    village: Math.random() > 0.3 ? getRandomElement(villages) : null,
                    lastDonationDate: Math.random() > 0.4 ? getRandomDate(180) : null,
                    isAvailable: Math.random() > 0.2,
                    isVerified: Math.random() > 0.4,
                    createdAt: new Date(),
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

                await db.collection(COLLECTIONS.BLOOD_REQUESTS).doc().set({
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
                        : null,
                    status: getRandomElement(statuses),
                    requester: superAdminId,
                    organization: org.id,
                    matchedDonors: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                createdRequests++;
            }
            console.log(`   ✅ Created ${createdRequests} blood requests`);
        }

        // Summary
        const totalOrgs = (await db.collection(COLLECTIONS.ORGANIZATIONS).count().get()).data().count;
        const totalUsers = (await db.collection(COLLECTIONS.USERS).count().get()).data().count;
        const totalDonors = (await db.collection(COLLECTIONS.DONOR_PROFILES).count().get()).data().count;
        const totalRequests = (await db.collection(COLLECTIONS.BLOOD_REQUESTS).count().get()).data().count;

        console.log("\n" + "=".repeat(50));
        console.log("🎉 Seed completed successfully!");
        console.log("=".repeat(50));
        console.log(`\n📊 Database Summary:`);
        console.log(`   Organizations: ${totalOrgs}`);
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
    }
}

seed();
