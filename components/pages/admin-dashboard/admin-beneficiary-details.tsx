
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  UserRound,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Ban,
  RotateCcw,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";

type BeneficiaryStatus = "نشط" | "موقوف";

type RequestStatus =
  | "جديد"
  | "تحت المراجعة"
  | "بانتظار معلومات إضافية"
  | "بانتظار رد الباحث"
  | "اعتذر الباحث"
  | "قيد التنفيذ"
  | "مكتمل"
  | "معتذر عن الطلب";

type BeneficiaryRequest = {
  id: string;
  title: string;
  helpType: string;
  date: string;
  researcher: string;
  status: RequestStatus;
};

type Beneficiary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  organization: string;
  role: string;
  researchField: string;
  joinDate: string;
  status: BeneficiaryStatus;
  suspensionReason?: string;
  requests: BeneficiaryRequest[];
};

type AdminBeneficiaryDetailsProps = {
  beneficiaryId: string;
};

// بيانات تجريبية متوافقة مع نموذج تسجيل المستفيد
const beneficiaries: Record<string, Beneficiary> = {
  "BEN-1001": {
    id: "BEN-1001",
    name: "سارة محمد",
    email: "sara@example.com",
    phone: "0501234567",
    specialty: "نظم المعلومات",
    organization: "جامعة الجوف",
    role: "طالبة",
    researchField: "الذكاء الاصطناعي",
    joinDate: "2026/08/15",
    status: "نشط",
    requests: [
      {
        id: "REQ-1024",
        title: "تطوير نموذج ذكاء اصطناعي",
        helpType: "استشارة بحثية",
        date: "2026/09/05",
        researcher: "—",
        status: "جديد",
      },
      {
        id: "REQ-1015",
        title: "مراجعة مقترح بحثي",
        helpType: "استشارة بحثية",
        date: "2026/08/20",
        researcher: "د. عبدالله الشمري",
        status: "قيد التنفيذ",
      },
    ],
  },

  "BEN-1002": {
    id: "BEN-1002",
    name: "نورة خالد",
    email: "noura@example.com",
    phone: "0502345678",
    specialty: "الإحصاء",
    organization: "جامعة الملك سعود",
    role: "باحثة",
    researchField: "تحليل البيانات",
    joinDate: "2026/08/18",
    status: "نشط",
    requests: [
      {
        id: "REQ-1023",
        title: "تحليل بيانات بحثية",
        helpType: "مراجعة بحثية",
        date: "2026/09/04",
        researcher: "د. مشاري العنزي",
        status: "تحت المراجعة",
      },
    ],
  },

  "BEN-1003": {
    id: "BEN-1003",
    name: "ريم أحمد",
    email: "reem@example.com",
    phone: "0503456789",
    specialty: "التربية",
    organization: "جامعة الجوف",
    role: "طالبة دراسات عليا",
    researchField: "البحوث التربوية",
    joinDate: "2026/08/22",
    status: "نشط",
    requests: [
      {
        id: "REQ-1018",
        title: "تصميم استبيان بحثي",
        helpType: "توجيه بحثي",
        date: "2026/08/28",
        researcher: "—",
        status: "بانتظار معلومات إضافية",
      },
    ],
  },

  "BEN-1004": {
    id: "BEN-1004",
    name: "هدى أحمد",
    email: "huda@example.com",
    phone: "0504567890",
    specialty: "إدارة الأعمال",
    organization: "جامعة الإمام محمد بن سعود",
    role: "باحثة",
    researchField: "منهجية البحث",
    joinDate: "2026/07/25",
    status: "نشط",
    requests: [
      {
        id: "REQ-1012",
        title: "استشارة في منهجية البحث",
        helpType: "تحليل بيانات",
        date: "2026/08/10",
        researcher: "د. فهد القحطاني",
        status: "مكتمل",
      },
    ],
  },

  "BEN-1005": {
    id: "BEN-1005",
    name: "منى خالد",
    email: "mona@example.com",
    phone: "0505678901",
    specialty: "العلوم الإنسانية",
    organization: "—",
    role: "موظفة",
    researchField: "الدراسات الاجتماعية",
    joinDate: "2026/07/10",
    status: "موقوف",
    suspensionReason: "إيقاف تجريبي لحين مراجعة الحساب.",
    requests: [
      {
        id: "REQ-1008",
        title: "مراجعة خطة بحث",
        helpType: "استشارة بحثية",
        date: "2026/07/22",
        researcher: "—",
        status: "معتذر عن الطلب",
      },
    ],
  },
};

const requestStatusStyles: Record<RequestStatus, string> = {
  جديد: "bg-[#EAF2F8] text-[#164A68]",
  "تحت المراجعة": "bg-[#FFF3D6] text-[#A36A00]",
  "بانتظار معلومات إضافية": "bg-[#F4E8FF] text-[#7A3EA1]",
  "بانتظار رد الباحث": "bg-[#F0EEFF] text-[#6554A4]",
  "اعتذر الباحث": "bg-[#FFF3D6] text-[#9A6700]",
  "قيد التنفيذ": "bg-[#E8F7EE] text-[#2E7D4F]",
  مكتمل: "bg-[#EAF0F5] text-[#475569]",
  "معتذر عن الطلب": "bg-[#FFE8EC] text-[#B4233A]",
};

export function AdminBeneficiaryDetails({
  beneficiaryId,
}: AdminBeneficiaryDetailsProps) {
  const beneficiary = beneficiaries[beneficiaryId];

  const [status, setStatus] = useState<BeneficiaryStatus>(
    beneficiary?.status ?? "نشط"
  );

  const [suspensionReason, setSuspensionReason] = useState(
    beneficiary?.suspensionReason ?? ""
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const closeModal = () => {
    setShowConfirm(false);
    setReason("");
    setError("");
  };

  const handleConfirm = () => {
    if (!beneficiary) return;

    if (status === "نشط") {
      if (!reason.trim()) {
        setError("يرجى كتابة سبب إيقاف الحساب.");
        return;
      }

      setSuspensionReason(reason.trim());
      setStatus("موقوف");
    } else {
      setSuspensionReason("");
      setStatus("نشط");
    }

    closeModal();
  };

  if (!beneficiary) {
    return (
      <section
        dir="rtl"
        className="min-h-screen bg-[#F8FBFD] px-4 py-10 sm:px-8 lg:px-10"
      >
        <Link
          href="/ar/admin-dashboard/beneficiaries"
          className="inline-flex items-center gap-2 text-sm text-[#164A68]"
        >
          <ArrowRight size={18} />
          العودة إلى إدارة المستفيدين
        </Link>

        <div className="mt-8 rounded-[24px] border border-[#D7E3EF] bg-white p-10 text-center">
          <h1 className="text-xl font-semibold text-[#071B2F]">
            المستفيد غير موجود
          </h1>

          <p className="mt-3 text-sm text-[#64748B]">
            لم يتم العثور على بيانات المستفيد المطلوب.
          </p>
        </div>
      </section>
    );
  }

  const activeRequests = beneficiary.requests.filter(
    (request) =>
      !["مكتمل", "معتذر عن الطلب"].includes(request.status)
  ).length;

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* العودة */}
        <Link
          href="/ar/admin-dashboard/beneficiaries"
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى إدارة المستفيدين
        </Link>

        {/* رأس الصفحة */}
        <div className="mb-6 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EAF2F8] text-[#164A68]">
                <UserRound size={30} strokeWidth={1.6} />
              </div>

              <div>
                <p className="mb-1 text-xs text-[#94A3B8]">
                  الملف الإداري للمستفيد
                </p>

                <h1 className="text-xl font-semibold text-[#071B2F] sm:text-2xl">
                  {beneficiary.name}
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                  {beneficiary.id}
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-xs font-medium ${
                status === "نشط"
                  ? "bg-[#E8F7EE] text-[#2E7D4F]"
                  : "bg-[#FFE8EC] text-[#B4233A]"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* المعلومات الأساسية */}
        <div className="mb-6 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <h2 className="mb-6 text-lg font-semibold text-[#071B2F]">
            المعلومات الأساسية
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={UserRound}
              label="الاسم الكامل"
              value={beneficiary.name}
            />

            <InfoItem
              icon={Mail}
              label="البريد الإلكتروني"
              value={beneficiary.email}
            />

            <InfoItem
              icon={Phone}
              label="رقم الجوال"
              value={beneficiary.phone}
            />

            <InfoItem
              icon={GraduationCap}
              label="مجال التخصص"
              value={beneficiary.specialty}
            />

            <InfoItem
              icon={Building2}
              label="الجهة"
              value={beneficiary.organization}
            />

            <InfoItem
              icon={BriefcaseBusiness}
              label="الصفة"
              value={beneficiary.role}
            />

            <InfoItem
              icon={BookOpen}
              label="مجال البحث"
              value={beneficiary.researchField}
            />

            <InfoItem
              icon={CalendarDays}
              label="تاريخ التسجيل"
              value={beneficiary.joinDate}
            />
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={ClipboardList}
            label="إجمالي الطلبات"
            value={beneficiary.requests.length}
          />

          <StatCard
            icon={CheckCircle2}
            label="الطلبات المكتملة"
            value={
              beneficiary.requests.filter(
                (request) => request.status === "مكتمل"
              ).length
            }
          />

          <StatCard
            icon={ClipboardList}
            label="الطلبات الجارية"
            value={activeRequests}
          />
        </div>

        {/* جدول الطلبات */}
        <div className="mb-6 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-[#071B2F]">
            الطلبات البحثية للمستفيد
          </h2>

          <p className="mt-2 text-sm text-[#64748B]">
            يمكنك الاطلاع على تفاصيل الطلبات ومتابعة حالتها من
            لوحة الإدارة.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[850px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-right text-[13px] text-[#64748B]">
                  <th className="px-4 py-3 font-medium">
                    عنوان الطلب
                  </th>
                  <th className="px-4 py-3 font-medium">
                    نوع المساعدة
                  </th>
                  <th className="px-4 py-3 font-medium">
                    الباحث المحدد
                  </th>
                  <th className="px-4 py-3 font-medium">
                    تاريخ التقديم
                  </th>
                  <th className="px-4 py-3 font-medium">
                    الحالة
                  </th>
                  <th className="px-4 py-3 font-medium">
                    التفاصيل
                  </th>
                </tr>
              </thead>

              <tbody>
                {beneficiary.requests.map((request) => (
                  <tr
                    key={request.id}
                    className="bg-[#F8FBFD] text-sm text-[#071B2F]"
                  >
                    <td className="rounded-r-xl px-4 py-4">
                      <p className="font-medium">
                        {request.title}
                      </p>
                      <p className="mt-1 text-xs text-[#94A3B8]">
                        {request.id}
                      </p>
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

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs ${requestStatusStyles[request.status]}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="rounded-l-xl px-4 py-4">
                      <Link
                        href={`/ar/admin-dashboard/requests/${request.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D7E3EF] bg-white px-3 py-2 text-xs font-medium text-[#164A68] transition hover:border-[#164A68] hover:bg-[#EAF2F8]"
                      >
                        <Eye size={15} />
                        عرض الطلب
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* سبب الإيقاف */}
        {status === "موقوف" && suspensionReason && (
          <div className="mb-6 flex items-start gap-3 rounded-[20px] border border-[#F5CBD2] bg-[#FFF7F8] p-5">
            <AlertCircle
              size={21}
              className="shrink-0 text-[#B4233A]"
            />

            <div>
              <h3 className="font-semibold text-[#B4233A]">
                سبب إيقاف الحساب
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#475569]">
                {suspensionReason}
              </p>
            </div>
          </div>
        )}

        {/* إجراءات الإدارة */}
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-[#071B2F]">
            إجراءات الإدارة
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            يمكنك إدارة حالة حساب المستفيد وفق الإجراءات
            المعتمدة في المنصة.
          </p>

          <div className="mt-6">
            {status === "نشط" ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#B4233A] px-6 py-3 text-sm font-medium text-[#B4233A] transition hover:bg-[#FFF1F3]"
              >
                <Ban size={18} />
                إيقاف الحساب
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#123E58]"
              >
                <RotateCcw size={18} />
                إعادة تفعيل الحساب
              </button>
            )}
          </div>

          <p className="mt-6 text-xs leading-6 text-[#94A3B8]">
            ملاحظة: هذه الإجراءات تجريبية، وتتغير حالة
            الحساب داخل الصفحة فقط. سيتم ربطها بقاعدة
            البيانات وصلاحيات الإدارة لاحقًا.
          </p>
        </div>
      </div>

      {/* نافذة تأكيد الإيقاف أو التفعيل */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="beneficiary-action-title"
            className="relative w-full max-w-[500px] rounded-[24px] bg-white p-6 shadow-xl sm:p-8"
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="إغلاق"
              className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F1F5F9]"
            >
              <X size={20} />
            </button>

            <h2
              id="beneficiary-action-title"
              className="pl-10 text-xl font-semibold text-[#071B2F]"
            >
              {status === "نشط"
                ? "إيقاف حساب المستفيد"
                : "إعادة تفعيل حساب المستفيد"}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#64748B]">
              {status === "نشط"
                ? "يرجى توضيح سبب إيقاف حساب المستفيد قبل تأكيد القرار."
                : "هل أنت متأكد من رغبتك في إعادة تفعيل حساب هذا المستفيد؟"}
            </p>

            {status === "نشط" && (
              <div className="mt-5">
                <label
                  htmlFor="suspension-reason"
                  className="mb-2 block text-sm font-medium text-[#071B2F]"
                >
                  سبب الإيقاف
                  <span className="mr-1 text-[#B4233A]">
                    *
                  </span>
                </label>

                <textarea
                  id="suspension-reason"
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setError("");
                  }}
                  rows={4}
                  placeholder="اكتب سبب الإيقاف..."
                  className="w-full resize-none rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-sm text-[#071B2F] outline-none placeholder:text-[#94A3B8] focus:border-[#164A68]"
                />

                {error && (
                  <p className="mt-2 text-xs text-[#B4233A]">
                    {error}
                  </p>
                )}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-full border border-[#D7E3EF] px-5 py-3 text-sm font-medium text-[#475569] transition hover:bg-[#F8FBFD]"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className={`flex-1 rounded-full px-5 py-3 text-sm font-medium text-white transition ${
                  status === "نشط"
                    ? "bg-[#B4233A] hover:bg-[#921D30]"
                    : "bg-[#164A68] hover:bg-[#123E58]"
                }`}
              >
                {status === "نشط"
                  ? "تأكيد الإيقاف"
                  : "تأكيد إعادة التفعيل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type IconComponent = typeof UserRound;

type InfoItemProps = {
  icon: IconComponent;
  label: string;
  value: string;
};

function InfoItem({
  icon: Icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F6F9] text-[#164A68]">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div>
        <p className="text-xs text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[#071B2F]">
          {value}
        </p>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: IconComponent;
  label: string;
  value: number;
};

function StatCard({
  icon: Icon,
  label,
  value,
}: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#D7E3EF] bg-white p-5">
      <div>
        <p className="text-sm text-[#64748B]">
          {label}
        </p>

        <p className="mt-3 text-[28px] font-semibold text-[#071B2F]">
          {value}
        </p>
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2F8] text-[#164A68]">
        <Icon size={23} strokeWidth={1.8} />
      </div>
    </div>
  );
}
