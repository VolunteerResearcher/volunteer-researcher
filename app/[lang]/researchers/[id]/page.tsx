
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  ResearcherProfilePage,
  type ResearcherProfileData,
} from "@/components/pages/researcher-profile/researcher-profile-page";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    lang: string;
    id: string;
  }>;
};

function splitFields(...values: (string | null)[]) {
  return [
    ...new Set(
      values
        .filter((value): value is string => Boolean(value))
        .flatMap((value) =>
          value
            .split(/[,،\n]+/)
            .map((item) => item.trim())
        )
        .filter(Boolean)
    ),
  ];
}

export default async function ResearcherProfile({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // جلب الباحث المعتمد حسب معرفه
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", id)
      .eq("role", "researcher")
      .eq("approval_status", "approved")
      .maybeSingle();

  if (profileError) {
    console.error(
      "Researcher profile error:",
      profileError.message
    );

    throw new Error("تعذر تحميل بيانات الباحث.");
  }

  if (!profile) {
    notFound();
  }

  // جلب بيانات الباحث وتقييماته المعتمدة
  const [applicationResult, reviewsResult] =
    await Promise.all([
      supabase
        .from("researcher_applications")
        .select(
          "id, workplace, general_specialization, detailed_specialization, research_field, researcher_bio, skills_and_expertise"
        )
        .eq("id", profile.id)
        .maybeSingle(),

      supabase
        .from("consultation_reviews")
        .select("rating")
        .eq("researcher_id", profile.id)
        .eq("status", "approved"),
    ]);

  if (applicationResult.error || reviewsResult.error) {
    console.error("Researcher details error:", {
      application: applicationResult.error?.message,
      reviews: reviewsResult.error?.message,
    });

    throw new Error("تعذر تحميل تفاصيل الباحث.");
  }

  const application = applicationResult.data;
  const reviews = reviewsResult.data ?? [];

  const reviewsCount = reviews.length;

  const rating =
    reviewsCount > 0
      ? reviews.reduce(
          (total, review) =>
            total + Number(review.rating),
          0
        ) / reviewsCount
      : 0;

  const researcher: ResearcherProfileData = {
    id: profile.id,
    name: profile.full_name || "باحث متطوع",
    title:
      application?.detailed_specialization ||
      application?.general_specialization ||
      "باحث متطوع",
    location: "الموقع غير محدد",
    university:
      application?.workplace ||
      "جهة العمل غير محددة",
    image: "/brand/researcher.png",
    fields: splitFields(
      application?.research_field ?? null,
      application?.general_specialization ?? null,
      application?.skills_and_expertise ?? null
    ),
    description:
      application?.researcher_bio ||
      "لم يضف الباحث نبذة تعريفية بعد.",
    rating,
    reviewsCount,
  };

  return (
    <ResearcherProfilePage researcher={researcher} />
  );
}
