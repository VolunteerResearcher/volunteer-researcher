
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    // التحقق من صحة معرف الباحث
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        { error: "معرّف الباحث غير صالح." },
        { status: 400 }
      );
    }

    // التحقق من تسجيل دخول المستخدم
    const supabase = await createClient();

    const {
      data: claimsData,
      error: authError,
    } = await supabase.auth.getClaims();

    const claims = claimsData?.claims;

    if (authError || !claims?.sub) {
      return NextResponse.json(
        { error: "يرجى تسجيل الدخول." },
        { status: 401 }
      );
    }

    // التأكد أن المستخدم مدير
    const {
      data: adminProfile,
      error: adminError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", claims.sub)
      .maybeSingle();

    if (adminError || adminProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية عرض السيرة الذاتية." },
        { status: 403 }
      );
    }

    // استخدام اتصال الخادم لجلب السيرة الذاتية
    const admin = createAdminClient();

    const {
      data: application,
      error: applicationError,
    } = await admin
      .from("researcher_applications")
      .select("cv_path")
      .eq("id", id)
      .maybeSingle();

    if (applicationError) {
      throw applicationError;
    }

    if (!application?.cv_path) {
      return NextResponse.json(
        { error: "لا توجد سيرة ذاتية لهذا الباحث." },
        { status: 404 }
      );
    }

    // إنشاء رابط مؤقت للسيرة الذاتية
    const {
      data,
      error: signedUrlError,
    } = await admin.storage
      .from("researcher-cvs")
      .createSignedUrl(application.cv_path, 60);

    if (signedUrlError || !data?.signedUrl) {
      throw (
        signedUrlError ??
        new Error("تعذر إنشاء رابط السيرة الذاتية.")
      );
    }

    // فتح السيرة الذاتية باستخدام الرابط المؤقت
    return NextResponse.redirect(
      data.signedUrl,
      { status: 302 }
    );
  } catch (error) {
    console.error(
      "Admin researcher CV error:",
      error
    );

    return NextResponse.json(
      { error: "تعذر فتح السيرة الذاتية." },
      { status: 500 }
    );
  }
}
