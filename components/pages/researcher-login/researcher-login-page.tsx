
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  UserRoundCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function ResearcherLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isLoading) return;

    setErrorMessage("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError || !data.user) {
        if (
          loginError?.message
            .toLowerCase()
            .includes("email not confirmed")
        ) {
          setErrorMessage(
            "يرجى تأكيد بريدك الإلكتروني من خلال رابط التأكيد المرسل إليك، ثم إعادة المحاولة."
          );
        } else {
          setErrorMessage(
            "تعذر تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور."
          );
        }

        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role, approval_status")
          .eq("id", data.user.id)
          .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();

        setErrorMessage(
          "تم التحقق من بيانات الدخول، لكن تعذر العثور على ملف الحساب. يرجى التواصل مع الإدارة."
        );

        return;
      }

      if (profile.role !== "researcher") {
        await supabase.auth.signOut();

        setErrorMessage(
          "هذه الصفحة مخصصة للباحثين فقط. يرجى استخدام صفحة تسجيل الدخول المناسبة لنوع حسابك."
        );

        return;
      }

      if (profile.approval_status === "approved") {
        router.replace("/ar/researcher-dashboard");
        router.refresh();
        return;
      }

      if (
        profile.approval_status === "pending" ||
        profile.approval_status === "rejected" ||
        profile.approval_status === "suspended"
      ) {
        router.replace("/ar/researcher-status");
        router.refresh();
        return;
      }

      await supabase.auth.signOut();

      setErrorMessage(
        "حالة حساب الباحث غير معروفة. يرجى التواصل مع الإدارة."
      );
    } catch (error) {
      console.error(
        "Researcher login error:",
        error instanceof Error
          ? error.message
          : "Unknown error"
      );

      setErrorMessage(
        "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-[75vh] bg-[#F8FBFD] px-4 py-14 md:py-20"
    >
      <div className="mx-auto max-w-[510px]">
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white px-6 py-9 shadow-sm sm:px-10">
          {/* Heading */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF2F8]">
              <UserRoundCheck
                size={31}
                strokeWidth={1.6}
                className="text-[#164A68]"
              />
            </div>

            <h1 className="text-[27px] font-semibold text-[#071B2F]">
              تسجيل دخول الباحث
            </h1>

            <p className="mt-3 text-[14px] leading-7 text-[#6B7280]">
              سجّل الدخول لمتابعة حالة طلب انضمامك،
              أو للوصول إلى لوحة الباحث بعد اعتماد حسابك.
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="researcher-email"
                className="mb-2 block text-[15px] text-[#071B2F]"
              >
                البريد الإلكتروني
                <span className="mr-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  id="researcher-email"
                  name="researcher-email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="example@domain.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={isLoading}
                  required
                  className="h-[50px] w-full rounded-[9px] border border-[#9DB5D8] bg-white pr-12 pl-4 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="researcher-password"
                className="mb-2 block text-[15px] text-[#071B2F]"
              >
                كلمة المرور
                <span className="mr-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  id="researcher-password"
                  name="researcher-password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                  className="h-[50px] w-full rounded-[9px] border border-[#9DB5D8] bg-white pr-12 pl-12 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={isLoading}
                  aria-label={
                    showPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-[#F5CBD2] bg-[#FFF7F8] p-4 text-sm leading-7 text-[#B4233A]"
              >
                <AlertCircle
                  size={20}
                  className="mt-1 shrink-0"
                />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[9px] bg-gradient-to-b from-[#071B2F] to-[#164A68] text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowLeft size={18} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-7 border-t border-[#E5E7EB] pt-6 text-center">
            <p className="text-[14px] text-[#6B7280]">
              ليس لديك حساب باحث؟
            </p>

            <Link
              href="/ar/volunteer"
              className="mt-2 inline-block text-[14px] font-semibold text-[#164A68] hover:underline"
            >
              الانضمام كباحث متطوع
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
