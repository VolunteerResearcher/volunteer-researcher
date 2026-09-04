"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "الباحثون", href: "#" },
  { label: "الانضمام كمتطوع", href: "#" },
  { label: "استشارة بحثية", href: "#" },
  { label: "عن المبادرة", href: "#" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50 w-full bg-[#111827] text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/brand/logo.png"
            alt="باحث متطوع"
            width={52}
            height={52}
            priority
            className="h-auto w-[46px] sm:w-[52px]"
          />

          <div className="leading-tight">
            <p className="text-base font-normal sm:text-lg">
              باحث متطوع
            </p>

            <p className="text-[9px] font-normal text-white/60 sm:text-[10px]">
              Volunteer Research
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-normal transition-opacity hover:opacity-70 xl:text-base"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="#"
            className="rounded-full border border-cyan-500 px-5 py-2 text-sm font-normal transition hover:bg-cyan-500/10"
          >
            تسجيل الدخول
          </Link>

          <Link
            href="#"
            className="rounded-full border border-cyan-500 px-5 py-2 text-sm font-normal transition hover:bg-cyan-500/10"
          >
            الملف الشخصي
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
          aria-label="فتح القائمة"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute left-0 top-full w-full border-t border-white/10 bg-[#111827] px-5 py-5 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-white/10 pb-3 text-base font-normal"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-cyan-500 px-4 py-2 text-center text-sm"
            >
              تسجيل الدخول
            </Link>

            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-cyan-500 px-4 py-2 text-center text-sm"
            >
              الملف الشخصي
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}