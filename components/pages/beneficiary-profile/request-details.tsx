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
  MessagesSquare,
  Send,
  UserRound,
} from "lucide-react";

type RequestDetailsProps = {
  requestId: string;
};

type RequestData = {
  id: string;
  title: string;
  type: string;
  field: string;
  researcher: string;
  date: string;
  status: string;
  message: string;
  statusMessage: string;
  adminResponse: string;
};

const requests: Record<string, RequestData> = {
  "REQ-1024": {
    id: "REQ-1024",
    title: "تطوير نموذج ذكاء اصطناعي",
    type: "استشارة بحثية",
    field: "الذكاء الاصطناعي",
    researcher: "لم يتم تحديد الباحث بعد",
    date: "2026/09/05",
    status: "جديد",
    message:
      "أحتاج إلى استشارة بحثية حول تطوير نموذج ذكاء اصطناعي، واختيار المنهجية المناسبة لتنفيذ البحث.",
    statusMessage:
      "تم استلام طلبك بنجاح، وهو الآن بانتظار بدء المراجعة من قبل الإدارة.",
    adminResponse:
      "تم استلام الطلب وسيتم مراجعته من قبل الإدارة.",
  },

  "REQ-1023": {
    id: "REQ-1023",
    title: "تحليل بيانات بحثية",
    type: "مراجعة بحثية",
    field: "تحليل البيانات",
    researcher: "د. مشاري العنزي",
    date: "2026/09/04",
    status: "تحت المراجعة",
    message:
      "أحتاج إلى مراجعة طريقة تحليل البيانات المستخدمة في البحث والتأكد من ملاءمتها لأهداف الدراسة.",
    statusMessage:
      "طلبك حاليًا تحت المراجعة من قبل الإدارة للتأكد من تفاصيل الطلب واختيار الإجراء المناسب.",
    adminResponse:
      "جاري مراجعة تفاصيل الطلب والتأكد من المجال والباحث المناسب.",
  },

  "REQ-1018": {
    id: "REQ-1018",
    title: "تصميم استبيان بحثي",
    type: "توجيه بحثي",
    field: "مناهج البحث",
    researcher: "لم يتم تحديد الباحث بعد",
    date: "2026/08/28",
    status: "بانتظار معلومات إضافية",
    message:
      "أحتاج إلى مساعدة في تصميم استبيان بحثي وتحديد المحاور والأسئلة المناسبة لموضوع الدراسة.",
    statusMessage:
      "تحتاج الإدارة إلى معلومات إضافية منك قبل استكمال مراجعة الطلب.",
    adminResponse:
      "نرجو توضيح الفئة المستهدفة من الاستبيان وعدد أفراد العينة المتوقع حتى نتمكن من استكمال مراجعة الطلب.",
  },

  "REQ-1015": {
    id: "REQ-1015",
    title: "مراجعة مقترح بحثي",
    type: "استشارة بحثية",
    field: "البحث العلمي",
    researcher: "د. عبدالله الشمري",
    date: "2026/08/20",
    status: "مؤكد",
    message:
      "أرغب في مراجعة المقترح البحثي والتأكد من وضوح المشكلة والأهداف والمنهجية قبل البدء في البحث.",
    statusMessage:
      "تمت الموافقة على طلبك وتحديد الباحث المتطوع. تم قبول الطلب من قبل الباحث ويمكنك الآن التواصل معه من خلال المنصة.",
    adminResponse:
      "تمت مراجعة الطلب والموافقة عليه وتحديد د. عبدالله الشمري كباحث متطوع مناسب للطلب.",
  },

  "REQ-1012": {
    id: "REQ-1012",
    title: "استشارة في منهجية البحث",
    type: "تحليل بيانات",
    field: "منهجية البحث",
    researcher: "د. فهد القحطاني",
    date: "2026/08/10",
    status: "مكتمل",
    message:
      "أحتاج إلى استشارة حول اختيار المنهج البحثي المناسب وطريقة تحليل البيانات الخاصة بالدراسة.",
    statusMessage:
      "تم الانتهاء من هذا الطلب بنجاح.",
    adminResponse:
      "تم تنفيذ الاستشارة وإغلاق الطلب بعد اكتمال الخدمة.",
  },

  "REQ-1008": {
    id: "REQ-1008",
    title: "مراجعة خطة بحث",
    type: "استشارة بحثية",
    field: "البحث العلمي",
    researcher: "لم يتم تحديد الباحث",
    date: "2026/07/22",
    status: "معتذر عن الطلب",
    message:
      "أرغب في الحصول على مراجعة لخطة البحث قبل تقديمها.",
    statusMessage:
      "تم الاعتذار عن استكمال هذا الطلب.",
    adminResponse:
      "نعتذر عن قبول الطلب في الوقت الحالي لعدم توفر باحث متطوع مناسب في المجال المطلوب.",
  },
};

function getStatusStyle(status: string) {
  switch (status) {
    case "جديد":
      return "bg-[#EAF2F8] text-[#164A68]";

    case "تحت المراجعة":
      return "bg-[#FFF3D6] text-[#9A6700]";

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

export function RequestDetails({
  requestId,
}: RequestDetailsProps) {
  const request = requests[requestId];

  const [additionalInfo, setAdditionalInfo] = useState("");
  const [sent, setSent] = useState(false);

  if (!request) {
    return (
      <section
        dir="rtl"
        className="min-h-[500px] bg-white px-5 py-14 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-[1280px]">
          <Link
            href="/ar/profile"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#164A68]"
          >
            <ArrowRight size={18} />
            العودة إلى طلباتي
          </Link>

          <div className="rounded-[24px] border border-[#D7E3EF] bg-[#F8FBFD] p-10 text-center">
            <h2 className="text-2xl font-semibold text-[#071B2F]">
              الطلب غير موجود
            </h2>

            <p className="mt-3 text-[#64748B]">
              لم نتمكن من العثور على تفاصيل هذا الطلب.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const details = [
    {
      label: "رقم الطلب",
      value: request.id,
      icon: Hash,
    },
    {
      label: "نوع المساعدة",
      value: request.type,
      icon: FileText,
    },
    {
      label: "مجال البحث",
      value: request.field,
      icon: GraduationCap,
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

  const handleSendAdditionalInfo = () => {
    if (!additionalInfo.trim()) return;

    setSent(true);
  };

  return (
    <section
      dir="rtl"
      className="bg-white px-5 py-14 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-[1280px]">

        {/* العودة */}
        <Link
          href="/ar/profile"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى طلباتي
        </Link>

        {/* العنوان والحالة */}
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
            className={`
              w-fit rounded-full px-5 py-2 text-sm
              ${getStatusStyle(request.status)}
            `}
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
                    <Icon
                      size={21}
                      strokeWidth={1.7}
                    />
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
            <div className="mb-4 flex items-center gap-2 text-[#164A68]">
              <MessageSquareText size={21} />

              <h3 className="font-medium text-[#071B2F]">
                تفاصيل الطلب
              </h3>
            </div>

            <p className="leading-8 text-[#475569]">
              {request.message}
            </p>
          </div>
        </div>

        {/* حالة الطلب */}
        <div className="mt-7 rounded-[20px] border border-[#D7E3EF] bg-[#F8FBFD] p-6">
          <h3 className="mb-2 text-lg font-semibold text-[#071B2F]">
            حالة الطلب
          </h3>

          <p className="text-sm leading-7 text-[#64748B]">
            {sent
              ? "تم إرسال المعلومات الإضافية إلى الإدارة، والطلب الآن بانتظار المراجعة."
              : request.statusMessage}
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
            {request.adminResponse}
          </p>
        </div>

        {/* إرسال معلومات إضافية */}
        {request.status === "بانتظار معلومات إضافية" && (
          <div className="mt-5 rounded-[20px] border border-[#9DB5D8] bg-white p-6 sm:p-7">
            {!sent ? (
              <>
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-[#071B2F]">
                    إرسال المعلومات المطلوبة
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#64748B]">
                    أضف المعلومات التي طلبتها الإدارة حتى يتم استكمال
                    مراجعة طلبك.
                  </p>
                </div>

                <textarea
                  value={additionalInfo}
                  onChange={(e) =>
                    setAdditionalInfo(e.target.value)
                  }
                  placeholder="اكتب المعلومات الإضافية هنا..."
                  rows={5}
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

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSendAdditionalInfo}
                    disabled={!additionalInfo.trim()}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-full bg-[#164A68]
                      px-6 py-3
                      text-sm font-medium text-white
                      transition
                      hover:bg-[#123E58]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <Send size={17} />
                    إرسال المعلومات
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={24}
                  className="mt-1 shrink-0 text-[#2E7D4F]"
                />

                <div>
                  <h3 className="font-semibold text-[#071B2F]">
                    تم إرسال المعلومات
                  </h3>

                  <p className="mt-1 text-sm leading-7 text-[#64748B]">
                    تم إرسال المعلومات الإضافية إلى الإدارة بنجاح،
                    وسيتم استكمال مراجعة طلبك.
                  </p>

                  <div className="mt-4 rounded-2xl bg-[#F8FBFD] p-4">
                    <p className="mb-1 text-xs text-[#64748B]">
                      المعلومات المرسلة
                    </p>

                    <p className="text-sm leading-7 text-[#071B2F]">
                      {additionalInfo}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* التواصل مع الباحث */}
        {request.status === "مؤكد" && (
          <div className="mt-5 rounded-[20px] border border-[#9DB5D8] bg-white p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                  <MessagesSquare
                    size={21}
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#071B2F]">
                    التواصل مع الباحث
                  </h3>

                  <p className="mt-1 text-sm leading-7 text-[#64748B]">
                    تم قبول طلبك من قبل الباحث المتطوع، ويمكنك الآن
                    التواصل معه من خلال المنصة.
                  </p>
                </div>
              </div>

              <Link
                href={`/ar/profile/requests/${request.id}/conversation`}
                className="
                  inline-flex shrink-0 items-center justify-center gap-2
                  rounded-full bg-[#164A68]
                  px-6 py-3
                  text-sm font-medium text-white
                  transition
                  hover:bg-[#123E58]
                "
              >
                <MessagesSquare size={18} />
                التواصل مع الباحث
              </Link>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}