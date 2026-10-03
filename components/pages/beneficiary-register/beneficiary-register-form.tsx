"use client";

import { useState } from "react";
import {
  UserRound,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  BookOpen,
  ChevronDown,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

export function BeneficiaryRegisterForm() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[1320px]">

        {/* Heading */}
        <div className="mb-8 text-right">
          <h2 className="text-[28px] font-normal text-[#071B2F] sm:text-[32px] md:text-[36px]">
            البيانات الشخصية
          </h2>

          <p className="mt-3 text-[16px] leading-7 text-[#6B7280] sm:text-[18px]">
            يرجى إدخال بياناتك الشخصية لإكمال التسجيل كمستفيد.
          </p>
        </div>

        <form autoComplete="off">

          {/* Form Card */}
          <div className="rounded-[24px] border border-[#9DB5D8] bg-white px-5 py-7 md:px-8 md:py-9">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-[17px] text-[#071B2F]">
                  الاسم الكامل
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <UserRound
                    size={21}
                    strokeWidth={1.7}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />

                  <input
                    type="text"
                    name="beneficiaryFullName"
                    autoComplete="name"
                    placeholder="مثال: رولا محمد العنزي"
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

              {/* Phone */}
              <div>
                <label className="mb-2 block text-[17px] text-[#071B2F]">
                  رقم الجوال
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <Phone
                    size={21}
                    strokeWidth={1.7}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />

                  <input
                    type="tel"
                    name="beneficiaryPhone"
                    autoComplete="tel"
                    placeholder="05xxxxxxxx"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />

                  <input
                    type="email"
                    name="beneficiaryEmail"
                    autoComplete="email"
                    placeholder="example@domain.com"
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

              {/* Specialization */}
              <div>
                <label className="mb-2 block text-[17px] text-[#071B2F]">
                  مجال التخصص
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <GraduationCap
                    size={21}
                    strokeWidth={1.7}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />

                  <input
                    type="text"
                    name="beneficiarySpecialization"
                    autoComplete="off"
                    placeholder="مثال: علوم الحاسب"
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

              {/* Organization */}
              <div>
                <label className="mb-2 block text-[17px] text-[#071B2F]">
                  الجهة
                  <span className="mr-1 text-[#6B7280]">
                    (اختياري)
                  </span>
                </label>

                <div className="relative">
                  <Building2
                    size={21}
                    strokeWidth={1.7}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />

                  <input
                    type="text"
                    name="beneficiaryOrganization"
                    autoComplete="organization"
                    placeholder="مثال: جامعة الجوف"
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

              {/* Research Field */}
              <div>
                <label className="mb-2 block text-[17px] text-[#071B2F]">
                  مجال البحث
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <BookOpen
                    size={21}
                    strokeWidth={1.7}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />

                  <input
                    type="text"
                    name="researchField"
                    autoComplete="off"
                    placeholder="اكتب مجال البحث الذي تهتم به"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="أدخل كلمة المرور"
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

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
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

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-[17px] text-[#071B2F]">
                  تأكيد كلمة المرور
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={21}
                    strokeWidth={1.7}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />

                  <input
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    name="confirmNewPassword"
                    autoComplete="new-password"
                    placeholder="أعد إدخال كلمة المرور"
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

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
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
                      showConfirmPassword
                        ? "إخفاء تأكيد كلمة المرور"
                        : "إظهار تأكيد كلمة المرور"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} strokeWidth={1.7} />
                    ) : (
                      <Eye size={20} strokeWidth={1.7} />
                    )}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="md:col-span-2">
                <label className="mb-3 block text-[17px] text-[#071B2F]">
                  الصفة
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    name="beneficiaryRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="
                      h-[50px]
                      w-full
                      cursor-pointer
                      appearance-none
                      rounded-[8px]
                      border
                      border-[#9DB5D8]
                      bg-white
                      px-4
                      text-[15px]
                      text-[#071B2F]
                      outline-none
                      transition
                      focus:border-[#164A68]
                    "
                  >
                    <option value="student">
                      طالب
                    </option>

                    <option value="graduate-student">
                      طالب دراسات عليا
                    </option>

                    <option value="researcher">
                      باحث
                    </option>

                    <option value="faculty">
                      عضو هيئة تدريس
                    </option>

                    <option value="employee">
                      موظف
                    </option>

                    <option value="other">
                      أخرى
                    </option>
                  </select>

                  <ChevronDown
                    size={20}
                    strokeWidth={1.8}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#164A68]
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              className="
                min-h-[46px]
                min-w-[170px]
                rounded-[7px]
                bg-gradient-to-b
                from-[#071B2F]
                to-[#164A68]
                px-8
                text-[15px]
                text-white
                transition
                hover:opacity-90
              "
            >
              تسجيل
            </button>

            <button
              type="button"
              className="
                min-h-[46px]
                min-w-[170px]
                rounded-[7px]
                bg-[#D9D9D9]
                px-8
                text-[15px]
                text-[#071B2F]
                transition
                hover:opacity-80
              "
            >
              إلغاء
            </button>

          </div>
        </form>
      </div>
    </section>
  );
}