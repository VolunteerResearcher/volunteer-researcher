
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import {
  UserRound,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  FileText,
  BookOpen,
  Paperclip,
  Upload,
  ChevronDown,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

const inputClassName =
  "h-[50px] w-full rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-4 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68]";

const textareaClassName =
  "w-full resize-y rounded-[8px] border border-[#9DB5D8] bg-white px-4 py-3 text-[15px] leading-7 text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68]";

const iconClassName =
  "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]";

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
];

export function VolunteerForm() {
  const [researchField, setResearchField] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting || success) return;

    setError("");

    if (password.length < 8) {
      setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقتين.");
      return;
    }

    if (!researchField) {
      setError("يرجى اختيار مجال الاهتمام البحثي.");
      return;
    }

    if (!selectedFile) {
      setError("يرجى رفع السيرة الذاتية.");
      return;
    }

    const extension = selectedFile.name
      .toLowerCase()
      .slice(selectedFile.name.lastIndexOf("."));

    if (
      !allowedExtensions.includes(extension) ||
      selectedFile.size === 0 ||
      selectedFile.size > 10 * 1024 * 1024
    ) {
      setError(
        "يرجى اختيار ملف PDF أو Word أو PowerPoint بحجم لا يتجاوز 10 ميجابايت."
      );
      return;
    }

    const formData = new FormData(e.currentTarget);

    const fullName = String(formData.get("fullName") || "").trim();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const phone = String(formData.get("phone") || "").trim();

    const generalSpecialization = String(
      formData.get("generalSpecialization") || ""
    ).trim();

    const researcherBio = String(
      formData.get("researcherBio") || ""
    ).trim();

    const skillsAndExpertise = String(
      formData.get("skillsAndExpertise") || ""
    ).trim();

    if (
      !fullName ||
      !email ||
      !/^05[0-9]{8}$/.test(phone) ||
      !generalSpecialization
    ) {
      setError("يرجى إكمال جميع الحقول المطلوبة.");
      return;
    }

    if (
      researcherBio.length < 20 ||
      researcherBio.length > 1000
    ) {
      setError(
        "يرجى كتابة نبذة عن الباحث من 20 إلى 1000 حرف."
      );
      return;
    }

    if (
      skillsAndExpertise.length < 5 ||
      skillsAndExpertise.length > 1000
    ) {
      setError(
        "يرجى كتابة المهارات ومجالات الخبرة من 5 إلى 1000 حرف."
      );
      return;
    }

    if (!turnstileToken) {
      setError("يرجى إكمال التحقق الأمني قبل إرسال الطلب.");
      return;
    }

    formData.set("fullName", fullName);
    formData.set("email", email);
    formData.set("phone", phone);
    formData.set("password", password);
    formData.set("researchField", researchField);
    formData.set("researcherBio", researcherBio);
    formData.set("skillsAndExpertise", skillsAndExpertise);
    formData.set("cv", selectedFile);
    formData.set("turnstileToken", turnstileToken);

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/researcher/apply", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      const result: {
        success?: boolean;
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error ||
            "تعذر إرسال طلب الانضمام. يرجى المحاولة لاحقًا."
        );
        return;
      }

      setSuccess(
        "تم إنشاء حسابك وإرسال طلب انضمامك بنجاح! يرجى تأكيد بريدك الإلكتروني من خلال الرسالة المرسلة إليك، ثم تسجيل الدخول لمتابعة حالة طلبك ومعرفة قرار الإدارة."
      );

      setPassword("");
      setConfirmPassword("");
      setTurnstileToken("");
    } catch {
      setError(
        "تعذر الاتصال بالخادم. تحققي من اتصال الإنترنت وحاولي مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[1320px]">
        {/* Heading */}
        <div className="mb-8 text-right">
          <h2 className="text-[28px] font-normal text-[#071B2F] sm:text-[32px] md:text-[36px]">
            الانضمام كمتطوع
          </h2>

          <p className="mt-3 text-[16px] leading-7 text-[#6B7280] sm:text-[18px]">
            يمكنك طلب الانضمام من خلال تعبئة النموذج التالي.
          </p>
        </div>

        {/* Researcher Login Link */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-[12px] border border-[#D7E3EF] bg-[#F8FBFD] px-5 py-4">
          <span className="text-[15px] text-[#6B7280]">
            سبق لك تقديم طلب الانضمام؟
          </span>

          <Link
            href="/ar/researcher-login"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#164A68] transition hover:underline"
          >
            تسجيل دخول الباحث لمتابعة حالة الطلب
            <ArrowLeft size={17} />
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form */}
          <div className="rounded-[24px] border border-[#9DB5D8] bg-white px-5 py-7 md:px-8 md:py-9">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="volunteer-name"
                  className="mb-2 block text-[17px] text-[#071B2F]"
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
                    id="volunteer-name"
                    name="fullName"
                    type="text"
                    placeholder="اكتب اسمك الكامل هنا"
                    autoComplete="name"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="volunteer-phone"
                  className="mb-2 block text-[17px] text-[#071B2F]"
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
                    id="volunteer-phone"
                    name="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    autoComplete="tel"
                    inputMode="tel"
                    pattern="05[0-9]{8}"
                    title="أدخل رقم جوال سعودي يبدأ بـ 05 ويتكون من 10 أرقام"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="volunteer-email"
                  className="mb-2 block text-[17px] text-[#071B2F]"
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
                    id="volunteer-email"
                    name="email"
                    type="email"
                    placeholder="example@domain.com"
                    autoComplete="email"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Workplace */}
              <div>
                <label
                  htmlFor="volunteer-work"
                  className="mb-2 block text-[17px] text-[#071B2F]"
                >
                  جهة العمل
                  <span className="mr-1 text-[#6B7280]">
                    (إن وجدت)
                  </span>
                </label>

                <div className="relative">
                  <Building2
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="volunteer-work"
                    name="workplace"
                    type="text"
                    placeholder="اكتب جهة العمل هنا"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* General Specialization */}
              <div>
                <label
                  htmlFor="volunteer-specialization"
                  className="mb-2 block text-[17px] text-[#071B2F]"
                >
                  التخصص العام
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <GraduationCap
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="volunteer-specialization"
                    name="generalSpecialization"
                    type="text"
                    placeholder="مثال: علوم الحاسب"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Detailed Specialization */}
              <div>
                <label
                  htmlFor="volunteer-detailed-specialization"
                  className="mb-2 block text-[17px] text-[#071B2F]"
                >
                  التخصص الدقيق
                </label>

                <div className="relative">
                  <FileText
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <input
                    id="volunteer-detailed-specialization"
                    name="detailedSpecialization"
                    type="text"
                    placeholder="مثال: الذكاء الاصطناعي"
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Research Interest */}
              <div>
                <label
                  htmlFor="volunteer-research-field"
                  className="mb-2 block text-[17px] text-[#071B2F]"
                >
                  مجال الاهتمام البحثي
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <BookOpen
                    size={21}
                    strokeWidth={1.7}
                    className={iconClassName}
                  />

                  <select
                    id="volunteer-research-field"
                    name="researchField"
                    value={researchField}
                    onChange={(e) =>
                      setResearchField(e.target.value)
                    }
                    required
                    className="h-[50px] w-full cursor-pointer appearance-none rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-12 text-[15px] text-[#071B2F] outline-none transition focus:border-[#164A68]"
                  >
                    <option value="">
                      اختر مجال الاهتمام البحثي
                    </option>
                    <option value="health">صحي</option>
                    <option value="engineering">هندسي</option>
                    <option value="technology">تقني</option>
                    <option value="social">اجتماعي</option>
                    <option value="education">تربوي</option>
                    <option value="business">
                      إداري واقتصادي
                    </option>
                    <option value="law">قانوني</option>
                    <option value="humanities">إنساني</option>
                    <option value="environment">بيئي</option>
                    <option value="basic-sciences">
                      علوم أساسية
                    </option>
                    <option value="other">مجالات أخرى</option>
                  </select>

                  <ChevronDown
                    size={20}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  />
                </div>
              </div>

              {/* Researcher Bio */}
              <div className="md:col-span-2">
                <label
                  htmlFor="volunteer-bio"
                  className="mb-2 block text-[17px] text-[#071B2F]"
                >
                  نبذة عن الباحث
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <textarea
                  id="volunteer-bio"
                  name="researcherBio"
                  rows={4}
                  required
                  minLength={20}
                  maxLength={1000}
                  placeholder="عرّف بنفسك، وخبراتك الأكاديمية والبحثية، وكيف يمكنك مساعدة المستفيدين..."
                  className={textareaClassName}
                />

                <p className="mt-2 text-[12px] text-[#6B7280]">
                  اكتب نبذة مختصرة عن نفسك من 20 إلى 1000 حرف.
                </p>
              </div>

              {/* Skills and Expertise */}
              <div className="md:col-span-2">
                <label
                  htmlFor="volunteer-skills"
                  className="mb-2 block text-[17px] text-[#071B2F]"
                >
                  المهارات ومجالات الخبرة
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <textarea
                  id="volunteer-skills"
                  name="skillsAndExpertise"
                  rows={4}
                  required
                  minLength={5}
                  maxLength={1000}
                  placeholder="مثال: منهجية البحث العلمي، تحليل البيانات، كتابة الأوراق العلمية، مراجعة الأدبيات..."
                  className={textareaClassName}
                />

                <p className="mt-2 text-[12px] text-[#6B7280]">
                  اذكر المهارات والمجالات التي يمكنك تقديم المساعدة فيها.
                </p>
              </div>

              {/* CV */}
              <div>
                <label className="mb-2 block text-[17px] text-[#071B2F]">
                  السيرة الذاتية (CV)
                  <span className="mr-1 text-red-500">*</span>
                </label>

                <label
                  htmlFor="volunteer-cv"
                  className="flex min-h-[100px] cursor-pointer items-center justify-between rounded-[10px] border border-dashed border-[#9DB5D8] bg-[#F8FAFC] px-5 transition hover:border-[#164A68]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2F8]">
                      <Paperclip
                        size={24}
                        strokeWidth={1.7}
                        className="text-[#164A68]"
                      />
                    </div>

                    <div>
                      <p className="break-all text-[15px] text-[#071B2F]">
                        {fileName || "اضغط لرفع الملف"}
                      </p>

                      <p className="mt-1 text-[13px] text-[#6B7280]">
                        PDF, DOC, DOCX, PPT, PPTX
                      </p>

                      <p className="mt-1 text-[12px] text-[#6B7280]">
                        الحد الأقصى 10 ميجابايت
                      </p>
                    </div>
                  </div>

                  <Upload
                    size={21}
                    strokeWidth={1.7}
                    className="shrink-0 text-[#164A68]"
                  />

                  <input
                    id="volunteer-cv"
                    name="cv"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    className="sr-only"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) {
                        setSelectedFile(null);
                        setFileName("");
                        return;
                      }

                      const extension = file.name
                        .toLowerCase()
                        .slice(file.name.lastIndexOf("."));

                      if (
                        !allowedExtensions.includes(extension) ||
                        file.size === 0 ||
                        file.size > 10 * 1024 * 1024
                      ) {
                        setError(
                          "يرجى اختيار ملف PDF أو Word أو PowerPoint بحجم لا يتجاوز 10 ميجابايت."
                        );

                        e.target.value = "";
                        setSelectedFile(null);
                        setFileName("");
                        return;
                      }

                      setError("");
                      setSelectedFile(file);
                      setFileName(file.name);
                    }}
                  />
                </label>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="volunteer-password"
                  className="mb-2 block text-[17px] text-[#071B2F]"
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
                    id="volunteer-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="أدخل كلمة المرور"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className={`${inputClassName} pl-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
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

                <p className="mt-2 text-[12px] text-[#6B7280]">
                  يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="volunteer-confirm-password"
                  className="mb-2 block text-[17px] text-[#071B2F]"
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
                    id="volunteer-confirm-password"
                    name="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="أعد إدخال كلمة المرور"
                    autoComplete="new-password"
                    required
                    className={`${inputClassName} pl-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "إخفاء تأكيد كلمة المرور"
                        : "إظهار تأكيد كلمة المرور"
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {confirmPassword &&
                  password !== confirmPassword && (
                    <p className="mt-2 text-[13px] text-red-500">
                      كلمتا المرور غير متطابقتين.
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-5 py-4 text-[14px] leading-7 text-red-700"
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              role="status"
              className="mt-5 rounded-[10px] border border-[#9DB5D8] bg-[#F8FBFD] px-5 py-4 text-[14px] leading-7 text-[#164A68]"
            >
              <p className="font-semibold">
                تم إنشاء حسابك وإرسال طلب انضمامك بنجاح!
              </p>

              <p className="mt-2">{success}</p>

              <div className="mt-4">
                <Link
                  href="/ar/researcher-login"
                  className="inline-flex items-center gap-2 font-semibold hover:underline"
                >
                  تسجيل الدخول لمتابعة حالة طلبي
                  <ArrowLeft size={17} />
                </Link>
              </div>
            </div>
          )}

          {/* Security Verification */}
          {!success && (
            <div className="mt-6">
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting || !!success}
              className="min-h-[46px] min-w-[170px] rounded-[7px] bg-gradient-to-b from-[#071B2F] to-[#164A68] px-8 text-[15px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "جارٍ إنشاء الحساب وإرسال الطلب..."
                : "إنشاء الحساب وإرسال الطلب"}
            </button>

            <button
              type="reset"
              disabled={isSubmitting}
              onClick={() => {
                setResearchField("");
                setFileName("");
                setSelectedFile(null);
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setShowConfirmPassword(false);
                setTurnstileToken("");
                setError("");
                setSuccess("");
              }}
              className="min-h-[46px] min-w-[170px] rounded-[7px] bg-[#D9D9D9] px-8 text-[15px] text-[#071B2F] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
