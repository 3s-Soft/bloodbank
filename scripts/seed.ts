/**
 * Database seed for the Blood Bank application.
 *
 *   npm run db:seed
 *
 * Requires MySQL credentials in .env.local and the schema already migrated
 * (`npm run db:migrate`). Every run clears the application tables first, so it
 * is safe to re-run but destructive to existing data.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";

import { closeDb, db } from "../lib/db";
import {
    auditLogs,
    bloodRequestMatches,
    bloodRequests,
    donations,
    donorProfiles,
    events,
    feedback,
    organizations,
    pushSubscriptions,
    users,
} from "../lib/db/schema";
import {
    AuditAction,
    DEFAULT_NOTIFICATION_PREFERENCES,
    EventStatus,
    FeedbackCategory,
    RequestStatus,
    UrgencyLevel,
    UserRole,
    type BloodGroup,
} from "../lib/db/enums";
import { POINTS, calculateBadges, calculatePoints } from "../lib/gamification";

const DEMO_PASSWORD = "demo123";

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DISTRICTS = [
    { name: "Dhaka", upazilas: ["Savar", "Dhamrai", "Keraniganj", "Nawabganj", "Dohar"] },
    { name: "Gazipur", upazilas: ["Gazipur Sadar", "Kaliakair", "Kapasia", "Sreepur", "Kaliganj"] },
    {
        name: "Narayanganj",
        upazilas: ["Narayanganj Sadar", "Araihazar", "Bandar", "Rupganj", "Sonargaon"],
    },
];

const VILLAGES = [
    "Balurpar",
    "Shimulia",
    "Hemayetpur",
    "Kathgara",
    "Nobinagar",
    "Aminbazar",
    "Birulia",
    "Tetultala",
    "Ashulia",
    "Jamgara",
];

const FIRST_NAMES = [
    "Rahim", "Karim", "Jamal", "Faruk", "Hasan", "Rashed", "Kabir", "Nasir", "Zakir", "Aziz",
    "Fatima", "Ayesha", "Khadija", "Sultana", "Roksana", "Nasreen", "Parveen", "Shirin", "Mina", "Rina",
];

const LAST_NAMES = [
    "Uddin", "Hossain", "Rahman", "Khan", "Chowdhury", "Ahmed", "Islam", "Miah", "Sikder", "Sarker",
];

const PATIENT_NAMES = [
    "Abdul Karim", "Mohammad Hasan", "Fatima Begum", "Rahim Uddin", "Kamal Ahmed",
    "Nasreen Akter", "Jahanara Begum", "Rashed Khan", "Salma Khatun", "Aminul Islam",
];

const ORGANIZATIONS = [
    {
        name: "Savar Blood Bank",
        slug: "savar-blood-bank",
        primaryColor: "#D32F2F",
        contactPhone: "01711111111",
        contactEmail: "savar@bloodbank.org",
        address: "Savar Bus Stand, Savar, Dhaka",
        adminPhone: "01710000001",
    },
    {
        name: "Uttara Donors",
        slug: "uttara-donors",
        primaryColor: "#1976D2",
        contactPhone: "01722222222",
        contactEmail: "uttara@bloodbank.org",
        address: "Sector 10, Uttara, Dhaka",
        adminPhone: "01710000002",
    },
    {
        name: "Mirpur Life Savers",
        slug: "mirpur-life-savers",
        primaryColor: "#388E3C",
        contactPhone: "01733333333",
        contactEmail: "mirpur@bloodbank.org",
        address: "Mirpur-10, Dhaka",
        adminPhone: "01710000003",
    },
];

/**
 * Deterministic pseudo-randomness. A fixed seed keeps re-runs comparable, which
 * matters when debugging against real data rather than eyeballing new numbers
 * every time.
 */
let randomState = 42;
function random(): number {
    randomState = (randomState * 1664525 + 1013904223) % 4294967296;
    return randomState / 4294967296;
}

function pick<T>(items: readonly T[]): T {
    return items[Math.floor(random() * items.length)];
}

function daysAgo(maxDays: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(random() * maxDays));
    return date;
}

function daysAhead(maxDays: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(random() * maxDays) + 1);
    return date;
}

/** Phone numbers are unique-indexed, so they are generated from a counter. */
let phoneCounter = 0;
function nextPhone(): string {
    phoneCounter += 1;
    return `018${String(10000000 + phoneCounter).slice(0, 8)}`;
}

/**
 * Refuses to run against a database that already holds real data.
 *
 * This script deletes every row in every table. It points at whatever
 * `.env.local` configures, which is the production database on a developer
 * machine, so an accidental `npm run db:seed` would destroy live donor records.
 * Re-seeding an already-seeded demo database is fine; wiping anything larger
 * requires an explicit override.
 */
async function assertSafeToSeed() {
    if (process.env.SEED_FORCE === "true") {
        console.warn("SEED_FORCE=true - skipping the safety check.");
        return;
    }

    const [orgCount] = await db.select({ total: count() }).from(organizations);
    const [donorCount] = await db.select({ total: count() }).from(donorProfiles);

    const orgs = Number(orgCount?.total ?? 0);
    const donors = Number(donorCount?.total ?? 0);

    // The seed itself creates 3 organizations and fewer than 70 donors, so
    // anything materially larger is not a demo dataset.
    const looksLikeRealData = orgs > 5 || donors > 100;

    if (looksLikeRealData) {
        console.error(
            `Refusing to seed: the database holds ${orgs} organizations and ${donors} donor ` +
                `profiles, which does not look like demo data. ` +
                `This script deletes every row. If you are certain, re-run with SEED_FORCE=true.`,
        );
        process.exit(1);
    }
}

async function clearTables() {
    console.log("Clearing existing data...");
    // Children before parents: foreign keys cascade, but explicit ordering keeps
    // the intent obvious and avoids depending on cascade behaviour.
    await db.delete(bloodRequestMatches);
    await db.delete(auditLogs);
    await db.delete(donations);
    await db.delete(pushSubscriptions);
    await db.delete(feedback);
    await db.delete(events);
    await db.delete(bloodRequests);
    await db.delete(donorProfiles);
    await db.delete(users);
    await db.delete(organizations);
}

/**
 * Seeds one organization: its admin, donors, requests, donations and events.
 *
 * Extracted so `seed()` reads as the shape of the dataset rather than every
 * detail of it.
 */
async function seedOrganization(
    org: { id: number; name: string; slug: string },
    definition: (typeof ORGANIZATIONS)[number],
    passwordHash: string,
) {
    console.log(`\n  ${org.name}`);

    const [adminResult] = await db.insert(users).values({
        name: `${org.name.split(" ")[0]} Admin`,
        phone: definition.adminPhone,
        email: `admin@${org.slug}.org`,
        password: passwordHash,
        role: UserRole.ADMIN,
        organizationId: org.id,
        onboardingCompleted: true,
        notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    });
    const adminId = Number(adminResult.insertId);
    console.log(`    admin: ${definition.adminPhone}`);

    /* donors */
    const donorCount = 15 + Math.floor(random() * 11);
    const donorProfileIds: number[] = [];

    for (let i = 0; i < donorCount; i += 1) {
        const district = pick(DISTRICTS);
        const bloodGroup = pick(BLOOD_GROUPS);
        const isVerified = random() > 0.3;
        const totalDonations = Math.floor(random() * 12);
        const hasDonated = totalDonations > 0;

        const [userResult] = await db.insert(users).values({
            name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
            phone: nextPhone(),
            password: passwordHash,
            role: UserRole.DONOR,
            organizationId: org.id,
            onboardingCompleted: true,
            notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
        });
        const userId = Number(userResult.insertId);

        const [profileResult] = await db.insert(donorProfiles).values({
            userId,
            organizationId: org.id,
            bloodGroup,
            district: district.name,
            upazila: pick(district.upazilas),
            village: pick(VILLAGES),
            lastDonationDate: hasDonated ? daysAgo(180) : null,
            totalDonations,
            points: calculatePoints(totalDonations, isVerified, true, true),
            badges: calculateBadges(totalDonations, isVerified),
            isAvailable: random() > 0.2,
            isVerified,
        });
        donorProfileIds.push(Number(profileResult.insertId));
    }
    console.log(`    donors: ${donorCount}`);

    /* blood requests */
    const requestCount = 5 + Math.floor(random() * 5);
    for (let i = 0; i < requestCount; i += 1) {
        const district = pick(DISTRICTS);
        const roll = random();
        const status =
            roll > 0.6
                ? RequestStatus.PENDING
                : roll > 0.25
                  ? RequestStatus.FULFILLED
                  : RequestStatus.CANCELED;
        const urgencyRoll = random();
        const urgency =
            urgencyRoll > 0.7
                ? UrgencyLevel.EMERGENCY
                : urgencyRoll > 0.4
                  ? UrgencyLevel.URGENT
                  : UrgencyLevel.NORMAL;

        await db.insert(bloodRequests).values({
            patientName: pick(PATIENT_NAMES),
            bloodGroup: pick(BLOOD_GROUPS),
            location: `${pick(VILLAGES)} Bazar`,
            district: district.name,
            upazila: pick(district.upazilas),
            urgency,
            requiredDate: daysAhead(14),
            contactNumber: nextPhone(),
            additionalNotes: "Seeded demo request.",
            status,
            organizationId: org.id,
            createdAt: daysAgo(30),
        });
    }
    console.log(`    blood requests: ${requestCount}`);

    /* donations against the first few donors, with matching audit entries */
    const donationCount = Math.min(4, donorProfileIds.length);
    for (let i = 0; i < donationCount; i += 1) {
        const donorProfileId = donorProfileIds[i];
        const [profile] = await db
            .select()
            .from(donorProfiles)
            .where(eq(donorProfiles.id, donorProfileId));

        await db.insert(donations).values({
            donorProfileId,
            organizationId: org.id,
            bloodGroup: profile.bloodGroup,
            donationDate: daysAgo(90),
            location: `${org.name} Center`,
            recipientName: pick(PATIENT_NAMES),
            notes: "Seeded demo donation.",
            pointsAwarded: POINTS.DONATION,
        });

        await db.insert(auditLogs).values({
            action: AuditAction.DONATION_RECORDED,
            performedById: adminId,
            organizationId: org.id,
            targetType: "DonorProfile",
            targetId: donorProfileId,
            details: "Seeded donation record.",
        });
    }
    console.log(`    donations: ${donationCount}`);

    /* events */
    await db.insert(events).values([
        {
            title: `${org.name} Monthly Blood Drive`,
            description: "Open blood donation camp for the local community.",
            date: daysAhead(21),
            location: `${org.name} Center`,
            district: "Dhaka",
            upazila: "Savar",
            organizationId: org.id,
            createdById: adminId,
            maxParticipants: 100,
            contactNumber: definition.contactPhone,
            status: EventStatus.UPCOMING,
        },
        {
            title: "Donor Awareness Session",
            description: "Session on donation eligibility and safety.",
            date: daysAgo(20),
            location: "Community Hall",
            district: "Dhaka",
            upazila: "Dhamrai",
            organizationId: org.id,
            createdById: adminId,
            maxParticipants: 50,
            contactNumber: definition.contactPhone,
            status: EventStatus.COMPLETED,
        },
    ]);
    console.log("    events: 2");
}

async function seed() {
    console.log("Seeding database...\n");

    await assertSafeToSeed();
    await clearTables();

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    /* ---------------------------------------------------------------- orgs */
    const orgIds: { id: number; name: string; slug: string }[] = [];
    for (const org of ORGANIZATIONS) {
        const [result] = await db.insert(organizations).values({
            name: org.name,
            slug: org.slug,
            primaryColor: org.primaryColor,
            contactEmail: org.contactEmail,
            contactPhone: org.contactPhone,
            address: org.address,
            isActive: true,
            isVerified: true,
        });
        orgIds.push({ id: Number(result.insertId), name: org.name, slug: org.slug });
        console.log(`  organization: ${org.name} (/${org.slug})`);
    }

    /* --------------------------------------------------------- super admin */
    await db.insert(users).values({
        name: "Super Admin",
        phone: "01700000000",
        email: "admin@bloodbank.org",
        password: passwordHash,
        role: UserRole.SUPER_ADMIN,
        onboardingCompleted: true,
        notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    });
    console.log("  super admin: 01700000000 / admin@bloodbank.org");

    /* ------------------------------------------------- per-organization data */
    for (const [index, org] of orgIds.entries()) {
        await seedOrganization(org, ORGANIZATIONS[index], passwordHash);
    }

    /* platform feedback */
    await db.insert(feedback).values({
        name: "Demo User",
        email: "demo@example.com",
        category: FeedbackCategory.GENERAL,
        message: "Seeded feedback entry.",
    });

    console.log("\nSeed complete.");
    console.log("\nLogins (password: demo123)");
    console.log("  super admin   01700000000  or  admin@bloodbank.org");
    for (const [index, org] of orgIds.entries()) {
        console.log(`  ${org.slug.padEnd(20)} ${ORGANIZATIONS[index].adminPhone}`);
    }
}

seed()
    .then(async () => {
        await closeDb();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error("Seed failed:", error);
        await closeDb();
        process.exit(1);
    });
