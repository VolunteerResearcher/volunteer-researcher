
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "رقم الطلب غير صالح." },
        { status: 400 }
      );
    }

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

    // التأكد من أن المستخدم باحث متطوع
    const { data: profile, error: profileError } =
      await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Complete consultation profile error:",
        profileError
      );

      return NextResponse.json(
        { error: "تعذر التحقق من صلاحيات المستخدم." },
        { status: 500 }
      );
    }

    if (profile?.role !== "researcher") {
      return NextResponse.json(
        {
          error:
            "إنهاء الاستشارة متاح للباحث المعيّن فقط.",
        },
        { status: 403 }
      );
    }

    // جلب الطلب للتحقق من الباحث وحالة الاستشارة
    const {
      data: consultation,
      error: consultationError,
    } = await admin
      .from("consultation_requests")
      .select("id, assigned_researcher_id, status")
      .eq("id", id)
      .maybeSingle();

    if (consultationError) {
      console.error(
        "Complete consultation lookup error:",
        consultationError
      );

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

    if (
      consultation.assigned_researcher_id !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكنك إنهاء استشارة مسندة إلى باحث آخر.",
        },
        { status: 403 }
      );
    }

    if (consultation.status !== "in_progress") {
      return NextResponse.json(
        {
          error:
            "يمكن إنهاء الاستشارات قيد التنفيذ فقط.",
        },
        { status: 409 }
      );
    }

    const completedAt = new Date().toISOString();

    // تحديث مشروط لمنع الإنهاء المكرر
    const { data: updated, error: updateError } =
      await admin
        .from("consultation_requests")
        .update({
          status: "completed",
          completed_by: user.id,
          completed_at: completedAt,
          updated_at: completedAt,
        })
        .eq("id", id)
        .eq("assigned_researcher_id", user.id)
        .eq("status", "in_progress")
        .select(
          "id, status, completed_by, completed_at"
        )
        .maybeSingle();

    if (updateError) {
      console.error(
        "Complete consultation update error:",
        updateError
      );

      return NextResponse.json(
        { error: "تعذر إنهاء الاستشارة." },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "تغيّرت حالة الاستشارة بالفعل. يرجى تحديث الصفحة.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم إنهاء الاستشارة بنجاح.",
      consultation: updated,
    });
  } catch (error) {
    console.error(
      "Unexpected complete consultation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "حدث خطأ غير متوقع أثناء إنهاء الاستشارة.",
      },
      { status: 500 }
    );
  }
}
