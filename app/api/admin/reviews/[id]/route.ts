
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ReviewAction = "approve" | "reject";

// التحقق من صيغة UUID
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: rawId } = await params;

    // تنظيف المسافات المحيطة بالمعرّف
    const id =
      typeof rawId === "string" ? rawId.trim() : "";

    if (!uuidPattern.test(id)) {
      console.error("Invalid review UUID:", {
        value: JSON.stringify(rawId),
        length: rawId?.length,
        normalizedLength: id.length,
      });

      return NextResponse.json(
        { error: "معرّف التقييم غير صالح." },
        { status: 400 }
      );
    }

    // التحقق من تسجيل الدخول
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

    // التحقق من صلاحية الأدمن
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
    const rejectionReason = input.rejectionReason;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "إجراء التقييم غير صالح." },
        { status: 400 }
      );
    }

    const reviewAction: ReviewAction = action;

    // سبب الرفض مطلوب فقط عند رفض التقييم
    if (
      reviewAction === "reject" &&
      (typeof rejectionReason !== "string" ||
        !rejectionReason.trim())
    ) {
      return NextResponse.json(
        { error: "يرجى كتابة سبب رفض التقييم." },
        { status: 400 }
      );
    }

    if (
      reviewAction === "reject" &&
      typeof rejectionReason === "string" &&
      rejectionReason.trim().length > 1000
    ) {
      return NextResponse.json(
        { error: "سبب الرفض طويل جدًا." },
        { status: 400 }
      );
    }

    // استخدام صلاحيات الخادم بعد التأكد من الأدمن
    const admin = createAdminClient();

    // التأكد من وجود التقييم
    const { data: review, error: reviewError } =
      await admin
        .from("consultation_reviews")
        .select("id, status")
        .eq("id", id)
        .maybeSingle();

    if (reviewError) {
      throw reviewError;
    }

    if (!review) {
      return NextResponse.json(
        { error: "التقييم غير موجود." },
        { status: 404 }
      );
    }

    // منع مراجعة تقييم سبق اعتماده أو رفضه
    if (review.status !== "pending") {
      return NextResponse.json(
        {
          error:
            "تمت مراجعة هذا التقييم مسبقًا. يرجى تحديث الصفحة.",
        },
        { status: 409 }
      );
    }

    const newStatus =
      reviewAction === "approve"
        ? "approved"
        : "rejected";

    // تحديث التقييم في Supabase
    const { data: updated, error: updateError } =
      await admin
        .from("consultation_reviews")
        .update({
          status: newStatus,
          rejection_reason:
            reviewAction === "reject" &&
            typeof rejectionReason === "string"
              ? rejectionReason.trim()
              : null,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("status", "pending")
        .select(
          "id, status, rejection_reason, reviewed_at"
        )
        .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "تغيرت حالة التقييم أثناء المراجعة. يرجى تحديث الصفحة.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        reviewAction === "approve"
          ? "تم اعتماد التقييم بنجاح."
          : "تم رفض التقييم وحفظ سبب الرفض بنجاح.",
      review: {
        id: updated.id,
        status: updated.status,
        rejectionReason: updated.rejection_reason,
        reviewedAt: updated.reviewed_at,
      },
    });
  } catch (error) {
    console.error(
      "Admin review moderation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "تعذرت مراجعة التقييم. يرجى المحاولة لاحقًا.",
      },
      { status: 500 }
    );
  }
}
