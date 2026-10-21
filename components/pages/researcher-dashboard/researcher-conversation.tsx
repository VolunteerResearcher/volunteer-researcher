
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  FileText,
  Lock,
  MessageSquareText,
  Paperclip,
  Send,
  UserRound,
  Loader2,
  AlertCircle,
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

const helpTypeLabels: Record<string, string> = {
  research: "البحث العلمي",
  methodology: "مناهج البحث",
  analysis: "تحليل البيانات",
  review: "مراجعة بحثية",
  other: "أخرى",
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  assigned: "بانتظار قبول الباحث",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "مرفوض",
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ResearcherConversation({
  requestId,
}: ResearcherConversationProps) {
  const [supabase] = useState(() => createClient());

  const [userId, setUserId] = useState<string | null>(null);
  const [request, setRequest] = useState<Consultation | null>(null);
  const [beneficiaryName, setBeneficiaryName] = useState("المستفيد");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const { data, error: messagesError } = await supabase
      .from("consultation_messages")
      .select("id, consultation_id, sender_id, body, created_at")
      .eq("consultation_id", requestId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (messagesError) {
      setSendError("تعذر تحديث الرسائل. حاولي مرة أخرى.");
      return;
    }

    setMessages((data ?? []) as ChatMessage[]);
  }, [supabase, requestId]);

  const loadRequest = useCallback(async () => {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setError("يجب تسجيل الدخول بحساب الباحث لعرض المحادثة.");
      setLoading(false);
      return;
    }

    const currentUserId = authData.user.id;
    setUserId(currentUserId);

    const { data: requestData, error: requestError } = await supabase
      .from("consultation_requests")
      .select(
        "id, title, help_type, beneficiary_id, assigned_researcher_id, status"
      )
      .eq("id", requestId)
      .eq("assigned_researcher_id", currentUserId)
      .single();

    if (requestError || !requestData) {
      setError("هذه المحادثة غير متاحة لحسابك.");
      setLoading(false);
      return;
    }

    if (
      requestData.status !== "in_progress" &&
      requestData.status !== "completed"
    ) {
      setError("المحادثة تصبح متاحة بعد قبول الطلب.");
      setLoading(false);
      return;
    }

    setRequest(requestData as Consultation);

    const { data: beneficiaryData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", requestData.beneficiary_id)
      .maybeSingle();

    if (beneficiaryData?.full_name) {
      setBeneficiaryName(beneficiaryData.full_name);
    }

    await loadMessages();
    setLoading(false);
  }, [supabase, requestId, loadMessages]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  useEffect(() => {
    if (!request) return;

    const interval = window.setInterval(async () => {
      const { data } = await supabase
        .from("consultation_requests")
        .select("status")
        .eq("id", requestId)
        .eq("assigned_researcher_id", userId)
        .maybeSingle();

      if (data?.status) {
        setRequest((current) =>
          current ? { ...current, status: data.status } : current
        );
      }

      await loadMessages();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [requestId, request?.id, supabase, userId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  const isCompleted = request?.status === "completed";
  const canSend = request?.status === "in_progress";

  const handleSend = async () => {
    const text = message.trim();

    if (!text || !canSend || !userId || sending) return;

    if (text.length > 5000) {
      setSendError("الرسالة يجب ألا تتجاوز 5000 حرف.");
      return;
    }

    setSending(true);
    setSendError("");

    const { error: insertError } = await supabase
      .from("consultation_messages")
      .insert({
        consultation_id: requestId,
        sender_id: userId,
        body: text,
      });

    if (insertError) {
      setSendError("تعذر إرسال الرسالة. تأكدي أن الطلب لا يزال قيد التنفيذ.");
      setSending(false);
      return;
    }

    setMessage("");
    await loadMessages();
    setSending(false);
  };

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#F8FBFD]"
      >
        <div className="flex items-center gap-3 text-[#164A68]">
          <Loader2 size={22} className="animate-spin" />
          <span>جاري تحميل المحادثة...</span>
        </div>
      </main>
    );
  }

  if (error || !request) {
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
            <AlertCircle
              size={34}
              className="mx-auto mb-4 text-[#164A68]"
            />
            <h1 className="text-2xl font-semibold text-[#071B2F]">
              المحادثة غير متاحة
            </h1>
            <p className="mt-3 text-sm text-[#64748B]">
              {error || "لا توجد محادثة متاحة لهذا الطلب."}
            </p>
          </div>
        </div>
      </main>
    );
  }

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
                <UserRound size={26} strokeWidth={1.6} />
              </div>

              <div>
                <p className="mb-1 text-xs text-[#64748B]">
                  المستفيد
                </p>

                <h1 className="text-lg font-semibold text-[#071B2F]">
                  {beneficiaryName}
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
              {statusLabels[request.status] ?? request.status}
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
              {helpTypeLabels[request.help_type] ?? request.help_type}
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
                الرسائل السابقة، ولكن لا يمكن إرسال رسائل جديدة.
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
                  ابدأ المحادثة بإرسال أول رسالة للمستفيد.
                </p>
              </div>
            )}

            {messages.map((item) => {
              const isResearcher = item.sender_id === userId;

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
                    className={`min-w-[180px] max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                      isResearcher
                        ? "rounded-tr-sm bg-[#164A68] text-white"
                        : "rounded-tl-sm border border-[#D7E3EF] bg-white text-[#071B2F]"
                    }`}
                  >
                    <p className="mb-1 text-[11px] font-medium opacity-70">
                      {isResearcher ? "أنت" : beneficiaryName}
                    </p>

                    <p className="whitespace-pre-wrap break-words text-sm leading-7">
                      {item.body}
                    </p>

                    <p
                      className={`mt-2 text-[10px] ${
                        isResearcher
                          ? "text-white/60"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {formatTime(item.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* الكتابة */}
          {canSend && (
            <div className="border-t border-[#D7E3EF] bg-white p-4 sm:p-5">
              <div className="flex items-end gap-3">
                {/* المرفقات: تُفعّل في خطوة لاحقة */}
                <button
                  type="button"
                  disabled
                  title="إرفاق الملفات سيكون متاحًا لاحقًا"
                  className="flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[#D7E3EF] text-[#94A3B8]"
                  aria-label="إرفاق ملف - غير متاح حاليًا"
                >
                  <Paperclip size={19} />
                </button>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك للمستفيد..."
                  rows={1}
                  maxLength={5000}
                  className="min-h-[46px] flex-1 resize-none rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-sm text-[#071B2F] outline-none placeholder:text-[#94A3B8] focus:border-[#164A68]"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!message.trim() || sending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#164A68] text-white transition hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="إرسال الرسالة"
                >
                  {sending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>

              {sendError && (
                <p
                  role="alert"
                  className="mt-3 text-center text-xs text-red-600"
                >
                  {sendError}
                </p>
              )}

              <p className="mt-3 text-center text-[11px] text-[#94A3B8]">
                حفاظًا على الخصوصية، لا تظهر بيانات التواصل الشخصية
                للمستفيد أو الباحث.
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
