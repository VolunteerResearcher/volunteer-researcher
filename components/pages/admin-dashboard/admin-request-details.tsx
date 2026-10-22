
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquareText,
  MessagesSquare,
  Send,
  UserRound,
  XCircle,
  Clock3,
  RefreshCw,
  Paperclip,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

type RequestStatus =
  | "pending"
  | "needs_revision"
  | "assigned"
  | "in_progress"
  | "completed"
  | "rejected";

type RequestData = {
  id: string;
  title: string;
  beneficiary_id: string;
  description: string;
  help_type: string;
  additional_notes: string | null;
  attachment_path: string | null;
  assigned_researcher_id: string | null;
  requested_researcher_id: string | null;
  research_field: string | null;
  status: RequestStatus;
  created_at: string;
  researcher_decline_reason: string | null;
  researcher_declined_at: string | null;
  last_declined_researcher_id: string | null;
  admin_revision_notes: string | null;
  revision_requested_at: string | null;
};

type Researcher = {
  id: string;
  full_name: string;
  field: string;
};

const helpTypeLabels: Record<string, string> = {
  research: "استشارة بحثية",
  methodology: "منهجية البحث",
  analysis: "تحليل البيانات",
  review: "مراجعة بحثية",
  other: "أخرى",
};

const statusLabels: Record<RequestStatus, string> = {
  pending: "جديد",
  needs_revision: "بانتظار استكمال البيانات",
  assigned: "تحت المراجعة",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "معتذر عن الطلب",
};

const statusStyles: Record<RequestStatus, string> = {
  pending: "bg-[#EAF2F8] text-[#164A68]",
  needs_revision: "bg-[#FFF5E6] text-[#A16207]",
  assigned: "bg-[#FFF5E6] text-[#A16207]",
  in_progress: "bg-[#E8F7EE] text-[#2E7D4F]",
  completed: "bg-[#E8F7EE] text-[#2E7D4F]",
  rejected: "bg-[#FDECEC] text-[#B42318]",
};

function formatDate(date: string | null) {
  if (!date) return "غير محدد";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "غير محدد";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-[#64748B]">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-[#071B2F]">
        {value || "غير محدد"}
      </p>
    </div>
  );
}

export function AdminRequestDetails({
  requestId,
}: {
  requestId: string;
}) {
  const [request, setRequest] = useState<RequestData | null>(null);
  const [beneficiaryName, setBeneficiaryName] = useState("مستفيد");
  const [requestedResearcherName, setRequestedResearcherName] =
    useState("");
  const [assignedResearcherName, setAssignedResearcherName] =
    useState("");
  const [declinedResearcherName, setDeclinedResearcherName] =
    useState("");
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [selectedResearcher, setSelectedResearcher] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionError, setRevisionError] = useState("");
  const [revisionSaving, setRevisionSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("يرجى تسجيل الدخول أولًا.");
      }

      const { data: adminProfile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle();

      if (profileError || adminProfile?.role !== "admin") {
        throw new Error("ليس لديك صلاحية الاطلاع على هذا الطلب.");
      }

      const { data: consultation, error: requestError } =
        await supabase
          .from("consultation_requests")
          .select(
            [
              "id",
              "title",
              "beneficiary_id",
              "description",
              "help_type",
              "additional_notes",
              "attachment_path",
              "assigned_researcher_id",
              "requested_researcher_id",
              "research_field",
              "status",
              "created_at",
              "researcher_decline_reason",
              "researcher_declined_at",
              "last_declined_researcher_id",
              "admin_revision_notes",
              "revision_requested_at",
            ].join(",")
          )
          .eq("id", requestId)
          .maybeSingle();

      if (requestError) throw requestError;
      if (!consultation) throw new Error("الطلب غير موجود.");

      const currentRequest = consultation as unknown as RequestData;
      setRequest(currentRequest);

      const { data: beneficiary, error: beneficiaryError } =
        await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentRequest.beneficiary_id)
          .maybeSingle();

      if (beneficiaryError) throw beneficiaryError;

      setBeneficiaryName(beneficiary?.full_name || "مستفيد");

      // الباحث الذي اختاره المستفيد، وليس الباحث المعيّن
      if (currentRequest.requested_researcher_id) {
        const { data: requestedProfile, error: requestedError } =
          await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", currentRequest.requested_researcher_id)
            .maybeSingle();

        if (requestedError) throw requestedError;

        setRequestedResearcherName(
          requestedProfile?.full_name || "باحث غير متاح حاليًا"
        );
      } else {
        setRequestedResearcherName("");
      }

      const { data: approvedProfiles, error: researchersError } =
        await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "researcher")
          .eq("approval_status", "approved")
          .order("full_name", { ascending: true });

      if (researchersError) throw researchersError;

      const profiles = approvedProfiles ?? [];
      let specializationMap = new Map<string, string>();

      if (profiles.length > 0) {
        const { data: applications, error: applicationsError } =
          await supabase
            .from("researcher_applications")
            .select("id, general_specialization")
            .in(
              "id",
              profiles.map((profile) => profile.id)
            );

        if (applicationsError) throw applicationsError;

        specializationMap = new Map(
          (applications ?? []).map((application) => [
            application.id,
            application.general_specialization || "غير محدد",
          ])
        );
      }

      setResearchers(
        profiles.map((profile) => ({
          id: profile.id,
          full_name: profile.full_name || "باحث متطوع",
          field: specializationMap.get(profile.id) || "غير محدد",
        }))
      );

      if (currentRequest.assigned_researcher_id) {
        const { data: assignedProfile, error: assignedError } =
          await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", currentRequest.assigned_researcher_id)
            .maybeSingle();

        if (assignedError) throw assignedError;

        setAssignedResearcherName(
          assignedProfile?.full_name || "باحث متطوع"
        );
        setSelectedResearcher(currentRequest.assigned_researcher_id);
      } else {
        setAssignedResearcherName("");
        setSelectedResearcher("");
      }

      if (currentRequest.last_declined_researcher_id) {
        const { data: declinedProfile, error: declinedError } =
          await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", currentRequest.last_declined_researcher_id)
            .maybeSingle();

        if (declinedError) throw declinedError;

        setDeclinedResearcherName(
          declinedProfile?.full_name || "باحث متطوع"
        );
      } else {
        setDeclinedResearcherName("");
      }
    } catch (error) {
      setRequest(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر تحميل تفاصيل الطلب."
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAssign = async () => {
    if (!request || saving || revisionSaving) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedResearcher) {
      setErrorMessage("يرجى اختيار الباحث أولًا.");
      return;
    }

    if (selectedResearcher === request.last_declined_researcher_id) {
      setErrorMessage(
        "لا يمكن إعادة إسناد الطلب إلى آخر باحث اعتذر عنه. يرجى اختيار باحث آخر."
      );
      return;
    }

    if (
      request.status !== "pending" ||
      request.assigned_researcher_id
    ) {
      setErrorMessage("لا يمكن إسناد الطلب في حالته الحالية.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/consultations/${encodeURIComponent(request.id)}/assign`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            researcherId: selectedResearcher,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "تعذر إسناد الطلب.");
      }

      setSuccessMessage(
        result.message || "تم إسناد الطلب بنجاح."
      );

      setRequest((current) =>
        current
          ? {
              ...current,
              status: "assigned",
              assigned_researcher_id: selectedResearcher,
            }
          : current
      );

      const researcher = researchers.find(
        (item) => item.id === selectedResearcher
      );

      setAssignedResearcherName(
        researcher?.full_name || "باحث متطوع"
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إسناد الطلب."
      );
    } finally {
      setSaving(false);
    }
  };

  const openRevisionModal = () => {
    if (
      !request ||
      request.status !== "pending" ||
      request.assigned_researcher_id
    ) {
      return;
    }

    setRevisionNotes("");
    setRevisionError("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowRevisionModal(true);
  };

  const closeRevisionModal = () => {
    if (revisionSaving) return;

    setShowRevisionModal(false);
    setRevisionNotes("");
    setRevisionError("");
  };

  const handleRequestRevision = async () => {
    if (
      !request ||
      revisionSaving ||
      saving ||
      request.status !== "pending" ||
      request.assigned_researcher_id
    ) {
      return;
    }

    const notes = revisionNotes.trim();

    if (notes.length < 5 || notes.length > 2000) {
      setRevisionError("يرجى كتابة الملاحظات من 5 إلى 2000 حرف.");
      return;
    }

    setRevisionSaving(true);
    setRevisionError("");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/consultations/${encodeURIComponent(
          request.id
        )}/request-revision`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        }
      );

      const result: {
        success?: boolean;
        status?: string;
        notes?: string;
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "تعذر إرسال الملاحظات للمستفيد."
        );
      }

      setRequest((current) =>
        current
          ? {
              ...current,
              status: "needs_revision",
              admin_revision_notes: result.notes ?? notes,
              revision_requested_at: new Date().toISOString(),
            }
          : current
      );

      setSuccessMessage(
        result.message ||
          "تم إرجاع الطلب للمستفيد مع الملاحظات بنجاح."
      );

      setShowRevisionModal(false);
      setRevisionNotes("");
      setRevisionError("");
    } catch (error) {
      setRevisionError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إرسال الملاحظات."
      );
    } finally {
      setRevisionSaving(false);
    }
  };

  const handleAttachment = async () => {
    if (!request?.attachment_path) return;

    setErrorMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase.storage
        .from("consultation-attachments")
        .createSignedUrl(request.attachment_path, 60);

      if (error || !data?.signedUrl) {
        throw new Error(
          "تعذر فتح المرفق. قد تحتاج صلاحيات التخزين إلى ضبط."
        );
      }

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر فتح المرفق."
      );
    }
  };

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen px-4 py-8 text-[#071B2F] sm:px-7 lg:px-10"
      >
        <div className="flex items-center gap-3 text-sm text-[#64748B]">
          <RefreshCw size={18} className="animate-spin" />
          جاري تحميل تفاصيل الطلب...
        </div>
      </main>
    );
  }

  if (!request) {
    return (
      <main
        dir="rtl"
        className="min-h-screen px-4 py-8 sm:px-7 lg:px-10"
      >
        <h1 className="text-xl font-semibold text-[#071B2F]">
          تعذر عرض الطلب
        </h1>

        {errorMessage && (
          <p className="mt-3 text-sm text-[#B42318]">
            {errorMessage}
          </p>
        )}

        <Link
          href="/ar/admin-dashboard/requests"
          className="mt-4 inline-block text-[#164A68]"
        >
          العودة إلى إدارة الطلبات
        </Link>
      </main>
    );
  }

  const status = request.status;

  const canReview =
    status === "pending" && !request.assigned_researcher_id;

  const hasResearcherDecline =
    Boolean(request.last_declined_researcher_id) &&
    Boolean(request.researcher_decline_reason);

  const formattedDate = formatDate(request.created_at);

  return (
    <main
      dir="rtl"
      className="min-h-screen px-4 py-8 text-[#071B2F] sm:px-7 lg:px-10"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* العودة */}
        <Link
          href="/ar/admin-dashboard/requests"
          className="mb-7 inline-flex items-center gap-2 text-sm text-[#164A68] hover:opacity-70"
        >
          <ArrowRight size={18} />
          العودة إلى إدارة الطلبات
        </Link>

        {/* عنوان الصفحة */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="break-words text-sm text-[#64748B]">
              إدارة الطلبات / #{request.id.slice(0, 8)}
            </p>

            <h1 className="mt-2 text-2xl font-semibold">
              تفاصيل الطلب
            </h1>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-xs font-medium ${
              statusStyles[status] ??
              "bg-[#EAF0F5] text-[#475569]"
            }`}
          >
            {statusLabels[status] ?? "غير محدد"}
          </span>
        </div>

        {/* رسائل النجاح والخطأ */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 rounded-2xl border border-[#B9E3C8] bg-[#E8F7EE] p-4 text-sm leading-7 text-[#2E7D4F]"
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-[#F1C7C7] bg-[#FFF5F5] p-4 text-sm leading-7 text-[#B42318]"
          >
            {errorMessage}
          </div>
        )}

        {/* بيانات الطلب */}
        <section className="rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <ClipboardList
              size={22}
              className="text-[#164A68]"
            />
            <h2 className="text-lg font-semibold">
              بيانات الطلب
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <DetailItem
              label="رقم الطلب"
              value={request.id}
            />

            <DetailItem
              label="موضوع الطلب"
              value={request.title}
            />

            <DetailItem
              label="نوع المساعدة"
              value={
                helpTypeLabels[request.help_type] ||
                request.help_type
              }
            />

            <DetailItem
              label="المجال البحثي"
              value={
                request.research_field ||
                (request.requested_researcher_id
                  ? "تم اختيار باحث محدد بدلًا من المجال"
                  : "لم يُحدد مجال بحثي مستقل في الطلب")
              }
            />

            <DetailItem
              label="الباحث المطلوب من المستفيد"
              value={
                requestedResearcherName ||
                (request.research_field
                  ? "لم يطلب المستفيد باحثًا محددًا"
                  : "لم يُحدد باحث في الطلب")
              }
            />

            <DetailItem
              label="تاريخ التقديم"
              value={formattedDate}
            />

            <DetailItem
              label="الباحث المعيّن"
              value={
                assignedResearcherName ||
                "لم يتم التعيين"
              }
            />
          </div>
        </section>

        {/* بيانات المستفيد */}
        <section className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <UserRound
              size={22}
              className="text-[#164A68]"
            />

            <h2 className="text-lg font-semibold">
              بيانات المستفيد
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <DetailItem
              label="اسم المستفيد"
              value={beneficiaryName}
            />

            <DetailItem
              label="الجهة"
              value="غير مذكورة في بيانات الطلب"
            />
          </div>
        </section>

        {/* وصف الطلب */}
        <section className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <FileText
              size={22}
              className="text-[#164A68]"
            />

            <h2 className="text-lg font-semibold">
              وصف الطلب
            </h2>
          </div>

          <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#475569]">
            {request.description}
          </p>

          {request.additional_notes && (
            <div className="mt-5 rounded-xl bg-[#F8FBFD] p-4">
              <p className="text-sm font-semibold">
                ملاحظات إضافية من المستفيد
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#475569]">
                {request.additional_notes}
              </p>
            </div>
          )}

          {request.attachment_path && (
            <button
              type="button"
              onClick={handleAttachment}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D7E3EF] px-5 py-3 text-sm font-medium text-[#164A68] hover:bg-[#F8FBFD]"
            >
              <Paperclip size={17} />
              عرض المرفق
            </button>
          )}
        </section>

        {/* ملاحظات الإدارة للمستفيد */}
        {request.admin_revision_notes && (
          <section className="mt-5 rounded-[24px] border border-[#F4D79B] bg-white p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF5E6] text-[#A16207]">
                <MessageSquareText size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">
                  ملاحظات الإدارة للمستفيد
                </h2>

                <p className="mt-1 text-xs text-[#64748B]">
                  تاريخ طلب الاستكمال:{" "}
                  {formatDate(request.revision_requested_at)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#FFF9EC] p-4 sm:p-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#785B29]">
                {request.admin_revision_notes}
              </p>
            </div>

            {status === "needs_revision" && (
              <p className="mt-4 text-sm leading-7 text-[#A16207]">
                الطلب الآن بانتظار استكمال البيانات من
                المستفيد وإعادة إرساله للمراجعة.
              </p>
            )}
          </section>
        )}

        {/* اعتذار الباحث السابق */}
        {hasResearcherDecline && (
          <section className="mt-5 rounded-[24px] border border-[#F1C7C7] bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1F3] text-[#B4233A]">
                  <XCircle size={23} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#071B2F]">
                    اعتذار الباحث عن الطلب
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    تم تسجيل اعتذار الباحث في قاعدة البيانات.
                  </p>
                </div>
              </div>

              {canReview && (
                <span className="rounded-full bg-[#FFF3D6] px-4 py-2 text-xs font-medium text-[#9A6700]">
                  بانتظار إعادة الإسناد
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5">
                <p className="text-xs text-[#64748B]">
                  الباحث الذي اعتذر
                </p>

                <p className="mt-2 text-sm font-semibold text-[#071B2F]">
                  {declinedResearcherName || "باحث متطوع"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5">
                <p className="text-xs text-[#64748B]">
                  تاريخ الاعتذار
                </p>

                <p className="mt-2 text-sm font-semibold text-[#071B2F]">
                  {formatDate(request.researcher_declined_at)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#F1C7C7] bg-[#FFF8F8] p-5">
              <p className="mb-2 text-sm font-semibold text-[#B4233A]">
                سبب الاعتذار
              </p>

              <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#475569]">
                {request.researcher_decline_reason}
              </p>
            </div>

            {canReview && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#F8FBFD] p-4">
                <RefreshCw
                  size={20}
                  className="mt-1 shrink-0 text-[#164A68]"
                />

                <p className="text-sm leading-7 text-[#475569]">
                  عاد الطلب إلى الإدارة بعد اعتذار الباحث.
                  يمكنك اختيار باحث متطوع آخر من قسم مراجعة
                  الطلب واتخاذ الإجراء أدناه.
                </p>
              </div>
            )}
          </section>
        )}

        {/* إجراءات الإدارة */}
        {canReview && (
          <section className="mt-5 rounded-[24px] border border-[#9DB5D8] bg-white p-5 sm:p-7">
            <h2 className="text-lg font-semibold">
              مراجعة الطلب واتخاذ الإجراء
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#64748B]">
              يمكنك اختيار باحث متطوع معتمد وإسناد الطلب
              إليه، أو إرجاع الطلب للمستفيد لاستكمال
              البيانات المطلوبة.
            </p>

            {/* اختيار الباحث */}
            <div className="mt-6">
              <label
                htmlFor="researcher"
                className="mb-2 block text-sm font-medium"
              >
                اختيار الباحث المتطوع
              </label>

              <select
                id="researcher"
                value={selectedResearcher}
                onChange={(event) =>
                  setSelectedResearcher(event.target.value)
                }
                disabled={saving || revisionSaving}
                className="w-full min-w-0 rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-sm outline-none focus:border-[#164A68] disabled:opacity-60"
              >
                <option value="">
                  اختر الباحث المناسب
                </option>

                {researchers.map((researcher) => {
                  const previouslyDeclined =
                    researcher.id ===
                    request.last_declined_researcher_id;

                  return (
                    <option
                      key={researcher.id}
                      value={researcher.id}
                      disabled={previouslyDeclined}
                    >
                      {researcher.full_name} — {researcher.field}
                      {previouslyDeclined
                        ? " (اعتذر عن هذا الطلب)"
                        : ""}
                    </option>
                  );
                })}
              </select>

              {researchers.length === 0 && (
                <p className="mt-2 text-xs text-[#B42318]">
                  لا يوجد باحثون معتمدون متاحون للإسناد حاليًا.
                </p>
              )}

              {request.last_declined_researcher_id && (
                <p className="mt-2 text-xs leading-6 text-[#64748B]">
                  الباحث الذي اعتذر عن هذا الطلب غير متاح
                  لإعادة الإسناد.
                </p>
              )}
            </div>

            {/* ملاحظة الإدارة للباحث */}
            <div className="mt-5">
              <label
                htmlFor="admin-note"
                className="mb-2 block text-sm font-medium"
              >
                ملاحظة الإدارة للباحث (اختيارية)
              </label>

              <textarea
                id="admin-note"
                value={adminNote}
                onChange={(event) =>
                  setAdminNote(event.target.value)
                }
                rows={3}
                disabled
                placeholder="سيتم تفعيل حفظ ملاحظات الإدارة للباحث في خطوة لاحقة..."
                className="w-full resize-none rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] p-4 text-sm outline-none disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-[#64748B]">
                هذه الملاحظة خاصة بالباحث، وحفظها غير مفعّل
                حاليًا. ملاحظات المستفيد تُكتب من زر طلب
                معلومات إضافية أدناه.
              </p>
            </div>

            {/* أزرار الإدارة */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleAssign}
                disabled={
                  saving ||
                  revisionSaving ||
                  !selectedResearcher ||
                  selectedResearcher ===
                    request.last_declined_researcher_id
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#164A68] px-5 py-3 text-sm font-medium text-white hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
                )}

                {saving
                  ? "جاري إسناد الطلب..."
                  : "اعتماد وإرسال للباحث"}
              </button>

              <button
                type="button"
                onClick={openRevisionModal}
                disabled={saving || revisionSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D7E3EF] px-5 py-3 text-sm font-medium text-[#164A68] transition hover:bg-[#F8FBFD] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <MessageSquareText size={17} />
                طلب معلومات إضافية
              </button>

              <button
                type="button"
                disabled
                title="سيتم تفعيلها بعد ربط حفظ أسباب اعتذار الإدارة"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#F1C7C7] px-5 py-3 text-sm text-[#B42318] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <XCircle size={17} />
                الاعتذار عن الطلب
              </button>
            </div>
          </section>
        )}

        {/* الطلب بانتظار استكمال البيانات */}
        {status === "needs_revision" && (
          <section className="mt-5 rounded-[24px] border border-[#F4D79B] bg-[#FFF9EC] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="mt-1 shrink-0 text-[#A16207]"
              />

              <div>
                <h2 className="font-semibold text-[#8A5B00]">
                  بانتظار استكمال البيانات
                </h2>

                <p className="mt-2 text-sm leading-7 text-[#785B29]">
                  تم إرسال ملاحظات الإدارة، والطلب الآن
                  بانتظار تعديل المستفيد لبياناته وإعادة
                  إرساله للمراجعة.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* الطلب بانتظار الباحث */}
        {status === "assigned" && (
          <section className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Clock3
                size={22}
                className="mt-1 shrink-0 text-[#164A68]"
              />

              <div>
                <h2 className="font-semibold">
                  بانتظار رد الباحث
                </h2>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  تمت إحالة الطلب إلى{" "}
                  {assignedResearcherName || "الباحث المعيّن"}،
                  وهو الآن بانتظار معالجة الباحث له.
                </p>

                <p className="mt-3 text-xs leading-6 text-[#94A3B8]">
                  تم حفظ الإسناد في قاعدة البيانات.
                  يستطيع الباحث قبول الطلب أو الاعتذار
                  عنه من لوحة الباحث.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* الطلب قيد التنفيذ */}
        {status === "in_progress" && (
          <section className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={22}
                className="shrink-0 text-[#2E7D4F]"
              />

              <div>
                <h2 className="font-semibold">
                  الطلب قيد التنفيذ
                </h2>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  الطلب قيد التنفيذ لدى{" "}
                  {assignedResearcherName || "الباحث المعيّن"}.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* الطلب مكتمل */}
        {status === "completed" && (
          <section className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={22}
                className="shrink-0 text-[#2E7D4F]"
              />

              <div>
                <h2 className="font-semibold">
                  الطلب مكتمل
                </h2>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  تم إنهاء الطلب البحثي.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* اعتذار الإدارة */}
        {status === "rejected" && (
          <section className="mt-5 rounded-[24px] border border-[#F1C7C7] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <XCircle
                size={22}
                className="shrink-0 text-[#B42318]"
              />

              <div>
                <h2 className="font-semibold">
                  تم الاعتذار عن الطلب
                </h2>

                <p className="mt-2 text-sm leading-7 text-[#64748B]">
                  حالة الطلب مسجلة في قاعدة البيانات
                  كمعتذر عنه.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* عرض المحادثة للإدارة */}
        {(status === "in_progress" ||
          status === "completed") && (
          <div className="mt-7 flex justify-end">
            <Link
              href={`/ar/admin-dashboard/requests/${request.id}/conversation`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#123E58] sm:w-auto"
            >
              <MessagesSquare size={19} />
              عرض المحادثة
            </Link>
          </div>
        )}

        <p className="mt-7 text-center text-xs leading-6 text-[#94A3B8]">
          تفاصيل الطلب وإسناده وطلب استكمال البيانات
          مرتبطة بقاعدة البيانات.
        </p>
      </div>

      {/* نافذة طلب معلومات إضافية */}
      {showRevisionModal && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071B2F]/60 p-3 sm:p-5"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="revision-modal-title"
            className="max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-[24px] bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#164A68]">
                <MessageSquareText size={24} />
              </div>

              <button
                type="button"
                onClick={closeRevisionModal}
                disabled={revisionSaving}
                aria-label="إغلاق النافذة"
                className="rounded-full p-2 text-[#64748B] transition hover:bg-[#F1F5F9] disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            <h2
              id="revision-modal-title"
              className="mt-5 text-xl font-semibold text-[#071B2F]"
            >
              إرجاع الطلب للمستفيد
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#64748B]">
              اكتبي المعلومات أو المستندات الناقصة
              التي يجب على المستفيد استكمالها.
              بعد الإرسال ستتغير حالة الطلب إلى
              «بانتظار استكمال البيانات».
            </p>

            <div className="mt-5">
              <label
                htmlFor="revision-notes"
                className="mb-2 block text-sm font-medium text-[#071B2F]"
              >
                ملاحظات الإدارة للمستفيد
                <span className="mr-1 text-[#B42318]">
                  *
                </span>
              </label>

              <textarea
                id="revision-notes"
                value={revisionNotes}
                onChange={(event) => {
                  setRevisionNotes(event.target.value);
                  if (revisionError) setRevisionError("");
                }}
                maxLength={2000}
                rows={6}
                disabled={revisionSaving}
                placeholder="مثال: يرجى توضيح عنوان البحث وإرفاق خطة البحث، مع تحديد نوع المساعدة المطلوبة بشكل أدق..."
                className="w-full resize-y rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-sm leading-7 text-[#071B2F] outline-none transition focus:border-[#164A68] disabled:opacity-60"
              />

              <p className="mt-1 text-left text-xs text-[#94A3B8]">
                {revisionNotes.length} / 2000
              </p>
            </div>

            {revisionError && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-[#F1C7C7] bg-[#FFF5F5] p-3 text-sm leading-6 text-[#B42318]"
              >
                <AlertCircle
                  size={18}
                  className="mt-1 shrink-0"
                />
                <p>{revisionError}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRequestRevision}
                disabled={
                  revisionSaving ||
                  revisionNotes.trim().length < 5 ||
                  revisionNotes.trim().length > 2000
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {revisionSaving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={18} />
                )}

                {revisionSaving
                  ? "جارٍ إرسال الملاحظات..."
                  : "إرسال الملاحظات للمستفيد"}
              </button>

              <button
                type="button"
                onClick={closeRevisionModal}
                disabled={revisionSaving}
                className="inline-flex w-full items-center justify-center rounded-full border border-[#D7E3EF] px-6 py-3 text-sm font-medium text-[#475569] transition hover:bg-[#F8FBFD] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
