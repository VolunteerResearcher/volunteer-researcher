"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Hash,
  MessageSquareText,
  UserRound,
  XCircle,
} from "lucide-react";

type ResearcherRequestDetailsProps = {
  requestId: string;
};

type RequestData = {
  id: string;
  title: string;
  type: string;
  field: string;
  date: string;
  status: string;
  beneficiary: string;
  organization: string;
  message: string;
  adminNote: string;
};

const requests: Record<string, RequestData> = {
  "REQ-1015": {
    id: "REQ-1015",
    title: "مراجعة مقترح بحثي",
    type: "استشارة بحثية",
    field: "البحث العلمي",
    date: "2026/08/20",
    status: "طلب جديد",
    beneficiary: "سارة محمد",
    organization: "جامعة الجوف",
    message:
      "أرغب في مراجعة المقترح البحثي والتأكد من وضوح مشكلة البحث والأهداف والمنهجية قبل البدء في تنفيذ الدراسة.",
    adminNote:
      "تمت مراجعة الطلب من قبل الإدارة، ونرى أن مجال الطلب يتوافق مع تخصصك وخبرتك البحثية.",
  },

  "REQ-1007": {
    id: "REQ-1007",
    title: "مراجعة منهجية دراسة",
    type: "توجيه بحثي",
    field: "مناهج البحث",
    date: "2026/08/15",
    status: "قيد التنفيذ",
    beneficiary: "نورة خالد",
    organization: "جامعة الملك سعود",
    message:
      "أحتاج إلى مراجعة المنهجية المستخدمة في الدراسة والتأكد من ملاءمتها لمشكلة البحث وأهدافه.",
    adminNote:
      "تم اعتماد الطلب وقبوله، وهو حاليًا قيد التنفيذ.",
  },

  "REQ-0998": {
    id: "REQ-0998",
    title: "مراجعة أسئلة البحث",
    type: "مراجعة بحثية",
    field: "البحث العلمي",
    date: "2026/08/02",
    status: "مكتمل",
    beneficiary: "ريم أحمد",
    organization: "جامعة تبوك",
    message:
      "أحتاج إلى مراجعة أسئلة البحث والتأكد من ارتباطها بأهداف الدراسة.",
    adminNote:
      "تم الانتهاء من هذا الطلب وإغلاقه بنجاح.",
  },
};

function getStatusStyle(status: string) {
  switch (status) {
    case "طلب جديد":
      return "bg-[#FFF3D6] text-[#9A6700]";

    case "قيد التنفيذ":
      return "bg-[#EAF2F8] text-[#164A68]";

    case "مكتمل":
      return "bg-[#E8F7EE] text-[#2E7D4F]";

    case "معتذر عنه":
      return "bg-[#FFE8EC] text-[#B4233A]";

    default:
      return "bg-[#F1F5F9] text-[#64748B]";
  }
}

export function ResearcherRequestDetails({
  requestId,
}: ResearcherRequestDetailsProps) {
  const originalRequest = requests[requestId];

  const [status, setStatus] = useState(
    originalRequest?.status ?? ""
  );

  const [showRejectForm, setShowRejectForm] =
    useState(false);

  const [rejectReason, setRejectReason] = useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  if (!originalRequest) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F8FBFD] px-5 py-12 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-[1100px]">
          <Link
            href="/ar/researcher-dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#164A68]"
          >
            <ArrowRight size={18} />
            العودة إلى طلباتي
          </Link>

          <div className="mt-8 rounded-[24px] border border-[#D7E3EF] bg-white p-10 text-center">
            <h1 className="text-2xl font-semibold text-[#071B2F]">
              الطلب غير موجود
            </h1>

            <p className="mt-3 text-sm text-[#64748B]">
              لم نتمكن من العثور على تفاصيل هذا الطلب.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const details = [
    {
      label: "رقم الطلب",
      value: originalRequest.id,
      icon: Hash,
    },
    {
      label: "نوع المساعدة",
      value: originalRequest.type,
      icon: FileText,
    },
    {
      label: "مجال البحث",
      value: originalRequest.field,
      icon: GraduationCap,
    },
    {
      label: "تاريخ الطلب",
      value: originalRequest.date,
      icon: CalendarDays,
    },
    {
      label: "اسم المستفيد",
      value: originalRequest.beneficiary,
      icon: UserRound,
    },
    {
      label: "الجهة",
      value: originalRequest.organization,
      icon: GraduationCap,
    },
  ];

  const handleAccept = () => {
    setStatus("قيد التنفيذ");

    setActionMessage(
      "تم قبول الطلب بنجاح، وأصبح بإمكانك التواصل مع المستفيد من خلال المنصة."
    );

    setShowRejectForm(false);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;

    setStatus("معتذر عنه");

    setActionMessage(
      "تم إرسال اعتذارك عن الطلب إلى الإدارة مع توضيح السبب."
    );

    setShowRejectForm(false);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-5 py-12 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-[1100px]">

        {/* العودة */}
        <Link
          href="/ar/researcher-dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى طلباتي
        </Link>

        {/* العنوان */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="mb-2 text-sm text-[#64748B]">
              تفاصيل الطلب المحول إليك
            </p>

            <h1 className="text-2xl font-semibold text-[#071B2F] sm:text-3xl">
              {originalRequest.title}
            </h1>
          </div>

          <span
            className={`w-fit rounded-full px-5 py-2 text-sm ${getStatusStyle(
              status
            )}`}
          >
            {status}
          </span>

        </div>

        {/* معلومات الطلب */}
        <div className="rounded-[24px] border border-[#9DB5D8] bg-white p-5 sm:p-7">

          <div className="grid gap-4 md:grid-cols-2">
            {details.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex min-h-[90px] items-center gap-4 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-5 py-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#164A68]">
                    <Icon size={21} strokeWidth={1.7} />
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-[#64748B]">
                      {item.label}
                    </p>

                    <p className="text-[15px] font-medium text-[#071B2F]">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* تفاصيل الطلب */}
          <div className="mt-5 rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquareText
                size={20}
                className="text-[#164A68]"
              />

              <h2 className="font-semibold text-[#071B2F]">
                تفاصيل الطلب
              </h2>
            </div>

            <p className="text-sm leading-8 text-[#475569]">
              {originalRequest.message}
            </p>
          </div>

        </div>

        {/* ملاحظة الإدارة */}
        <div className="mt-5 rounded-[20px] border border-[#D7E3EF] bg-white p-6">
          <h2 className="mb-2 font-semibold text-[#071B2F]">
            ملاحظة الإدارة
          </h2>

          <p className="text-sm leading-7 text-[#64748B]">
            {originalRequest.adminNote}
          </p>
        </div>

        {/* قبول أو اعتذار */}
        {status === "طلب جديد" && (
          <div className="mt-5 rounded-[24px] border border-[#9DB5D8] bg-white p-6 sm:p-7">

            <h2 className="text-lg font-semibold text-[#071B2F]">
              الرد على الطلب
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              راجع تفاصيل الطلب، ثم اختر قبول الطلب أو الاعتذار عنه.
            </p>

            {!showRejectForm ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={handleAccept}
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-full bg-[#164A68]
                    px-7 py-3
                    text-sm font-medium text-white
                    transition
                    hover:bg-[#123E58]
                  "
                >
                  <CheckCircle2 size={18} />
                  قبول الطلب
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowRejectForm(true)
                  }
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-full border border-[#B4233A]
                    px-7 py-3
                    text-sm font-medium text-[#B4233A]
                    transition
                    hover:bg-[#FFF1F3]
                  "
                >
                  <XCircle size={18} />
                  الاعتذار عن الطلب
                </button>

              </div>
            ) : (
              <div className="mt-6">

                <label
                  htmlFor="reject-reason"
                  className="mb-2 block text-sm font-medium text-[#071B2F]"
                >
                  سبب الاعتذار
                </label>

                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) =>
                    setRejectReason(e.target.value)
                  }
                  rows={4}
                  placeholder="اكتب سبب الاعتذار عن الطلب..."
                  className="
                    w-full resize-none rounded-2xl
                    border border-[#D7E3EF]
                    bg-[#F8FBFD]
                    px-4 py-4
                    text-sm text-[#071B2F]
                    outline-none
                    placeholder:text-[#94A3B8]
                    focus:border-[#164A68]
                  "
                />

                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
                    className="rounded-full border border-[#D7E3EF] px-6 py-3 text-sm text-[#475569] transition hover:bg-[#F8FBFD]"
                  >
                    إلغاء
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                    className="
                      rounded-full bg-[#B4233A]
                      px-6 py-3
                      text-sm font-medium text-white
                      transition
                      hover:opacity-90
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    تأكيد الاعتذار
                  </button>

                </div>
              </div>
            )}

          </div>
        )}

        {/* نتيجة الإجراء */}
        {actionMessage && (
          <div className="mt-5 rounded-[20px] border border-[#D7E3EF] bg-white p-6">

            <div className="flex items-start gap-3">

              {status === "قيد التنفيذ" ? (
                <CheckCircle2
                  size={23}
                  className="mt-1 shrink-0 text-[#2E7D4F]"
                />
              ) : (
                <XCircle
                  size={23}
                  className="mt-1 shrink-0 text-[#B4233A]"
                />
              )}

              <div>
                <h3 className="font-semibold text-[#071B2F]">
                  {status === "قيد التنفيذ"
                    ? "تم قبول الطلب"
                    : "تم الاعتذار عن الطلب"}
                </h3>

                <p className="mt-1 text-sm leading-7 text-[#64748B]">
                  {actionMessage}
                </p>

                {status === "معتذر عنه" &&
                  rejectReason && (
                    <div className="mt-4 rounded-2xl bg-[#F8FBFD] p-4">
                      <p className="mb-1 text-xs text-[#64748B]">
                        سبب الاعتذار
                      </p>

                      <p className="text-sm leading-7 text-[#071B2F]">
                        {rejectReason}
                      </p>
                    </div>
                  )}

              </div>
            </div>

          </div>
        )}

        {/* التواصل بعد القبول */}
        {status === "قيد التنفيذ" && (
          <div className="mt-5 rounded-[20px] border border-[#9DB5D8] bg-white p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="font-semibold text-[#071B2F]">
                  التواصل مع المستفيد
                </h3>

                <p className="mt-1 text-sm leading-7 text-[#64748B]">
                  الطلب مقبول ويمكنك الآن التواصل مع المستفيد من خلال المنصة.
                </p>
              </div>

              <Link
                href={`/ar/researcher-dashboard/requests/${requestId}/conversation`}
                className="
                  inline-flex shrink-0 items-center justify-center gap-2
                  rounded-full bg-[#164A68]
                  px-6 py-3
                  text-sm font-medium text-white
                  transition
                  hover:bg-[#123E58]
                "
              >
                <MessageSquareText size={18} />
                التواصل مع المستفيد
              </Link>

            </div>
          </div>
        )}

        {/* المحادثة السابقة للطلب المكتمل */}
        {status === "مكتمل" && (
          <div className="mt-5 rounded-[20px] border border-[#9DB5D8] bg-white p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="font-semibold text-[#071B2F]">
                  المحادثة السابقة
                </h3>

                <p className="mt-1 text-sm leading-7 text-[#64748B]">
                  تم إغلاق هذا الطلب بعد اكتماله، ويمكنك الاطلاع على سجل
                  المحادثة السابقة مع المستفيد.
                </p>
              </div>

              <Link
                href={`/ar/researcher-dashboard/requests/${requestId}/conversation`}
                className="
                  inline-flex shrink-0 items-center justify-center gap-2
                  rounded-full border border-[#164A68]
                  px-6 py-3
                  text-sm font-medium text-[#164A68]
                  transition
                  hover:bg-[#F1F6F9]
                "
              >
                <MessageSquareText size={18} />
                عرض المحادثة السابقة
              </Link>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}