"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquareText,
  Paperclip,
  Send,
  Star,
  UserRound,
  X,
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

const requestData: Record<
  string,
  {
    title: string;
    researcher: string;
    field: string;
  }
> = {
  "REQ-1015": {
    title: "مراجعة مقترح بحثي",
    researcher: "د. عبدالله الشمري",
    field: "البحث العلمي",
  },
};

export function ResearcherConversation({
  requestId,
}: ResearcherConversationProps) {
  const request = requestData[requestId];

  const [message, setMessage] = useState("");
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // التقييم
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
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
  ]);

  if (!request) {
    return (
      <section
        dir="rtl"
        className="min-h-[600px] bg-white px-5 py-14 sm:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-[1100px]">
          <Link
            href={`/ar/profile/requests/${requestId}`}
            className="inline-flex items-center gap-2 text-sm text-[#164A68]"
          >
            <ArrowRight size={18} />
            العودة إلى تفاصيل الطلب
          </Link>

          <div className="mt-8 rounded-[24px] border border-[#D7E3EF] bg-[#F8FBFD] p-10 text-center">
            <h1 className="text-2xl font-semibold text-[#071B2F]">
              المحادثة غير متاحة
            </h1>

            <p className="mt-3 text-sm text-[#64748B]">
              لا توجد محادثة متاحة لهذا الطلب.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const handleSend = () => {
    if (!message.trim() || isCompleted) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "beneficiary",
      text: message.trim(),
      time: "الآن",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);

    setMessage("");
  };

  const handleFinishRequest = () => {
    setIsCompleted(true);
    setShowFinishConfirm(false);
    setMessage("");
  };

  const handleSubmitRating = () => {
    if (rating === 0) return;

    setRatingSubmitted(true);
  };

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-10 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-[1100px]">

        {/* العودة */}
        <Link
          href={`/ar/profile/requests/${requestId}`}
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#164A68] transition hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى تفاصيل الطلب
        </Link>

        {/* معلومات الباحث */}
        <div className="mb-5 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF2F8] text-[#164A68]">
                <UserRound size={26} strokeWidth={1.6} />
              </div>

              <div>
                <p className="mb-1 text-xs text-[#64748B]">
                  الباحث المتطوع
                </p>

                <h1 className="text-lg font-semibold text-[#071B2F]">
                  {request.researcher}
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                  {request.field}
                </p>
              </div>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-xs font-medium ${
                isCompleted
                  ? "bg-[#EAF0F5] text-[#475569]"
                  : "bg-[#E8F7EE] text-[#2E7D4F]"
              }`}
            >
              {isCompleted ? "الطلب مكتمل" : "الطلب نشط"}
            </div>

          </div>
        </div>

        {/* معلومات الطلب */}
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
          </div>
        </div>

        {/* المحادثة */}
        <div className="overflow-hidden rounded-[24px] border border-[#9DB5D8] bg-white">

          {/* رأس المحادثة */}
          <div className="flex flex-col gap-4 border-b border-[#D7E3EF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="flex items-center gap-3">
              <MessageSquareText
                size={21}
                className="text-[#164A68]"
              />

              <div>
                <h2 className="font-semibold text-[#071B2F]">
                  التواصل حول الطلب
                </h2>

                <p className="mt-1 text-xs text-[#64748B]">
                  جميع الرسائل تتم من خلال منصة باحث متطوع
                </p>
              </div>
            </div>

            {!isCompleted && (
              <button
                type="button"
                onClick={() => setShowFinishConfirm(true)}
                className="
                  w-fit rounded-full
                  border border-[#B4233A]
                  px-5 py-2
                  text-sm font-medium text-[#B4233A]
                  transition
                  hover:bg-[#FFF1F3]
                "
              >
                إنهاء الطلب
              </button>
            )}

          </div>

          {/* الرسائل */}
          <div className="min-h-[420px] space-y-5 bg-[#F8FBFD] p-5 sm:p-7">
            {messages.map((item) => {
              const isBeneficiary =
                item.sender === "beneficiary";

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    isBeneficiary
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`
                      min-w-[180px]
                      max-w-[85%]
                      rounded-2xl px-4 py-3
                      sm:max-w-[70%]
                      ${
                        isBeneficiary
                          ? "rounded-tr-sm bg-[#164A68] text-white"
                          : "rounded-tl-sm border border-[#D7E3EF] bg-white text-[#071B2F]"
                      }
                    `}
                  >
                    <p className="mb-1 text-[11px] font-medium opacity-70">
                      {isBeneficiary
                        ? "أنت"
                        : request.researcher}
                    </p>

                    <p className="text-sm leading-7">
                      {item.text}
                    </p>

                    <p
                      className={`mt-2 text-[10px] ${
                        isBeneficiary
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

          {/* كتابة رسالة */}
          {!isCompleted ? (
            <div className="border-t border-[#D7E3EF] bg-white p-4 sm:p-5">
              <div className="flex items-end gap-3">

                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D7E3EF] text-[#164A68] transition hover:bg-[#F8FBFD]"
                  aria-label="إرفاق ملف"
                >
                  <Paperclip size={19} />
                </button>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="اكتب رسالتك للباحث..."
                  rows={1}
                  className="
                    min-h-[46px] flex-1 resize-none
                    rounded-2xl border border-[#D7E3EF]
                    bg-[#F8FBFD]
                    px-4 py-3
                    text-sm text-[#071B2F]
                    outline-none
                    placeholder:text-[#94A3B8]
                    focus:border-[#164A68]
                  "
                />

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-full bg-[#164A68]
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
                حفاظًا على الخصوصية، يتم التواصل بين المستفيد والباحث داخل المنصة.
              </p>
            </div>
          ) : (
            <div className="border-t border-[#D7E3EF] bg-white p-6">
              <div className="flex items-start justify-center gap-3 text-center">
                <CheckCircle2
                  size={23}
                  className="shrink-0 text-[#2E7D4F]"
                />

                <div>
                  <h3 className="font-semibold text-[#071B2F]">
                    تم إنهاء الطلب
                  </h3>

                  <p className="mt-1 text-sm text-[#64748B]">
                    تم إغلاق التواصل لهذا الطلب بنجاح.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* التقييم بعد إنهاء الطلب */}
        {isCompleted && (
          <div className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-6 sm:p-8">

            {!ratingSubmitted ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-[#071B2F]">
                    قيّم تجربتك
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#64748B]">
                    ساعدنا في تحسين الخدمة من خلال تقييم تجربتك مع الباحث المتطوع.
                  </p>
                </div>

                {/* النجوم */}
                <div>
                  <p className="mb-3 text-sm font-medium text-[#071B2F]">
                    تقييم الباحث
                  </p>

                  <div
                    className="flex w-fit flex-row-reverse gap-2"
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active =
                        star <= (hoveredRating || rating);

                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() =>
                            setHoveredRating(star)
                          }
                          onClick={() =>
                            setRating(star)
                          }
                          className="transition hover:scale-110"
                          aria-label={`تقييم ${star} من 5`}
                        >
                          <Star
                            size={32}
                            strokeWidth={1.7}
                            className={
                              active
                                ? "fill-[#F5B301] text-[#F5B301]"
                                : "text-[#CBD5E1]"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>

                  {rating > 0 && (
                    <p className="mt-2 text-xs text-[#64748B]">
                      اخترت {rating} من 5
                    </p>
                  )}
                </div>

                {/* التعليق */}
                <div className="mt-6">
                  <label
                    htmlFor="rating-comment"
                    className="mb-2 block text-sm font-medium text-[#071B2F]"
                  >
                    تعليقك
                    <span className="mr-1 font-normal text-[#94A3B8]">
                      (اختياري)
                    </span>
                  </label>

                  <textarea
                    id="rating-comment"
                    value={ratingComment}
                    onChange={(e) =>
                      setRatingComment(e.target.value)
                    }
                    rows={4}
                    placeholder="اكتب ملاحظتك عن تجربتك..."
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
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitRating}
                    disabled={rating === 0}
                    className="
                      rounded-full bg-[#164A68]
                      px-7 py-3
                      text-sm font-medium text-white
                      transition
                      hover:bg-[#123E58]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    إرسال التقييم
                  </button>
                </div>

                <p className="mt-4 text-xs leading-6 text-[#94A3B8]">
                  سيتم إرسال التقييم إلى الإدارة للمراجعة قبل اعتماده أو عرضه.
                </p>
              </>
            ) : (
              <div className="py-4 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F7EE] text-[#2E7D4F]">
                  <CheckCircle2 size={28} />
                </div>

                <h3 className="mt-4 text-xl font-semibold text-[#071B2F]">
                  شكرًا لتقييمك
                </h3>

                <p className="mx-auto mt-2 max-w-[520px] text-sm leading-7 text-[#64748B]">
                  تم إرسال تقييمك بنجاح إلى الإدارة للمراجعة.
                </p>

                {/* التقييم المرسل */}
                <div className="mt-5 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={23}
                      className={
                        star <= rating
                          ? "fill-[#F5B301] text-[#F5B301]"
                          : "text-[#CBD5E1]"
                      }
                    />
                  ))}
                </div>

                {ratingComment.trim() && (
                  <div className="mx-auto mt-5 max-w-[650px] rounded-2xl bg-[#F8FBFD] p-4 text-right">
                    <p className="mb-1 text-xs text-[#64748B]">
                      تعليقك
                    </p>

                    <p className="text-sm leading-7 text-[#071B2F]">
                      {ratingComment}
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>

      {/* نافذة تأكيد إنهاء الطلب */}
      {showFinishConfirm && !isCompleted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">

          <div className="relative w-full max-w-[470px] rounded-[24px] bg-white p-6 shadow-xl sm:p-8">

            <button
              type="button"
              onClick={() => setShowFinishConfirm(false)}
              className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F1F5F9]"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F3] text-[#B4233A]">
              <CheckCircle2 size={24} />
            </div>

            <h2 className="text-xl font-semibold text-[#071B2F]">
              هل تريد إنهاء الطلب؟
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#64748B]">
              بعد إنهاء الطلب سيتم إغلاق المحادثة، ولن تتمكن من إرسال رسائل جديدة ضمن هذا الطلب.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 rounded-full border border-[#D7E3EF] px-5 py-3 text-sm font-medium text-[#475569] transition hover:bg-[#F8FBFD]"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleFinishRequest}
                className="flex-1 rounded-full bg-[#B4233A] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                نعم، إنهاء الطلب
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}