
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const loginUrl = new URL("/ar/researcher-login", origin);

  const supabase = await createClient();

  // دعم رابط تأكيد البريد باستخدام token_hash
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      loginUrl.searchParams.set("error", "confirmation_failed");
      return NextResponse.redirect(loginUrl);
    }

    loginUrl.searchParams.set("confirmed", "true");
    return NextResponse.redirect(loginUrl);
  }

  // دعم رابط التأكيد باستخدام PKCE code
  if (code) {
    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      loginUrl.searchParams.set("error", "confirmation_failed");
      return NextResponse.redirect(loginUrl);
    }

    loginUrl.searchParams.set("confirmed", "true");
    return NextResponse.redirect(loginUrl);
  }

  loginUrl.searchParams.set("error", "invalid_link");
  return NextResponse.redirect(loginUrl);
}
