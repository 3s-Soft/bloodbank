import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS, UserRole } from "@/lib/firebase/types";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, password, age, gender, bloodGroup, district, upazila, village, lastDonationDate, orgSlug } = body;

        if (!name || (!phone && !email) || !orgSlug) {
            return NextResponse.json({ error: "Missing required fields: Name, Organization, and either Phone or Email" }, { status: 400 });
        }

        // Find organization
        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnapshot = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnapshot.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const organizationId = orgSnapshot.docs[0].id;

        const usersRef = adminDb.collection(COLLECTIONS.USERS);
        let userSnapshot;
        
        // Find by email or phone
        if (email) {
            userSnapshot = await usersRef.where("email", "==", email).limit(1).get();
            if (userSnapshot.empty && phone) {
                userSnapshot = await usersRef.where("phone", "==", phone).limit(1).get();
            }
        } else {
            userSnapshot = await usersRef.where("phone", "==", phone).limit(1).get();
        }
        
        let userId;
        let userData;

        if (userSnapshot.empty) {
            const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
            // Create user for the organization
            const newUserReq = {
                name,
                email: email || null,
                phone: phone || null,
                password: hashedPassword,
                role: UserRole.DONOR,
                organization: organizationId,
                onboardingCompleted: false,
                notificationPreferences: {
                    emailDonationReminders: true,
                    emailNewRequests: true,
                    emailEventUpdates: true,
                    inAppAlerts: true,
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const docRef = await usersRef.add(newUserReq);
            userId = docRef.id;
            userData = { _id: userId, ...newUserReq };
        } else {
            const existingUser = userSnapshot.docs[0];
            userId = existingUser.id;
            userData = { _id: userId, ...existingUser.data() } as any;
            
            // If user exists but is missing phone/email from the form, update it
            const updates: any = {};
            if (email && !userData.email) updates.email = email;
            if (phone && !userData.phone) updates.phone = phone;
            if (password && !userData.password) updates.password = await bcrypt.hash(password, 10);
            
            // If user exists but is not part of this organization, 
            // and has NO organization assigned yet, we can assign this one.
            if (!userData.organization) {
                updates.organization = organizationId;
                userData.organization = organizationId;
            }

            if (Object.keys(updates).length > 0) {
                updates.updatedAt = new Date();
                await usersRef.doc(userId).update(updates);
            }
        }

        // Create or update donor profile for this specific organization
        const profilesRef = adminDb.collection(COLLECTIONS.DONOR_PROFILES);
        const profileSnapshot = await profilesRef
            .where("user", "==", userId)
            .where("organization", "==", organizationId)
            .limit(1)
            .get();

        const profileData = {
            user: userId,
            organization: organizationId,
            bloodGroup,
            district,
            upazila,
            village,
            lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
            isAvailable: true,
            isVerified: false,
            updatedAt: new Date()
        };

        if (profileSnapshot.empty) {
            await profilesRef.add({
                ...profileData,
                totalDonations: 0,
                points: 0,
                badges: [],
                createdAt: new Date()
            });
        } else {
            await profilesRef.doc(profileSnapshot.docs[0].id).update(profileData);
        }

        return NextResponse.json({ message: "Registration successful" }, { status: 201 });
    } catch (error: unknown) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Internal Server Error") }, { status: 500 });
    }
}
