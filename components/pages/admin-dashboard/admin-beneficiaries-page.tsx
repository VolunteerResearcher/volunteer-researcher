
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  Eye,
  ChevronDown,
} from "lucide-react";

type BeneficiaryStatus = "نشط" | "موقوف";

type Beneficiary = {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  requestsCount: number;
  activeRequests: number;
  status: BeneficiaryStatus;
};

const beneficiaries: Beneficiary[] = [
  {
    id: "BEN-1001",
    name: "سارة محمد",
    email: "sara@example.com",
    joinDate: "2026/08/15",
    requestsCount: 2,
    activeRequests: 1,
    status: "نشط",
  },
  {
    id: "BEN-1002",
    name: "نورة خالد",
    email: "noura@example.com",
    joinDate: "2026/08/18",
    requestsCount: 1,
    activeRequests: 1,
    status: "نشط",
  },
  {
    id: "BEN-1003",
    name: "ريم أحمد",
    email: "reem@example.com",
    joinDate: "2026/08/22",
    requestsCount: 1,
    activeRequests: 1,
    status: "نشط",
  },
  {
    id: "BEN-1004",
    name: "هدى أحمد",
    email: "huda@example.com",
    joinDate: "2026/07/25",
    requestsCount: 1,
    activeRequests: 0,
    status: "نشط",
  },
  {
    id: "BEN-1005",
    name: "منى خالد",
    email: "mona@example.com",
    joinDate: "2026/07/10",
    requestsCount: 1,
    activeRequests: 0,
    status: "موقوف",
  },
];

const statusStyles: Record<BeneficiaryStatus, string> = {
  نشط: "bg-[#E8F7EE] text-[#2E7D4F]",
  موقوف: "bg-[#FFE8EC] text-[#B4233A]",
};

type StatusFilter = "الكل" | BeneficiaryStatus;

export function AdminBeneficiariesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("الكل");

  const stats = useMemo(() => {
    return {
      total: beneficiaries.length,
      active: beneficiaries.filter(
        (item) => item.status === "نشط"
      ).length,
      suspended: beneficiaries.filter(
        (item) => item.status === "موقوف"
      ).length,
      requests: beneficiaries.reduce(
        (total, item) => total + item.requestsCount,
        0
      ),
    };
  }, []);

  const filteredBeneficiaries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return beneficiaries.filter((beneficiary) => {
      const matchesSearch =
        beneficiary.name.toLowerCase().includes(query) ||
        beneficiary.email.toLowerCase().includes(query) ||
        beneficiary.id.toLowerCase().includes(query);

      const matchesFilter =
        filter === "الكل" ||
        beneficiary.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const statCards = [
    {
      title: "إجمالي المستفيدين",
      value: stats.total,
      icon: Users,
      iconClass: "bg-[#EAF2F8] text-[#164A68]",
    },
    {
      title: "الحسابات النشطة",
      value: stats.active,
      icon: UserCheck,
      iconClass: "bg-[#E8F7EE] text-[#2E7D4F]",
    },
    {
      title: "الحسابات الموقوفة",
      value: stats.suspended,
      icon: UserX,
      iconClass: "bg-[#FFE8EC] text-[#B4233A]",
    },
    {
      title: "إجمالي الطلبات",
      value: stats.requests,
      icon: ClipboardList,
      iconClass: "bg-[#F0EEFF] text-[#6554A4]",
    },
  ];

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* عنوان الصفحة */}
        <div className="mb-8">
          <h1 className="text-[26px] font-semibold text-[#071B2F] sm:text-[32px]">
            إدارة المستفيدين
          </h1>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            متابعة حسابات المستفيدين وطلباتهم البحثية
            وإدارة حالة الحسابات.
          </p>
        </div>

        {/* بطاقات الإحصائيات */}
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

        {/* جدول المستفيدين */}
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#071B2F]">
                قائمة المستفيدين
              </h2>

              <p className="mt-1 text-xs text-[#94A3B8]">
                عرض {filteredBeneficiaries.length} من أصل{" "}
                {beneficiaries.length} مستفيدين
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
                  placeholder="ابحث عن مستفيد..."
                  aria-label="البحث عن مستفيد"
                  className="h-[44px] w-full rounded-xl border border-[#D7E3EF] bg-white pr-10 pl-4 text-sm text-[#071B2F] outline-none focus:border-[#164A68] sm:w-[260px]"
                />
              </div>

              {/* التصفية */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target.value as StatusFilter
                    )
                  }
                  aria-label="تصفية المستفيدين حسب الحالة"
                  className="h-[44px] w-full appearance-none rounded-xl border border-[#D7E3EF] bg-white pr-4 pl-10 text-sm text-[#071B2F] outline-none focus:border-[#164A68] sm:w-[190px]"
                >
                  <option value="الكل">
                    جميع الحالات
                  </option>
                  <option value="نشط">نشط</option>
                  <option value="موقوف">موقوف</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
              </div>
            </div>
          </div>

          {/* الجدول */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-right text-[13px] text-[#64748B]">
                  <th className="px-4 py-3 font-medium">
                    المستفيد
                  </th>
                  <th className="px-4 py-3 font-medium">
                    البريد الإلكتروني
                  </th>
                  <th className="px-4 py-3 font-medium">
                    تاريخ التسجيل
                  </th>
                  <th className="px-4 py-3 font-medium">
                    إجمالي الطلبات
                  </th>
                  <th className="px-4 py-3 font-medium">
                    الطلبات الجارية
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
                {filteredBeneficiaries.map((beneficiary) => (
                  <tr
                    key={beneficiary.id}
                    className="bg-[#F8FBFD] text-sm text-[#071B2F] transition hover:bg-[#EEF5F9]"
                  >
                    <td className="rounded-r-xl px-4 py-4">
                      <p className="font-medium">
                        {beneficiary.name}
                      </p>

                      <p className="mt-1 text-xs text-[#94A3B8]">
                        {beneficiary.id}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {beneficiary.email}
                    </td>

                    <td className="px-4 py-4">
                      {beneficiary.joinDate}
                    </td>

                    <td className="px-4 py-4">
                      {beneficiary.requestsCount}
                    </td>

                    <td className="px-4 py-4">
                      {beneficiary.activeRequests}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs ${statusStyles[beneficiary.status]}`}
                      >
                        {beneficiary.status}
                      </span>
                    </td>

                    <td className="rounded-l-xl px-4 py-4">
                      <Link
                        href={`/ar/admin-dashboard/beneficiaries/${beneficiary.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D7E3EF] bg-white px-3 py-2 text-xs font-medium text-[#164A68] transition hover:border-[#164A68] hover:bg-[#EAF2F8]"
                      >
                        <Eye size={15} />
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredBeneficiaries.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm text-[#64748B]"
                    >
                      لا يوجد مستفيدون مطابقون
                      للبحث أو التصفية.
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
