
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ResearcherConversationProps = {
  requestId: string;
};

type Consultation = {
  id: string;
  title: string;
  help_type: string;
  beneficiary_id: string;
  assigned_researcher_id: string | null;
  status: string;
};

type ChatMessage = {
  id: string;
  consultation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type ExistingReview = {
  rating: number;
  comment: string | null;
  status: string;
};

const helpTypeLabels: Record<string, string> = {
  research: "البحث العلمي",
  methodology: "منهجية البحث",
  analysis: "تحليل البيانات",
  review: "مراجعة بحثية",
  other: "أخرى",
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Riyadh",
  }).format(new Date(value));
}

export function ResearcherConversation({
  requestId,
}: ResearcherConversationProps) {
  const [supabase] = useState(() => createClient());

  const [userId, setUserId] = useState<string | null>(null);
  const [request, setRequest] = useState<Consultation | null>(null);
  const [researcherName, setResearcherName] =
    useState("الباحث المتطوع");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showFinishConfirm, setShowFinishConfirm] =
    useState(false);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const [existingReview, setExistingReview] =
    useState<ExistingReview | null>(null);

  const [loadingReview, setLoadingReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewLoaded, setReviewLoaded] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // جلب التقييم السابق إن وجد
  const loadReview = useCallback(async () => {
    if (!userId) return;

    setLoadingReview(true);
    setReviewLoaded(false);
    setReviewError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("consultation_reviews")
        .select("rating, comment, status")
        .eq("consultation_id", requestId)
        .eq("beneficiary_id", userId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setExistingReview(data ?? null);
      setReviewLoaded(true);
    } catch (caughtError) {
      console.error(
        "Load consultation review error:",
        caughtError
      );

      setReviewError(
        "تعذر التحقق من التقييم السابق. حاولي تحديث الصفحة."
      );
    } finally {
      setLoadingReview(false);
    }
  }, [supabase, requestId, userId]);

  useEffect(() => {
    if (request?.status === "completed" && userId) {
      void loadReview();
    }
  }, [request?.status, userId, loadReview]);

  // إرسال تقييم حقيقي إلى Supabase
  const handleSubmitReview = async () => {
    if (
      !request ||
      request.status !== "completed" ||
      !userId ||
      !request.assigned_researcher_id ||
      existingReview ||
      !reviewLoaded ||
      submittingReview
    ) {
      return;
    }

    if (rating < 1 || rating > 5) {
      setReviewError(
        "يرجى اختيار عدد النجوم من 1 إلى 5."
      );
      return;
    }

    if (ratingComment.trim().length > 2000) {
      setReviewError(
        "التعليق يجب ألا يتجاوز 2000 حرف."
      );
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const comment = ratingComment.trim();

      const { data, error: insertError } = await supabase
        .from("consultation_reviews")
        .insert({
          consultation_id: requestId,
          beneficiary_id: userId,
          researcher_id: request.assigned_researcher_id,
          rating,
          comment: comment || null,
          status: "pending",
        })
        .select("rating, comment, status")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          await loadReview();

          throw new Error(
            "سبق إرسال تقييم لهذه الاستشارة، ولا يمكن إرسال تقييم آخر."
          );
        }

        throw insertError;
      }

      setExistingReview(data);
      setReviewLoaded(true);
      setRatingComment("");
    } catch (caughtError) {
      console.error(
        "Submit consultation review error:",
        caughtError
      );

      setReviewError(
        caughtError instanceof Error &&
          caughtError.message.startsWith("سبق إرسال")
          ? caughtError.message
          : "تعذر إرسال التقييم. يرجى المحاولة مجددًا."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // جلب الرسائل
  const loadMessages = useCallback(async () => {
    const { data, error: messagesError } = await supabase
      .from("consultation_messages")
      .select(
        "id, consultation_id, sender_id, body, created_at"
      )
      .eq("consultation_id", requestId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (messagesError) {
      setActionError(
        "تعذر تحديث الرسائل. حاولي مرة أخرى."
      );
      return;
    }

    setMessages((data ?? []) as ChatMessage[]);
  }, [supabase, requestId]);

  // جلب تفاصيل الاستشارة
  const loadRequest = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "يجب تسجيل الدخول بحساب المستفيد."
        );
      }

      setUserId(user.id);

      const { data, error: requestError } = await supabase
        .from("consultation_requests")
        .select(
          "id, title, help_type, beneficiary_id, assigned_researcher_id, status"
        )
        .eq("id", requestId)
        .eq("beneficiary_id", user.id)
        .maybeSingle();

      if (requestError || !data) {
        throw new Error(
          "هذا الطلب غير موجود ضمن طلبات حسابك."
        );
      }

      if (
        data.status !== "in_progress" &&
        data.status !== "completed"
      ) {
        throw new Error(
          "المحادثة تصبح متاحة بعد موافقة الباحث على الطلب."
        );
      }

      setRequest(data as Consultation);

      if (data.assigned_researcher_id) {
        const { data: researcher } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.assigned_researcher_id)
          .maybeSingle();

        if (researcher?.full_name) {
          setResearcherName(researcher.full_name);
        }
      }

      await loadMessages();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تعذر تحميل المحادثة."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, requestId, loadMessages]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  // تحديث حالة الطلب والرسائل
  useEffect(() => {
    if (!request || !userId) return;

    const interval = window.setInterval(async () => {
      const { data } = await supabase
        .from("consultation_requests")
        .select("status")
        .eq("id", requestId)
        .eq("beneficiary_id", userId)
        .maybeSingle();

      if (data?.status) {
        setRequest((current) =>
          current
            ? { ...current, status: data.status }
            : current
        );
      }

      await loadMessages();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [
    supabase,
    requestId,
    request?.id,
    userId,
    loadMessages,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  const isCompleted = request?.status === "completed";
  const canSendMessages = request?.status === "in_progress";

  // إرسال رسالة
  const handleSend = async () => {
    const text = message.trim();

    if (
      !text ||
      !canSendMessages ||
      !userId ||
      sending
    ) {
      return;
    }

    if (text.length > 5000) {
      setActionError(
        "الرسالة يجب ألا تتجاوز 5000 حرف."
      );
      return;
    }

    setSending(true);
    setActionError("");

    const { error: insertError } = await supabase
      .from("consultation_messages")
      .insert({
        consultation_id: requestId,
        sender_id: userId,
        body: text,
      });

    if (insertError) {
      setActionError(
        "تعذر إرسال الرسالة. تأكدي أن الطلب لا يزال قيد التنفيذ."
      );
      setSending(false);
      return;
    }

    setMessage("");
    await loadMessages();
    setSending(false);
  };

  // إنهاء الاستشارة
  const handleFinishRequest = async () => {
    if (!canSendMessages || finishing) return;

    setFinishing(true);
    setActionError("");

    try {
      const response = await fetch(
        `/api/consultations/${requestId}/complete`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "تعذر إنهاء الطلب."
        );
      }

      setRequest((current) =>
        current
          ? { ...current, status: "completed" }
          : current
      );

      setShowFinishConfirm(false);
      setMessage("");
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "حدث خطأ أثناء إنهاء الطلب."
      );

      setShowFinishConfirm(false);
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <section
        dir="rtl"
        className="flex min-h-[600px] items-center justify-center bg-[#F8FBFD]"
      >
        <div className="flex items-center gap-3 text-[#164A68]">
          <Loader2
            size={23}
            className="animate-spin"
          />
          <span>جارٍ تحميل المحادثة...</span>
        </div>
      </section>
    );
  }

  if (error || !request) {
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
            <AlertCircle
              size={32}
              className="mx-auto mb-4 text-[#164A68]"
            />

            <h1 className="text-2xl font-semibold text-[#071B2F]">
              المحادثة غير متاحة
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#64748B]">
              {error ||
                "لا توجد محادثة متاحة لهذا الطلب."}
            </p>
          </div>
        </div>
      </section>
    );
  }

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
                <UserRound
                  size={26}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-[#64748B]">
                  الباحث المتطوع
                </p>

                <h1 className="text-lg font-semibold text-[#071B2F]">
                  {researcherName}
                </h1>

                <p className="mt-1 text-sm text-[#64748B]">
                  {helpTypeLabels[request.help_type] ??
                    request.help_type}
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-xs font-medium ${
                isCompleted
                  ? "bg-[#EAF0F5] text-[#475569]"
                  : "bg-[#E8F7EE] text-[#2E7D4F]"
              }`}
            >
              {isCompleted
                ? "مكتمل"
                : "قيد التنفيذ"}
            </span>
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

            {canSendMessages && (
              <button
                type="button"
                onClick={() =>
                  setShowFinishConfirm(true)
                }
                className="w-fit rounded-full border border-[#B4233A] px-5 py-2 text-sm font-medium text-[#B4233A] transition hover:bg-[#FFF1F3]"
              >
                إنهاء الطلب
              </button>
            )}
          </div>

          {/* الرسائل */}
          <div className="max-h-[550px] min-h-[420px] space-y-5 overflow-y-auto bg-[#F8FBFD] p-5 sm:p-7">
            {messages.length === 0 && (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                <MessageSquareText
                  size={38}
                  className="mb-4 text-[#9DB5D8]"
                />

                <p className="font-medium text-[#071B2F]">
                  لا توجد رسائل بعد
                </p>

                <p className="mt-2 text-sm text-[#64748B]">
                  يمكنك بدء المحادثة بإرسال رسالة للباحث.
                </p>
              </div>
            )}

            {messages.map((item) => {
              const isBeneficiary =
                item.sender_id === userId;

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
                    className={`min-w-[180px] max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                      isBeneficiary
                        ? "rounded-tr-sm bg-[#164A68] text-white"
                        : "rounded-tl-sm border border-[#D7E3EF] bg-white text-[#071B2F]"
                    }`}
                  >
                    <p className="mb-1 text-[11px] font-medium opacity-70">
                      {isBeneficiary
                        ? "أنت"
                        : researcherName}
                    </p>

                    <p className="whitespace-pre-wrap break-words text-sm leading-7">
                      {item.body}
                    </p>

                    <p
                      className={`mt-2 text-[10px] ${
                        isBeneficiary
                          ? "text-white/60"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {formatTime(
                        item.created_at
                      )}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* كتابة الرسالة */}
          {canSendMessages ? (
            <div className="border-t border-[#D7E3EF] bg-white p-4 sm:p-5">
              <div className="flex items-end gap-3">
                <button
                  type="button"
                  disabled
                  title="إرفاق الملفات سيكون متاحًا لاحقًا"
                  aria-label="إرفاق ملف - غير متاح حاليًا"
                  className="flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[#D7E3EF] text-[#94A3B8] opacity-60"
                >
                  <Paperclip size={19} />
                </button>

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder="اكتب رسالتك للباحث..."
                  rows={1}
                  maxLength={5000}
                  className="min-h-[46px] flex-1 resize-none rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-sm text-[#071B2F] outline-none placeholder:text-[#94A3B8] focus:border-[#164A68]"
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    void handleSend()
                  }
                  disabled={
                    !message.trim() || sending
                  }
                  aria-label="إرسال الرسالة"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#164A68] text-white transition hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] text-[#94A3B8]">
                حفاظًا على الخصوصية، يتم التواصل بين
                المستفيد والباحث داخل المنصة.
              </p>
            </div>
          ) : (
            <div className="border-t border-[#D7E3EF] bg-white p-6">
              <div className="flex items-start justify-center gap-3 text-center">
                <Lock
                  size={23}
                  className="shrink-0 text-[#2E7D4F]"
                />

                <div>
                  <h3 className="font-semibold text-[#071B2F]">
                    تم إنهاء الطلب
                  </h3>

                  <p className="mt-1 text-sm leading-7 text-[#64748B]">
                    المحادثة مغلقة للقراءة فقط.
                    يمكنك الاطلاع على الرسائل السابقة،
                    لكن لا يمكن إرسال رسائل جديدة.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* التقييم بعد الإنهاء */}
        {isCompleted && (
          <div className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#071B2F]">
                قيّم تجربتك
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                ساعدنا في تحسين الخدمة من خلال تقييم تجربتك
                مع الباحث المتطوع.
              </p>
            </div>

            {loadingReview ? (
              <div className="flex items-center gap-3 py-6 text-sm text-[#64748B]">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                جارٍ التحقق من التقييم...
              </div>
            ) : existingReview ? (
              <div className="rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5">
                <div className="mb-4 flex items-center gap-2 text-[#2E7D4F]">
                  <CheckCircle2 size={22} />

                  <h4 className="font-semibold">
                    تم إرسال تقييمك بنجاح
                  </h4>
                </div>

                <div className="mb-4 flex flex-row-reverse justify-end gap-2">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Star
                        key={star}
                        size={27}
                        className={
                          star <=
                          existingReview.rating
                            ? "fill-[#F5B301] text-[#F5B301]"
                            : "text-[#CBD5E1]"
                        }
                      />
                    )
                  )}
                </div>

                {existingReview.comment && (
                  <p className="mb-4 whitespace-pre-wrap text-sm leading-7 text-[#475569]">
                    {existingReview.comment}
                  </p>
                )}

                <p className="text-sm text-[#64748B]">
                  حالة التقييم:{" "}
                  <span className="font-semibold text-[#164A68]">
                    {existingReview.status ===
                    "approved"
                      ? "معتمد"
                      : existingReview.status ===
                          "rejected"
                        ? "مرفوض"
                        : "بانتظار مراجعة الإدارة"}
                  </span>
                </p>

                <p className="mt-3 text-xs text-[#94A3B8]">
                  لا يمكن إرسال أكثر من تقييم لنفس الاستشارة.
                </p>
              </div>
            ) : reviewLoaded ? (
              <>
                {/* النجوم */}
                <div>
                  <p className="mb-3 text-sm font-medium text-[#071B2F]">
                    تقييم الباحث
                  </p>

                  <div
                    className="flex w-fit flex-row-reverse gap-2"
                    onMouseLeave={() =>
                      setHoveredRating(0)
                    }
                  >
                    {[1, 2, 3, 4, 5].map(
                      (star) => {
                        const active =
                          star <=
                          (hoveredRating ||
                            rating);

                        return (
                          <button
                            key={star}
                            type="button"
                            disabled={
                              submittingReview
                            }
                            onMouseEnter={() =>
                              setHoveredRating(
                                star
                              )
                            }
                            onFocus={() =>
                              setHoveredRating(
                                star
                              )
                            }
                            onBlur={() =>
                              setHoveredRating(0)
                            }
                            onClick={() => {
                              setRating(star);
                              setReviewError("");
                            }}
                            className="transition hover:scale-110 disabled:opacity-50"
                            aria-label={`تقييم ${star} من 5`}
                            aria-pressed={
                              rating === star
                            }
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
                      }
                    )}
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
                    onChange={(event) =>
                      setRatingComment(
                        event.target.value
                      )
                    }
                    rows={4}
                    maxLength={2000}
                    disabled={
                      submittingReview
                    }
                    placeholder="اكتب ملاحظتك عن تجربتك..."
                    className="w-full resize-none rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-4 text-sm text-[#071B2F] outline-none placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-50"
                  />
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      void handleSubmitReview()
                    }
                    disabled={
                      submittingReview ||
                      rating === 0
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-[#164A68] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submittingReview && (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    )}

                    {submittingReview
                      ? "جارٍ إرسال التقييم..."
                      : "إرسال التقييم"}
                  </button>
                </div>

                <p className="mt-4 text-xs leading-6 text-[#94A3B8]">
                  يُرسل التقييم للإدارة للمراجعة قبل نشره.
                </p>
              </>
            ) : null}

            {reviewError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p>{reviewError}</p>

                {!reviewLoaded &&
                  !loadingReview && (
                    <button
                      type="button"
                      onClick={() =>
                        void loadReview()
                      }
                      className="mt-3 font-medium underline"
                    >
                      إعادة المحاولة
                    </button>
                  )}
              </div>
            )}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} />
            {actionError}
          </div>
        )}
      </div>

      {/* تأكيد إنهاء الطلب */}
      {showFinishConfirm &&
        canSendMessages && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
            role="presentation"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="finish-request-title"
              className="relative w-full max-w-[470px] rounded-[24px] bg-white p-6 shadow-xl sm:p-8"
            >
              <button
                type="button"
                onClick={() =>
                  setShowFinishConfirm(false)
                }
                disabled={finishing}
                className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F1F5F9]"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F3] text-[#B4233A]">
                <CheckCircle2 size={24} />
              </div>

              <h2
                id="finish-request-title"
                className="text-xl font-semibold text-[#071B2F]"
              >
                هل تريد إنهاء الطلب؟
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#64748B]">
                بعد إنهاء الطلب سيتم إغلاق المحادثة،
                ولن تتمكن من إرسال رسائل جديدة ضمن
                هذا الطلب. وسيظهر لك نموذج تقييم الباحث.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    setShowFinishConfirm(false)
                  }
                  disabled={finishing}
                  className="flex-1 rounded-full border border-[#D7E3EF] px-5 py-3 text-sm font-medium text-[#475569] transition hover:bg-[#F8FBFD]"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleFinishRequest()
                  }
                  disabled={finishing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#B4233A] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {finishing && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {finishing
                    ? "جارٍ إنهاء الطلب..."
                    : "نعم، إنهاء الطلب"}
                </button>
              </div>
            </div>
          </div>
        )}
    </section>
  );
}
