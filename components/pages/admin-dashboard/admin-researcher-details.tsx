
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  UserRound,
  GraduationCap,
  Mail,
  CalendarDays,
  ClipboardList,
  FileText,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  AlertCircle,
  Phone,
  Building2,
  BookOpen,
  Loader2,
} from "lucide-react";

type ResearcherStatus =
  | "نشط"
  | "بانتظار المراجعة"
  | "موقوف"
  | "مرفوض";

type Researcher = {
  id: string;
  name: string;
  email: string;
  status: string;
  joinDate: string;
  rejectionReason: string;
  specialty: string;
  detailedSpecialty: string;
  researchField: string;
  researcherBio: string;
  skillsAndExpertise: string;
  phone: string;
  workplace: string;
  cvPath: string | null;
  hasCompletedApplication: boolean;
  requestsCount: number | null;
};

type AdminResearcherDetailsProps = {
  researcher: Researcher | null;
};

type ReviewAction =
  | "approve"
  | "reject"
  | "suspend"
  | "reactivate";

const statusStyles: Record<ResearcherStatus, string> = {
  نشط: "bg-[#E8F7EE] text-[#2E7D4F]",
  "بانتظار المراجعة": "bg-[#FFF3D6] text-[#A36A00]",
  موقوف: "bg-[#FFE8EC] text-[#B4233A]",
  مرفوض: "bg-[#F1F5F9] text-[#64748B]",
};

function getResearcherStatus(
  status: string
): ResearcherStatus {
  switch (status) {
    case "approved":
      return "نشط";
    case "pending":
      return "بانتظار المراجعة";
    case "suspended":
      return "موقوف";
    case "rejected":
      return "مرفوض";
    default:
      return "بانتظار المراجعة";
  }
}

function formatJoinDate(date: string) {
  if (!date) return "غير متوفر";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Riyadh",
  })
    .format(parsedDate)
    .replaceAll("-", "/");
}

const actionConfig: Record<
  ReviewAction,
  {
    title: string;
    button: string;
    description: (name: string) => string;
    successStatus: string;
    color: "green" | "red" | "blue";
  }
> = {
  approve: {
    title: "تأكيد الموافقة على الباحث",
    button: "تأكيد الموافقة",
    description: (name) =>
      `هل أنت متأكد من الموافقة على انضمام الباحث «${name}»؟ سيتم تفعيل حسابه كباحث معتمد.`,
    successStatus: "approved",
    color: "green",
  },
  reject: {
    title: "رفض طلب انضمام الباحث",
    button: "تأكيد الرفض",
    description: (name) =>
      `يرجى توضيح سبب رفض طلب الباحث «${name}». سيتم حفظ السبب في قاعدة البيانات.`,
    successStatus: "rejected",
    color: "red",
  },
  suspend: {
    title: "تأكيد إيقاف حساب الباحث",
    button: "تأكيد الإيقاف",
    description: (name) =>
      `هل أنت متأكد من إيقاف حساب الباحث «${name}» مؤقتًا؟ ستبقى بياناته وسيرته الذاتية محفوظة، وستتغير حالته إلى موقوف.`,
    successStatus: "suspended",
    color: "red",
  },
  reactivate: {
    title: "تأكيد إعادة تفعيل الباحث",
    button: "تأكيد إعادة التفعيل",
    description: (name) =>
      `هل أنت متأكد من إعادة تفعيل حساب الباحث «${name}»؟ ستعود حالته إلى نشط.`,
    successStatus: "approved",
    color: "blue",
  },
};

export function AdminResearcherDetails({
  researcher,
}: AdminResearcherDetailsProps) {
  const router = useRouter();

  const [reviewAction, setReviewAction] =
    useState<ReviewAction | null>(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [currentStatus, setCurrentStatus] =
    useState(researcher?.status ?? "pending");

  const [
    currentRejectionReason,
    setCurrentRejectionReason,
  ] = useState(researcher?.rejectionReason ?? "");

  const status = getResearcherStatus(currentStatus);

  function openReview(action: ReviewAction) {
    setErrorMessage("");
    setSuccessMessage("");
    setRejectionReason("");
    setReviewAction(action);
  }

  function closeReview() {
    if (isSubmitting) return;

    setReviewAction(null);
    setRejectionReason("");
    setErrorMessage("");
  }

  async function submitReview() {
    if (!researcher || !reviewAction || isSubmitting) {
      return;
    }

    if (
      reviewAction === "reject" &&
      (rejectionReason.trim().length < 5 ||
        rejectionReason.trim().length > 1000)
    ) {
      setErrorMessage(
        "يرجى كتابة سبب الرفض من 5 إلى 1000 حرف."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/admin/researchers/${researcher.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: reviewAction,
            ...(reviewAction === "reject"
              ? { reason: rejectionReason.trim() }
              : {}),
          }),
        }
      );

      const result: {
        success?: boolean;
        status?: string;
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "تعذر تنفيذ الإجراء."
        );
      }

      setCurrentStatus(
        result.status ??
          actionConfig[reviewAction].successStatus
      );

      if (reviewAction === "reject") {
        setCurrentRejectionReason(
          rejectionReason.trim()
        );
      } else if (reviewAction === "approve") {
        setCurrentRejectionReason("");
      }

      setSuccessMessage(
        result.message ||
          "تم تحديث حالة الباحث بنجاح."
      );

      setReviewAction(null);
      setRejectionReason("");

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ غير متوقع."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!researcher) {
    return (
      <section
        dir="rtl"
        className="min-h-screen bg-[#F8FBFD] px-4 py-10 sm:px-8 lg:px-10"
      >
        <Link
          href="/ar/admin-dashboard/researchers"
          className="inline-flex items-center gap-2 text-sm text-[#164A68]"
        >
          <ArrowRight size={18} />
          العودة إلى إدارة الباحثين
        </Link>

        <div className="mt-8 rounded-[24px] border border-[#D7E3EF] bg-white p-10 text-center">
          <h1 className="text-xl font-semibold text-[#071B2F]">
            الباحث غير موجود
          </h1>
          <p className="mt-3 text-sm text-[#64748B]">
            لم يتم العثور على بيانات الباحث المطلوب.
          </p>
        </div>
      </section>
    );
  }

  const modalConfig = reviewAction
    ? actionConfig[reviewAction]
    : null;

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* العودة */}
        <Link
          href="/ar/admin-dashboard/researchers"
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى إدارة الباحثين
        </Link>

        {/* رسائل الإجراءات */}
        {successMessage && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-[20px] border border-[#B9E3C8] bg-[#E8F7EE] p-5 text-sm text-[#2E7D4F]"
          >
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
            {successMessage}
          </div>
        )}

        {errorMessage && !reviewAction && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-[20px] border border-[#F5CBD2] bg-[#FFF7F8] p-5 text-sm text-[#B4233A]"
          >
            <AlertCircle
              size={20}
              className="shrink-0"
            />
            {errorMessage}
          </div>
        )}

        {/* رأس الصفحة */}
        <div className="mb-6 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EAF2F8] text-[#164A68]">
                <UserRound
                  size={30}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-[#94A3B8]">
                  الملف الإداري للباحث
                </p>

                <h1 className="text-xl font-semibold text-[#071B2F] sm:text-2xl">
                  {researcher.name}
                </h1>

                <p className="mt-1 break-all text-sm text-[#64748B]">
                  {researcher.id}
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-xs font-medium ${statusStyles[status]}`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* تنبيه الطلب غير المكتمل */}
        {!researcher.hasCompletedApplication && (
          <div className="mb-6 flex items-start gap-3 rounded-[20px] border border-[#F4D79B] bg-[#FFF9EC] p-5">
            <AlertCircle
              size={21}
              className="shrink-0 text-[#A36A00]"
            />

            <div>
              <h2 className="font-semibold text-[#8A5B00]">
                طلب الانضمام غير مكتمل
              </h2>

              <p className="mt-2 text-sm leading-7 text-[#785B29]">
                تم إنشاء حساب الباحث، لكن لم يُحفظ طلب
                الانضمام في قاعدة البيانات. لا يمكن
                اعتماد الباحث قبل استكمال بيانات الطلب
                والسيرة الذاتية.
              </p>
            </div>
          </div>
        )}

        {/* المعلومات الأساسية */}
        <div className="mb-6 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <h2 className="mb-6 text-lg font-semibold text-[#071B2F]">
            المعلومات الأساسية
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={GraduationCap}
              label="التخصص العام"
              value={researcher.specialty}
            />

            <InfoItem
              icon={Mail}
              label="البريد الإلكتروني"
              value={researcher.email}
            />

            <InfoItem
              icon={CalendarDays}
              label="تاريخ التسجيل"
              value={formatJoinDate(
                researcher.joinDate
              )}
            />

            <InfoItem
              icon={GraduationCap}
              label="التخصص الدقيق"
              value={researcher.detailedSpecialty}
            />

            <InfoItem
              icon={BookOpen}
              label="مجال البحث"
              value={researcher.researchField}
            />

            <InfoItem
              icon={ClipboardList}
              label="عدد الطلبات المسندة"
              value={
                researcher.requestsCount === null
                  ? "غير متوفر"
                  : String(researcher.requestsCount)
              }
            />

            <InfoItem
              icon={Phone}
              label="رقم الجوال"
              value={researcher.phone}
            />

            <InfoItem
              icon={Building2}
              label="جهة العمل"
              value={researcher.workplace}
            />
          </div>
        </div>

        {/* النبذة والمهارات - بيانات حقيقية من Supabase */}
        <div className="mb-6 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <h2 className="mb-4 text-lg font-semibold text-[#071B2F]">
            نبذة عن الباحث
          </h2>

          <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#475569]">
            {researcher.researcherBio ||
              "غير متوفر — لم يُضف الباحث نبذة عن نفسه."}
          </p>

          <h3 className="mb-3 mt-7 text-sm font-semibold text-[#071B2F]">
            المهارات ومجالات الخبرة
          </h3>

          <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#475569]">
            {researcher.skillsAndExpertise ||
              "غير متوفر — لم يُضف الباحث مهاراته ومجالات خبرته."}
          </p>
        </div>

        {/* السيرة الذاتية */}
        <div className="mb-6 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2F8] text-[#164A68]">
              <FileText size={23} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#071B2F]">
                السيرة الذاتية
              </h2>

              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                {researcher.cvPath
                  ? "السيرة الذاتية محفوظة في التخزين الخاص، ويمكن للمدير عرضها للمراجعة."
                  : "لا توجد سيرة ذاتية محفوظة لهذا الباحث حتى الآن."}
              </p>

              {researcher.cvPath && (
                <a
                  href={`/api/admin/researchers/${researcher.id}/cv`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#164A68] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#103B55]"
                >
                  <FileText size={18} />
                  عرض السيرة الذاتية
                </a>
              )}
            </div>
          </div>
        </div>

        {/* سبب الرفض السابق */}
        {status === "مرفوض" &&
          currentRejectionReason && (
            <div className="mb-6 flex items-start gap-3 rounded-[20px] border border-[#F5CBD2] bg-[#FFF7F8] p-5">
              <AlertCircle
                size={21}
                className="shrink-0 text-[#B4233A]"
              />

              <div>
                <h3 className="font-semibold text-[#B4233A]">
                  سبب رفض طلب الانضمام
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#475569]">
                  {currentRejectionReason}
                </p>
              </div>
            </div>
          )}

        {/* إجراءات الإدارة */}
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-[#071B2F]">
            إجراءات الإدارة
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            يمكنك مراجعة بيانات الباحث وسيرته الذاتية
            وإدارة حالة حسابه.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {status === "بانتظار المراجعة" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    openReview("approve")
                  }
                  disabled={
                    isSubmitting ||
                    !researcher.hasCompletedApplication ||
                    !researcher.cvPath
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[#2E7D4F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#256B42] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  الموافقة على الانضمام
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openReview("reject")
                  }
                  disabled={
                    isSubmitting ||
                    !researcher.hasCompletedApplication ||
                    !researcher.cvPath
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-[#B4233A] px-6 py-3 text-sm font-medium text-[#B4233A] transition hover:bg-[#FFF7F8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={18} />
                  رفض الطلب
                </button>
              </>
            )}

            {status === "نشط" && (
              <button
                type="button"
                onClick={() =>
                  openReview("suspend")
                }
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full border border-[#B4233A] px-6 py-3 text-sm font-medium text-[#B4233A] transition hover:bg-[#FFF7F8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Ban size={18} />
                إيقاف الحساب
              </button>
            )}

            {status === "موقوف" && (
              <button
                type="button"
                onClick={() =>
                  openReview("reactivate")
                }
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#103B55] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={18} />
                إعادة تفعيل الحساب
              </button>
            )}

            {status === "مرفوض" && (
              <p className="text-sm text-[#64748B]">
                تم رفض طلب الانضمام. لا توجد إجراءات
                إضافية متاحة حاليًا.
              </p>
            )}
          </div>

          <p className="mt-6 text-xs leading-6 text-[#94A3B8]">
            الموافقة والرفض متاحان للطلبات المكتملة
            وقيد المراجعة فقط. يمكن إيقاف الباحث
            المعتمد مؤقتًا وإعادة تفعيله لاحقًا.
          </p>
        </div>
      </div>

      {/* نافذة تأكيد إجراء الإدارة */}
      {reviewAction && modalConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071B2F]/60 p-4"
          dir="rtl"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            className="w-full max-w-[480px] rounded-[24px] border border-[#D7E3EF] bg-white p-6 shadow-2xl sm:p-8"
          >
            <div
              className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                modalConfig.color === "green"
                  ? "bg-[#E8F7EE] text-[#2E7D4F]"
                  : modalConfig.color === "blue"
                    ? "bg-[#EAF2F8] text-[#164A68]"
                    : "bg-[#FFF0F2] text-[#B4233A]"
              }`}
            >
              {reviewAction === "approve" ? (
                <CheckCircle2 size={28} />
              ) : reviewAction === "reject" ? (
                <XCircle size={28} />
              ) : reviewAction === "suspend" ? (
                <Ban size={28} />
              ) : (
                <RotateCcw size={28} />
              )}
            </div>

            <h2
              id="review-dialog-title"
              className="text-xl font-semibold text-[#071B2F]"
            >
              {modalConfig.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#64748B]">
              {modalConfig.description(
                researcher.name
              )}
            </p>

            {reviewAction === "reject" && (
              <div className="mt-5">
                <label
                  htmlFor="researcher-rejection-reason"
                  className="mb-2 block text-sm font-medium text-[#071B2F]"
                >
                  سبب الرفض
                  <span className="mr-1 text-[#B4233A]">
                    *
                  </span>
                </label>

                <textarea
                  id="researcher-rejection-reason"
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(
                      event.target.value
                    )
                  }
                  maxLength={1000}
                  rows={4}
                  disabled={isSubmitting}
                  placeholder="اكتبي سبب رفض طلب الانضمام..."
                  className="w-full resize-none rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-sm leading-7 text-[#071B2F] outline-none transition focus:border-[#164A68] disabled:opacity-60"
                />

                <p className="mt-1 text-left text-xs text-[#94A3B8]">
                  {rejectionReason.length} / 1000
                </p>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[#F5CBD2] bg-[#FFF7F8] p-3 text-sm leading-6 text-[#B4233A]"
              >
                {errorMessage}
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={submitReview}
                disabled={
                  isSubmitting ||
                  (reviewAction === "reject" &&
                    rejectionReason.trim().length < 5)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  modalConfig.color === "green"
                    ? "bg-[#2E7D4F] hover:bg-[#256B42]"
                    : modalConfig.color === "blue"
                      ? "bg-[#164A68] hover:bg-[#103B55]"
                      : "bg-[#B4233A] hover:bg-[#921B2D]"
                }`}
              >
                {isSubmitting ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : reviewAction === "approve" ? (
                  <CheckCircle2 size={18} />
                ) : reviewAction === "reject" ? (
                  <XCircle size={18} />
                ) : reviewAction === "suspend" ? (
                  <Ban size={18} />
                ) : (
                  <RotateCcw size={18} />
                )}

                {isSubmitting
                  ? "جارٍ حفظ القرار..."
                  : modalConfig.button}
              </button>

              <button
                type="button"
                onClick={closeReview}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full border border-[#D7E3EF] bg-white px-6 py-3 text-sm font-medium text-[#475569] transition hover:bg-[#F8FBFD] disabled:cursor-not-allowed disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type InfoItemProps = {
  icon: typeof UserRound;
  label: string;
  value: string;
};

function InfoItem({
  icon: Icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F6F9] text-[#164A68]">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[#071B2F]">
          {value}
        </p>
      </div>
    </div>
  );
}
