
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const { data: claimsData, error: authError } =
      await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (authError || !userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولًا." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role, approval_status")
        .eq("id", userId)
        .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.role !== "researcher" ||
      profile.approval_status !== "approved"
    ) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية تنفيذ هذا الإجراء." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const action = body?.action;
    const reason =
      typeof body?.reason === "string"
        ? body.reason.trim()
        : "";

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json(
        { error: "الإجراء غير صالح." },
        { status: 400 }
      );
    }

    if (
      action === "decline" &&
      (reason.length < 5 || reason.length > 1000)
    ) {
      return NextResponse.json(
        {
          error:
            "سبب الاعتذار يجب أن يكون بين 5 و1000 حرف.",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: existingRequest, error: readError } =
      await admin
        .from("consultation_requests")
        .select("id, status, assigned_researcher_id")
        .eq("id", id)
        .maybeSingle();

    if (readError) {
      return NextResponse.json(
        { error: "تعذر التحقق من بيانات الطلب." },
        { status: 500 }
      );
    }

    if (!existingRequest) {
      return NextResponse.json(
        { error: "الطلب غير موجود." },
        { status: 404 }
      );
    }

    if (existingRequest.assigned_researcher_id !== userId) {
      return NextResponse.json(
        { error: "هذا الطلب غير مسند إلى حسابك." },
        { status: 403 }
      );
    }

    if (existingRequest.status !== "assigned") {
      return NextResponse.json(
        { error: "تم الرد على هذا الطلب مسبقًا." },
        { status: 409 }
      );
    }

    const updateData =
      action === "accept"
        ? {
            status: "in_progress",
            updated_at: new Date().toISOString(),
          }
        : {
            status: "pending",
            assigned_researcher_id: null,
            researcher_decline_reason: reason,
            researcher_declined_at:
              new Date().toISOString(),
            last_declined_researcher_id: userId,
            updated_at: new Date().toISOString(),
          };

    const { data: updatedRequest, error: updateError } =
      await admin
        .from("consultation_requests")
        .update(updateData)
        .eq("id", id)
        .eq("status", "assigned")
        .eq("assigned_researcher_id", userId)
        .select("id, status")
        .maybeSingle();

    if (updateError) {
      console.error(
        "Researcher response update error:",
        updateError.message
      );

      return NextResponse.json(
        { error: "تعذر حفظ الرد على الطلب." },
        { status: 500 }
      );
    }

    if (!updatedRequest) {
      return NextResponse.json(
        {
          error:
            "تغيرت حالة الطلب أثناء تنفيذ الإجراء. حدّث الصفحة وحاول مجددًا.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      status: updatedRequest.status,
      message:
        action === "accept"
          ? "تم قبول الطلب وأصبحت حالته قيد التنفيذ."
          : "تم تسجيل اعتذارك وإعادة الطلب إلى الإدارة.",
    });
  } catch (error) {
    console.error("Researcher response API error:", error);

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تنفيذ الإجراء." },
      { status: 500 }
    );
  }
}
