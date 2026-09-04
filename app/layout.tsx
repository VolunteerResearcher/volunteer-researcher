import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const yearOfHandicrafts = localFont({
  src: [
    {
      path: "../public/brand/fonts/TheYearofHandicrafts-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/brand/fonts/TheYearofHandicrafts-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/brand/fonts/TheYearofHandicrafts-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/brand/fonts/TheYearofHandicrafts-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/brand/fonts/TheYearofHandicrafts-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-year-of-handicrafts",
  display: "swap",
});

export const metadata: Metadata = {
  title: "باحث متطوع",
  description: "منصة باحث متطوع",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${yearOfHandicrafts.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}