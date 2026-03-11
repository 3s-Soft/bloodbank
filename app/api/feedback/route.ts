import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

// Feedback structures replaced instead of importing from old mongoose models
const FeedbackCategory = { GENERAL: "general", BUG: "bug", FEATURE: "feature", SUPPORT: "support" };
const FeedbackStatus = { NEW: "new", IN_PROGRESS: "in_progress", RESOLVED: "resolved", DISMISSED: "dismissed" };

// GET: List feedback (admin)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        let query: any = adminDb.collection(COLLECTIONS.FEEDBACK);

        if (orgSlug) {
            const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
            const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
            if (orgSnap.empty) {
                return NextResponse.json({ error: "Organization not found" }, { status: 404 });
            }
            query = query.where("organization", "==", orgSnap.docs[0].id);
        }

        if (status) query = query.where("status", "==", status);
        if (category) query = query.where("category", "==", category);

        const feedbackSnap = await query.orderBy("createdAt", "desc").limit(100).get();
        const feedback = await Promise.all(feedbackSnap.docs.map(async (doc: any) => {
             const data = doc.data();
             let userObj = null;
             if (data.user) {
                  const uDoc = await adminDb.collection(COLLECTIONS.USERS).doc(data.user).get();
                  if (uDoc.exists) userObj = { _id: uDoc.id, name: uDoc.data()?.name, email: uDoc.data()?.email };
             }
             return { _id: doc.id, ...data, user: userObj };
        }));

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }
}

// POST: Submit feedback (public)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, category, message, orgSlug, userId } = body;

        if (!name || !message) {
            return NextResponse.json(
                { error: "Name and message are required" },
                { status: 400 }
            );
        }

        const feedbackData: any = {
            name,
            email,
            category: category || FeedbackCategory.GENERAL,
            message,
            status: FeedbackStatus.NEW,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (orgSlug) {
            const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
            const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
            if (!orgSnap.empty) {
                 feedbackData.organization = orgSnap.docs[0].id;
            }
        }

        if (userId) feedbackData.user = userId;

        const feedbackRef = await adminDb.collection(COLLECTIONS.FEEDBACK).add(feedbackData);

        return NextResponse.json({ success: true, feedback: { _id: feedbackRef.id, ...feedbackData } });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
    }
}
