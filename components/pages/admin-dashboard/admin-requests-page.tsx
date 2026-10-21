
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Filter,
  ArrowUpLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RequestStatus =
  | "جديد"
  | "تحت المراجعة"
  | "بانتظار معلومات إضافية"
  | "بانتظار رد الباحث"
  | "قيد التنفيذ"
  | "مكتمل"
  | "معتذر عن الطلب";

type RequestItem = {
  id: string;
  title: string;
  beneficiary: string;
  helpType: string;
  researcher: string;
  date: string;
  status: RequestStatus;
};

type ConsultationRow = {
  id: string;
  beneficiary_id: string;
  title: string;
  help_type: string;
  assigned_researcher_id: string | null;
  created_at: string;
  status: string;
};

const statusStyles: Record<RequestStatus, string> = {
  "جديد": "bg-[#EAF2F8] text-[#164A68]",
  "تحت المراجعة": "bg-[#FFF5E6] text-[#A16207]",
  "بانتظار معلومات إضافية":
    "bg-[#FFF5E6] text-[#A16207]",
  "بانتظار رد الباحث":
    "bg-[#F0EEFF] text-[#6554A4]",
  "قيد التنفيذ": "bg-[#E8F7EE] text-[#2E7D4F]",
  "مكتمل": "bg-[#E8F7EE] text-[#2E7D4F]",
  "معتذر عن الطلب":
    "bg-[#FDECEC] text-[#B42318]",
};

const statusOptions = [
  "الكل",
  "جديد",
  "تحت المراجعة",
  "بانتظار معلومات إضافية",
  "بانتظار رد الباحث",
  "قيد التنفيذ",
  "مكتمل",
  "معتذر عن الطلب",
];

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

function formatDate(value: string): string {
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

export function AdminRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");

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
            "يجب تسجيل الدخول بحساب الإدارة لعرض الطلبات."
          );
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "admin") {
          throw new Error(
            "ليس لديك صلاحية الوصول إلى طلبات الإدارة."
          );
        }

        const { data, error } = await supabase
          .from("consultation_requests")
          .select(
            "id, beneficiary_id, title, help_type, assigned_researcher_id, created_at, status"
          )
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(
            "تعذر جلب طلبات الاستشارة: " + error.message
          );
        }

        const rows = (data || []) as ConsultationRow[];

        const profileIds = [
          ...new Set(
            rows.flatMap((item) => [
              item.beneficiary_id,
              ...(item.assigned_researcher_id
                ? [item.assigned_researcher_id]
                : []),
            ])
          ),
        ];

        const profileNames = new Map<string, string>();

        if (profileIds.length > 0) {
          const {
            data: profiles,
            error: namesError,
          } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", profileIds);

          if (namesError) {
            throw new Error(
              "تعذر جلب أسماء المستفيدين: " +
                namesError.message
            );
          }

          (profiles || []).forEach((item) => {
            if (item.full_name) {
              profileNames.set(item.id, item.full_name);
            }
          });
        }

        const realRequests: RequestItem[] = rows.map(
          (item) => ({
            id: item.id,
            title: item.title,
            beneficiary:
              profileNames.get(item.beneficiary_id) ||
              "مستفيد",
            helpType:
              helpTypeLabels[item.help_type] || "أخرى",
            researcher: item.assigned_researcher_id
              ? profileNames.get(
                  item.assigned_researcher_id
                ) || "باحث محدد"
              : "لم يتم التعيين",
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

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        [
          request.id,
          `#${request.id.slice(0, 8)}`,
          request.title,
          request.beneficiary,
          request.helpType,
          request.researcher,
        ].some((value) =>
          value.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "الكل" ||
        request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const totalRequests = requests.length;

  const newRequests = requests.filter(
    (request) => request.status === "جديد"
  ).length;

  const inProgress = requests.filter(
    (request) => request.status === "قيد التنفيذ"
  ).length;

  const completed = requests.filter(
    (request) => request.status === "مكتمل"
  ).length;

  const stats = [
    {
      title: "إجمالي الطلبات",
      value: totalRequests,
      icon: ClipboardList,
    },
    {
      title: "طلبات جديدة",
      value: newRequests,
      icon: Clock3,
    },
    {
      title: "قيد التنفيذ",
      value: inProgress,
      icon: Clock3,
    },
    {
      title: "طلبات مكتملة",
      value: completed,
      icon: CheckCircle2,
    },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen px-4 py-8 text-[#071B2F] sm:px-7 lg:px-10"
    >
      {/* عنوان الصفحة */}
      <div className="mb-8">
        <p className="text-sm text-[#64748B]">
          لوحة الإدارة / إدارة الطلبات
        </p>

        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          إدارة الطلبات
        </h1>

        <p className="mt-2 text-sm leading-7 text-[#64748B]">
          مراجعة طلبات المستفيدين، متابعة حالاتها، وتعيين الباحثين
          المناسبين لتقديم الاستشارات البحثية.
        </p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[20px] border border-[#D7E3EF] bg-white p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                <Icon size={20} />
              </div>

              <p className="text-xs text-[#64748B] sm:text-sm">
                {item.title}
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {isLoading ? "—" : item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* جدول الطلبات */}
      <div className="mt-8 overflow-hidden rounded-[24px] border border-[#D7E3EF] bg-white">
        {/* البحث والتصفية */}
        <div className="flex flex-col gap-4 border-b border-[#D7E3EF] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">
              جميع الطلبات
            </h2>

            <p className="mt-1 text-xs text-[#64748B]">
              {isLoading
                ? "جارٍ تحميل الطلبات..."
                : `${filteredRequests.length} طلب من أصل ${totalRequests}`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="ابحث عن طلب..."
                className="w-full rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] py-3 pl-4 pr-10 text-sm outline-none focus:border-[#164A68] sm:w-[240px]"
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="تصفية حسب الحالة"
                className="w-full rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] py-3 pl-4 pr-10 text-sm outline-none focus:border-[#164A68] sm:w-[200px]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "الكل"
                      ? "جميع الحالات"
                      : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {errorMessage && (
          <div
            role="alert"
            className="m-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700"
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
          <div className="flex min-h-[220px] items-center justify-center gap-3 text-[#164A68]">
            <Loader2
              size={23}
              className="animate-spin"
            />
            <span>جارٍ تحميل طلبات المستفيدين...</span>
          </div>
        ) : !errorMessage ? (
          /* الجدول */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead className="bg-[#F8FBFD] text-[#64748B]">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    رقم الطلب
                  </th>

                  <th className="px-5 py-4 font-medium">
                    موضوع الطلب
                  </th>

                  <th className="px-5 py-4 font-medium">
                    المستفيد
                  </th>

                  <th className="px-5 py-4 font-medium">
                    نوع المساعدة
                  </th>

                  <th className="px-5 py-4 font-medium">
                    الباحث
                  </th>

                  <th className="px-5 py-4 font-medium">
                    التاريخ
                  </th>

                  <th className="px-5 py-4 font-medium">
                    الحالة
                  </th>

                  <th className="px-5 py-4 font-medium">
                    التفاصيل
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-[#E8EEF5] transition hover:bg-[#F8FBFD]"
                  >
                    <td className="px-5 py-5 font-medium text-[#164A68]">
                      #{request.id.slice(0, 8)}
                    </td>

                    <td className="px-5 py-5 font-medium">
                      {request.title}
                    </td>

                    <td className="px-5 py-5">
                      {request.beneficiary}
                    </td>

                    <td className="px-5 py-5">
                      {request.helpType}
                    </td>

                    <td className="px-5 py-5 text-[#64748B]">
                      {request.researcher}
                    </td>

                    <td className="px-5 py-5 text-[#64748B]">
                      {request.date}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${statusStyles[request.status]}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <Link
                        href={`/ar/admin-dashboard/requests/${request.id}`}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-[#164A68] hover:underline"
                      >
                        عرض التفاصيل
                        <ArrowUpLeft size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRequests.length === 0 && (
              <div className="px-6 py-14 text-center">
                <Search
                  size={28}
                  className="mx-auto mb-3 text-[#94A3B8]"
                />

                <p className="font-medium">
                  {requests.length === 0
                    ? "لا توجد طلبات استشارية حتى الآن"
                    : "لا توجد طلبات مطابقة"}
                </p>

                <p className="mt-2 text-sm text-[#64748B]">
                  {requests.length === 0
                    ? "ستظهر هنا طلبات المستفيدين عند إرسالها."
                    : "جرّبي تغيير البحث أو حالة الطلب."}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
