
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  Users,
  MessagesSquare,
  Star,
} from "lucide-react";

const menuItems = [
  {
    title: "الرئيسية",
    icon: LayoutDashboard,
    href: "/ar/admin-dashboard",
  },
  {
    title: "إدارة الطلبات",
    icon: ClipboardList,
    href: "/ar/admin-dashboard/requests",
  },
  {
    title: "إدارة الباحثين",
    icon: GraduationCap,
    href: "/ar/admin-dashboard/researchers",
  },
  {
    title: "إدارة المستفيدين",
    icon: Users,
    href: "/ar/admin-dashboard/beneficiaries",
  },
  {
    title: "المحادثات",
    icon: MessagesSquare,
    href: "/ar/admin-dashboard/conversations",
  },
  {
    title: "التقييمات",
    icon: Star,
    href: "/ar/admin-dashboard/reviews",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      dir="rtl"
      className="w-full shrink-0 bg-[#111827] px-5 py-7 text-white lg:min-h-screen lg:w-[270px]"
    >
      <div className="mb-9">
        <p className="text-xl font-semibold">
          باحث متطوع
        </p>

        <p className="mt-1 text-xs text-white/60">
          لوحة تحكم الإدارة
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/ar/admin-dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[#164A68] text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={19} />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
