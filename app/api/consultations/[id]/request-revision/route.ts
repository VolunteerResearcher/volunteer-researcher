
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
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

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية تنفيذ هذا الإجراء." },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        { error: "رقم الطلب غير صالح." },
        { status: 400 }
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

    const notes =
      typeof body === "object" &&
      body !== null &&
      "notes" in body &&
      typeof body.notes === "string"
        ? body.notes.trim()
        : "";

    if (notes.length < 5 || notes.length > 2000) {
      return NextResponse.json(
        { error: "يرجى كتابة الملاحظات من 5 إلى 2000 حرف." },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await admin
      .from("consultation_requests")
      .update({
        status: "needs_revision",
        admin_revision_notes: notes,
        revision_requested_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .is("assigned_researcher_id", null)
      .select("id, status, admin_revision_notes")
      .maybeSingle();

    if (updateError) {
      console.error("Request revision error:", updateError);

      return NextResponse.json(
        { error: "تعذر حفظ ملاحظات الإدارة." },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "لا يمكن إرجاع هذا الطلب؛ ربما تغيرت حالته أو تم إسناده لباحث.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      status: updated.status,
      notes: updated.admin_revision_notes,
      message: "تم إرجاع الطلب للمستفيد مع الملاحظات بنجاح.",
    });
  } catch (error) {
    console.error("Unexpected request revision error:", error);

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء معالجة الطلب." },
      { status: 500 }
    );
  }
}
