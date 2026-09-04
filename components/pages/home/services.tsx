import Link from "next/link";
import {
  Search,
  MessageSquareText,
  UserPlus,
  UserRound,
} from "lucide-react";

import { Reveal } from "@/components/ui/reveal";

const services = [
  {
    title: "ابحث عن باحث",
    href: "#",
    icon: Search,
  },
  {
    title: "اطلب استشارة بحثية",
    href: "#",
    icon: MessageSquareText,
  },
  {
    title: "انضم كباحث متطوع",
    href: "#",
    icon: UserPlus,
  },
  {
    title: "التسجيل كمستفيد جديد",
    href: "#",
    icon: UserRound,
  },
];

export function Services() {
  return (
    <section className="relative z-10 bg-white px-4">
      <div
        className="
          mx-auto grid max-w-[1200px]
          grid-cols-2 gap-3
          -translate-y-[42px]

          sm:gap-4

          md:grid-cols-4
          md:gap-6
          md:-translate-y-[52px]
        "
      >
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <Reveal
              key={service.title}
              delay={index * 120}
              className="h-full"
            >
              <Link
                href={service.href}
                className="
                  flex h-full min-h-[125px]
                  flex-col items-center justify-center
                  rounded-[20px]
                  border border-[#026D95]

                  bg-gradient-to-b
                  from-[#071B2F]
                  to-[#164A68]

                  px-3 py-4
                  text-center
                  text-white

                  transition-transform
                  duration-200

                  hover:-translate-y-1

                  sm:min-h-[140px]
                  sm:px-4

                  md:min-h-[155px]
                "
              >
                <Icon
                  className="
                    mb-3
                    h-8 w-8
                    sm:h-9 sm:w-9
                    md:h-10 md:w-10
                  "
                  strokeWidth={1.7}
                />

                <span
                  className="
                    max-w-[170px]
                    text-[15px]
                    font-normal
                    leading-6

                    sm:text-lg
                    sm:leading-7

                    md:text-xl
                  "
                >
                  {service.title}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}