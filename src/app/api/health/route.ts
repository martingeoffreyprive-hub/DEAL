/**
 * Health Check Endpoint
 * GET /api/health
 * Returns system status for uptime monitoring
 */

export const dynamic = "force-dynamic";
export const runtime = "edge";

import { NextResponse } from "next/server";

interface HealthCheck {
  name: string;
  status: "up" | "down" | "degraded";
  latency?: number;
  error?: string;
}

async function checkSupabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return { name: "supabase", status: "down", error: "URL not configured" };

    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      signal: AbortSignal.timeout(5000),
    });

    return {
      name: "supabase",
      status: res.ok ? "up" : "degraded",
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return { name: "supabase", status: "down", latency: Date.now() - start, error: error.message };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    if (!url) return { name: "redis", status: "down", error: "URL not configured" };

    const res = await fetch(`${url}/ping`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN || ""}`,
      },
      signal: AbortSignal.timeout(3000),
    });

    return {
      name: "redis",
      status: res.ok ? "up" : "degraded",
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return { name: "redis", status: "down", latency: Date.now() - start, error: error.message };
  }
}

export async function GET() {
  const startTime = Date.now();

  const checks = await Promise.all([
    checkSupabase(),
    checkRedis(),
  ]);

  const allUp = checks.every((c) => c.status === "up");
  const anyDown = checks.some((c) => c.status === "down");
  const overallStatus = anyDown ? "degraded" : allUp ? "up" : "degraded";

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    uptime: process.uptime?.() || null,
    checks: Object.fromEntries(checks.map((c) => [c.name, c])),
    responseTime: Date.now() - startTime,
  };

  return NextResponse.json(response, {
    status: overallStatus === "up" ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
