
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/pages/admin-dashboard/admin-sidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang === "en" ? "en" : "ar";

  const supabase = await createClient();

  // التحقق من هوية المستخدم على السيرفر
  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (authError || !userId) {
    redirect(`/${locale}/admin-login`);
  }

  // التحقق من صلاحية الإدارة من قاعدة البيانات
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect(`/${locale}/admin-login`);
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] text-[#071B2F]"
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <AdminSidebar />

        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
