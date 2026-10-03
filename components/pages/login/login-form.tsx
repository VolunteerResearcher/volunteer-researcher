"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                البريد الإلكتروني
                <span className="mr-1 text-red-500">*</span>
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
                  type="email"
                  name="volunteerResearchLoginEmail"
                  autoComplete="off"
                  defaultValue=""
                  readOnly
                  onFocus={(e) => {
                    e.currentTarget.readOnly = false;
                  }}
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
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                كلمة المرور
                <span className="mr-1 text-red-500">*</span>
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
                  type={showPassword ? "text" : "password"}
                  name="volunteerResearchLoginPassword"
                  autoComplete="new-password"
                  defaultValue=""
                  readOnly
                  onFocus={(e) => {
                    e.currentTarget.readOnly = false;
                  }}
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
                    <EyeOff size={20} strokeWidth={1.7} />
                  ) : (
                    <Eye size={20} strokeWidth={1.7} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="
                mt-2
                min-h-[48px]
                w-full
                rounded-[8px]
                bg-gradient-to-b
                from-[#071B2F]
                to-[#164A68]
                px-6
                text-[16px]
                text-white
                transition
                hover:opacity-90
              "
            >
              تسجيل الدخول
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