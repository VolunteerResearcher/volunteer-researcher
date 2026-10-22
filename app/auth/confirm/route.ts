
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  // نحدد صفحة الدخول بناءً على نوع الحساب بعد التأكيد
  async function getLoginUrl() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const accountType = user?.user_metadata?.account_type;

    const loginPath =
      accountType === "researcher"
        ? "/ar/researcher-login"
        : "/ar/login";

    return new URL(loginPath, origin);
  }

  // عند تعذر التأكيد، نستخدم صفحة الدخول العامة
  function getErrorUrl(errorType: string) {
    const url = new URL("/ar/login", origin);
    url.searchParams.set("error", errorType);
    return NextResponse.redirect(url);
  }

  // التأكيد باستخدام token_hash
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return getErrorUrl("confirmation_failed");
    }

    const loginUrl = await getLoginUrl();
    loginUrl.searchParams.set("confirmed", "true");

    return NextResponse.redirect(loginUrl);
  }

  // التأكيد باستخدام PKCE code
  if (code) {
    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return getErrorUrl("confirmation_failed");
    }

    const loginUrl = await getLoginUrl();
    loginUrl.searchParams.set("confirmed", "true");

    return NextResponse.redirect(loginUrl);
  }

  return getErrorUrl("invalid_link");
}
