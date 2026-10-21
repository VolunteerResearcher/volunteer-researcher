
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Hash,
  Loader2,
  MessageSquareText,
  UserRound,
  XCircle,
} from "lucide-react";

type ResearcherRequestDetailsProps = {
  requestId: string;
};

type RequestData = {
  id: string;
  title: string;
  type: string;
  field: string;
  date: string;
  status: string;
  beneficiary: string;
  organization: string;
  message: string;
  adminNote: string;
  additionalNotes: string;
  attachmentPath: string | null;
};

const helpTypeLabels: Record<string, string> = {
  research: "استشارة بحثية",
  methodology: "منهجية البحث",
  analysis: "تحليل البيانات",
  review: "مراجعة بحثية",
  other: "أخرى",
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  assigned: "طلب جديد",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
};

function getStatusStyle(status: string) {
  switch (status) {
    case "طلب جديد":
      return "bg-[#FFF3D6] text-[#9A6700]";

    case "قيد التنفيذ":
      return "bg-[#EAF2F8] text-[#164A68]";

    case "مكتمل":
      return "bg-[#E8F7EE] text-[#2E7D4F]";

    case "مرفوض":
      return "bg-[#FFE8EC] text-[#B4233A]";

    default:
      return "bg-[#F1F5F9] text-[#64748B]";
  }
}

export function ResearcherRequestDetails({
  requestId,
}: ResearcherRequestDetailsProps) {
  const [requestData, setRequestData] =
    useState<RequestData | null>(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showRejectForm, setShowRejectForm] =
    useState(false);

  const [rejectReason, setRejectReason] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRequest() {
      setLoading(true);
      setPageError("");
      setRequestData(null);

      try {
        const supabase = createClient();

        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          throw new Error(
            "يجب تسجيل الدخول بحساب الباحث أولًا."
          );
        }

        const { data, error } = await supabase
          .from("consultation_requests")
          .select(
            "id, title, description, help_type, additional_notes, attachment_path, status, created_at, beneficiary_id, assigned_researcher_id"
          )
          .eq("id", requestId)
          .eq(
            "assigned_researcher_id",
            authData.user.id
          )
          .maybeSingle();

        if (error) {
          throw new Error(
            "تعذر تحميل بيانات الطلب: " + error.message
          );
        }

        if (!data) {
          throw new Error(
            "الطلب غير موجود أو غير مسند إلى حسابك."
          );
        }

        let beneficiaryName = "غير متاح";

        const { data: beneficiaryProfile } =
          await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.beneficiary_id)
            .maybeSingle();

        if (beneficiaryProfile?.full_name) {
          beneficiaryName = beneficiaryProfile.full_name;
        }

        const formattedDate = new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone: "Asia/Riyadh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }
        )
          .format(new Date(data.created_at))
          .replaceAll("-", "/");

        if (!cancelled) {
          setRequestData({
            id: data.id,
            title: data.title,
            type:
              helpTypeLabels[data.help_type] ??
              data.help_type,
            field: "غير محدد في الطلب",
            date: formattedDate,
            status:
              statusLabels[data.status] ??
              "غير محدد",
            beneficiary: beneficiaryName,
            organization: "غير محددة",
            message: data.description,
            adminNote:
              "تمت إحالة هذا الطلب إليك من قبل الإدارة. يرجى مراجعة التفاصيل واختيار الإجراء المناسب.",
            additionalNotes:
              data.additional_notes ?? "",
            attachmentPath:
              data.attachment_path ?? null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحميل الطلب."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRequest();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  async function respondToRequest(
    action: "accept" | "decline"
  ) {
    if (saving || !requestData) return;

    setActionError("");
    setActionMessage("");

    const reason = rejectReason.trim();

    if (
      action === "decline" &&
      (reason.length < 5 || reason.length > 1000)
    ) {
      setActionError(
        "سبب الاعتذار يجب أن يكون بين 5 و1000 حرف."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/researcher/requests/${encodeURIComponent(
          requestId
        )}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            ...(action === "decline"
              ? { reason }
              : {}),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ??
            "تعذر حفظ الرد على الطلب."
        );
      }

      if (action === "accept") {
        setRequestData((current) =>
          current
            ? {
                ...current,
                status: "قيد التنفيذ",
              }
            : current
        );

        setActionMessage(
          "تم قبول الطلب بنجاح وحفظ حالته في قاعدة البيانات."
        );
      } else {
        setActionMessage(
          "تم حفظ سبب الاعتذار وإعادة الطلب إلى الإدارة لإعادة إسناده."
        );
      }

      setShowRejectForm(false);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حفظ الرد."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#F8FBFD] px-5"
      >
        <div className="flex items-center gap-3 text-[#164A68]">
          <Loader2 className="animate-spin" size={24} />
          <span>جارٍ تحميل تفاصيل الطلب...</span>
        </div>
      </main>
    );
  }

  if (pageError || !requestData) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F8FBFD] px-5 py-12 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-[1100px]">
          <Link
            href="/ar/researcher-dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#164A68]"
          >
            <ArrowRight size={18} />
            العودة إلى طلباتي
          </Link>

          <div className="mt-8 rounded-[24px] border border-[#D7E3EF] bg-white p-10 text-center">
            <h1 className="text-2xl font-semibold text-[#071B2F]">
              تعذر عرض الطلب
            </h1>

            <p className="mt-3 text-sm text-[#64748B]">
              {pageError || "الطلب غير موجود."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const details = [
    {
      label: "رقم الطلب",
      value: requestData.id,
      icon: Hash,
    },
    {
      label: "نوع المساعدة",
      value: requestData.type,
      icon: FileText,
    },
    {
      label: "مجال البحث",
      value: requestData.field,
      icon: GraduationCap,
    },
    {
      label: "تاريخ الطلب",
      value: requestData.date,
      icon: CalendarDays,
    },
    {
      label: "اسم المستفيد",
      value: requestData.beneficiary,
      icon: UserRound,
    },
    {
      label: "الجهة",
      value: requestData.organization,
      icon: GraduationCap,
    },
  ];

  const status = requestData.status;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-5 py-12 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-[1100px]">
        {/* العودة */}
        <Link
          href="/ar/researcher-dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى طلباتي
        </Link>

        {/* العنوان */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm text-[#64748B]">
              تفاصيل الطلب المحول إليك
            </p>

            <h1 className="text-2xl font-semibold text-[#071B2F] sm:text-3xl">
              {requestData.title}
            </h1>
          </div>

          <span
            className={`w-fit rounded-full px-5 py-2 text-sm ${getStatusStyle(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        {/* معلومات الطلب */}
        <div className="rounded-[24px] border border-[#9DB5D8] bg-white p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            {details.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex min-h-[90px] items-center gap-4 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-5 py-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#164A68]">
                    <Icon
                      size={21}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-[#64748B]">
                      {item.label}
                    </p>

                    <p className="break-words text-[15px] font-medium text-[#071B2F]">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* تفاصيل الطلب */}
          <div className="mt-5 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquareText
                size={20}
                className="text-[#164A68]"
              />

              <h2 className="font-semibold text-[#071B2F]">
                تفاصيل الطلب
              </h2>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-8 text-[#475569]">
              {requestData.message}
            </p>
          </div>

          {/* ملاحظات المستفيد */}
          {requestData.additionalNotes && (
            <div className="mt-5 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5 sm:p-6">
              <h2 className="mb-3 font-semibold text-[#071B2F]">
                ملاحظات إضافية من المستفيد
              </h2>

              <p className="whitespace-pre-wrap text-sm leading-8 text-[#475569]">
                {requestData.additionalNotes}
              </p>
            </div>
          )}

          {/* المرفق */}
          {requestData.attachmentPath && (
            <div className="mt-5 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#164A68]">
                <FileText size={20} />

                <h2 className="font-semibold">
                  مرفق الطلب
                </h2>
              </div>

              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                يوجد ملف مرفق بهذا الطلب. سيتم
                تفعيل عرضه بعد ربط صلاحيات الوصول
                الآمن للمرفقات.
              </p>
            </div>
          )}
        </div>

        {/* ملاحظة الإدارة */}
        <div className="mt-5 rounded-[20px] border border-[#D7E3EF] bg-white p-6">
          <h2 className="mb-2 font-semibold text-[#071B2F]">
            ملاحظة الإدارة
          </h2>

          <p className="text-sm leading-7 text-[#64748B]">
            {requestData.adminNote}
          </p>
        </div>

        {/* قبول أو اعتذار */}
        {status === "طلب جديد" && !actionMessage && (
          <div className="mt-5 rounded-[24px] border border-[#9DB5D8] bg-white p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-[#071B2F]">
              الرد على الطلب
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              راجع تفاصيل الطلب، ثم اختر قبول
              الطلب أو الاعتذار عنه.
            </p>

            {!showRejectForm ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void respondToRequest("accept")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#164A68] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}

                  قبول الطلب
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setShowRejectForm(true)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B4233A] px-7 py-3 text-sm font-medium text-[#B4233A] transition hover:bg-[#FFF1F3] disabled:opacity-50"
                >
                  <XCircle size={18} />
                  الاعتذار عن الطلب
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <label
                  htmlFor="reject-reason"
                  className="mb-2 block text-sm font-medium text-[#071B2F]"
                >
                  سبب الاعتذار
                </label>

                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(event) =>
                    setRejectReason(event.target.value)
                  }
                  rows={4}
                  maxLength={1000}
                  disabled={saving}
                  placeholder="اكتب سبب الاعتذار عن الطلب..."
                  className="w-full resize-none rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-4 text-sm text-[#071B2F] outline-none placeholder:text-[#94A3B8] focus:border-[#164A68]"
                />

                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                      setActionError("");
                    }}
                    className="rounded-full border border-[#D7E3EF] px-6 py-3 text-sm text-[#475569] transition hover:bg-[#F8FBFD] disabled:opacity-50"
                  >
                    إلغاء
                  </button>

                  <button
                    type="button"
                    disabled={
                      saving ||
                      rejectReason.trim().length < 5
                    }
                    onClick={() =>
                      void respondToRequest("decline")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B4233A] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving && (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    )}

                    تأكيد الاعتذار
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* رسالة الخطأ */}
        {actionError && (
          <div
            role="alert"
            className="mt-5 rounded-[20px] border border-[#F5C2C7] bg-[#FFF1F3] p-5 text-sm text-[#B4233A]"
          >
            {actionError}
          </div>
        )}

        {/* نتيجة الإجراء */}
        {actionMessage && (
          <div className="mt-5 rounded-[20px] border border-[#D7E3EF] bg-white p-6">
            <div className="flex items-start gap-3">
              {status === "قيد التنفيذ" ? (
                <CheckCircle2
                  size={23}
                  className="mt-1 shrink-0 text-[#2E7D4F]"
                />
              ) : (
                <XCircle
                  size={23}
                  className="mt-1 shrink-0 text-[#B4233A]"
                />
              )}

              <div>
                <h3 className="font-semibold text-[#071B2F]">
                  {status === "قيد التنفيذ"
                    ? "تم قبول الطلب"
                    : "تم الاعتذار عن الطلب"}
                </h3>

                <p className="mt-1 text-sm leading-7 text-[#64748B]">
                  {actionMessage}
                </p>

                {status !== "قيد التنفيذ" &&
                  rejectReason && (
                    <div className="mt-4 rounded-2xl bg-[#F8FBFD] p-4">
                      <p className="mb-1 text-xs text-[#64748B]">
                        سبب الاعتذار
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-7 text-[#071B2F]">
                        {rejectReason}
                      </p>
                    </div>
                  )}

                {status !== "قيد التنفيذ" && (
                  <Link
                    href="/ar/researcher-dashboard"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#164A68]"
                  >
                    <ArrowRight size={17} />
                    العودة إلى طلباتي
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* التواصل بعد القبول */}
        {status === "قيد التنفيذ" && (
          <div className="mt-5 rounded-[20px] border border-[#9DB5D8] bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-[#071B2F]">
                  التواصل مع المستفيد
                </h3>

                <p className="mt-1 text-sm leading-7 text-[#64748B]">
                  الطلب مقبول. يمكنك الانتقال إلى
                  صفحة المحادثة عند تفعيل خدمة
                  المراسلة داخل المنصة.
                </p>
              </div>

              <Link
                href={`/ar/researcher-dashboard/requests/${encodeURIComponent(
                  requestId
                )}/conversation`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#123E58]"
              >
                <MessageSquareText size={18} />
                التواصل مع المستفيد
              </Link>
            </div>
          </div>
        )}

        {/* المحادثة السابقة للطلب المكتمل */}
        {status === "مكتمل" && (
          <div className="mt-5 rounded-[20px] border border-[#9DB5D8] bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-[#071B2F]">
                  المحادثة السابقة
                </h3>

                <p className="mt-1 text-sm leading-7 text-[#64748B]">
                  الطلب مكتمل. يمكنك الاطلاع على
                  المحادثة السابقة إذا كانت خدمة
                  المراسلة مفعّلة.
                </p>
              </div>

              <Link
                href={`/ar/researcher-dashboard/requests/${encodeURIComponent(
                  requestId
                )}/conversation`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#164A68] px-6 py-3 text-sm font-medium text-[#164A68] transition hover:bg-[#F1F6F9]"
              >
                <MessageSquareText size={18} />
                عرض المحادثة السابقة
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
