
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
} from "lucide-react";

type RequestStatus =
  | "pending"
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
  status: RequestStatus;
  created_at: string;
  researcher_decline_reason: string | null;
  researcher_declined_at: string | null;
  last_declined_researcher_id: string | null;
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
  assigned: "تحت المراجعة",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "معتذر عن الطلب",
};

const statusStyles: Record<RequestStatus, string> = {
  pending: "bg-[#EAF2F8] text-[#164A68]",
  assigned: "bg-[#FFF5E6] text-[#A16207]",
  in_progress: "bg-[#E8F7EE] text-[#2E7D4F]",
  completed: "bg-[#E8F7EE] text-[#2E7D4F]",
  rejected: "bg-[#FDECEC] text-[#B42318]",
};

function formatDate(date: string | null) {
  if (!date) return "غير محدد";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "غير محدد";
  }

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
    <div>
      <p className="text-xs text-[#64748B]">
        {label}
      </p>

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
  const [request, setRequest] =
    useState<RequestData | null>(null);

  const [beneficiaryName, setBeneficiaryName] =
    useState("مستفيد");

  const [
    assignedResearcherName,
    setAssignedResearcherName,
  ] = useState("");

  const [
    declinedResearcherName,
    setDeclinedResearcherName,
  ] = useState("");

  const [researchers, setResearchers] =
    useState<Researcher[]>([]);

  const [
    selectedResearcher,
    setSelectedResearcher,
  ] = useState("");

  const [adminNote, setAdminNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = createClient();

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error(
          "يرجى تسجيل الدخول أولًا."
        );
      }

      const {
        data: adminProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (
        profileError ||
        adminProfile?.role !== "admin"
      ) {
        throw new Error(
          "ليس لديك صلاحية الاطلاع على هذا الطلب."
        );
      }

      const {
        data: consultation,
        error: requestError,
      } = await supabase
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
            "status",
            "created_at",
            "researcher_decline_reason",
            "researcher_declined_at",
            "last_declined_researcher_id",
          ].join(",")
        )
        .eq("id", requestId)
        .maybeSingle();

      if (requestError) {
        throw requestError;
      }

      if (!consultation) {
        throw new Error("الطلب غير موجود.");
      }

      const currentRequest =
        consultation as unknown as RequestData;

      setRequest(currentRequest);

      const {
        data: beneficiary,
        error: beneficiaryError,
      } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentRequest.beneficiary_id)
        .maybeSingle();

      if (beneficiaryError) {
        throw beneficiaryError;
      }

      setBeneficiaryName(
        beneficiary?.full_name || "مستفيد"
      );

      const {
        data: approvedProfiles,
        error: researchersError,
      } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "researcher")
        .eq("approval_status", "approved")
        .order("full_name", {
          ascending: true,
        });

      if (researchersError) {
        throw researchersError;
      }

      const profiles = approvedProfiles ?? [];

      let specializationMap =
        new Map<string, string>();

      if (profiles.length > 0) {
        const {
          data: applications,
          error: applicationsError,
        } = await supabase
          .from("researcher_applications")
          .select("id, general_specialization")
          .in(
            "id",
            profiles.map((profile) => profile.id)
          );

        if (applicationsError) {
          throw applicationsError;
        }

        specializationMap = new Map(
          (applications ?? []).map(
            (application) => [
              application.id,
              application.general_specialization ||
                "غير محدد",
            ]
          )
        );
      }

      setResearchers(
        profiles.map((profile) => ({
          id: profile.id,
          full_name:
            profile.full_name || "باحث متطوع",
          field:
            specializationMap.get(profile.id) ||
            "غير محدد",
        }))
      );

      if (currentRequest.assigned_researcher_id) {
        const {
          data: assignedProfile,
          error: assignedError,
        } = await supabase
          .from("profiles")
          .select("full_name")
          .eq(
            "id",
            currentRequest.assigned_researcher_id
          )
          .maybeSingle();

        if (assignedError) {
          throw assignedError;
        }

        setAssignedResearcherName(
          assignedProfile?.full_name ||
            "باحث متطوع"
        );

        setSelectedResearcher(
          currentRequest.assigned_researcher_id
        );
      } else {
        setAssignedResearcherName("");
        setSelectedResearcher("");
      }

      if (
        currentRequest.last_declined_researcher_id
      ) {
        const {
          data: declinedProfile,
          error: declinedError,
        } = await supabase
          .from("profiles")
          .select("full_name")
          .eq(
            "id",
            currentRequest.last_declined_researcher_id
          )
          .maybeSingle();

        if (declinedError) {
          throw declinedError;
        }

        setDeclinedResearcherName(
          declinedProfile?.full_name ||
            "باحث متطوع"
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
    if (!request || saving) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedResearcher) {
      setErrorMessage(
        "يرجى اختيار الباحث أولًا."
      );
      return;
    }

    if (
      selectedResearcher ===
      request.last_declined_researcher_id
    ) {
      setErrorMessage(
        "لا يمكن إعادة إسناد الطلب إلى آخر باحث اعتذر عنه. يرجى اختيار باحث آخر."
      );
      return;
    }

    if (
      request.status !== "pending" ||
      request.assigned_researcher_id
    ) {
      setErrorMessage(
        "لا يمكن إسناد الطلب في حالته الحالية."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/consultations/${encodeURIComponent(
          request.id
        )}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            researcherId: selectedResearcher,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "تعذر إسناد الطلب."
        );
      }

      setSuccessMessage(
        result.message ||
          "تم إسناد الطلب بنجاح."
      );

      setRequest((current) =>
        current
          ? {
              ...current,
              status: "assigned",
              assigned_researcher_id:
                selectedResearcher,
            }
          : current
      );

      const researcher = researchers.find(
        (item) =>
          item.id === selectedResearcher
      );

      setAssignedResearcherName(
        researcher?.full_name ||
          "باحث متطوع"
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

  const handleAttachment = async () => {
    if (!request?.attachment_path) return;

    setErrorMessage("");

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.storage
          .from("consultation-attachments")
          .createSignedUrl(
            request.attachment_path,
            60
          );

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
        className="min-h-screen p-8 text-[#071B2F]"
      >
        <div className="flex items-center gap-3 text-sm text-[#64748B]">
          <RefreshCw
            size={18}
            className="animate-spin"
          />
          جاري تحميل تفاصيل الطلب...
        </div>
      </main>
    );
  }

  if (!request) {
    return (
      <main
        dir="rtl"
        className="min-h-screen p-8"
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
    status === "pending" &&
    !request.assigned_researcher_id;

  const hasResearcherDecline =
    Boolean(
      request.last_declined_researcher_id
    ) &&
    Boolean(
      request.researcher_decline_reason
    );

  const formattedDate =
    formatDate(request.created_at);

  return (
    <main
      dir="rtl"
      className="min-h-screen px-4 py-8 text-[#071B2F] sm:px-7 lg:px-10"
    >
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
        <div>
          <p className="text-sm text-[#64748B]">
            إدارة الطلبات / #
            {request.id.slice(0, 8)}
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
          {statusLabels[status] ??
            "غير محدد"}
        </span>
      </div>

      {/* رسائل النجاح والخطأ */}
      {successMessage && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-[#D7E3EF] bg-white p-4 text-sm text-[#164A68]"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-[#F1C7C7] bg-[#FFF5F5] p-4 text-sm text-[#B42318]"
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
              helpTypeLabels[
                request.help_type
              ] || request.help_type
            }
          />

          <DetailItem
            label="المجال البحثي"
            value="لم يُحدد مجال بحثي مستقل في الطلب"
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

        <p className="whitespace-pre-wrap text-sm leading-8 text-[#475569]">
          {request.description}
        </p>

        {request.additional_notes && (
          <div className="mt-5 rounded-xl bg-[#F8FBFD] p-4">
            <p className="text-sm font-semibold">
              ملاحظات إضافية من المستفيد
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#475569]">
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
                {declinedResearcherName ||
                  "باحث متطوع"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#D7E3EF] bg-[#F8FBFD] p-5">
              <p className="text-xs text-[#64748B]">
                تاريخ الاعتذار
              </p>

              <p className="mt-2 text-sm font-semibold text-[#071B2F]">
                {formatDate(
                  request.researcher_declined_at
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#F1C7C7] bg-[#FFF8F8] p-5">
            <p className="mb-2 text-sm font-semibold text-[#B4233A]">
              سبب الاعتذار
            </p>

            <p className="whitespace-pre-wrap text-sm leading-8 text-[#475569]">
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
                عاد الطلب إلى الإدارة بعد اعتذار
                الباحث. يمكنك اختيار باحث متطوع
                آخر من قسم مراجعة الطلب واتخاذ
                الإجراء أدناه.
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
            يمكنك اختيار باحث متطوع معتمد
            وإسناد الطلب إليه. وستُحفظ عملية
            الإسناد في قاعدة البيانات.
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
                setSelectedResearcher(
                  event.target.value
                )
              }
              disabled={saving}
              className="w-full rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-sm outline-none focus:border-[#164A68] disabled:opacity-60"
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
                    {researcher.full_name} —{" "}
                    {researcher.field}
                    {previouslyDeclined
                      ? " (اعتذر عن هذا الطلب)"
                      : ""}
                  </option>
                );
              })}
            </select>

            {researchers.length === 0 && (
              <p className="mt-2 text-xs text-[#B42318]">
                لا يوجد باحثون معتمدون متاحون
                للإسناد حاليًا.
              </p>
            )}

            {request.last_declined_researcher_id && (
              <p className="mt-2 text-xs leading-6 text-[#64748B]">
                الباحث الذي اعتذر عن هذا الطلب
                غير متاح لإعادة الإسناد.
              </p>
            )}
          </div>

          {/* ملاحظة الإدارة */}
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
                setAdminNote(
                  event.target.value
                )
              }
              rows={3}
              disabled
              placeholder="سيتم تفعيل حفظ ملاحظات الإدارة في خطوة لاحقة..."
              className="w-full resize-none rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] p-4 text-sm outline-none disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-[#64748B]">
              حفظ ملاحظات الإدارة غير مفعّل
              حاليًا؛ لن تُرسل أي ملاحظة مع
              الإسناد.
            </p>
          </div>

          {/* أزرار الإدارة */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAssign}
              disabled={
                saving ||
                !selectedResearcher ||
                selectedResearcher ===
                  request.last_declined_researcher_id
              }
              className="inline-flex items-center gap-2 rounded-full bg-[#164A68] px-5 py-3 text-sm font-medium text-white hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={17} />

              {saving
                ? "جاري إسناد الطلب..."
                : "اعتماد وإرسال للباحث"}
            </button>

            <button
              type="button"
              disabled
              title="سيتم تفعيلها بعد ربط حفظ طلبات المعلومات الإضافية"
              className="inline-flex items-center gap-2 rounded-full border border-[#D7E3EF] px-5 py-3 text-sm text-[#164A68] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageSquareText size={17} />
              طلب معلومات إضافية
            </button>

            <button
              type="button"
              disabled
              title="سيتم تفعيلها بعد ربط حفظ أسباب اعتذار الإدارة"
              className="inline-flex items-center gap-2 rounded-full border border-[#F1C7C7] px-5 py-3 text-sm text-[#B42318] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={17} />
              الاعتذار عن الطلب
            </button>
          </div>
        </section>
      )}

      {/* الطلب بانتظار الباحث */}
      {status === "assigned" && (
        <section className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-6">
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
                {assignedResearcherName ||
                  "الباحث المعيّن"}
                ، وهو الآن بانتظار معالجة
                الباحث له.
              </p>

              <p className="mt-3 text-xs leading-6 text-[#94A3B8]">
                تم حفظ الإسناد في قاعدة
                البيانات. يستطيع الباحث قبول
                الطلب أو الاعتذار عنه من لوحة
                الباحث.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* الطلب قيد التنفيذ */}
      {status === "in_progress" && (
        <section className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={22}
              className="text-[#2E7D4F]"
            />

            <div>
              <h2 className="font-semibold">
                الطلب قيد التنفيذ
              </h2>

              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                الطلب قيد التنفيذ لدى{" "}
                {assignedResearcherName ||
                  "الباحث المعيّن"}
                .
              </p>
            </div>
          </div>
        </section>
      )}

      {/* الطلب مكتمل */}
      {status === "completed" && (
        <section className="mt-5 rounded-[24px] border border-[#D7E3EF] bg-white p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={22}
              className="text-[#2E7D4F]"
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
        <section className="mt-5 rounded-[24px] border border-[#F1C7C7] bg-white p-6">
          <div className="flex items-center gap-3">
            <XCircle
              size={22}
              className="text-[#B42318]"
            />

            <div>
              <h2 className="font-semibold">
                تم الاعتذار عن الطلب
              </h2>

              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                حالة الطلب مسجلة في قاعدة
                البيانات كمعتذر عنه.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* زر عرض المحادثة للإدارة - الإضافة الجديدة */}
      {(status === "in_progress" ||
        status === "completed") && (
        <div className="mt-7 flex justify-end">
          <Link
            href={`/ar/admin-dashboard/requests/${request.id}/conversation`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#123E58]"
          >
            <MessagesSquare size={19} />
            عرض المحادثة
          </Link>
        </div>
      )}

      <p className="mt-7 text-center text-xs leading-6 text-[#94A3B8]">
        تفاصيل الطلب وإسناده مرتبطة بقاعدة
        البيانات. سيتم تفعيل بقية إجراءات
        الإدارة بعد تجهيز الحقول والصلاحيات
        اللازمة لها.
      </p>
    </main>
  );
}
