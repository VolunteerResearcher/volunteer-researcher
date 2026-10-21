
import { AdminResearchersPage } from "@/components/pages/admin-dashboard/admin-researchers-page";
import { createClient } from "@/lib/supabase/server";

export default async function ResearchersPage() {
  const supabase = await createClient();

  const [profilesResult, applicationsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, email, role, approval_status, created_at"
      )
      .eq("role", "researcher")
      .order("created_at", { ascending: false }),

    supabase
      .from("researcher_applications")
      .select("id, general_specialization"),
  ]);

  if (profilesResult.error || applicationsResult.error) {
    console.error("Admin researchers loading error:", {
      profiles: profilesResult.error?.message,
      applications: applicationsResult.error?.message,
    });

    throw new Error("تعذر تحميل بيانات الباحثين.");
  }

  const applicationsById = new Map(
    (applicationsResult.data ?? []).map((application) => [
      application.id,
      application,
    ])
  );

  const researchers = (profilesResult.data ?? []).map((profile) => {
    const application = applicationsById.get(profile.id);

    return {
      id: profile.id,
      name: profile.full_name || "بدون اسم",
      email: profile.email || "",
      specialty:
        application?.general_specialization ||
        "لم يُستكمل طلب الانضمام",
      joinDate: profile.created_at || "",
      requestsCount: null,
      status: profile.approval_status || "pending",
      hasCompletedApplication: Boolean(application),
    };
  });

  return <AdminResearchersPage researchers={researchers} />;
}
