import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const firstQuickLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "الباحثون", href: "#" },
  { label: "الانضمام كمتطوع", href: "#" },
];

const secondQuickLinks = [
  { label: "استشارة بحثية", href: "#" },
  { label: " عن المبادرة", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/logo.png"
                alt="باحث متطوع"
                width={56}
                height={56}
              />

              <div>
                <h2 className="text-lg font-normal">
                  باحث متطوع
                </h2>

                <p className="text-[10px] text-white/60">
                  Volunteer Research
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-[220px] text-xs leading-6 text-white/70">
              منصة تطوعية تربط بين الباحثين والمستفيدين في مختلف
              التخصصات والمجالات البحثية.
            </p>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h3 className="mb-4 text-sm font-normal">
              روابط سريعة
            </h3>

            <div className="flex flex-col gap-2">
              {firstQuickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="w-fit text-xs text-white/75 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h3 className="mb-4 text-sm font-normal">
              روابط سريعة
            </h3>

            <div className="flex flex-col gap-2">
              {secondQuickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="w-fit text-xs text-white/75 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

{/* Contact */}
<div>
  <h3 className="mb-4 text-sm font-normal">
    معلومات التواصل
  </h3>

  <div className="space-y-3 text-xs text-white/75">

    <div className="flex items-center gap-2">
      <Mail size={14} strokeWidth={1.8} />
      <span>researchvolunteersksa@gmail.com</span>
    </div>

    <div className="flex items-center gap-2">
      <MapPin size={14} strokeWidth={1.8} />
      <span>المملكة العربية السعودية</span>
    </div>

  </div>
</div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-normal">
              تابعنا
            </h3>

            <div className="flex flex-col gap-2 text-xs text-white/75">
              <Link href="#" className="w-fit hover:text-white">
                X
              </Link>

              <Link href="#" className="w-fit hover:text-white">
                LinkedIn
              </Link>

              <Link href="#" className="w-fit hover:text-white">
                منصة العمل التطوعي
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-white/10 pt-4 text-center">
          <p className="text-[11px] text-white/60">
            جميع الحقوق محفوظة لدى باحث متطوع © 2026
          </p>
        </div>
      </div>
    </footer>
  );
}