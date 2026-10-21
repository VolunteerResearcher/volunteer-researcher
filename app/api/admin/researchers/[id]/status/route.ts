
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ResearcherAction =
  | "approve"
  | "reject"
  | "suspend"
  | "reactivate";

const allowedTransitions: Record<
  ResearcherAction,
  { from: string; to: string }
> = {
  approve: {
    from: "pending",
    to: "approved",
  },
  reject: {
    from: "pending",
    to: "rejected",
  },
  suspend: {
    from: "approved",
    to: "suspended",
  },
  reactivate: {
    from: "suspended",
    to: "approved",
  },
};

const actionMessages: Record<ResearcherAction, string> = {
  approve: "تمت الموافقة على انضمام الباحث بنجاح.",
  reject: "تم رفض طلب انضمام الباحث.",
  suspend: "تم إيقاف حساب الباحث مؤقتًا.",
  reactivate: "تمت إعادة تفعيل حساب الباحث بنجاح.",
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    // التحقق من صحة معرف الباحث
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return NextResponse.json(
        { error: "معرّف الباحث غير صالح." },
        { status: 400 }
      );
    }

    // التحقق من جلسة تسجيل الدخول
    const supabase = await createClient();

    const {
      data: claimsData,
      error: authError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (authError || !userId) {
      return NextResponse.json(
        { error: "يرجى تسجيل الدخول أولًا." },
        { status: 401 }
      );
    }

    // التأكد من صلاحية المدير
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

    // قراءة بيانات الطلب
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
    const action = input.action;

    if (
      action !== "approve" &&
      action !== "reject" &&
      action !== "suspend" &&
      action !== "reactivate"
    ) {
      return NextResponse.json(
        { error: "الإجراء المطلوب غير صالح." },
        { status: 400 }
      );
    }

    const researcherAction: ResearcherAction = action;

    const rejectionReason =
      typeof input.reason === "string"
        ? input.reason.trim()
        : "";

    // سبب الرفض إلزامي
    if (
      researcherAction === "reject" &&
      (rejectionReason.length < 5 ||
        rejectionReason.length > 1000)
    ) {
      return NextResponse.json(
        {
          error: "يرجى كتابة سبب الرفض من 5 إلى 1000 حرف.",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // جلب بيانات الباحث
    const { data: researcher, error: researcherError } =
      await admin
        .from("profiles")
        .select("id, role, approval_status")
        .eq("id", id)
        .eq("role", "researcher")
        .maybeSingle();

    if (researcherError) {
      throw researcherError;
    }

    if (!researcher) {
      return NextResponse.json(
        { error: "الباحث غير موجود." },
        { status: 404 }
      );
    }

    // تحديد الحالة المطلوبة والحالة السابقة الصحيحة
    const transition = allowedTransitions[researcherAction];

    if (researcher.approval_status !== transition.from) {
      return NextResponse.json(
        {
          error:
            "لا يمكن تنفيذ هذا الإجراء على حالة الباحث الحالية. يرجى تحديث الصفحة.",
        },
        { status: 409 }
      );
    }

    // التحقق من اكتمال طلب الباحث عند الموافقة أو الرفض
    if (
      researcherAction === "approve" ||
      researcherAction === "reject"
    ) {
      const {
        data: application,
        error: applicationError,
      } = await admin
        .from("researcher_applications")
        .select("id, cv_path")
        .eq("id", id)
        .maybeSingle();

      if (applicationError) {
        throw applicationError;
      }

      if (!application?.cv_path) {
        return NextResponse.json(
          {
            error:
              "لا يمكن مراجعة الطلب قبل اكتمال بيانات الباحث وسيرته الذاتية.",
          },
          { status: 409 }
        );
      }
    }

    // تحديث حالة الباحث فقط
    const updateData: {
      approval_status: string;
      rejection_reason?: string | null;
    } = {
      approval_status: transition.to,
    };

    if (researcherAction === "reject") {
      updateData.rejection_reason = rejectionReason;
    } else if (researcherAction === "approve") {
      updateData.rejection_reason = null;
    }

    const { data: updated, error: updateError } =
      await admin
        .from("profiles")
        .update(updateData)
        .eq("id", id)
        .eq("role", "researcher")
        .eq("approval_status", transition.from)
        .select("id, approval_status")
        .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "تم تغيير حالة الباحث بالفعل. يرجى تحديث الصفحة.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      status: updated.approval_status,
      message: actionMessages[researcherAction],
    });
  } catch (error) {
    console.error("Admin researcher status error:", error);

    return NextResponse.json(
      {
        error: "تعذر تنفيذ الإجراء. يرجى المحاولة لاحقًا.",
      },
      { status: 500 }
    );
  }
}
