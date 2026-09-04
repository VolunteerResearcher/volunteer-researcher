"use client";

import { useEffect, useRef, useState } from "react";
import {
  UsersRound,
  BookOpenText,
  ClipboardCheck,
  MessagesSquare,
  GraduationCap,
} from "lucide-react";

const statistics = [
  {
    label: "الباحثين المتطوعين",
    value: 250,
    icon: UsersRound,
  },
  {
    label: "المجالات البحثية",
    value: 250,
    icon: BookOpenText,
  },
  {
    label: "الطلبات المقدمة",
    value: 250,
    icon: ClipboardCheck,
  },
  {
    label: "الاستشارات المكتملة",
    value: 250,
    icon: MessagesSquare,
  },
  {
    label: "التخصصات",
    value: 250,
    icon: GraduationCap,
  },
];

function Counter({
  value,
  start,
}: {
  value: number;
  start: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    const duration = 1400;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentValue = Math.floor(progress * value);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [start, value]);

  return (
    <span className="text-3xl font-semibold text-[#071B2F] md:text-4xl">
      {count}+
    </span>
  );
}

export function Statistics() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white px-4 pb-14 pt-2 md:pb-20"
    >
      <div className="mx-auto max-w-[1250px]">
        <h2 className="mb-8 text-center text-2xl font-normal text-[#071B2F] md:text-3xl">
          إحصائيات المبادرة
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {statistics.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`
                  flex min-h-[180px] flex-col
                  items-center justify-center
                  rounded-[22px]
                  border-2 border-[#A2A2A2]
                  bg-white
                  px-4 py-6
                  text-center
                  transition-all
                  duration-700

                  md:min-h-[210px]

                  ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: `${index * 120}ms`,
                }}
              >
                <Icon
                  className="mb-4 h-10 w-10 text-[#164A68] md:h-12 md:w-12"
                  strokeWidth={1.7}
                />

                <Counter
                  value={item.value}
                  start={isVisible}
                />

                <p className="mt-2 text-base font-normal text-[#071B2F] md:text-lg">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}