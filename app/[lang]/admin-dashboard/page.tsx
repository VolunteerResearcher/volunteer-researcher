
import { AdminDashboardPage } from "@/components/pages/admin-dashboard/admin-dashboard-page";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  const [
    beneficiariesResult,
    approvedResearchersResult,
    pendingResearchersResult,
    researcherApplicationsResult,
    pendingApplicationsResult,
    consultationsCountResult,
    pendingConsultationsResult,
    recentConsultationsResult,
    conversationsResult,
    pendingReviewsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "beneficiary"),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "researcher")
      .eq("approval_status", "approved"),

    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "researcher")
      .eq("approval_status", "pending"),

    supabase
      .from("researcher_applications")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("pending_researcher_applications")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("consultation_requests")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("consultation_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("consultation_requests")
      .select(
        "id, title, beneficiary_id, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("consultation_messages")
      .select("consultation_id"),

    supabase
      .from("consultation_reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const results = [
    beneficiariesResult,
    approvedResearchersResult,
    pendingResearchersResult,
    researcherApplicationsResult,
    pendingApplicationsResult,
    consultationsCountResult,
    pendingConsultationsResult,
    recentConsultationsResult,
    conversationsResult,
    pendingReviewsResult,
  ];

  const failedResult = results.find(
    (result) => result.error
  );

  if (failedResult?.error) {
    console.error(
      "Admin dashboard statistics error:",
      failedResult.error.message
    );

    throw new Error(
      "تعذر تحميل إحصائيات لوحة الإدارة."
    );
  }

  // عدد المحادثات الفعلية، وليس عدد الرسائل
  const conversationsCount = new Set(
    (conversationsResult.data ?? []).map(
      (message) => message.consultation_id
    )
  ).size;

  const recentRows = recentConsultationsResult.data ?? [];

  const beneficiaryIds = [
    ...new Set(
      recentRows.map(
        (request) => request.beneficiary_id
      )
    ),
  ];

  const beneficiaryNames = new Map<string, string>();

  if (beneficiaryIds.length > 0) {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", beneficiaryIds);

    if (error) {
      console.error(
        "Admin dashboard beneficiary names error:",
        error.message
      );

      throw new Error(
        "تعذر تحميل أسماء المستفيدين."
      );
    }

    for (const profile of profiles ?? []) {
      beneficiaryNames.set(
        profile.id,
        profile.full_name || "مستفيد"
      );
    }
  }

  const recentRequests = recentRows.map((request) => ({
    id: request.id,
    title: request.title,
    beneficiary:
      beneficiaryNames.get(request.beneficiary_id) ??
      "مستفيد",
    status: request.status,
  }));

  return (
    <AdminDashboardPage
      beneficiariesCount={
        beneficiariesResult.count ?? 0
      }
      approvedResearchersCount={
        approvedResearchersResult.count ?? 0
      }
      pendingResearchersCount={
        pendingResearchersResult.count ?? 0
      }
      researcherApplicationsCount={
        researcherApplicationsResult.count ?? 0
      }
      pendingApplicationsCount={
        pendingApplicationsResult.count ?? 0
      }
      consultationsCount={
        consultationsCountResult.count ?? 0
      }
      conversationsCount={conversationsCount}
      pendingConsultationsCount={
        pendingConsultationsResult.count ?? 0
      }
      pendingReviewsCount={
        pendingReviewsResult.count ?? 0
      }
      recentRequests={recentRequests}
    />
  );
}
