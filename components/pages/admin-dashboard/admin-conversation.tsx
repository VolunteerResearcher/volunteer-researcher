
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  LockKeyhole,
  Loader2,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Consultation = {
  id: string;
  title: string;
  status: string;
  beneficiary_id: string;
  assigned_researcher_id: string | null;
};

type ChatMessage = {
  id: string;
  consultation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    timeZone: "Asia/Riyadh",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminConversation({
  requestId,
}: {
  requestId: string;
}) {
  const [supabase] = useState(() => createClient());

  const [consultation, setConsultation] =
    useState<Consultation | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [beneficiaryName, setBeneficiaryName] =
    useState("المستفيد");

  const [researcherName, setResearcherName] =
    useState("الباحث");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("consultation_messages")
      .select(
        "id, consultation_id, sender_id, body, created_at"
      )
      .eq("consultation_id", requestId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      setErrorMessage("تعذر تحميل رسائل المحادثة.");
      return;
    }

    setMessages((data ?? []) as ChatMessage[]);
  }, [supabase, requestId]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        setErrorMessage("يجب تسجيل الدخول أولًا.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

      if (!active) return;

      if (profileError || profile?.role !== "admin") {
        setErrorMessage(
          "ليس لديك صلاحية الاطلاع على هذه المحادثة."
        );
        setLoading(false);
        return;
      }

      const { data: request, error: requestError } =
        await supabase
          .from("consultation_requests")
          .select(
            "id, title, status, beneficiary_id, assigned_researcher_id"
          )
          .eq("id", requestId)
          .maybeSingle();

      if (!active) return;

      if (requestError || !request) {
        setErrorMessage("تعذر العثور على الطلب.");
        setLoading(false);
        return;
      }

      if (
        request.status !== "in_progress" &&
        request.status !== "completed"
      ) {
        setErrorMessage(
          "المحادثة متاحة للطلبات قيد التنفيذ أو المكتملة فقط."
        );
        setLoading(false);
        return;
      }

      const currentRequest = request as Consultation;
      setConsultation(currentRequest);

      const participantIds = [
        currentRequest.beneficiary_id,
        currentRequest.assigned_researcher_id,
      ].filter((id): id is string => Boolean(id));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", participantIds);

      if (!active) return;

      const profileMap = new Map(
        ((profiles ?? []) as Profile[]).map((item) => [
          item.id,
          item.full_name,
        ])
      );

      setBeneficiaryName(
        profileMap.get(currentRequest.beneficiary_id) ||
          "المستفيد"
      );

      setResearcherName(
        currentRequest.assigned_researcher_id
          ? profileMap.get(
              currentRequest.assigned_researcher_id
            ) || "الباحث"
          : "الباحث"
      );

      await loadMessages();

      if (active) setLoading(false);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [supabase, requestId, loadMessages]);

  useEffect(() => {
    if (!consultation) return;

    const interval = window.setInterval(() => {
      void loadMessages();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [consultation, loadMessages]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[60vh] items-center justify-center gap-3 text-[#64748B]"
      >
        <Loader2 size={22} className="animate-spin" />
        جاري تحميل المحادثة...
      </div>
    );
  }

  if (errorMessage && !consultation) {
    return (
      <main dir="rtl" className="p-6">
        <Link
          href={`/ar/admin-dashboard/requests/${requestId}`}
          className="inline-flex items-center gap-2 text-sm text-[#164A68]"
        >
          <ArrowRight size={17} />
          العودة إلى تفاصيل الطلب
        </Link>

        <p className="mt-6 rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-700">
          {errorMessage}
        </p>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen px-4 py-8 text-[#071B2F] sm:px-7 lg:px-10"
    >
      <Link
        href={`/ar/admin-dashboard/requests/${requestId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-[#164A68]"
      >
        <ArrowRight size={18} />
        العودة إلى تفاصيل الطلب
      </Link>

      <section className="rounded-[24px] border border-[#D7E3EF] bg-white p-6">
        <div className="flex items-start gap-3">
          <Eye size={24} className="mt-1 text-[#164A68]" />

          <div>
            <h1 className="text-xl font-semibold">
              مراقبة محادثة الطلب
            </h1>

            <p className="mt-2 text-sm text-[#64748B]">
              {consultation?.title}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full bg-[#EAF2F8] px-4 py-2 text-xs text-[#164A68]">
            المستفيد: {beneficiaryName}
          </span>

          <span className="rounded-full bg-[#EAF2F8] px-4 py-2 text-xs text-[#164A68]">
            الباحث: {researcherName}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#F8FBFD] p-4 text-xs leading-6 text-[#64748B]">
          <LockKeyhole size={18} className="shrink-0" />
          هذه المحادثة متاحة للإدارة للاطلاع فقط، ولا يمكن للإدارة إرسال رسائل.
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[24px] border border-[#9DB5D8] bg-white">
        <div className="flex items-center gap-3 border-b border-[#D7E3EF] p-5">
          <MessageSquareText
            size={21}
            className="text-[#164A68]"
          />

          <div>
            <h2 className="font-semibold">سجل المحادثة</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              يتم تحديث الرسائل تلقائيًا كل 3 ثوانٍ
            </p>
          </div>
        </div>

        <div className="min-h-[360px] space-y-5 bg-[#F8FBFD] p-5">
          {messages.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#64748B]">
              لا توجد رسائل في هذه المحادثة حتى الآن.
            </p>
          ) : (
            messages.map((message) => {
              const fromResearcher =
                message.sender_id ===
                consultation?.assigned_researcher_id;

              const senderName = fromResearcher
                ? researcherName
                : beneficiaryName;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    fromResearcher
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[70%] ${
                      fromResearcher
                        ? "bg-[#164A68] text-white"
                        : "border border-[#D7E3EF] bg-white text-[#071B2F]"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                      <UserRound size={14} />
                      {senderName}
                    </div>

                    <p className="whitespace-pre-wrap break-words leading-7">
                      {message.body}
                    </p>

                    <p
                      className={`mt-2 text-left text-[10px] ${
                        fromResearcher
                          ? "text-white/70"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[#D7E3EF] p-5 text-sm text-[#64748B]">
          <LockKeyhole size={17} />
          وضع المشاهدة فقط — لا يمكن إرسال رسائل
        </div>
      </section>

      {errorMessage && (
        <p className="mt-4 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </main>
  );
}
