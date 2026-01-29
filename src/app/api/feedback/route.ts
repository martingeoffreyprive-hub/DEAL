/**
 * Feedback Collection API
 * POST /api/feedback
 * Collects user feedback, bug reports, feature requests, and NPS scores
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface FeedbackPayload {
  type: "general" | "bug" | "feature" | "nps";
  message: string;
  npsScore?: number;
  page?: string;
  userAgent?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: FeedbackPayload = await request.json();

    // Validate
    if (!payload.type || (!payload.message && payload.type !== "nps")) {
      return NextResponse.json(
        { error: "Type et message requis" },
        { status: 400 }
      );
    }

    if (payload.type === "nps" && (payload.npsScore === undefined || payload.npsScore < 0 || payload.npsScore > 10)) {
      return NextResponse.json(
        { error: "Score NPS invalide (0-10)" },
        { status: 400 }
      );
    }

    // Get current user (optional — allow anonymous feedback)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Store feedback
    const feedbackRecord = {
      user_id: user?.id || null,
      type: payload.type,
      message: payload.message,
      nps_score: payload.npsScore ?? null,
      page: payload.page || null,
      user_agent: payload.userAgent || null,
      status: "new",
      created_at: payload.timestamp || new Date().toISOString(),
    };

    // Try to insert into feedback table
    const { error } = await supabase
      .from("feedback")
      .insert(feedbackRecord);

    if (error) {
      // If table doesn't exist, log to console as fallback
      console.log("[Feedback]", JSON.stringify(feedbackRecord));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Never fail on feedback — non-blocking
    console.error("[Feedback] Error:", error);
    return NextResponse.json({ success: true });
  }
}
