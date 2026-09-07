import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBaseUrlFromRequest } from "@/lib/url";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${getBaseUrlFromRequest(request)}/login`, {
    status: 303,
  });
}
