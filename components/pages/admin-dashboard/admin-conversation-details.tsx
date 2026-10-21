
"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  UserRound,
  BookOpen,
  CalendarDays,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

type Message = {
  id: string;
  sender: "beneficiary" | "researcher";
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  requestId: string;
  requestTitle: string;
  beneficiary: string;
  researcher: string;
  status: "نشطة" | "مغلقة";
  startedAt: string;
  messages: Message[];
};

const conversations: Record<string, Conversation> = {
  "CON-1001": {
    id: "CON-1001",
    requestId: "REQ-1015",
    requestTitle: "مراجعة مقترح بحثي",
    beneficiary: "سارة محمد",
    researcher: "د. عبدالله الشمري",
    status: "نشطة",
    startedAt: "2026/08/20",
    messages: [
      {
        id: "MSG-1",
        sender: "beneficiary",
        text: "السلام عليكم دكتور، أحتاج مساعدتك في مراجعة مقترح البحث.",
        time: "10:15 ص",
      },
      {
        id: "MSG-2",
        sender: "researcher",
        text: "وعليكم السلام، أهلًا بك. يسعدني مساعدتك، أرسلي تفاصيل المقترح.",
        time: "10:20 ص",
      },
      {
        id: "MSG-3",
        sender: "beneficiary",
        text: "المقترح يتناول استخدام الذكاء الاصطناعي في تحسين الخدمات التعليمية.",
        time: "10:25 ص",
      },
      {
        id: "MSG-4",
        sender: "researcher",
        text: "الموضوع جيد، أنصح بتوضيح مشكلة البحث والأهداف بشكل أكثر تحديدًا.",
        time: "11:00 ص",
      },
      {
        id: "MSG-5",
        sender: "beneficiary",
        text: "شكرًا دكتور، سأرسل التعديلات قريبًا.",
        time: "11:10 ص",
      },
    ],
  },

  "CON-1002": {
    id: "CON-1002",
    requestId: "REQ-1012",
    requestTitle: "استشارة في منهجية البحث",
    beneficiary: "هدى أحمد",
    researcher: "د. فهد القحطاني",
    status: "مغلقة",
    startedAt: "2026/08/10",
    messages: [
      {
        id: "MSG-1",
        sender: "beneficiary",
        text: "مرحبًا دكتور، أحتاج استشارة بخصوص منهجية البحث.",
        time: "09:30 ص",
      },
      {
        id: "MSG-2",
        sender: "researcher",
        text: "أهلًا بك، ما نوع المنهج الذي تستخدمينه في بحثك؟",
        time: "09:40 ص",
      },
      {
        id: "MSG-3",
        sender: "beneficiary",
        text: "أستخدم المنهج الوصفي التحليلي وأحتاج التأكد من ملاءمته.",
        time: "09:50 ص",
      },
      {
        id: "MSG-4",
        sender: "researcher",
        text: "المنهج مناسب مبدئيًا، مع ضرورة توضيح أدوات جمع البيانات والعينة.",
        time: "10:05 ص",
      },
      {
        id: "MSG-5",
        sender: "researcher",
        text: "تم الانتهاء من مراجعة المنهجية، بالتوفيق.",
        time: "10:30 ص",
      },
    ],
  },
};

export function AdminConversationDetails({
  conversationId,
}: {
  conversationId: string;
}) {
  const conversation = conversations[conversationId];

  if (!conversation) {
    return (
      <section
        dir="rtl"
        className="min-h-screen bg-[#F8FBFD] px-4 py-10 sm:px-8"
      >
        <Link
          href="/ar/admin-dashboard/conversations"
          className="inline-flex items-center gap-2 text-sm text-[#164A68]"
        >
          <ArrowRight size={18} />
          العودة إلى المحادثات
        </Link>

        <div className="mt-8 rounded-[24px] border border-[#D7E3EF] bg-white p-10 text-center">
          <MessageSquare
            size={36}
            className="mx-auto text-[#94A3B8]"
          />
          <h1 className="mt-4 text-xl font-semibold text-[#071B2F]">
            المحادثة غير موجودة
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1100px]">
        {/* العودة */}
        <Link
          href="/ar/admin-dashboard/conversations"
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى إدارة المحادثات
        </Link>

        {/* العنوان */}
        <div className="mb-6 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs text-[#94A3B8]">
                {conversation.id}
              </p>

              <h1 className="text-xl font-semibold text-[#071B2F] sm:text-2xl">
                تفاصيل المحادثة
              </h1>

              <p className="mt-2 text-sm text-[#64748B]">
                متابعة الرسائل المتبادلة بين المستفيد والباحث.
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-xs font-medium ${
                conversation.status === "نشطة"
                  ? "bg-[#E8F7EE] text-[#2E7D4F]"
                  : "bg-[#EAF0F5] text-[#475569]"
              }`}
            >
              {conversation.status}
            </span>
          </div>

          {/* المعلومات */}
          <div className="mt-7 grid gap-5 border-t border-[#E5EDF3] pt-6 sm:grid-cols-2">
            <InfoItem
              icon={UserRound}
              label="المستفيد"
              value={conversation.beneficiary}
            />

            <InfoItem
              icon={UserRound}
              label="الباحث"
              value={conversation.researcher}
            />

            <InfoItem
              icon={BookOpen}
              label="عنوان الطلب"
              value={conversation.requestTitle}
            />

            <InfoItem
              icon={CalendarDays}
              label="تاريخ بدء المحادثة"
              value={conversation.startedAt}
            />
          </div>

          <Link
            href={`/ar/admin-dashboard/requests/${conversation.requestId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#D7E3EF] px-4 py-2.5 text-sm font-medium text-[#164A68] transition hover:bg-[#EAF2F8]"
          >
            <BookOpen size={17} />
            عرض الطلب المرتبط
          </Link>
        </div>

        {/* الرسائل */}
        <div className="overflow-hidden rounded-[24px] border border-[#D7E3EF] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#E5EDF3] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                <MessageSquare size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-[#071B2F]">
                  سجل المحادثة
                </h2>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {conversation.messages.length} رسائل معروضة
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 text-xs text-[#64748B]">
              <LockKeyhole size={15} />
              للقراءة فقط
            </span>
          </div>

          <div className="space-y-5 bg-[#F8FBFD] p-5 sm:p-7">
            {conversation.messages.map((message) => {
              const isBeneficiary =
                message.sender === "beneficiary";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isBeneficiary
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[18px] px-5 py-4 sm:max-w-[75%] ${
                      isBeneficiary
                        ? "rounded-tr-sm bg-white text-[#071B2F] shadow-sm"
                        : "rounded-tl-sm bg-[#164A68] text-white"
                    }`}
                  >
                    <p
                      className={`mb-2 text-xs font-semibold ${
                        isBeneficiary
                          ? "text-[#164A68]"
                          : "text-[#D7E3EF]"
                      }`}
                    >
                      {isBeneficiary
                        ? conversation.beneficiary
                        : conversation.researcher}
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-7">
                      {message.text}
                    </p>

                    <p
                      className={`mt-3 text-left text-[11px] ${
                        isBeneficiary
                          ? "text-[#94A3B8]"
                          : "text-[#D7E3EF]"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* نهاية المحادثة */}
          <div className="flex items-center gap-3 border-t border-[#E5EDF3] bg-white px-5 py-5 sm:px-7">
            {conversation.status === "مغلقة" ? (
              <CheckCircle2
                size={19}
                className="text-[#2E7D4F]"
              />
            ) : (
              <LockKeyhole
                size={19}
                className="text-[#164A68]"
              />
            )}

            <p className="text-sm leading-6 text-[#64748B]">
              {conversation.status === "مغلقة"
                ? "هذه المحادثة مغلقة بعد اكتمال الطلب، ويمكن للإدارة الاطلاع عليها فقط."
                : "يمكن للإدارة متابعة المحادثة دون إرسال رسائل أو التدخل في الحوار."}
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs leading-6 text-[#94A3B8]">
          ملاحظة: الرسائل الحالية تجريبية، وليست مرتبطة
          بمحادثات المستخدمين الفعلية بعد.
        </p>
      </div>
    </section>
  );
}

type InfoItemProps = {
  icon: typeof UserRound;
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

        <p className="mt-1 text-sm font-medium text-[#071B2F]">
          {value}
        </p>
      </div>
    </div>
  );
}
