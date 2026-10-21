
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage(
        "يرجى إدخال البريد الإلكتروني وكلمة المرور."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // تسجيل الدخول بالبريد وكلمة المرور
      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError || !authData.user) {
        if (
          loginError?.message
            .toLowerCase()
            .includes("email not confirmed")
        ) {
          throw new Error(
            "يرجى تأكيد بريدك الإلكتروني أولًا."
          );
        }

        throw new Error(
          "تعذر تسجيل الدخول. تأكدي من البريد الإلكتروني وكلمة المرور."
        );
      }

      // جلب دور المستخدم وحالة الحساب وسبب الرفض
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select(
            "role, approval_status, rejection_reason"
          )
          .eq("id", authData.user.id)
          .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();

        throw new Error(
          "تم تسجيل الدخول، لكن تعذر العثور على بيانات حسابك."
        );
      }

      // توجيه المستخدم حسب نوع الحساب وحالته
      if (profile.role === "researcher") {
        if (profile.approval_status === "approved") {
          router.replace("/ar/researcher-dashboard");
        } else {
          // منع بقاء جلسة الباحث غير المعتمد
          await supabase.auth.signOut();

          if (profile.approval_status === "rejected") {
            const reason =
              typeof profile.rejection_reason === "string"
                ? profile.rejection_reason.trim()
                : "";

            throw new Error(
              reason
                ? `نعتذر، لم تتم الموافقة على طلب انضمامك كباحث متطوع.\nسبب الرفض: ${reason}`
                : "نعتذر، لم تتم الموافقة على طلب انضمامك كباحث متطوع."
            );
          }

          if (profile.approval_status === "suspended") {
            throw new Error(
              "حسابك كباحث متطوع موقوف مؤقتًا. يرجى التواصل مع إدارة المنصة."
            );
          }

          throw new Error(
            "طلب انضمامك كباحث متطوع قيد المراجعة. ستتمكن من الدخول بعد موافقة الإدارة."
          );
        }
      } else if (profile.role === "beneficiary") {
        router.replace("/ar/profile");
      } else if (profile.role === "admin") {
        // المدير يستخدم صفحة الدخول الإدارية
        await supabase.auth.signOut();

        throw new Error(
          "حساب المدير يُستخدم من خلال صفحة تسجيل دخول الإدارة."
        );
      } else {
        await supabase.auth.signOut();

        throw new Error(
          "نوع الحساب غير معروف. يرجى التواصل مع الإدارة."
        );
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ غير متوقع أثناء تسجيل الدخول."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[620px]">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="text-[28px] font-normal text-[#071B2F] sm:text-[32px]">
            مرحبًا بعودتك
          </h2>

          <p className="mt-3 text-[16px] text-[#6B7280]">
            أدخل بيانات حسابك لتسجيل الدخول.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          autoComplete="off"
          className="
            rounded-[24px]
            border
            border-[#9DB5D8]
            bg-white
            px-5
            py-7
            sm:px-7
            md:px-8
          "
        >
          <div className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-[17px] text-[#071B2F]"
              >
                البريد الإلكتروني
                <span className="mr-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <Mail
                  size={21}
                  strokeWidth={1.7}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-[#164A68]
                  "
                />

                <input
                  id="login-email"
                  type="email"
                  name="volunteerResearchLoginEmail"
                  autoComplete="username"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  placeholder="مثال: example@domain.com"
                  className="
                    h-[50px]
                    w-full
                    rounded-[8px]
                    border
                    border-[#9DB5D8]
                    bg-white
                    pr-12
                    pl-4
                    text-[15px]
                    text-[#071B2F]
                    outline-none
                    transition
                    placeholder:text-[#94A3B8]
                    focus:border-[#164A68]
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-[17px] text-[#071B2F]"
              >
                كلمة المرور
                <span className="mr-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <LockKeyhole
                  size={21}
                  strokeWidth={1.7}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-[#164A68]
                  "
                />

                <input
                  id="login-password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  name="volunteerResearchLoginPassword"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  placeholder="مثال: ********"
                  className="
                    h-[50px]
                    w-full
                    rounded-[8px]
                    border
                    border-[#9DB5D8]
                    bg-white
                    pr-12
                    pl-12
                    text-[15px]
                    text-[#071B2F]
                    outline-none
                    transition
                    placeholder:text-[#94A3B8]
                    focus:border-[#164A68]
                  "
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#6B7280]
                    transition
                    hover:text-[#164A68]
                  "
                  aria-label={
                    showPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                      strokeWidth={1.7}
                    />
                  ) : (
                    <Eye
                      size={20}
                      strokeWidth={1.7}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-[#F5CBD2] bg-[#FFF7F8] p-3 text-sm leading-6 text-[#B4233A]"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span className="whitespace-pre-line">
                  {errorMessage}
                </span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                mt-2
                flex
                min-h-[48px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[8px]
                bg-gradient-to-b
                from-[#071B2F]
                to-[#164A68]
                px-6
                text-[16px]
                text-white
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>

            {/* Register */}
            <p className="text-center text-[15px] text-[#6B7280]">
              لا تملك حسابًا؟{" "}
              <Link
                href="/ar/register"
                className="
                  text-[#164A68]
                  transition
                  hover:opacity-70
                "
              >
                سجل كمستفيد جديد
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
