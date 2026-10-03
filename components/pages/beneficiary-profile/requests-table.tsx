"use client";

import { Search } from "lucide-react";

const requests = [
  {
    id: "#REQ-1024",
    title: "تطوير نموذج ذكاء اصطناعي",
    helpType: "استشارة بحثية",
    researcher: "—",
    date: "2026/09/05",
    status: "جديد",
  },
  {
    id: "#REQ-1023",
    title: "تحليل بيانات بحثية",
    helpType: "مراجعة بحثية",
    researcher: "د. مشاري العنزي",
    date: "2026/09/04",
    status: "تحت المراجعة",
  },
  {
    id: "#REQ-1018",
    title: "تصميم استبيان بحثي",
    helpType: "توجيه بحثي",
    researcher: "—",
    date: "2026/08/28",
    status: "بانتظار معلومات إضافية",
  },
  {
    id: "#REQ-1015",
    title: "مراجعة مقترح بحثي",
    helpType: "استشارة بحثية",
    researcher: "د. عبدالله الشمري",
    date: "2026/08/20",
    status: "مؤكد",
  },
  {
    id: "#REQ-1012",
    title: "استشارة في منهجية البحث",
    helpType: "تحليل بيانات",
    researcher: "د. فهد القحطاني",
    date: "2026/08/10",
    status: "مكتمل",
  },
  {
    id: "#REQ-1008",
    title: "مراجعة خطة بحث",
    helpType: "استشارة بحثية",
    researcher: "—",
    date: "2026/07/22",
    status: "معتذر عن الطلب",
  },
];

function getStatusStyle(status: string) {
  switch (status) {
    case "جديد":
      return "bg-[#EAF2F8] text-[#164A68]";

    case "تحت المراجعة":
      return "bg-[#FFF3D6] text-[#A36A00]";

    case "بانتظار معلومات إضافية":
      return "bg-[#F4E8FF] text-[#7A3EA1]";

    case "مؤكد":
      return "bg-[#E8F7EE] text-[#2E7D4F]";

    case "مكتمل":
      return "bg-[#EAF0F5] text-[#475569]";

    case "معتذر عن الطلب":
      return "bg-[#FFE8EC] text-[#B4233A]";

    default:
      return "bg-[#F3F4F6] text-[#6B7280]";
  }
}

export function RequestsTable() {
  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-14 md:px-8 md:pb-20"
    >
      <div className="mx-auto max-w-[1320px]">

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-[28px] font-normal text-[#071B2F] sm:text-[32px] md:text-[36px]">
            طلباتي
          </h2>

          <p className="mt-2 text-[16px] text-[#6B7280] sm:text-[18px]">
            يمكنك متابعة حالة طلباتك الاستشارية التي قمت بتقديمها.
          </p>
        </div>

        {/* Card */}
        <div
          className="
            rounded-[24px]
            border
            border-[#9DB5D8]
            bg-white
            px-4
            py-5
            sm:px-5
            md:px-6
            md:py-6
          "
        >
          {/* Search */}
          <div className="mb-5">
            <div className="relative max-w-[360px]">
              <Search
                size={18}
                strokeWidth={1.7}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#164A68]
                "
              />

              <input
                type="text"
                placeholder="البحث في الطلبات ..."
                className="
                  h-[44px]
                  w-full
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-11
                  pl-4
                  text-[14px]
                  text-[#071B2F]
                  outline-none
                  transition
                  placeholder:text-[#94A3B8]
                  focus:border-[#164A68]
                "
              />
            </div>
          </div>

          {/* Table */}
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
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="
                      bg-[#F8FBFD]
                      text-[14px]
                      text-[#071B2F]
                    "
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

                    <td className="px-4 py-4 text-[#6B7280]">
                      {request.id}
                    </td>

                    <td className="rounded-l-[10px] px-4 py-4">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-3
                          py-1
                          text-[13px]
                          ${getStatusStyle(request.status)}
                        `}
                      >
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}