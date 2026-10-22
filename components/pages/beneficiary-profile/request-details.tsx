
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  Info,
  MessageSquareText,
  MessagesSquare,
  UserRound,
  XCircle,
  Loader2,
  AlertCircle,
  BookOpen,
  Upload,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RequestStatus =
  | "جديد"
  | "بانتظار معلومات إضافية"
  | "تحت المراجعة"
  | "قيد التنفيذ"
  | "مكتمل"
  | "معتذر عن الطلب";

type RequestData = {
  id: string;
  title: string;
  type: string;
  helpType: string;
  researcher: string;
  date: string;
  status: RequestStatus;
  rawStatus: string;
  message: string;
  additionalNotes: string;
  attachmentPath: string | null;
  statusMessage: string;
  adminRevisionNotes: string | null;
  revisionRequestedAt: string | null;
};

type ConsultationRow = {
  id: string;
  beneficiary_id: string;
  title: string;
  description: string;
  help_type: string;
  additional_notes: string | null;
  attachment_path: string | null;
  assigned_researcher_id: string | null;
  status: string;
  created_at: string;
  admin_revision_notes: string | null;
  revision_requested_at: string | null;
};

const helpTypeLabels: Record<string, string> = {
  research: "استشارة بحثية",
  methodology: "منهجية البحث",
  analysis: "تحليل البيانات",
  review: "مراجعة بحثية",
  other: "أخرى",
};

const statusStyles: Record<RequestStatus, string> = {
  جديد: "bg-[#EAF2F8] text-[#164A68]",
  "بانتظار معلومات إضافية":
    "bg-[#FFF3D6] text-[#9A6700]",
  "تحت المراجعة": "bg-[#FFF3D6] text-[#9A6700]",
  "قيد التنفيذ": "bg-[#E8F7EE] text-[#2E7D4F]",
  مكتمل: "bg-[#EAF0F5] text-[#475569]",
  "معتذر عن الطلب":
    "bg-[#FFE8EC] text-[#B4233A]",
};

function getStatus(status: string): RequestStatus {
  switch (status) {
    case "needs_revision":
      return "بانتظار معلومات إضافية";
    case "assigned":
      return "تحت المراجعة";
    case "in_progress":
      return "قيد التنفيذ";
    case "completed":
      return "مكتمل";
    case "rejected":
      return "معتذر عن الطلب";
    default:
      return "جديد";
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "تم استلام طلبك بنجاح، وهو الآن بانتظار مراجعة الإدارة.";
    case "needs_revision":
      return "طلبت الإدارة استكمال بعض المعلومات. يرجى قراءة الملاحظات وتعديل طلبك ثم إعادة إرساله.";
    case "assigned":
      return "تم إسناد طلبك إلى باحث متطوع، وهو في مرحلة المتابعة.";
    case "in_progress":
      return "طلبك قيد التنفيذ حاليًا.";
    case "completed":
      return "تم إكمال طلب الاستشارة.";
    case "rejected":
      return "تم الاعتذار عن قبول الطلب من قبل الإدارة.";
    default:
      return "يمكنك متابعة حالة طلبك من هذه الصفحة.";
  }
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("-", "/");
}

export function RequestDetails({
  requestId,
}: {
  requestId: string;
}) {
  const [request, setRequest] =
    useState<RequestData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [helpType, setHelpType] = useState("research");
  const [additionalNotes, setAdditionalNotes] =
    useState("");
  const [attachment, setAttachment] =
    useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRequest() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "يجب تسجيل الدخول لعرض تفاصيل الطلب."
          );
        }

        const { data, error } = await supabase
          .from("consultation_requests")
          .select(
            "id, beneficiary_id, title, description, help_type, additional_notes, attachment_path, assigned_researcher_id, status, created_at, admin_revision_notes, revision_requested_at"
          )
          .eq("id", requestId)
          .eq("beneficiary_id", user.id)
          .maybeSingle();

        if (error) {
          throw new Error(
            "تعذر تحميل تفاصيل الطلب: " + error.message
          );
        }

        if (!data) {
          if (!cancelled) setNotFound(true);
          return;
        }

        const row = data as ConsultationRow;

        let researcherName =
          "لم يتم تحديد الباحث بعد";

        if (row.assigned_researcher_id) {
          researcherName = "باحث محدد";

          const { data: researcher } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", row.assigned_researcher_id)
            .maybeSingle();

          if (researcher?.full_name) {
            researcherName = researcher.full_name;
          }
        }

        if (cancelled) return;

        setRequest({
          id: row.id,
          title: row.title,
          type:
            helpTypeLabels[row.help_type] || "أخرى",
          helpType: row.help_type,
          researcher: researcherName,
          date: formatDate(row.created_at),
          status: getStatus(row.status),
          rawStatus: row.status,
          message: row.description,
          additionalNotes: row.additional_notes || "",
          attachmentPath: row.attachment_path,
          statusMessage: getStatusMessage(row.status),
          adminRevisionNotes: row.admin_revision_notes,
          revisionRequestedAt: row.revision_requested_at,
        });

        setTitle(row.title);
        setDescription(row.description);
        setHelpType(row.help_type);
        setAdditionalNotes(row.additional_notes || "");
        setNotFound(false);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحميل الطلب."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadRequest();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const handleResubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !request ||
      request.rawStatus !== "needs_revision" ||
      isSubmitting
    ) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanNotes = additionalNotes.trim();

    if (
      cleanTitle.length < 3 ||
      cleanTitle.length > 200
    ) {
      setFormError(
        "عنوان الطلب يجب أن يكون بين 3 و200 حرف."
      );
      return;
    }

    if (
      cleanDescription.length < 10 ||
      cleanDescription.length > 1000
    ) {
      setFormError(
        "وصف الطلب يجب أن يكون بين 10 و1000 حرف."
      );
      return;
    }

    if (cleanNotes.length > 2000) {
      setFormError(
        "الملاحظات الإضافية يجب ألا تتجاوز 2000 حرف."
      );
      return;
    }

    if (
      attachment &&
      attachment.size > 10 * 1024 * 1024
    ) {
      setFormError(
        "حجم الملف يجب ألا يتجاوز 10 ميجابايت."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", cleanTitle);
      formData.append("description", cleanDescription);
      formData.append("helpType", helpType);
      formData.append("additionalNotes", cleanNotes);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await fetch(
        `/api/consultations/${encodeURIComponent(
          request.id
        )}/resubmit`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "تعذر حفظ التعديلات وإعادة إرسال الطلب."
        );
      }

      setRequest((current) =>
        current
          ? {
              ...current,
              title: cleanTitle,
              message: cleanDescription,
              helpType,
              type:
                helpTypeLabels[helpType] || "أخرى",
              additionalNotes: cleanNotes,
              attachmentPath: attachment
                ? "updated"
                : current.attachmentPath,
              status: "جديد",
              rawStatus: "pending",
              statusMessage: getStatusMessage("pending"),
            }
          : current
      );

      setAttachment(null);

      setSuccessMessage(
        "تم حفظ التعديلات وإعادة إرسال الطلب للإدارة بنجاح."
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إعادة إرسال الطلب."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const backLink = (
    <Link
      href="/ar/profile"
      className="mb-8 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
    >
      <ArrowRight size={18} />
      العودة إلى طلباتي
    </Link>
  );

  if (isLoading) {
    return (
      <section
        dir="rtl"
        className="min-h-[500px] bg-white px-5 py-14 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-[1280px]">
          {backLink}
          <div className="flex min-h-[250px] items-center justify-center gap-3 text-[#164A68]">
            <Loader2
              size={24}
              className="animate-spin"
            />
            جارٍ تحميل تفاصيل الطلب...
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage || notFound || !request) {
    return (
      <section
        dir="rtl"
        className="min-h-[500px] bg-white px-5 py-14 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-[1280px]">
          {backLink}

          <div className="rounded-[24px] border border-[#D7E3EF] bg-[#F8FBFD] p-8 text-center sm:p-10">
            <AlertCircle
              size={32}
              className="mx-auto mb-4 text-[#164A68]"
            />

            <h2 className="text-2xl font-semibold text-[#071B2F]">
              {errorMessage
                ? "تعذر عرض الطلب"
                : "الطلب غير موجود"}
            </h2>

            <p className="mt-3 text-[#64748B]">
              {errorMessage ||
                "لم نتمكن من العثور على هذا الطلب ضمن طلبات حسابك."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const details = [
    {
      label: "رقم الطلب",
      value: `#${request.id.slice(0, 8)}`,
      icon: Hash,
    },
    {
      label: "نوع المساعدة",
      value: request.type,
      icon: FileText,
    },
    {
      label: "الباحث المحدد",
      value: request.researcher,
      icon: UserRound,
    },
    {
      label: "تاريخ التقديم",
      value: request.date,
      icon: CalendarDays,
    },
  ];

  const isCompleted = request.rawStatus === "completed";
  const isInProgress = request.rawStatus === "in_progress";
  const isRejected = request.rawStatus === "rejected";
  const needsRevision =
    request.rawStatus === "needs_revision";

  const conversationLink =
    `/ar/profile/requests/${request.id}/conversation`;

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#D7E3EF] bg-white px-4 py-3 text-sm text-[#071B2F] outline-none transition focus:border-[#164A68] disabled:opacity-60";

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 sm:px-8 sm:py-14 lg:px-16"
    >
      <div className="mx-auto max-w-[1280px]">
        {backLink}

        {/* عنوان الطلب */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm text-[#64748B]">
              تفاصيل الطلب
            </p>

            <h2 className="break-words text-2xl font-semibold text-[#071B2F] sm:text-3xl">
              {request.title}
            </h2>
          </div>

          <span
            className={`w-fit rounded-full px-5 py-2 text-sm ${statusStyles[request.status]}`}
          >
            {request.status}
          </span>
        </div>

        {successMessage && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-[#B9E3C8] bg-[#E8F7EE] p-4 text-sm leading-7 text-[#2E7D4F]"
          >
            <CheckCircle2
              size={20}
              className="mt-1 shrink-0"
            />
            {successMessage}
          </div>
        )}

        {/* معلومات الطلب */}
        <div className="rounded-[24px] border border-[#9DB5D8] bg-white p-5 sm:p-7 lg:p-9">
          <div className="grid gap-4 md:grid-cols-2">
            {details.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex min-h-[95px] items-center gap-4 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-4 sm:px-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#164A68]">
                    <Icon
                      size={21}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="min-w-0">
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

          {/* وصف الطلب */}
          <div className="mt-5 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-[#164A68]">
              <MessageSquareText size={21} />

              <h3 className="font-medium text-[#071B2F]">
                تفاصيل الطلب
              </h3>
            </div>

            <p className="whitespace-pre-wrap break-words leading-8 text-[#475569]">
              {request.message}
            </p>
          </div>

          {/* الملاحظات الإضافية */}
          {request.additionalNotes && (
            <div className="mt-5 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2 text-[#164A68]">
                <BookOpen size={21} />

                <h3 className="font-medium text-[#071B2F]">
                  ملاحظات إضافية
                </h3>
              </div>

              <p className="whitespace-pre-wrap break-words leading-8 text-[#475569]">
                {request.additionalNotes}
              </p>
            </div>
          )}

          {/* المرفق */}
          {request.attachmentPath && (
            <div className="mt-5 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2 text-[#164A68]">
                <FileText size={21} />

                <h3 className="font-medium text-[#071B2F]">
                  مرفق الطلب
                </h3>
              </div>

              <p className="text-sm leading-7 text-[#64748B]">
                يوجد ملف مرفق بهذا الطلب.
                معاينة المرفقات الخاصة غير
                مفعّلة في هذه الصفحة حاليًا.
              </p>
            </div>
          )}
        </div>

        {/* حالة الطلب */}
        <div className="mt-7 rounded-[20px] border border-[#D7E3EF] bg-[#F8FBFD] p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            {isInProgress || isCompleted ? (
              <CheckCircle2
                size={21}
                className="text-[#2E7D4F]"
              />
            ) : isRejected ? (
              <XCircle
                size={21}
                className="text-[#B4233A]"
              />
            ) : needsRevision ? (
              <AlertCircle
                size={21}
                className="text-[#A16207]"
              />
            ) : (
              <Clock3
                size={21}
                className="text-[#164A68]"
              />
            )}

            <h3 className="text-lg font-semibold text-[#071B2F]">
              حالة الطلب
            </h3>
          </div>

          <p className="text-sm leading-7 text-[#64748B]">
            {request.statusMessage}
          </p>
        </div>

        {/* رد الإدارة */}
        <div
          className={`mt-5 rounded-[20px] border p-5 sm:p-6 ${
            needsRevision
              ? "border-[#F4D79B] bg-[#FFF9EC]"
              : "border-[#D7E3EF] bg-white"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <MessageSquareText
              size={21}
              className={
                needsRevision
                  ? "text-[#A16207]"
                  : "text-[#164A68]"
              }
            />

            <h3 className="text-lg font-semibold text-[#071B2F]">
              رد الإدارة
            </h3>
          </div>

          {request.adminRevisionNotes ? (
            <>
              <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#475569]">
                {request.adminRevisionNotes}
              </p>

              <p className="mt-3 text-xs text-[#64748B]">
                تاريخ الملاحظات:{" "}
                {formatDate(
                  request.revisionRequestedAt
                )}
              </p>
            </>
          ) : (
            <p className="text-sm leading-7 text-[#64748B]">
              لم يتم إضافة رد من الإدارة حتى الآن.
            </p>
          )}
        </div>

        {/* نموذج استكمال البيانات */}
        {needsRevision && (
          <div className="mt-6 rounded-[24px] border border-[#9DB5D8] bg-white p-5 sm:p-7 lg:p-9">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                <FileText size={23} />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#071B2F]">
                  استكمال بيانات الطلب
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  عدّلي البيانات المطلوبة حسب
                  ملاحظات الإدارة، ثم أعيدي
                  إرسال الطلب للمراجعة.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleResubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="revision-title"
                  className="text-sm font-medium text-[#071B2F]"
                >
                  عنوان الطلب *
                </label>

                <input
                  id="revision-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  minLength={3}
                  maxLength={200}
                  required
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="revision-help-type"
                  className="text-sm font-medium text-[#071B2F]"
                >
                  نوع المساعدة *
                </label>

                <select
                  id="revision-help-type"
                  value={helpType}
                  onChange={(event) =>
                    setHelpType(event.target.value)
                  }
                  required
                  disabled={isSubmitting}
                  className={inputClass}
                >
                  {Object.entries(helpTypeLabels).map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="revision-description"
                  className="text-sm font-medium text-[#071B2F]"
                >
                  وصف الطلب *
                </label>

                <textarea
                  id="revision-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  minLength={10}
                  maxLength={1000}
                  rows={6}
                  required
                  disabled={isSubmitting}
                  className={`${inputClass} resize-y leading-7`}
                />

                <p className="mt-1 text-left text-xs text-[#94A3B8]">
                  {description.length} / 1000
                </p>
              </div>

              <div>
                <label
                  htmlFor="revision-additional-notes"
                  className="text-sm font-medium text-[#071B2F]"
                >
                  ملاحظات إضافية (اختياري)
                </label>

                <textarea
                  id="revision-additional-notes"
                  value={additionalNotes}
                  onChange={(event) =>
                    setAdditionalNotes(
                      event.target.value
                    )
                  }
                  maxLength={2000}
                  rows={4}
                  disabled={isSubmitting}
                  className={`${inputClass} resize-y leading-7`}
                />
              </div>

              <div className="rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-4 sm:p-5">
                <label
                  htmlFor="revision-attachment"
                  className="flex items-center gap-2 text-sm font-medium text-[#071B2F]"
                >
                  <Upload
                    size={19}
                    className="text-[#164A68]"
                  />
                  إرفاق ملف جديد (اختياري)
                </label>

                <input
                  id="revision-attachment"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setAttachment(
                      event.target.files?.[0] || null
                    );
                  }}
                  className="mt-4 block w-full min-w-0 text-sm text-[#475569] file:ml-3 file:rounded-full file:border-0 file:bg-[#164A68] file:px-4 file:py-2 file:text-sm file:text-white"
                />

                <p className="mt-3 text-xs leading-6 text-[#64748B]">
                  الصيغ المسموحة: PDF وDOC
                  وDOCX وPPT وPPTX. الحد
                  الأقصى 10 ميجابايت.
                </p>

                <p className="mt-1 text-xs leading-6 text-[#64748B]">
                  إذا لم تختاري ملفًا جديدًا،
                  سيبقى المرفق السابق كما هو.
                </p>

                {attachment && (
                  <p className="mt-3 break-all text-xs text-[#164A68]">
                    الملف المختار: {attachment.name}
                  </p>
                )}
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
                >
                  <AlertCircle
                    size={19}
                    className="mt-1 shrink-0"
                  />
                  <p>{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#164A68] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={19} />
                )}

                {isSubmitting
                  ? "جارٍ حفظ التعديلات..."
                  : "حفظ وإعادة إرسال للمراجعة"}
              </button>
            </form>
          </div>
        )}

        {/* متابعة الطلب المسند */}
        {request.rawStatus === "assigned" && (
          <div className="mt-5 rounded-[20px] border border-[#D7E3EF] bg-white p-6">
            <div className="flex items-start gap-3">
              <Clock3
                size={23}
                className="mt-1 shrink-0 text-[#164A68]"
              />

              <div>
                <h3 className="text-lg font-semibold text-[#071B2F]">
                  متابعة الطلب مع الباحث
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  تم إسناد طلبك إلى{" "}
                  {request.researcher}. ستظهر
                  أي تحديثات على حالة الطلب هنا.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* الطلب قيد التنفيذ */}
        {isInProgress && (
          <div className="mt-5 rounded-[20px] border border-[#9DB5D8] bg-white p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <MessagesSquare
                size={23}
                className="mt-1 shrink-0 text-[#164A68]"
              />

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-[#071B2F]">
                  التواصل مع الباحث
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  طلبك قيد التنفيذ لدى{" "}
                  {request.researcher}. يمكنك
                  الآن التواصل مع الباحث
                  مباشرة من خلال المنصة.
                </p>

                <Link
                  href={conversationLink}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#123E58] sm:w-auto"
                >
                  <MessageSquareText size={18} />
                  فتح المحادثة
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* الطلب المكتمل */}
        {isCompleted && (
          <div className="mt-5 rounded-[20px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={24}
                className="mt-1 shrink-0 text-[#2E7D4F]"
              />

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-[#071B2F]">
                  تم إكمال الطلب
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  تم تسجيل حالة الاستشارة
                  كمكتملة. يمكنك الاطلاع على
                  المحادثة السابقة، لكن لا
                  يمكن إرسال رسائل جديدة.
                </p>

                <Link
                  href={conversationLink}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#164A68] px-6 py-3 text-sm font-medium text-[#164A68] transition hover:bg-[#F8FBFD] sm:w-auto"
                >
                  <MessagesSquare size={18} />
                  عرض سجل المحادثة
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* الطلب المعتذر عنه */}
        {isRejected && (
          <div className="mt-5 rounded-[20px] border border-[#E8D6AE] bg-[#FFFCF5] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Info
                size={23}
                className="mt-1 shrink-0 text-[#A16207]"
              />

              <div>
                <h3 className="text-lg font-semibold text-[#071B2F]">
                  تم الاعتذار عن الطلب
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  تم تسجيل الاعتذار عن قبول
                  الطلب. لا توجد تفاصيل إضافية
                  مسجلة حاليًا.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
