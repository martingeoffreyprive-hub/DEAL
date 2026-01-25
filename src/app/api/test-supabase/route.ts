import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug info
  const debug = {
    urlExists: !!url,
    urlLength: url?.length,
    urlStart: url?.substring(0, 40),
    keyExists: !!key,
    keyLength: key?.length,
    keyStart: key?.substring(0, 20),
  };

  if (!url || !key) {
    return NextResponse.json({ error: "Missing config", debug });
  }

  try {
    const supabase = createClient(url, key);

    // Test simple query
    const { data, error } = await supabase.from("profiles").select("count").limit(1);

    if (error) {
      return NextResponse.json({ error: error.message, debug });
    }

    return NextResponse.json({ success: true, debug, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, debug });
  }
}
