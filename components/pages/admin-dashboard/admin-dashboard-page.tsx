
import Link from "next/link";
import {
  ClipboardList,
  GraduationCap,
  Users,
  Clock3,
  CheckCircle2,
  ArrowUpLeft,
  UserRoundPlus,
  Star,
  MessagesSquare,
  UserRoundCheck,
  ArrowLeft,
} from "lucide-react";

type RecentRequest = {
  id: string;
  title: string;
  beneficiary: string;
  status: string;
};

type AdminDashboardPageProps = {
  beneficiariesCount: number;
  approvedResearchersCount: number;
  pendingResearchersCount: number;
  researcherApplicationsCount: number;
  pendingApplicationsCount: number;
  consultationsCount: number;
  conversationsCount: number;
  pendingConsultationsCount: number;
  pendingReviewsCount: number;
  recentRequests: RecentRequest[];
};

const statusLabels: Record<string, string> = {
  pending: "جديد",
  assigned: "تحت المراجعة",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "معتذر عن الطلب",
};

const statusStyles: Record<string, string> = {
  pending: "bg-[#EAF2F8] text-[#164A68]",
  assigned: "bg-[#FFF5E6] text-[#A16207]",
  in_progress: "bg-[#E8F7EE] text-[#2E7D4F]",
  completed: "bg-[#EAF0F5] text-[#475569]",
  rejected: "bg-[#FDECEC] text-[#B42318]",
};

const quickActions = [
  {
    title: "مراجعة الطلبات",
    description: "مراجعة الطلبات وتعيين الباحثين",
    icon: ClipboardList,
    href: "/ar/admin-dashboard/requests",
  },
  {
    title: "طلبات انضمام الباحثين",
    description: "مراجعة واعتماد الباحثين المتطوعين",
    icon: UserRoundPlus,
    href: "/ar/admin-dashboard/researchers",
  },
  {
    title: "إدارة المستفيدين",
    description: "متابعة حسابات المستفيدين وطلباتهم",
    icon: UserRoundCheck,
    href: "/ar/admin-dashboard/beneficiaries",
  },
  {
    title: "متابعة المحادثات",
    description: "الاطلاع على المحادثات البحثية",
    icon: MessagesSquare,
    href: "/ar/admin-dashboard/conversations",
  },
  {
    title: "مراجعة التقييمات",
    description: "اعتماد تقييمات الباحثين أو رفضها",
    icon: Star,
    href: "/ar/admin-dashboard/reviews",
  },
];

export function AdminDashboardPage({
  beneficiariesCount,
  approvedResearchersCount,
  pendingResearchersCount,
  researcherApplicationsCount,
  pendingApplicationsCount,
  consultationsCount,
  conversationsCount,
  pendingConsultationsCount,
  pendingReviewsCount,
  recentRequests,
}: AdminDashboardPageProps) {
  const stats = [
    {
      title: "إجمالي الطلبات",
      value: consultationsCount,
      description: "طلبات الاستشارات البحثية المسجلة",
      icon: ClipboardList,
      href: "/ar/admin-dashboard/requests",
    },
    {
      title: "الباحثون المعتمدون",
      value: approvedResearchersCount,
      description: "الباحثون المعتمدون فعليًا",
      icon: GraduationCap,
      href: "/ar/admin-dashboard/researchers",
    },
    {
      title: "إجمالي المستفيدين",
      value: beneficiariesCount,
      description: "المستفيدون المسجلون",
      icon: Users,
      href: "/ar/admin-dashboard/beneficiaries",
    },
    {
      title: "المحادثات",
      value: conversationsCount,
      description: "المحادثات الفعلية بين الباحثين والمستفيدين",
      icon: MessagesSquare,
      href: "/ar/admin-dashboard/conversations",
    },
  ];

  const pendingStats = [
    {
      title: "طلبات تحتاج مراجعة",
      value: pendingConsultationsCount,
      description: "طلبات الاستشارات الجديدة",
      icon: Clock3,
      href: "/ar/admin-dashboard/requests",
    },
    {
      title: "باحثون بانتظار الاعتماد",
      value: pendingResearchersCount,
      description: "حسابات باحثين بانتظار الاعتماد",
      icon: UserRoundPlus,
      href: "/ar/admin-dashboard/researchers",
    },
    {
      title: "تقييمات بانتظار المراجعة",
      value: pendingReviewsCount,
      description: "تقييمات المستفيدين التي تنتظر اعتماد الإدارة",
      icon: Star,
      href: "/ar/admin-dashboard/reviews",
    },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 text-[#071B2F] sm:px-7 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* عنوان الصفحة */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#64748B]">
              مرحبًا بك في لوحة الإدارة
            </p>

            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              نظرة عامة
            </h1>

            <p className="mt-3 text-sm text-[#64748B]">
              متابعة نشاط منصة باحث متطوع وإدارة أقسامها.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#D7E3EF] bg-white px-4 py-2 text-sm">
            <CheckCircle2
              size={17}
              className="text-[#2E7D4F]"
            />
            حساب الإدارة
          </div>
        </div>

        {/* إحصائيات المنصة */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            إحصائيات المنصة
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[20px] border border-[#D7E3EF] bg-white p-5 transition hover:border-[#164A68] hover:shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                    <Icon size={22} />
                  </div>

                  <ArrowUpLeft
                    size={17}
                    className="text-[#94A3B8] transition group-hover:text-[#164A68]"
                  />
                </div>

                <p className="text-sm text-[#64748B]">
                  {item.title}
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {item.value}
                </p>

                <p className="mt-3 text-xs text-[#94A3B8]">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* عناصر تحتاج متابعة */}
        <div className="mb-5 mt-9">
          <h2 className="text-lg font-semibold">
            عناصر تحتاج متابعة
          </h2>

          <p className="mt-2 text-sm text-[#64748B]">
            المهام والتنبيهات التي تحتاج إلى مراجعة الإدارة.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pendingStats.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col rounded-[20px] border border-[#D7E3EF] bg-white p-5 transition hover:border-[#164A68] hover:shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1F6F9] text-[#164A68]">
                    <Icon size={21} />
                  </div>

                  <ArrowUpLeft
                    size={17}
                    className="text-[#94A3B8] transition group-hover:text-[#164A68]"
                  />
                </div>

                <p className="text-sm text-[#64748B]">
                  {item.title}
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {item.value}
                </p>

                <p className="mt-3 text-xs leading-6 text-[#94A3B8]">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* حالة طلبات انضمام الباحثين */}
        <div className="mt-6 rounded-[20px] border border-[#D7E3EF] bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
              <UserRoundPlus size={21} />
            </div>

            <div>
              <h3 className="font-semibold">
                حالة طلبات انضمام الباحثين
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                طلبات الانضمام المحفوظة:{" "}
                <span className="font-semibold text-[#071B2F]">
                  {researcherApplicationsCount}
                </span>{" "}
                | الطلبات المبدئية المحفوظة:{" "}
                <span className="font-semibold text-[#071B2F]">
                  {pendingApplicationsCount}
                </span>
              </p>

              <p className="mt-1 text-xs leading-6 text-[#64748B]">
                عدد حسابات الباحثين بانتظار الاعتماد قد يشمل
                حسابات لم يكتمل حفظ طلب انضمامها.
              </p>
            </div>
          </div>
        </div>

        {/* أحدث الطلبات */}
        <div className="mt-9 overflow-hidden rounded-[24px] border border-[#D7E3EF] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D7E3EF] p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">
                أحدث الطلبات
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                متابعة آخر الطلبات المقدمة من المستفيدين.
              </p>
            </div>

            <Link
              href="/ar/admin-dashboard/requests"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#164A68] hover:underline"
            >
              عرض جميع الطلبات
              <ArrowUpLeft size={17} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-[#F8FBFD] text-[#64748B]">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    رقم الطلب
                  </th>

                  <th className="px-6 py-4 font-medium">
                    موضوع الطلب
                  </th>

                  <th className="px-6 py-4 font-medium">
                    المستفيد
                  </th>

                  <th className="px-6 py-4 font-medium">
                    الحالة
                  </th>

                  <th className="px-6 py-4 font-medium">
                    التفاصيل
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentRequests.length > 0 ? (
                  recentRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-t border-[#E8EEF5] transition hover:bg-[#F8FBFD]"
                    >
                      <td className="px-6 py-5 font-medium text-[#164A68]">
                        #{request.id.slice(0, 8)}
                      </td>

                      <td className="px-6 py-5 font-medium">
                        {request.title}
                      </td>

                      <td className="px-6 py-5">
                        {request.beneficiary}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                            statusStyles[request.status] ??
                            "bg-[#EAF0F5] text-[#475569]"
                          }`}
                        >
                          {statusLabels[request.status] ??
                            "غير محدد"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <Link
                          href={`/ar/admin-dashboard/requests/${request.id}`}
                          className="inline-flex items-center gap-2 whitespace-nowrap font-medium text-[#164A68] hover:underline"
                        >
                          عرض التفاصيل
                          <ArrowUpLeft size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-[#E8EEF5]">
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                          <ClipboardList size={23} />
                        </div>

                        <p className="font-medium text-[#071B2F]">
                          لا توجد طلبات بحثية معروضة حاليًا
                        </p>

                        <p className="max-w-md text-xs leading-6 text-[#64748B]">
                          ستظهر هنا أحدث طلبات الاستشارات
                          البحثية عند إرسالها من المستفيدين.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* الإجراءات السريعة */}
        <div className="mt-9">
          <h2 className="mb-4 text-lg font-semibold">
            الإجراءات السريعة
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-4 rounded-[20px] border border-[#D7E3EF] bg-white p-5 transition hover:border-[#164A68] hover:shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                    <Icon size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {action.title}
                    </p>

                    <p className="mt-1 text-xs leading-6 text-[#64748B]">
                      {action.description}
                    </p>
                  </div>

                  <ArrowLeft
                    size={17}
                    className="shrink-0 text-[#94A3B8] transition group-hover:text-[#164A68]"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <p className="mt-9 text-center text-xs leading-6 text-[#94A3B8]">
          إحصائيات الحسابات والطلبات البحثية وطلبات انضمام
          الباحثين متصلة بقاعدة البيانات. وتُحسب المحادثات
          من الرسائل الفعلية المسجلة في المنصة، والتقييمات
          المنتظرة من سجلات التقييمات الحقيقية.
        </p>
      </div>
    </main>
  );
}
