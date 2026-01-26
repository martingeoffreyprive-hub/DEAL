/**
 * Web Vitals Analytics Endpoint
 * POST /api/analytics/vitals
 * Collects Core Web Vitals metrics for performance monitoring
 */

export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

interface VitalsPayload {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
  url: string;
  timestamp: number;
  userAgent: string;
  connection: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: VitalsPayload = await request.json();

    // Validate required fields
    if (!payload.name || typeof payload.value !== "number") {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // In production, you would send this to your analytics service
    // Examples: Datadog, New Relic, custom database, etc.

    // Log for now (would be replaced with actual analytics)
    if (process.env.NODE_ENV === "development") {
      console.log("[Web Vitals]", {
        metric: payload.name,
        value: payload.value.toFixed(2),
        rating: payload.rating,
        url: payload.url,
      });
    }

    // Optional: Store in database for custom dashboards
    // await supabase.from("performance_metrics").insert({
    //   metric_name: payload.name,
    //   metric_value: payload.value,
    //   rating: payload.rating,
    //   url: payload.url,
    //   user_agent: payload.userAgent,
    //   connection_type: payload.connection,
    //   created_at: new Date(payload.timestamp).toISOString(),
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Don't fail - analytics should be non-blocking
    return NextResponse.json({ success: true });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
