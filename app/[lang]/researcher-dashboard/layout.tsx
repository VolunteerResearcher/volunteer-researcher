
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ResearcherDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const locale = lang === "en" ? "en" : "ar";

  const supabase = await createClient();

  // التحقق من تسجيل الدخول
  const { data: claimsData, error: authError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (authError || !userId) {
    redirect(`/${locale}/researcher-login`);
  }

  // جلب دور المستخدم وحالة اعتماده
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, approval_status")
      .eq("id", userId)
      .maybeSingle();

  // في حال تعذر قراءة بيانات الحساب، لا نسمح بالدخول
  if (profileError || !profile) {
    redirect(`/${locale}/researcher-login`);
  }

  // المستفيد له ملف شخصي مستقل
  if (profile.role === "beneficiary") {
    redirect(`/${locale}/profile`);
  }

  // المدير لا يدخل لوحة الباحث
  if (profile.role === "admin") {
    redirect(`/${locale}/admin-dashboard`);
  }

  // منع أي دور غير الباحث من الدخول
  if (profile.role !== "researcher") {
    redirect(`/${locale}/login`);
  }

  // الباحث غير المعتمد يذهب لصفحة حالة طلبه
  if (profile.approval_status !== "approved") {
    redirect(`/${locale}/researcher-status`);
  }

  // السماح فقط للباحث المعتمد بالدخول
  return <>{children}</>;
}
