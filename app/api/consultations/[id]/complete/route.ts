
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولًا." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: consultation, error: consultationError } =
      await admin
        .from("consultation_requests")
        .select(
          "id, beneficiary_id, assigned_researcher_id, status"
        )
        .eq("id", id)
        .maybeSingle();

    if (consultationError) {
      return NextResponse.json(
        { error: "تعذر التحقق من الطلب." },
        { status: 500 }
      );
    }

    if (!consultation) {
      return NextResponse.json(
        { error: "الطلب غير موجود." },
        { status: 404 }
      );
    }

    const isBeneficiary =
      consultation.beneficiary_id === user.id;

    const isResearcher =
      consultation.assigned_researcher_id === user.id;

    if (!isBeneficiary && !isResearcher) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية إنهاء هذا الطلب." },
        { status: 403 }
      );
    }

    if (consultation.status !== "in_progress") {
      return NextResponse.json(
        { error: "يمكن إنهاء الطلبات قيد التنفيذ فقط." },
        { status: 409 }
      );
    }

    const completedAt = new Date().toISOString();

    const { data: updated, error: updateError } = await admin
      .from("consultation_requests")
      .update({
        status: "completed",
        completed_by: user.id,
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq("id", id)
      .eq("status", "in_progress")
      .select("id, status, completed_by, completed_at")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        { error: "تعذر إنهاء الطلب." },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { error: "تم تغيير حالة الطلب بالفعل. حدّث الصفحة." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      consultation: updated,
    });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء إنهاء الطلب." },
      { status: 500 }
    );
  }
}
