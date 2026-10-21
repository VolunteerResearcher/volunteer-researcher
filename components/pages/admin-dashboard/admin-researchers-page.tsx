
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  UserCheck,
  Clock3,
  UserX,
  Eye,
  ChevronDown,
} from "lucide-react";

type ResearcherStatus =
  | "نشط"
  | "بانتظار المراجعة"
  | "موقوف"
  | "مرفوض";

type Researcher = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  joinDate: string;
  requestsCount: number | null;
  status: string;
  hasCompletedApplication: boolean;
};

type AdminResearchersPageProps = {
  researchers: Researcher[];
};

const statusStyles: Record<ResearcherStatus, string> = {
  نشط: "bg-[#E8F7EE] text-[#2E7D4F]",
  "بانتظار المراجعة": "bg-[#FFF3D6] text-[#A36A00]",
  موقوف: "bg-[#FFE8EC] text-[#B4233A]",
  مرفوض: "bg-[#F1F5F9] text-[#64748B]",
};

const filters = [
  "الكل",
  "نشط",
  "بانتظار المراجعة",
  "موقوف",
  "مرفوض",
] as const;

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

export function AdminResearchersPage({
  researchers,
}: AdminResearchersPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "الكل" | ResearcherStatus
  >("الكل");

  const stats = useMemo(
    () => ({
      total: researchers.length,
      active: researchers.filter(
        (item) => item.status === "approved"
      ).length,
      pending: researchers.filter(
        (item) => item.status === "pending"
      ).length,
      suspended: researchers.filter(
        (item) => item.status === "suspended"
      ).length,
    }),
    [researchers]
  );

  const filteredResearchers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return researchers.filter((researcher) => {
      const matchesSearch =
        researcher.name.toLowerCase().includes(query) ||
        researcher.specialty.toLowerCase().includes(query) ||
        researcher.id.toLowerCase().includes(query) ||
        researcher.email.toLowerCase().includes(query);

      const matchesFilter =
        filter === "الكل" ||
        getResearcherStatus(researcher.status) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [researchers, search, filter]);

  const statCards = [
    {
      title: "إجمالي الباحثين",
      value: stats.total,
      icon: GraduationCap,
      iconClass: "bg-[#EAF2F8] text-[#164A68]",
    },
    {
      title: "الباحثون النشطون",
      value: stats.active,
      icon: UserCheck,
      iconClass: "bg-[#E8F7EE] text-[#2E7D4F]",
    },
    {
      title: "بانتظار المراجعة",
      value: stats.pending,
      icon: Clock3,
      iconClass: "bg-[#FFF3D6] text-[#A36A00]",
    },
    {
      title: "الحسابات الموقوفة",
      value: stats.suspended,
      icon: UserX,
      iconClass: "bg-[#FFE8EC] text-[#B4233A]",
    },
  ];

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold text-[#071B2F] sm:text-[32px]">
            إدارة الباحثين
          </h1>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            مراجعة طلبات انضمام الباحثين المتطوعين
            وإدارة حساباتهم ومتابعة نشاطهم.
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-[20px] border border-[#D7E3EF] bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#64748B]">
                      {card.title}
                    </p>

                    <p className="mt-3 text-[30px] font-semibold text-[#071B2F]">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconClass}`}
                  >
                    <Icon size={23} strokeWidth={1.8} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* جدول الباحثين */}
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#071B2F]">
                قائمة الباحثين المتطوعين
              </h2>

              <p className="mt-1 text-xs text-[#94A3B8]">
                عرض {filteredResearchers.length} من أصل{" "}
                {researchers.length} باحثين
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* البحث */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="ابحث عن باحث..."
                  aria-label="البحث عن باحث"
                  className="h-[44px] w-full rounded-xl border border-[#D7E3EF] bg-white pr-10 pl-4 text-sm text-[#071B2F] outline-none focus:border-[#164A68] sm:w-[260px]"
                />
              </div>

              {/* التصفية */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target.value as
                        | "الكل"
                        | ResearcherStatus
                    )
                  }
                  aria-label="تصفية الباحثين حسب الحالة"
                  className="h-[44px] w-full appearance-none rounded-xl border border-[#D7E3EF] bg-white pr-4 pl-10 text-sm text-[#071B2F] outline-none focus:border-[#164A68] sm:w-[190px]"
                >
                  {filters.map((status) => (
                    <option key={status} value={status}>
                      {status === "الكل"
                        ? "جميع الحالات"
                        : status}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-right text-[13px] text-[#64748B]">
                  <th className="px-4 py-3 font-medium">
                    الباحث
                  </th>

                  <th className="px-4 py-3 font-medium">
                    التخصص
                  </th>

                  <th className="px-4 py-3 font-medium">
                    تاريخ الانضمام
                  </th>

                  <th className="px-4 py-3 font-medium">
                    الطلبات
                  </th>

                  <th className="px-4 py-3 font-medium">
                    الحالة
                  </th>

                  <th className="px-4 py-3 font-medium">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredResearchers.map((researcher) => {
                  const status = getResearcherStatus(
                    researcher.status
                  );

                  return (
                    <tr
                      key={researcher.id}
                      className="bg-[#F8FBFD] text-sm text-[#071B2F] transition hover:bg-[#EEF5F9]"
                    >
                      <td className="rounded-r-xl px-4 py-4">
                        <p className="font-medium">
                          {researcher.name}
                        </p>

                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {researcher.id.slice(0, 8)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {researcher.specialty}
                      </td>

                      <td className="px-4 py-4">
                        {formatJoinDate(
                          researcher.joinDate
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {researcher.requestsCount ?? "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs ${statusStyles[status]}`}
                        >
                          {status}
                        </span>

                        {!researcher.hasCompletedApplication && (
                          <p className="mt-2 text-xs text-[#B45309]">
                            طلب الانضمام غير مكتمل
                          </p>
                        )}
                      </td>

                      <td className="rounded-l-xl px-4 py-4">
                        <Link
                          href={`/ar/admin-dashboard/researchers/${researcher.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#D7E3EF] bg-white px-3 py-2 text-xs font-medium text-[#164A68] transition hover:border-[#164A68] hover:bg-[#EAF2F8]"
                        >
                          <Eye size={15} />
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filteredResearchers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-[#64748B]"
                    >
                      {researchers.length === 0
                        ? "لا يوجد باحثون مسجلون حتى الآن."
                        : "لا يوجد باحثون مطابقون للبحث أو التصفية."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
