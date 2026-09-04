import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
      className="flex min-h-screen flex-col"
    >
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}