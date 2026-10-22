
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = createAdminClient();

    // جلب الباحثين المعتمدين فقط
    const {
      data: approvedResearchers,
      error: researchersError,
    } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "researcher")
      .eq("approval_status", "approved");

    if (researchersError) {
      throw researchersError;
    }

    const researcherIds = (
      approvedResearchers ?? []
    ).map((researcher) => researcher.id);

    let researchFieldsCount = 0;
    let specializationsCount = 0;

    // جلب المجالات والتخصصات للباحثين المعتمدين
    if (researcherIds.length > 0) {
      const {
        data: applications,
        error: applicationsError,
      } = await admin
        .from("researcher_applications")
        .select(
          "research_field, general_specialization"
        )
        .in("id", researcherIds);

      if (applicationsError) {
        throw applicationsError;
      }

      researchFieldsCount = new Set(
        (applications ?? [])
          .map((item) => item.research_field?.trim())
          .filter(Boolean)
      ).size;

      specializationsCount = new Set(
        (applications ?? [])
          .map((item) =>
            item.general_specialization?.trim()
          )
          .filter(Boolean)
      ).size;
    }

    // إجمالي الطلبات والاستشارات المكتملة
    const [requestsResult, completedResult] =
      await Promise.all([
        admin
          .from("consultation_requests")
          .select("*", {
            count: "exact",
            head: true,
          }),

        admin
          .from("consultation_requests")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("status", "completed"),
      ]);

    if (requestsResult.error) {
      throw requestsResult.error;
    }

    if (completedResult.error) {
      throw completedResult.error;
    }

    return NextResponse.json(
      {
        researchers: researcherIds.length,
        researchFields: researchFieldsCount,
        requests: requestsResult.count ?? 0,
        completedConsultations:
          completedResult.count ?? 0,
        specializations: specializationsCount,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Public statistics API error:",
      error
    );

    return NextResponse.json(
      { error: "تعذر تحميل الإحصائيات." },
      { status: 500 }
    );
  }
}
