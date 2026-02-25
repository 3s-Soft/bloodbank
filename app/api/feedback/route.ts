import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Feedback, FeedbackCategory, FeedbackStatus } from "@/lib/models/Feedback";
import { Organization } from "@/lib/models/Organization";

// GET: List feedback (admin)
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        const query: Record<string, unknown> = {};

        if (orgSlug) {
            const org = await Organization.findOne({ slug: orgSlug });
            if (!org) {
                return NextResponse.json({ error: "Organization not found" }, { status: 404 });
            }
            query.organization = org._id;
        }

        if (status) query.status = status;
        if (category) query.category = category;

        const feedback = await Feedback.find(query)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }
}

// POST: Submit feedback (public)
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { name, email, category, message, orgSlug, userId } = body;

        if (!name || !message) {
            return NextResponse.json(
                { error: "Name and message are required" },
                { status: 400 }
            );
        }

        const feedbackData: Record<string, unknown> = {
            name,
            email,
            category: category || FeedbackCategory.GENERAL,
            message,
            status: FeedbackStatus.NEW,
        };

        if (orgSlug) {
            const org = await Organization.findOne({ slug: orgSlug });
            if (org) feedbackData.organization = org._id;
        }

        if (userId) feedbackData.user = userId;

        const feedback = await Feedback.create(feedbackData);

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
    }
}
