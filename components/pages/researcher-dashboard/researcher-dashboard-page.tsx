"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Inbox,
  UserRound,
} from "lucide-react";

const researcher = {
  name: "د. عبدالله الشمري",
  specialization: "البحث العلمي",
};

const requests = [
  {
    id: "REQ-1015",
    title: "مراجعة مقترح بحثي",
    type: "استشارة بحثية",
    field: "البحث العلمي",
    date: "2026/08/20",
    status: "طلب جديد",
  },
  {
    id: "REQ-1007",
    title: "مراجعة منهجية دراسة",
    type: "توجيه بحثي",
    field: "مناهج البحث",
    date: "2026/08/15",
    status: "قيد التنفيذ",
  },
  {
    id: "REQ-0998",
    title: "مراجعة أسئلة البحث",
    type: "مراجعة بحثية",
    field: "البحث العلمي",
    date: "2026/08/02",
    status: "مكتمل",
  },
];

function getStatusStyle(status: string) {
  switch (status) {
    case "طلب جديد":
      return "bg-[#FFF3D6] text-[#9A6700]";

    case "قيد التنفيذ":
      return "bg-[#EAF2F8] text-[#164A68]";

    case "مكتمل":
      return "bg-[#E8F7EE] text-[#2E7D4F]";

    default:
      return "bg-[#F1F5F9] text-[#64748B]";
  }
}

export function ResearcherDashboardPage() {
  const newRequests = requests.filter(
    (request) => request.status === "طلب جديد"
  ).length;

  const activeRequests = requests.filter(
    (request) => request.status === "قيد التنفيذ"
  ).length;

  const completedRequests = requests.filter(
    (request) => request.status === "مكتمل"
  ).length;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-5 py-12 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-[1280px]">

        {/* عنوان الصفحة */}
        <div className="mb-8">
          <p className="mb-2 text-sm text-[#64748B]">
            لوحة الباحث المتطوع
          </p>

          <h1 className="text-3xl font-semibold text-[#071B2F] sm:text-4xl">
            طلباتي
          </h1>
        </div>

        {/* بطاقة الباحث */}
        <div className="rounded-[24px] border border-[#9DB5D8] bg-white p-6 sm:p-8">
          <div className="flex items-center gap-5">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EAF2F8] text-[#164A68]">
              <UserRound size={30} strokeWidth={1.5} />
            </div>

            <div>
              <span className="mb-2 inline-block rounded-full bg-[#E8F7EE] px-3 py-1 text-xs text-[#2E7D4F]">
                باحث متطوع
              </span>

              <h2 className="text-xl font-semibold text-[#071B2F]">
                {researcher.name}
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                {researcher.specialization}
              </p>
            </div>

          </div>
        </div>

        {/* الإحصائيات */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          {/* الطلبات الجديدة */}
          <div className="rounded-[20px] border border-[#D7E3EF] bg-white p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-[#64748B]">
                  الطلبات الجديدة
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#071B2F]">
                  {newRequests}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3D6] text-[#9A6700]">
                <Inbox size={23} />
              </div>

            </div>
          </div>

          {/* قيد التنفيذ */}
          <div className="rounded-[20px] border border-[#D7E3EF] bg-white p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-[#64748B]">
                  قيد التنفيذ
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#071B2F]">
                  {activeRequests}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                <Clock3 size={23} />
              </div>

            </div>
          </div>

          {/* مكتملة */}
          <div className="rounded-[20px] border border-[#D7E3EF] bg-white p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-[#64748B]">
                  الطلبات المكتملة
                </p>

                <p className="mt-2 text-3xl font-semibold text-[#071B2F]">
                  {completedRequests}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F7EE] text-[#2E7D4F]">
                <CheckCircle2 size={23} />
              </div>

            </div>
          </div>

        </div>

        {/* قائمة الطلبات */}
        <div className="mt-9">

          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[#071B2F]">
              الطلبات المحولة إليّ
            </h2>

            <p className="mt-2 text-sm text-[#64748B]">
              الطلبات التي تمت مراجعتها وتحويلها إليك من قبل الإدارة.
            </p>
          </div>

          <div className="space-y-4">

            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/ar/researcher-dashboard/requests/${request.id}`}
                className="
                  block rounded-[20px]
                  border border-[#D7E3EF]
                  bg-white p-5
                  transition
                  hover:border-[#9DB5D8]
                  hover:shadow-sm
                  sm:p-6
                "
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F6F9] text-[#164A68]">
                      <FileText size={21} />
                    </div>

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">

                        <span className="text-xs text-[#94A3B8]">
                          {request.id}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getStatusStyle(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>

                      </div>

                      <h3 className="font-semibold text-[#071B2F]">
                        {request.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#64748B]">

                        <span>
                          {request.type}
                        </span>

                        <span className="flex items-center gap-1">
                          <GraduationCap size={14} />
                          {request.field}
                        </span>

                        <span>
                          {request.date}
                        </span>

                      </div>
                    </div>

                  </div>

                  <span className="shrink-0 text-sm font-medium text-[#164A68]">
                    عرض تفاصيل الطلب
                  </span>

                </div>
              </Link>
            ))}

          </div>
        </div>

      </div>
    </main>
  );
}