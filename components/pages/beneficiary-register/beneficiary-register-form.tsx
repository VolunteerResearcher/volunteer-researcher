
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function BeneficiaryRegisterForm() {
  const router = useRouter();

  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [organization, setOrganization] = useState("");
  const [researchField, setResearchField] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSpecialization = specialization.trim();
    const cleanOrganization = organization.trim();
    const cleanResearchField = researchField.trim();

    if (
      !cleanFullName ||
      !cleanPhone ||
      !cleanEmail ||
      !cleanSpecialization ||
      !cleanResearchField ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }

    if (!/^05\d{8}$/.test(cleanPhone)) {
      setErrorMessage(
        "يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 ويتكون من 10 أرقام."
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("كلمة المرور وتأكيد كلمة المرور غير متطابقين.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            account_type: "beneficiary",
            full_name: cleanFullName,
            phone: cleanPhone,
            specialization: cleanSpecialization,
            organization: cleanOrganization || null,
            research_field: cleanResearchField,
            beneficiary_type: role,
          },
          emailRedirectTo: `${window.location.origin}/ar/login`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error(
          "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى."
        );
      }

      if (data.user.identities?.length === 0) {
        setErrorMessage(
          "قد يكون هذا البريد الإلكتروني مسجلًا مسبقًا. جربي تسجيل الدخول أو استعادة كلمة المرور."
        );
        return;
      }

      if (data.session) {
        setSuccessMessage(
          "تم إنشاء حسابك بنجاح! جارٍ الانتقال إلى ملفك الشخصي."
        );

        router.replace("/ar/profile");
        router.refresh();
      } else {
        setSuccessMessage(
          "تم استلام طلب التسجيل. إذا كان البريد صالحًا وغير مسجل مسبقًا، ستصلك رسالة لتأكيد الحساب. افتحي بريدك الإلكتروني وأكّدي الحساب، ثم سجّلي الدخول."
        );
      }
    } catch (error) {
      console.error("Beneficiary registration error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "h-[50px] w-full rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-4 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-60";

  const labelClassName =
    "mb-2 block text-[17px] text-[#071B2F]";

  const iconClassName =
    "absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]";

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

        <form onSubmit={handleRegister} autoComplete="off">
          {/* Form Card */}
          <div className="rounded-[24px] border border-[#9DB5D8] bg-white px-5 py-7 md:px-8 md:py-9">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="beneficiary-full-name"
                  className={labelClassName}
                >
                  الاسم الكامل
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <UserRound
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="beneficiary-full-name"
                    type="text"
                    name="beneficiaryFullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    required
                    maxLength={150}
                    disabled={isSubmitting}
                    placeholder="مثال: رولا محمد العنزي"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="beneficiary-phone"
                  className={labelClassName}
                >
                  رقم الجوال
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <Phone
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="beneficiary-phone"
                    type="tel"
                    name="beneficiaryPhone"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    required
                    maxLength={10}
                    inputMode="numeric"
                    disabled={isSubmitting}
                    placeholder="05xxxxxxxx"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="beneficiary-email"
                  className={labelClassName}
                >
                  البريد الإلكتروني
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <Mail
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="beneficiary-email"
                    type="email"
                    name="beneficiaryEmail"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    maxLength={254}
                    disabled={isSubmitting}
                    placeholder="example@domain.com"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label
                  htmlFor="beneficiary-specialization"
                  className={labelClassName}
                >
                  مجال التخصص
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <GraduationCap
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="beneficiary-specialization"
                    type="text"
                    name="beneficiarySpecialization"
                    autoComplete="off"
                    value={specialization}
                    onChange={(event) =>
                      setSpecialization(event.target.value)
                    }
                    required
                    maxLength={150}
                    disabled={isSubmitting}
                    placeholder="مثال: علوم الحاسب"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label
                  htmlFor="beneficiary-organization"
                  className={labelClassName}
                >
                  الجهة
                  <span className="mr-1 text-[#6B7280]">
                    (اختياري)
                  </span>
                </label>

                <div className="relative">
                  <Building2
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="beneficiary-organization"
                    type="text"
                    name="beneficiaryOrganization"
                    autoComplete="organization"
                    value={organization}
                    onChange={(event) =>
                      setOrganization(event.target.value)
                    }
                    maxLength={150}
                    disabled={isSubmitting}
                    placeholder="مثال: جامعة الجوف"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Research Field */}
              <div>
                <label
                  htmlFor="beneficiary-research-field"
                  className={labelClassName}
                >
                  مجال البحث
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <BookOpen
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="beneficiary-research-field"
                    type="text"
                    name="researchField"
                    autoComplete="off"
                    value={researchField}
                    onChange={(event) =>
                      setResearchField(event.target.value)
                    }
                    required
                    maxLength={150}
                    disabled={isSubmitting}
                    placeholder="اكتب مجال البحث الذي تهتم به"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="beneficiary-password"
                  className={labelClassName}
                >
                  كلمة المرور
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="beneficiary-password"
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    placeholder="أدخل كلمة المرور"
                    className={`${inputClassName} pl-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] transition hover:text-[#164A68]"
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
                <label
                  htmlFor="beneficiary-confirm-password"
                  className={labelClassName}
                >
                  تأكيد كلمة المرور
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="beneficiary-confirm-password"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    name="confirmNewPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    placeholder="أعد إدخال كلمة المرور"
                    className={`${inputClassName} pl-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] transition hover:text-[#164A68]"
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
                <label
                  htmlFor="beneficiary-role"
                  className="mb-3 block text-[17px] text-[#071B2F]"
                >
                  الصفة
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    id="beneficiary-role"
                    name="beneficiaryRole"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    className="h-[50px] w-full cursor-pointer appearance-none rounded-[8px] border border-[#9DB5D8] bg-white px-4 text-[15px] text-[#071B2F] outline-none transition focus:border-[#164A68] disabled:opacity-60"
                  >
                    <option value="student">طالب</option>
                    <option value="graduate-student">
                      طالب دراسات عليا
                    </option>
                    <option value="researcher">باحث</option>
                    <option value="faculty">
                      عضو هيئة تدريس
                    </option>
                    <option value="employee">موظف</option>
                    <option value="other">أخرى</option>
                  </select>

                  <ChevronDown
                    size={20}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-xl border border-[#F5CBD2] bg-[#FFF7F8] p-4 text-sm leading-7 text-[#B4233A]"
            >
              <AlertCircle
                size={20}
                className="mt-1 shrink-0"
              />
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mt-5 flex items-start gap-3 rounded-xl border border-[#B7DFC6] bg-[#F0FFF5] p-4 text-sm leading-7 text-[#166534]"
            >
              <CheckCircle2
                size={20}
                className="mt-1 shrink-0"
              />
              <p>{successMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting || Boolean(successMessage)}
              className="flex min-h-[46px] min-w-[170px] items-center justify-center gap-2 rounded-[7px] bg-gradient-to-b from-[#071B2F] to-[#164A68] px-8 text-[15px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  جارٍ التسجيل...
                </>
              ) : (
                "تسجيل"
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => router.push("/ar/login")}
              className="min-h-[46px] min-w-[170px] rounded-[7px] bg-[#D9D9D9] px-8 text-[15px] text-[#071B2F] transition hover:opacity-80 disabled:opacity-60"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
