import { SiteShell } from "@/components/layout/site-shell";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isArabic = lang === "ar";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      lang={lang}
      className="min-h-screen"
    >
      <SiteShell>{children}</SiteShell>
    </div>
  );
}