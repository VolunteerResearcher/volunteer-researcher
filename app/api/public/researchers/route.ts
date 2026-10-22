
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("role", "researcher")
      .eq("approval_status", "approved")
      .order("full_name", { ascending: true });

    if (error) {
      console.error(
        "Public researchers API error:",
        error.message
      );

      return NextResponse.json(
        {
          success: false,
          error: "تعذر تحميل قائمة الباحثين.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      researchers: (data ?? []).map((researcher) => ({
        id: researcher.id,
        name: researcher.full_name || "باحث متطوع",
      })),
    });
  } catch (error) {
    console.error("Public researchers API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء تحميل الباحثين.",
      },
      { status: 500 }
    );
  }
}
