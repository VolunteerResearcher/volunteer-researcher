
import { ResearcherDashboardPage } from "@/components/pages/researcher-dashboard/researcher-dashboard-page";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const helpTypeLabels: Record<string, string> = {
  research: "استشارة بحثية",
  methodology: "منهجية البحث",
  analysis: "تحليل البيانات",
  review: "مراجعة بحثية",
  other: "أخرى",
};

const statusLabels: Record<string, string> = {
  assigned: "طلب جديد",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  rejected: "معتذر عن الطلب",
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang === "en" ? "en" : "ar";

  const supabase = await createClient();

  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (authError || !userId) {
    redirect(`/${locale}/researcher-login`);
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("full_name, role, approval_status")
      .eq("id", userId)
      .maybeSingle();

  if (profileError || !profile) {
    throw new Error("تعذر تحميل بيانات الباحث.");
  }

  if (profile.role !== "researcher") {
    redirect(`/${locale}/profile`);
  }

  if (profile.approval_status !== "approved") {
    redirect(`/${locale}/researcher-status`);
  }

  const [
    applicationResult,
    requestsResult,
  ] = await Promise.all([
    supabase
      .from("researcher_applications")
      .select("general_specialization")
      .eq("id", userId)
      .maybeSingle(),

    supabase
      .from("consultation_requests")
      .select(
        "id, title, help_type, status, created_at"
      )
      .eq("assigned_researcher_id", userId)
      .in("status", [
        "assigned",
        "in_progress",
        "completed",
        "rejected",
      ])
      .order("created_at", { ascending: false }),
  ]);

  if (applicationResult.error) {
    console.error(
      "Researcher application loading error:",
      applicationResult.error.message
    );
  }

  if (requestsResult.error) {
    console.error(
      "Researcher requests loading error:",
      requestsResult.error.message
    );

    throw new Error(
      "تعذر تحميل الطلبات المسندة للباحث."
    );
  }

  const requests = (requestsResult.data ?? []).map(
    (request) => ({
      id: request.id,
      title: request.title,
      type:
        helpTypeLabels[request.help_type] ??
        request.help_type,
      field: "غير محدد في الطلب",
      date: new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Riyadh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(new Date(request.created_at))
        .replaceAll("-", "/"),
      status:
        statusLabels[request.status] ??
        "غير محدد",
    })
  );

  return (
    <ResearcherDashboardPage
      researcher={{
        name: profile.full_name || "باحث متطوع",
        specialization:
          applicationResult.data?.general_specialization ||
          "غير محدد",
      }}
      requests={requests}
    />
  );
}
