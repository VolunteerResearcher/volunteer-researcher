
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!uuidPattern.test(id)) {
      return NextResponse.json(
        { error: "معرّف الطلب غير صالح." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: claimsData, error: authError } =
      await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (authError || !userId) {
      return NextResponse.json(
        { error: "يرجى تسجيل الدخول أولًا." },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: adminError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (adminError || adminProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية تنفيذ هذا الإجراء." },
        { status: 403 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "بيانات الطلب غير صالحة." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "بيانات الطلب غير صالحة." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const researcherId = input.researcherId;

    if (
      typeof researcherId !== "string" ||
      !uuidPattern.test(researcherId)
    ) {
      return NextResponse.json(
        { error: "يرجى اختيار باحث صالح." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: researcher, error: researcherError } =
      await admin
        .from("profiles")
        .select("id, full_name, role, approval_status")
        .eq("id", researcherId)
        .eq("role", "researcher")
        .eq("approval_status", "approved")
        .maybeSingle();

    if (researcherError) {
      throw researcherError;
    }

    if (!researcher) {
      return NextResponse.json(
        { error: "الباحث غير موجود أو غير معتمد." },
        { status: 404 }
      );
    }

    const { data: consultation, error: consultationError } =
      await admin
        .from("consultation_requests")
        .select(
          "id, status, assigned_researcher_id, last_declined_researcher_id"
        )
        .eq("id", id)
        .maybeSingle();

    if (consultationError) {
      throw consultationError;
    }

    if (!consultation) {
      return NextResponse.json(
        { error: "طلب الاستشارة غير موجود." },
        { status: 404 }
      );
    }

    if (
      consultation.status !== "pending" ||
      consultation.assigned_researcher_id
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن إسناد هذا الطلب في حالته الحالية. يرجى تحديث الصفحة.",
        },
        { status: 409 }
      );
    }

    if (
      consultation.last_declined_researcher_id === researcherId
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن إعادة إسناد الطلب إلى آخر باحث اعتذر عنه. يرجى اختيار باحث آخر.",
        },
        { status: 409 }
      );
    }

    const { data: updated, error: updateError } =
      await admin
        .from("consultation_requests")
        .update({
          assigned_researcher_id: researcherId,
          status: "assigned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("status", "pending")
        .is("assigned_researcher_id", null)
        .or(
          `last_declined_researcher_id.is.null,last_declined_researcher_id.neq.${researcherId}`
        )
        .select("id, status, assigned_researcher_id")
        .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "تغيرت بيانات الطلب أو الباحث المختار غير متاح للإسناد. يرجى تحديث الصفحة.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `تم إسناد الطلب إلى ${
        researcher.full_name || "الباحث"
      } بنجاح.`,
      status: updated.status,
      assignedResearcherId:
        updated.assigned_researcher_id,
    });
  } catch (error) {
    console.error(
      "Admin consultation assignment error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "تعذر إسناد الطلب. يرجى المحاولة لاحقًا.",
      },
      { status: 500 }
    );
  }
}
