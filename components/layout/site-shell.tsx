
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // صفحات لوحات التحكم
  const isDashboard =
    /\/(admin-dashboard|researcher-dashboard)(\/|$)/.test(pathname);

  // صفحة تسجيل دخول الإدارة
  const isAdminLogin =
    /\/admin-login(\/|$)/.test(pathname);

  // إخفاء الهيدر والفوتر عن لوحات التحكم ودخول الإدارة
  if (isDashboard || isAdminLogin) {
    return <div className="min-h-screen">{children}</div>;
  }

  // بقية صفحات الموقع الأساسي
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
