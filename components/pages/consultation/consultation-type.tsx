
"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  BookOpen,
  Circle,
  CircleDot,
  ChevronDown,
  Loader2,
} from "lucide-react";

type ConsultationMode = "researcher" | "field";

type ResearcherOption = {
  id: string;
  name: string;
};

type ConsultationTypeProps = {
  mode: ConsultationMode;
  onModeChange: (mode: ConsultationMode) => void;
  requestedResearcherId: string;
  onRequestedResearcherChange: (id: string) => void;
  researchField: string;
  onResearchFieldChange: (value: string) => void;
};

export function ConsultationType({
  mode,
  onModeChange,
  requestedResearcherId,
  onRequestedResearcherChange,
  researchField,
  onResearchFieldChange,
}: ConsultationTypeProps) {
  const [researchers, setResearchers] = useState<
    ResearcherOption[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadResearchers() {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await fetch(
          "/api/public/researchers",
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load researchers");
        }

        const result = (await response.json()) as {
          success: boolean;
          researchers?: ResearcherOption[];
        };

        if (!result.success) {
          throw new Error("Failed to load researchers");
        }

        setResearchers(result.researchers ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(
          "Consultation researchers loading error:",
          error
        );

        setLoadError(
          "تعذر تحميل قائمة الباحثين. يرجى تحديث الصفحة."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadResearchers();

    return () => controller.abort();
  }, []);

  const handleModeChange = (nextMode: ConsultationMode) => {
    onModeChange(nextMode);

    if (nextMode === "researcher") {
      onResearchFieldChange("");
    } else {
      onRequestedResearcherChange("");
    }
  };

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[1320px]">
        {/* Section title */}
        <div className="mb-8 text-right">
          <h2 className="text-[26px] font-normal text-[#071B2F] sm:text-[30px] md:text-[34px]">
            طريقة تقديم الطلب
          </h2>

          <p className="mt-3 text-[16px] leading-7 text-[#6B7280] sm:text-[18px]">
            يمكنك طلب استشارة بحثية من خلال تعبئة النموذج التالي،
            وسيتم توجيه طلبك إلى الباحث المناسب.
          </p>
        </div>

        {/* Selection cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* Specific Researcher */}
          <button
            type="button"
            onClick={() => handleModeChange("researcher")}
            aria-pressed={mode === "researcher"}
            className={`flex min-h-[120px] w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-5 text-right transition sm:px-5 ${
              mode === "researcher"
                ? "border-[#3B82F6] bg-[#EFF6FF]"
                : "border-[#CBD5E1] bg-white"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <UserRound
                size={34}
                strokeWidth={1.7}
                className="shrink-0 text-[#164A68]"
              />

              <div className="min-w-0">
                <h3 className="text-[18px] font-normal text-[#071B2F] sm:text-[22px]">
                  اسم باحث محدد
                </h3>

                <p className="mt-1 text-[13px] leading-6 text-[#6B7280] sm:text-[15px]">
                  أريد إرسال الطلب إلى باحث معين.
                </p>
              </div>
            </div>

            {mode === "researcher" ? (
              <CircleDot
                size={26}
                strokeWidth={2}
                className="shrink-0 text-[#2563EB]"
              />
            ) : (
              <Circle
                size={26}
                strokeWidth={1.7}
                className="shrink-0 text-[#94A3B8]"
              />
            )}
          </button>

          {/* Research Field */}
          <button
            type="button"
            onClick={() => handleModeChange("field")}
            aria-pressed={mode === "field"}
            className={`flex min-h-[120px] w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-5 text-right transition sm:px-5 ${
              mode === "field"
                ? "border-[#3B82F6] bg-[#EFF6FF]"
                : "border-[#CBD5E1] bg-white"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <BookOpen
                size={34}
                strokeWidth={1.7}
                className="shrink-0 text-[#164A68]"
              />

              <div className="min-w-0">
                <h3 className="text-[18px] font-normal text-[#071B2F] sm:text-[22px]">
                  مجال البحث فقط
                </h3>

                <p className="mt-1 text-[13px] leading-6 text-[#6B7280] sm:text-[15px]">
                  أريد تحديد مجال البحث وسيتم توجيه الطلب إلى الباحث المناسب.
                </p>
              </div>
            </div>

            {mode === "field" ? (
              <CircleDot
                size={26}
                strokeWidth={2}
                className="shrink-0 text-[#2563EB]"
              />
            ) : (
              <Circle
                size={26}
                strokeWidth={1.7}
                className="shrink-0 text-[#94A3B8]"
              />
            )}
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {/* Researcher Dropdown */}
          <div className="min-w-0">
            <label
              htmlFor="consultation-researcher"
              className="mb-2 block text-[17px] text-[#071B2F]"
            >
              اسم الباحث المحدد
              {mode === "researcher" && (
                <span className="mr-1 text-red-500">*</span>
              )}
            </label>

            <div className="relative">
              <UserRound
                size={20}
                strokeWidth={1.7}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <select
                id="consultation-researcher"
                value={requestedResearcherId}
                onChange={(event) =>
                  onRequestedResearcherChange(event.target.value)
                }
                disabled={mode !== "researcher" || isLoading}
                aria-required={mode === "researcher"}
                className="h-[48px] w-full min-w-0 appearance-none rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-10 text-[15px] text-[#071B2F] outline-none transition focus:border-[#164A68] disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:opacity-60"
              >
                <option value="">
                  {isLoading
                    ? "جارٍ تحميل الباحثين..."
                    : researchers.length === 0
                      ? "لا يوجد باحثون معتمدون حاليًا"
                      : "اختر الباحث من القائمة"}
                </option>

                {researchers.map((researcher) => (
                  <option
                    key={researcher.id}
                    value={researcher.id}
                  >
                    {researcher.name}
                  </option>
                ))}
              </select>

              {isLoading ? (
                <Loader2
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-[#164A68]"
                />
              ) : (
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />
              )}
            </div>

            {loadError && (
              <p
                role="alert"
                className="mt-2 text-sm text-red-600"
              >
                {loadError}
              </p>
            )}
          </div>

          {/* Research Field */}
          <div className="min-w-0">
            <label
              htmlFor="consultation-research-field"
              className="mb-2 block text-[17px] text-[#071B2F]"
            >
              مجال البحث
              {mode === "field" && (
                <span className="mr-1 text-red-500">*</span>
              )}
            </label>

            <div className="relative">
              <BookOpen
                size={20}
                strokeWidth={1.7}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <input
                id="consultation-research-field"
                type="text"
                value={researchField}
                onChange={(event) =>
                  onResearchFieldChange(event.target.value)
                }
                maxLength={200}
                disabled={mode !== "field"}
                aria-required={mode === "field"}
                placeholder="اكتب مجال البحث هنا"
                className="h-[48px] w-full min-w-0 rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-4 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-[14px] leading-6 text-[#6B7280]">
          يمكنك اختيار أحد الخيارين فقط: اسم الباحث أو مجال البحث.
          ويخضع توجيه الطلب للمراجعة من الإدارة.
        </p>
      </div>
    </section>
  );
}
