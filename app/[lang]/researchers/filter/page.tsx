
import { ResearchersFilterPage } from "@/components/pages/researchers-filter/researchers-filter-page";
import type { PublicResearcher } from "@/components/pages/researchers/researchers-page";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function splitFields(...values: (string | null)[]) {
  return [
    ...new Set(
      values
        .filter((value): value is string => Boolean(value))
        .flatMap((value) =>
          value.split(/[,،\n]+/).map((item) => item.trim())
        )
        .filter(Boolean)
    ),
  ];
}

export default async function ResearchersFilter() {
  const supabase = await createClient();

  // جلب الباحثين المعتمدين فقط
  const { data: profiles, error: profilesError } =
    await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "researcher")
      .eq("approval_status", "approved");

  if (profilesError) {
    console.error(
      "Researchers filter profiles error:",
      profilesError.message
    );

    throw new Error("تعذر تحميل الباحثين.");
  }

  const researcherIds = (profiles ?? []).map(
    (profile) => profile.id
  );

  if (researcherIds.length === 0) {
    return <ResearchersFilterPage researchers={[]} />;
  }

  // بيانات الباحثين والتقييمات المعتمدة فقط
  const [applicationsResult, reviewsResult] =
    await Promise.all([
      supabase
        .from("researcher_applications")
        .select(
          "id, workplace, general_specialization, detailed_specialization, research_field, researcher_bio, skills_and_expertise"
        )
        .in("id", researcherIds),

      supabase
        .from("consultation_reviews")
        .select("researcher_id, rating")
        .in("researcher_id", researcherIds)
        .eq("status", "approved"),
    ]);

  if (applicationsResult.error || reviewsResult.error) {
    console.error("Researchers filter loading error:", {
      applications: applicationsResult.error?.message,
      reviews: reviewsResult.error?.message,
    });

    throw new Error("تعذر تحميل بيانات الباحثين وتقييماتهم.");
  }

  const applicationsById = new Map(
    (applicationsResult.data ?? []).map((application) => [
      application.id,
      application,
    ])
  );

  const ratingsByResearcher = new Map<
    string,
    { total: number; count: number }
  >();

  for (const review of reviewsResult.data ?? []) {
    const current = ratingsByResearcher.get(
      review.researcher_id
    ) ?? { total: 0, count: 0 };

    current.total += Number(review.rating);
    current.count += 1;

    ratingsByResearcher.set(review.researcher_id, current);
  }

  const researchers: PublicResearcher[] = (profiles ?? []).map(
    (profile) => {
      const application = applicationsById.get(profile.id);
      const reviews = ratingsByResearcher.get(profile.id);

      return {
        id: profile.id,
        name: profile.full_name || "باحث متطوع",
        title:
          application?.detailed_specialization ||
          application?.general_specialization ||
          "باحث متطوع",
        university:
          application?.workplace || "جهة العمل غير محددة",
        image: "/brand/researcher.png",
        fields: splitFields(
          application?.research_field ?? null,
          application?.general_specialization ?? null,
          application?.skills_and_expertise ?? null
        ),
        description:
          application?.researcher_bio ||
          "لم يضف الباحث نبذة تعريفية بعد.",
        rating:
          reviews && reviews.count > 0
            ? reviews.total / reviews.count
            : 0,
        reviewsCount: reviews?.count ?? 0,
      };
    }
  );

  return <ResearchersFilterPage researchers={researchers} />;
}
