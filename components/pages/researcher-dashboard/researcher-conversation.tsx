"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  FileText,
  Lock,
  MessageSquareText,
  Paperclip,
  Send,
  UserRound,
} from "lucide-react";

type ResearcherConversationProps = {
  requestId: string;
};

type Message = {
  id: number;
  sender: "beneficiary" | "researcher";
  text: string;
  time: string;
};

type RequestConversationData = {
  title: string;
  beneficiary: string;
  field: string;
  status: string;
  messages: Message[];
};

const requestData: Record<string, RequestConversationData> = {
  "REQ-1015": {
    title: "مراجعة مقترح بحثي",
    beneficiary: "سارة محمد",
    field: "البحث العلمي",
    status: "قيد التنفيذ",
    messages: [
      {
        id: 1,
        sender: "researcher",
        text: "مرحبًا، تم قبول طلبك ويسعدني مساعدتك في مراجعة المقترح البحثي.",
        time: "10:30 ص",
      },
      {
        id: 2,
        sender: "beneficiary",
        text: "شكرًا لك. أحتاج إلى التأكد من صياغة مشكلة البحث والمنهجية قبل البدء.",
        time: "10:35 ص",
      },
      {
        id: 3,
        sender: "researcher",
        text: "بالتأكيد، يمكنك إرسال التفاصيل المتعلقة بالمقترح وسأراجعها معك.",
        time: "10:40 ص",
      },
    ],
  },

  "REQ-1007": {
    title: "مراجعة منهجية دراسة",
    beneficiary: "نورة خالد",
    field: "مناهج البحث",
    status: "قيد التنفيذ",
    messages: [
      {
        id: 1,
        sender: "researcher",
        text: "مرحبًا، اطلعت على تفاصيل طلبك المتعلق بمنهجية الدراسة.",
        time: "09:15 ص",
      },
      {
        id: 2,
        sender: "beneficiary",
        text: "شكرًا لك. أريد التأكد من أن المنهج المستخدم مناسب لأهداف البحث.",
        time: "09:20 ص",
      },
      {
        id: 3,
        sender: "researcher",
        text: "بالتأكيد، أرسل لي تفاصيل المنهج والأهداف وسأراجع مدى توافقها.",
        time: "09:28 ص",
      },
    ],
  },

  "REQ-0998": {
    title: "مراجعة أسئلة البحث",
    beneficiary: "ريم أحمد",
    field: "البحث العلمي",
    status: "مكتمل",
    messages: [
      {
        id: 1,
        sender: "beneficiary",
        text: "مرحبًا، أحتاج إلى مراجعة أسئلة البحث والتأكد من ارتباطها بأهداف الدراسة.",
        time: "11:10 ص",
      },
      {
        id: 2,
        sender: "researcher",
        text: "مرحبًا ريم، بالتأكيد. أرسلي أسئلة البحث مع أهداف الدراسة وسأراجعها معك.",
        time: "11:18 ص",
      },
      {
        id: 3,
        sender: "beneficiary",
        text: "تم إرسالها، وأحتاج بشكل خاص إلى التأكد من وضوح السؤال الثالث.",
        time: "11:25 ص",
      },
      {
        id: 4,
        sender: "researcher",
        text: "راجعت الأسئلة، وهي مرتبطة بالأهداف بشكل جيد. أقترح فقط إعادة صياغة السؤال الثالث ليكون أكثر تحديدًا ووضوحًا.",
        time: "11:40 ص",
      },
      {
        id: 5,
        sender: "beneficiary",
        text: "شكرًا لك، تم تعديل السؤال حسب الملاحظة.",
        time: "11:48 ص",
      },
      {
        id: 6,
        sender: "researcher",
        text: "ممتاز، الصياغة الآن أوضح ومتوافقة مع هدف الدراسة. بالتوفيق في بحثك.",
        time: "11:55 ص",
      },
    ],
  },
};

export function ResearcherConversation({
  requestId,
}: ResearcherConversationProps) {
  const request = requestData[requestId];

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>(
    request?.messages ?? []
  );

  if (!request) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#F8FBFD] px-5 py-12 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-[1100px]">
          <Link
            href={`/ar/researcher-dashboard/requests/${requestId}`}
            className="inline-flex items-center gap-2 text-sm text-[#164A68]"
          >
            <ArrowRight size={18} />
            العودة إلى تفاصيل الطلب
          </Link>

          <div className="mt-8 rounded-[24px] border border-[#D7E3EF] bg-white p-10 text-center">
            <h1 className="text-2xl font-semibold text-[#071B2F]">
              المحادثة غير متاحة
            </h1>

            <p className="mt-3 text-sm text-[#64748B]">
              لا توجد محادثة متاحة لهذا الطلب.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isCompleted = request.status === "مكتمل";

  const handleSend = () => {
    if (!message.trim() || isCompleted) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "researcher",
      text: message.trim(),
      time: "الآن",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);

    setMessage("");
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-10 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-[1100px]">

        {/* العودة */}
        <Link
          href={`/ar/researcher-dashboard/requests/${requestId}`}
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى تفاصيل الطلب
        </Link>

        {/* بيانات المستفيد */}
        <div className="mb-5 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF2F8] text-[#164A68]">
                <UserRound
                  size={26}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-[#64748B]">
                  المستفيد
                </p>

                <h1 className="text-lg font-semibold text-[#071B2F]">
                  {request.beneficiary}
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                  التواصل من خلال المنصة
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-xs font-medium ${
                isCompleted
                  ? "bg-[#E8F7EE] text-[#2E7D4F]"
                  : "bg-[#EAF2F8] text-[#164A68]"
              }`}
            >
              {request.status}
            </span>

          </div>
        </div>

        {/* بيانات الطلب */}
        <div className="mb-5 flex items-start gap-3 rounded-[20px] border border-[#D7E3EF] bg-white p-5">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F6F9] text-[#164A68]">
            <FileText size={19} />
          </div>

          <div>
            <p className="text-xs text-[#64748B]">
              الطلب {requestId}
            </p>

            <p className="mt-1 font-medium text-[#071B2F]">
              {request.title}
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              {request.field}
            </p>
          </div>

        </div>

        {/* تنبيه إغلاق المحادثة */}
        {isCompleted && (
          <div className="mb-5 flex items-start gap-3 rounded-[20px] border border-[#D7E3EF] bg-white p-5">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F7EE] text-[#2E7D4F]">
              <Lock size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-[#071B2F]">
                المحادثة مغلقة
              </h2>

              <p className="mt-1 text-sm leading-7 text-[#64748B]">
                تم إغلاق هذه المحادثة بعد اكتمال الطلب. يمكنك الاطلاع على
                الرسائل السابقة، ولكن لا يمكن إرسال رسائل أو مرفقات جديدة.
              </p>
            </div>

          </div>
        )}

        {/* صندوق المحادثة */}
        <div className="overflow-hidden rounded-[24px] border border-[#9DB5D8] bg-white">

          {/* رأس المحادثة */}
          <div className="flex items-center gap-3 border-b border-[#D7E3EF] px-5 py-4 sm:px-6">

            <MessageSquareText
              size={21}
              className="text-[#164A68]"
            />

            <div>
              <h2 className="font-semibold text-[#071B2F]">
                {isCompleted
                  ? "سجل المحادثة"
                  : "التواصل مع المستفيد"}
              </h2>

              <p className="mt-1 text-xs text-[#64748B]">
                {isCompleted
                  ? "محادثة سابقة لطلب مكتمل"
                  : "جميع الرسائل تتم من خلال منصة باحث متطوع"}
              </p>
            </div>

          </div>

          {/* الرسائل */}
          <div className="min-h-[420px] space-y-5 bg-[#F8FBFD] p-5 sm:p-7">

            {messages.map((item) => {
              const isResearcher =
                item.sender === "researcher";

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    isResearcher
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`
                      min-w-[180px]
                      max-w-[85%]
                      rounded-2xl
                      px-4 py-3
                      sm:max-w-[70%]
                      ${
                        isResearcher
                          ? "rounded-tr-sm bg-[#164A68] text-white"
                          : "rounded-tl-sm border border-[#D7E3EF] bg-white text-[#071B2F]"
                      }
                    `}
                  >
                    <p className="mb-1 text-[11px] font-medium opacity-70">
                      {isResearcher
                        ? "أنت"
                        : request.beneficiary}
                    </p>

                    <p className="text-sm leading-7">
                      {item.text}
                    </p>

                    <p
                      className={`mt-2 text-[10px] ${
                        isResearcher
                          ? "text-white/60"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>

          {/* الكتابة - تظهر فقط إذا الطلب غير مكتمل */}
          {!isCompleted && (
            <div className="border-t border-[#D7E3EF] bg-white p-4 sm:p-5">

              <div className="flex items-end gap-3">

                {/* مرفق */}
                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D7E3EF] text-[#164A68] transition hover:bg-[#F8FBFD]"
                  aria-label="إرفاق ملف"
                >
                  <Paperclip size={19} />
                </button>

                {/* الرسالة */}
                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="اكتب رسالتك للمستفيد..."
                  rows={1}
                  className="
                    min-h-[46px]
                    flex-1 resize-none
                    rounded-2xl
                    border border-[#D7E3EF]
                    bg-[#F8FBFD]
                    px-4 py-3
                    text-sm text-[#071B2F]
                    outline-none
                    placeholder:text-[#94A3B8]
                    focus:border-[#164A68]
                  "
                />

                {/* إرسال */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-[#164A68]
                    text-white
                    transition
                    hover:bg-[#123E58]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                  aria-label="إرسال الرسالة"
                >
                  <Send size={18} />
                </button>

              </div>

              <p className="mt-3 text-center text-[11px] text-[#94A3B8]">
                حفاظًا على الخصوصية، لا تظهر بيانات التواصل الشخصية للمستفيد أو الباحث.
              </p>

            </div>
          )}

          {/* أسفل المحادثة المكتملة */}
          {isCompleted && (
            <div className="border-t border-[#D7E3EF] bg-white px-5 py-4">
              <div className="flex items-center justify-center gap-2 text-sm text-[#64748B]">
                <Lock size={15} />
                تم إغلاق المحادثة بعد اكتمال الطلب
              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}