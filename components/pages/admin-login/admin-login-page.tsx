
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setMessage("");
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError || !data.user) {
        setMessage(
          "تعذر تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور."
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (
        profileError ||
        !profile ||
        profile.role !== "admin"
      ) {
        await supabase.auth.signOut();

        setMessage(
          "هذا الحساب غير مخوّل بالدخول إلى لوحة الإدارة."
        );
        return;
      }

      router.replace("/ar/admin-dashboard");
      router.refresh();
    } catch {
      setMessage(
        "تعذر الاتصال بخدمة تسجيل الدخول. يرجى المحاولة لاحقًا."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="flex min-h-[80vh] items-center justify-center bg-[#F8FBFD] px-4 py-14"
    >
      <div className="w-full max-w-[480px]">
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white px-6 py-10 shadow-sm sm:px-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#EAF2F8]">
              <ShieldCheck
                size={35}
                strokeWidth={1.6}
                className="text-[#164A68]"
              />
            </div>

            <h1 className="text-[27px] font-semibold text-[#071B2F]">
              تسجيل دخول الإدارة
            </h1>

            <p className="mt-3 text-[14px] leading-7 text-[#6B7280]">
              أدخل بيانات حساب الإدارة للوصول إلى
              لوحة التحكم وإدارة المنصة.
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            autoComplete="on"
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-[15px] text-[#071B2F]"
              >
                البريد الإلكتروني
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل البريد الإلكتروني"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  disabled={isLoading}
                  className="h-[50px] w-full rounded-[9px] border border-[#9DB5D8] bg-white pr-12 pl-4 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-[15px] text-[#071B2F]"
              >
                كلمة المرور
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  strokeWidth={1.7}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="h-[50px] w-full rounded-[9px] border border-[#9DB5D8] bg-white pr-12 pl-12 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[9px] bg-gradient-to-b from-[#071B2F] to-[#164A68] text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
              {!isLoading && <ArrowLeft size={18} />}
            </button>

            {message && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-[10px] border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-[13px] leading-6 text-[#164A68]"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />
                <span>{message}</span>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-[#E5E7EB] pt-5 text-center">
            <p className="text-[13px] text-[#6B7280]">
              هذه الصفحة مخصصة لإدارة منصة باحث متطوع فقط.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
