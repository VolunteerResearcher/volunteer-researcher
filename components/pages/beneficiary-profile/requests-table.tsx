
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  ArrowUpLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RequestStatus =
  | "جديد"
  | "تحت المراجعة"
  | "بانتظار معلومات إضافية"
  | "بانتظار رد الباحث"
  | "اعتذر الباحث"
  | "قيد التنفيذ"
  | "مكتمل"
  | "معتذر عن الطلب";

type RequestItem = {
  id: string;
  title: string;
  helpType: string;
  researcher: string;
  date: string;
  status: RequestStatus;
};

type ConsultationRow = {
  id: string;
  title: string;
  help_type: string;
  assigned_researcher_id: string | null;
  created_at: string;
  status: string;
};

const statusStyles: Record<RequestStatus, string> = {
  "جديد": "bg-[#EAF2F8] text-[#164A68]",
  "تحت المراجعة": "bg-[#FFF3D6] text-[#A36A00]",
  "بانتظار معلومات إضافية":
    "bg-[#F4E8FF] text-[#7A3EA1]",
  "بانتظار رد الباحث":
    "bg-[#F0EEFF] text-[#6554A4]",
  "اعتذر الباحث":
    "bg-[#FFF3D6] text-[#9A6700]",
  "قيد التنفيذ": "bg-[#E8F7EE] text-[#2E7D4F]",
  "مكتمل": "bg-[#EAF0F5] text-[#475569]",
  "معتذر عن الطلب":
    "bg-[#FFE8EC] text-[#B4233A]",
};

const helpTypeLabels: Record<string, string> = {
  research: "استشارة بحثية",
  methodology: "منهجية البحث",
  analysis: "تحليل البيانات",
  review: "مراجعة بحثية",
  other: "أخرى",
};

function getRequestStatus(status: string): RequestStatus {
  switch (status) {
    case "pending":
      return "جديد";

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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("-", "/");
}

export function RequestsTable() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "يجب تسجيل الدخول لعرض طلباتك الاستشارية."
          );
        }

        const { data, error } = await supabase
          .from("consultation_requests")
          .select(
            "id, title, help_type, assigned_researcher_id, created_at, status"
          )
          .eq("beneficiary_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(
            "تعذر جلب طلبات الاستشارة: " + error.message
          );
        }

        const rows = (data || []) as ConsultationRow[];

        const researcherIds = [
          ...new Set(
            rows
              .map((item) => item.assigned_researcher_id)
              .filter((id): id is string => Boolean(id))
          ),
        ];

        const researcherNames = new Map<string, string>();

        if (researcherIds.length > 0) {
          const {
            data: researchers,
            error: researchersError,
          } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", researcherIds);

          if (!researchersError && researchers) {
            researchers.forEach((researcher) => {
              if (researcher.full_name) {
                researcherNames.set(
                  researcher.id,
                  researcher.full_name
                );
              }
            });
          }
        }

        const realRequests: RequestItem[] = rows.map(
          (item) => ({
            id: item.id,
            title: item.title,
            helpType:
              helpTypeLabels[item.help_type] || "أخرى",
            researcher: item.assigned_researcher_id
              ? researcherNames.get(
                  item.assigned_researcher_id
                ) || "باحث محدد"
              : "—",
            date: formatDate(item.created_at),
            status: getRequestStatus(item.status),
          })
        );

        if (!cancelled) {
          setRequests(realRequests);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحميل الطلبات."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRequests = requests.filter((request) => {
    const query = search.trim().toLowerCase();

    const displayId = `#${request.id.slice(0, 8)}`;

    return (
      request.title.toLowerCase().includes(query) ||
      request.id.toLowerCase().includes(query) ||
      displayId.toLowerCase().includes(query) ||
      request.helpType.toLowerCase().includes(query) ||
      request.researcher.toLowerCase().includes(query) ||
      request.status.toLowerCase().includes(query)
    );
  });

  const openRequest = (id: string) => {
    router.push(`/ar/profile/requests/${id}`);
  };

  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-14 md:px-8 md:pb-20"
    >
      <div className="mx-auto max-w-[1320px]">
        {/* العنوان */}
        <div className="mb-6">
          <h2 className="text-[28px] font-normal text-[#071B2F] sm:text-[32px] md:text-[36px]">
            طلباتي
          </h2>

          <p className="mt-2 text-[16px] text-[#6B7280] sm:text-[18px]">
            يمكنك متابعة حالة طلباتك الاستشارية التي قمت بتقديمها.
          </p>
        </div>

        {/* البطاقة */}
        <div className="rounded-[24px] border border-[#9DB5D8] bg-white px-4 py-5 sm:px-5 md:px-6 md:py-6">
          {/* البحث */}
          <div className="mb-5">
            <div className="relative max-w-[360px]">
              <Search
                size={18}
                strokeWidth={1.7}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="البحث في الطلبات ..."
                aria-label="البحث في الطلبات"
                className="h-[44px] w-full rounded-[8px] border border-[#9DB5D8] bg-white pr-11 pl-4 text-[14px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68]"
              />
            </div>
          </div>

          {/* رسالة الخطأ */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700"
            >
              <AlertCircle
                size={20}
                className="mt-1 shrink-0"
              />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* التحميل */}
          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center gap-3 text-[#164A68]">
              <Loader2
                size={22}
                className="animate-spin"
              />
              <span>جارٍ تحميل طلباتك...</span>
            </div>
          ) : !errorMessage ? (
            /* الجدول */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-right text-[14px] text-[#071B2F]">
                    <th className="px-4 py-3 font-normal">
                      عنوان الطلب
                    </th>

                    <th className="px-4 py-3 font-normal">
                      نوع المساعدة
                    </th>

                    <th className="px-4 py-3 font-normal">
                      الباحث المحدد
                    </th>

                    <th className="px-4 py-3 font-normal">
                      تاريخ التقديم
                    </th>

                    <th className="px-4 py-3 font-normal">
                      رقم الطلب
                    </th>

                    <th className="px-4 py-3 font-normal">
                      حالة الطلب
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="bg-[#F8FBFD] text-[14px] text-[#071B2F]"
                    >
                      <td className="rounded-r-[10px] px-4 py-4">
                        {request.title}
                      </td>

                      <td className="px-4 py-4">
                        {request.helpType}
                      </td>

                      <td className="px-4 py-4">
                        {request.researcher}
                      </td>

                      <td className="px-4 py-4">
                        {request.date}
                      </td>

                      <td className="px-4 py-4 text-[#164A68]">
                        #{request.id.slice(0, 8)}
                      </td>

                      {/* حالة الطلب + زر عرض التفاصيل */}
                      <td className="rounded-l-[10px] px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex shrink-0 rounded-full px-3 py-1 text-[13px] ${statusStyles[request.status]}`}
                          >
                            {request.status}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              openRequest(request.id)
                            }
                            aria-label={`عرض تفاصيل الطلب ${request.id}`}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[#164A68] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#071B2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#164A68]"
                          >
                            عرض التفاصيل
                            <ArrowUpLeft size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-sm text-[#64748B]"
                      >
                        {requests.length === 0
                          ? "لا توجد لديك طلبات استشارية حتى الآن."
                          : "لا توجد طلبات مطابقة لبحثك."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
