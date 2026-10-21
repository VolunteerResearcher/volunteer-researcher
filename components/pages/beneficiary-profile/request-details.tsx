
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RequestStatus =
  | "جديد"
  | "تحت المراجعة"
  | "قيد التنفيذ"
  | "مكتمل"
  | "معتذر عن الطلب";

type RequestData = {
  id: string;
  title: string;
  type: string;
  researcher: string;
  date: string;
  status: RequestStatus;
  message: string;
  additionalNotes: string;
  attachmentPath: string | null;
  statusMessage: string;
};

type RequestDetailsProps = {
  requestId: string;
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
  "تحت المراجعة": "bg-[#FFF3D6] text-[#9A6700]",
  "قيد التنفيذ": "bg-[#E8F7EE] text-[#2E7D4F]",
  مكتمل: "bg-[#EAF0F5] text-[#475569]",
  "معتذر عن الطلب": "bg-[#FFE8EC] text-[#B4233A]",
};

function getStatus(status: string): RequestStatus {
  switch (status) {
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

function formatDate(value: string): string {
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
}: RequestDetailsProps) {
  const [request, setRequest] = useState<RequestData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

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
            "id, beneficiary_id, title, description, help_type, additional_notes, attachment_path, assigned_researcher_id, status, created_at"
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

        let researcherName = "لم يتم تحديد الباحث بعد";

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

        const realRequest: RequestData = {
          id: row.id,
          title: row.title,
          type: helpTypeLabels[row.help_type] || "أخرى",
          researcher: researcherName,
          date: formatDate(row.created_at),
          status: getStatus(row.status),
          message: row.description,
          additionalNotes: row.additional_notes || "",
          attachmentPath: row.attachment_path,
          statusMessage: getStatusMessage(row.status),
        };

        if (!cancelled) {
          setRequest(realRequest);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحميل الطلب."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRequest();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

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
            <Loader2 size={24} className="animate-spin" />
            <span>جارٍ تحميل تفاصيل الطلب...</span>
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

          <div className="rounded-[24px] border border-[#D7E3EF] bg-[#F8FBFD] p-10 text-center">
            {errorMessage ? (
              <AlertCircle
                size={32}
                className="mx-auto mb-4 text-red-600"
              />
            ) : (
              <Info
                size={32}
                className="mx-auto mb-4 text-[#164A68]"
              />
            )}

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

  const isCompleted = request.status === "مكتمل";
  const isInProgress = request.status === "قيد التنفيذ";
  const isRejected = request.status === "معتذر عن الطلب";

  const conversationLink =
    `/ar/profile/requests/${request.id}/conversation`;

  return (
    <section
      dir="rtl"
      className="bg-white px-5 py-14 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* العودة */}
        {backLink}

        {/* عنوان الطلب */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm text-[#64748B]">
              تفاصيل الطلب
            </p>

            <h2 className="text-2xl font-semibold text-[#071B2F] sm:text-3xl">
              {request.title}
            </h2>
          </div>

          <span
            className={`w-fit rounded-full px-5 py-2 text-sm ${statusStyles[request.status]}`}
          >
            {request.status}
          </span>
        </div>

        {/* معلومات الطلب */}
        <div className="rounded-[24px] border border-[#9DB5D8] bg-white p-5 sm:p-7 lg:p-9">
          <div className="grid gap-4 md:grid-cols-2">
            {details.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex min-h-[95px] items-center gap-4 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-5 py-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#164A68]">
                    <Icon size={21} strokeWidth={1.7} />
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

            <p className="whitespace-pre-wrap leading-8 text-[#475569]">
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

              <p className="whitespace-pre-wrap leading-8 text-[#475569]">
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
                يوجد ملف مرفق بهذا الطلب. ستتوفر
                معاينته وتنزيله بعد ربط الوصول الآمن
                إلى الملفات الخاصة.
              </p>
            </div>
          )}
        </div>

        {/* حالة الطلب */}
        <div className="mt-7 rounded-[20px] border border-[#D7E3EF] bg-[#F8FBFD] p-6">
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
        <div className="mt-5 rounded-[20px] border border-[#D7E3EF] bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquareText
              size={21}
              strokeWidth={1.7}
              className="text-[#164A68]"
            />

            <h3 className="text-lg font-semibold text-[#071B2F]">
              رد الإدارة
            </h3>
          </div>

          <p className="text-sm leading-7 text-[#64748B]">
            لم يتم إضافة رد من الإدارة حتى الآن.
          </p>
        </div>

        {/* متابعة الطلب المسند */}
        {request.status === "تحت المراجعة" && (
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
                  تم إسناد طلبك إلى {request.researcher}.
                  ستظهر أي تحديثات على حالة الطلب هنا.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* الطلب قيد التنفيذ */}
        {isInProgress && (
          <div className="mt-5 rounded-[20px] border border-[#9DB5D8] bg-white p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <MessagesSquare
                size={23}
                className="mt-1 shrink-0 text-[#164A68]"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#071B2F]">
                  التواصل مع الباحث
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  طلبك قيد التنفيذ لدى {request.researcher}.
                  يمكنك الآن التواصل مع الباحث مباشرة
                  من خلال منصة باحث متطوع ومتابعة رسائلك.
                </p>

                <Link
                  href={conversationLink}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#123E58]"
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
          <div className="mt-5 rounded-[20px] border border-[#D7E3EF] bg-white p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={24}
                className="mt-1 shrink-0 text-[#2E7D4F]"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#071B2F]">
                  تم إكمال الطلب
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  تم تسجيل حالة الاستشارة كمكتملة.
                  يمكنك الاطلاع على المحادثة السابقة،
                  لكن لا يمكن إرسال رسائل جديدة.
                </p>

                <Link
                  href={conversationLink}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-[#164A68] px-6 py-3 text-sm font-medium text-[#164A68] transition hover:bg-[#F8FBFD]"
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
          <div className="mt-5 rounded-[20px] border border-[#E8D6AE] bg-[#FFFCF5] p-6">
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
                  تم تسجيل الاعتذار عن قبول الطلب.
                  لا توجد تفاصيل إضافية مسجلة حاليًا.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
