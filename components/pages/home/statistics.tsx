
"use client";

import { useEffect, useRef, useState } from "react";
import {
  UsersRound,
  BookOpenText,
  ClipboardCheck,
  MessagesSquare,
  GraduationCap,
} from "lucide-react";

type StatisticsData = {
  researchers: number;
  researchFields: number;
  requests: number;
  completedConsultations: number;
  specializations: number;
};

const initialStatistics: StatisticsData = {
  researchers: 0,
  researchFields: 0,
  requests: 0,
  completedConsultations: 0,
  specializations: 0,
};

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

    let frameId = 0;
    const duration = 1400;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [start, value]);

  return (
    <span className="text-3xl font-semibold text-[#071B2F] md:text-4xl">
      {count}
    </span>
  );
}

export function Statistics() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [isVisible, setIsVisible] = useState(false);

  const [statisticsData, setStatisticsData] =
    useState<StatisticsData>(initialStatistics);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStatistics() {
      try {
        const response = await fetch(
          "/api/public/statistics",
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Statistics request failed: ${response.status}`
          );
        }

        const data: StatisticsData =
          await response.json();

        if (controller.signal.aborted) return;

        setStatisticsData(data);
        setLoadError(false);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(
          "Failed to load initiative statistics:",
          error
        );

        setLoadError(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchStatistics();

    return () => controller.abort();
  }, []);

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
      { threshold: 0.25 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const statistics = [
    {
      label: "الباحثين المتطوعين",
      value: statisticsData.researchers,
      icon: UsersRound,
    },
    {
      label: "المجالات البحثية",
      value: statisticsData.researchFields,
      icon: BookOpenText,
    },
    {
      label: "الطلبات المقدمة",
      value: statisticsData.requests,
      icon: ClipboardCheck,
    },
    {
      label: "الاستشارات المكتملة",
      value: statisticsData.completedConsultations,
      icon: MessagesSquare,
    },
    {
      label: "التخصصات",
      value: statisticsData.specializations,
      icon: GraduationCap,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-white px-4 pb-14 pt-2 md:pb-20"
    >
      <div className="mx-auto max-w-[1250px]">
        <h2 className="mb-8 text-center text-2xl font-normal text-[#071B2F] md:text-3xl">
          إحصائيات المبادرة
        </h2>

        {loadError && (
          <p
            role="alert"
            className="mb-5 text-center text-sm text-[#B4233A]"
          >
            تعذر تحميل الإحصائيات حاليًا.
          </p>
        )}

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
                    index === 4
                      ? "col-span-2 mx-auto w-[calc((100%-1rem)/2)] sm:col-span-1 sm:w-full"
                      : ""
                  }
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

                {isLoading ? (
                  <span className="text-3xl font-semibold text-[#94A3B8] md:text-4xl">
                    ...
                  </span>
                ) : loadError ? (
                  <span className="text-3xl font-semibold text-[#94A3B8] md:text-4xl">
                    —
                  </span>
                ) : (
                  <Counter
                    value={item.value}
                    start={isVisible}
                  />
                )}

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
