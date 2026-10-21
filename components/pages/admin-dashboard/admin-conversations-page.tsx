
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  MessageSquare,
  Search,
  MessagesSquare,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
} from "lucide-react";

type ConversationStatus = "نشطة" | "مغلقة";

type Conversation = {
  id: string;
  requestId: string;
  requestTitle: string;
  beneficiary: string;
  researcher: string;
  lastMessage: string;
  lastActivity: string;
  messagesCount: number;
  status: ConversationStatus;
};

type ConsultationRow = {
  id: string;
  title: string;
  beneficiary_id: string;
  assigned_researcher_id: string | null;
  status: string;
};

type MessageRow = {
  id: string;
  consultation_id: string;
  body: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

export function AdminConversationsPage() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      try {
        const supabase = createClient();

        const {
          data: consultations,
          error: consultationsError,
        } = await supabase
          .from("consultation_requests")
          .select(
            "id, title, beneficiary_id, assigned_researcher_id, status"
          )
          .in("status", ["in_progress", "completed"]);

        if (consultationsError) {
          throw consultationsError;
        }

        const requests = (consultations ??
          []) as ConsultationRow[];

        if (requests.length === 0) {
          if (!cancelled) {
            setConversations([]);
            setError(null);
          }
          return;
        }

        const requestIds = requests.map(
          (request) => request.id
        );

        const { data: messages, error: messagesError } =
          await supabase
            .from("consultation_messages")
            .select(
              "id, consultation_id, body, created_at"
            )
            .in("consultation_id", requestIds)
            .order("created_at", { ascending: false });

        if (messagesError) {
          throw messagesError;
        }

        const messageRows = (messages ??
          []) as MessageRow[];

        const messagesByRequest = new Map<
          string,
          MessageRow[]
        >();

        for (const message of messageRows) {
          const existing =
            messagesByRequest.get(
              message.consultation_id
            ) ?? [];

          existing.push(message);

          messagesByRequest.set(
            message.consultation_id,
            existing
          );
        }

        const requestsWithMessages = requests.filter(
          (request) =>
            (messagesByRequest.get(request.id)?.length ??
              0) > 0
        );

        const profileIds = [
          ...new Set(
            requestsWithMessages.flatMap((request) => [
              request.beneficiary_id,
              ...(request.assigned_researcher_id
                ? [request.assigned_researcher_id]
                : []),
            ])
          ),
        ];

        const profileNames = new Map<
          string,
          string
        >();

        if (profileIds.length > 0) {
          const {
            data: profiles,
            error: profilesError,
          } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", profileIds);

          if (profilesError) {
            throw profilesError;
          }

          for (const profile of (profiles ??
            []) as ProfileRow[]) {
            profileNames.set(
              profile.id,
              profile.full_name || "غير محدد"
            );
          }
        }

        const realConversations: Conversation[] =
          requestsWithMessages.map((request) => {
            const requestMessages =
              messagesByRequest.get(request.id) ?? [];

            const latestMessage =
              requestMessages[0];

            return {
              id: request.id,
              requestId: request.id,
              requestTitle: request.title,
              beneficiary:
                profileNames.get(
                  request.beneficiary_id
                ) ?? "مستفيد",
              researcher:
                request.assigned_researcher_id
                  ? profileNames.get(
                      request.assigned_researcher_id
                    ) ?? "باحث"
                  : "لم يُعيّن باحث",
              lastMessage:
                latestMessage?.body ?? "",
              lastActivity:
                latestMessage?.created_at ?? "",
              messagesCount:
                requestMessages.length,
              status:
                request.status === "completed"
                  ? "مغلقة"
                  : "نشطة",
            };
          });

        realConversations.sort(
          (a, b) =>
            new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime()
        );

        if (!cancelled) {
          setConversations(realConversations);
          setError(null);
        }
      } catch (err) {
        console.error(
          "Admin conversations error:",
          err
        );

        if (!cancelled) {
          setError(
            "تعذر تحميل المحادثات. يرجى تحديث الصفحة والمحاولة مجددًا."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        [
          conversation.id,
          conversation.requestId,
          conversation.requestTitle,
          conversation.beneficiary,
          conversation.researcher,
        ].some((value) =>
          value.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "الكل" ||
        conversation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [conversations, search, statusFilter]);

  const activeCount = conversations.filter(
    (conversation) =>
      conversation.status === "نشطة"
  ).length;

  const closedCount = conversations.filter(
    (conversation) =>
      conversation.status === "مغلقة"
  ).length;

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      calendar: "gregory",
    }).format(new Date(date));
  }

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1300px]">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#071B2F] sm:text-3xl">
            إدارة المحادثات
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#64748B]">
            متابعة المحادثات بين المستفيدين والباحثين
            المرتبطة بالطلبات البحثية.
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={MessagesSquare}
            label="إجمالي المحادثات"
            value={conversations.length}
          />

          <StatCard
            icon={Clock3}
            label="المحادثات النشطة"
            value={activeCount}
          />

          <StatCard
            icon={CheckCircle2}
            label="المحادثات المغلقة"
            value={closedCount}
          />
        </div>

        {/* القائمة */}
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#071B2F]">
                قائمة المحادثات
              </h2>

              <p className="mt-2 text-sm text-[#64748B]">
                يمكنك البحث عن محادثة وعرض تفاصيلها.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* البحث */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="ابحث عن محادثة..."
                  className="h-11 w-full rounded-xl border border-[#D7E3EF] bg-white pr-11 pl-4 text-sm text-[#071B2F] outline-none placeholder:text-[#94A3B8] focus:border-[#164A68] sm:w-[260px]"
                />
              </div>

              {/* الفلترة */}
              <div className="relative">
                <Filter
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-11 w-full cursor-pointer rounded-xl border border-[#D7E3EF] bg-white pr-10 pl-4 text-sm text-[#071B2F] outline-none focus:border-[#164A68] sm:w-[175px]"
                >
                  <option value="الكل">
                    جميع الحالات
                  </option>
                  <option value="نشطة">
                    نشطة
                  </option>
                  <option value="مغلقة">
                    مغلقة
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* الجدول */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-right text-xs text-[#64748B]">
                  <th className="px-4 py-3 font-medium">
                    المحادثة
                  </th>
                  <th className="px-4 py-3 font-medium">
                    المستفيد
                  </th>
                  <th className="px-4 py-3 font-medium">
                    الباحث
                  </th>
                  <th className="px-4 py-3 font-medium">
                    آخر رسالة
                  </th>
                  <th className="px-4 py-3 font-medium">
                    آخر نشاط
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
                {filteredConversations.map(
                  (conversation) => (
                    <tr
                      key={conversation.id}
                      className="bg-[#F8FBFD] text-sm text-[#071B2F]"
                    >
                      <td className="rounded-r-xl px-4 py-4">
                        <p className="font-medium">
                          {conversation.requestTitle}
                        </p>

                        <p className="mt-1 text-xs text-[#94A3B8]">
                          #
                          {conversation.requestId.slice(
                            0,
                            8
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {conversation.beneficiary}
                      </td>

                      <td className="px-4 py-4">
                        {conversation.researcher}
                      </td>

                      <td className="max-w-[220px] px-4 py-4">
                        <p className="truncate text-[#64748B]">
                          {conversation.lastMessage}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p>
                          {formatDate(
                            conversation.lastActivity
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {conversation.messagesCount} رسالة
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs ${
                            conversation.status === "نشطة"
                              ? "bg-[#E8F7EE] text-[#2E7D4F]"
                              : "bg-[#EAF0F5] text-[#475569]"
                          }`}
                        >
                          {conversation.status}
                        </span>
                      </td>

                      <td className="rounded-l-xl px-4 py-4">
                        <Link
                          href={`/ar/admin-dashboard/requests/${conversation.requestId}/conversation`}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#D7E3EF] bg-white px-3 py-2 text-xs font-medium text-[#164A68] transition hover:border-[#164A68] hover:bg-[#EAF2F8]"
                        >
                          <Eye size={15} />
                          عرض المحادثة
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {!loading &&
              !error &&
              filteredConversations.length === 0 && (
                <div className="py-14 text-center">
                  <MessageSquare
                    size={36}
                    className="mx-auto text-[#94A3B8]"
                  />

                  <p className="mt-4 text-sm text-[#64748B]">
                    {conversations.length === 0
                      ? "لا توجد محادثات فعلية حتى الآن."
                      : "لا توجد محادثات مطابقة لبحثك."}
                  </p>
                </div>
              )}

            {loading && (
              <p className="py-14 text-center text-sm text-[#64748B]">
                جارٍ تحميل المحادثات...
              </p>
            )}

            {error && (
              <p className="py-14 text-center text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <p className="mt-5 text-xs leading-6 text-[#94A3B8]">
          المحادثات المعروضة مرتبطة بطلبات الاستشارات
          الفعلية في المنصة. يمكن للإدارة الاطلاع على
          الرسائل دون المشاركة في المحادثة.
        </p>
      </div>
    </section>
  );
}

type StatCardProps = {
  icon: typeof MessageSquare;
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
