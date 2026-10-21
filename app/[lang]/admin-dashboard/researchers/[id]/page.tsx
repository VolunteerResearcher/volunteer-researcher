
import { AdminResearcherDetails } from "@/components/pages/admin-dashboard/admin-researcher-details";
import { createClient } from "@/lib/supabase/server";

type AdminResearcherDetailsPageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

export default async function AdminResearcherDetailsPage({
  params,
}: AdminResearcherDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role, approval_status, rejection_reason, created_at"
      )
      .eq("id", id)
      .eq("role", "researcher")
      .maybeSingle();

  if (profileError) {
    console.error(
      "Researcher profile error:",
      profileError.message
    );

    throw new Error("تعذر تحميل بيانات الباحث.");
  }

  if (!profile) {
    return <AdminResearcherDetails researcher={null} />;
  }

  const { data: application, error: applicationError } =
    await supabase
      .from("researcher_applications")
      .select(
        "id, phone, workplace, general_specialization, detailed_specialization, research_field, researcher_bio, skills_and_expertise, cv_path, created_at"
      )
      .eq("id", profile.id)
      .maybeSingle();

  if (applicationError) {
    console.error(
      "Researcher application error:",
      applicationError.message
    );

    throw new Error("تعذر تحميل طلب انضمام الباحث.");
  }

  const researcher = {
    id: profile.id,
    name: profile.full_name || "غير متوفر",
    email: profile.email || "غير متوفر",
    status: profile.approval_status || "pending",
    joinDate: profile.created_at || "",
    rejectionReason: profile.rejection_reason || "",
    specialty:
      application?.general_specialization || "غير متوفر",
    detailedSpecialty:
      application?.detailed_specialization || "غير متوفر",
    researchField:
      application?.research_field || "غير متوفر",
    researcherBio: application?.researcher_bio || "",
    skillsAndExpertise:
      application?.skills_and_expertise || "",
    phone: application?.phone || "غير متوفر",
    workplace: application?.workplace || "غير متوفر",
    cvPath: application?.cv_path || null,
    hasCompletedApplication: Boolean(application),
    requestsCount: null,
  };

  return (
    <AdminResearcherDetails researcher={researcher} />
  );
}
