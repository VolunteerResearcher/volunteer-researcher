"use client";

import { useState } from "react";
import {
  UserRound,
  BookOpen,
  Circle,
  CircleDot,
} from "lucide-react";

type ConsultationMode = "researcher" | "field";

export function ConsultationType() {
  const [mode, setMode] = useState<ConsultationMode>("researcher");

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[1320px]">
        {/* Section title */}
        <div className="mb-8 text-right">
          <h2
            className="
              text-[26px]
              font-normal
              text-[#071B2F]

              sm:text-[30px]
              md:text-[34px]
            "
          >
            طريقة تقديم الطلب
          </h2>

          <p
            className="
              mt-3
              text-[16px]
              leading-7
              text-[#6B7280]

              sm:text-[18px]
            "
          >
            يمكنك طلب استشارة بحثية من خلال تعبئة النموذج التالي،
            وسيتم توجيه طلبك إلى الباحث المناسب.
          </p>
        </div>

        {/* Selection cards */}
        <div
          className="
            grid
            grid-cols-1
            gap-4

            md:grid-cols-2
            md:gap-6
          "
        >
          {/* Specific Researcher */}
          <button
            type="button"
            onClick={() => setMode("researcher")}
            className={`
              flex
              min-h-[120px]
              w-full
              items-center
              justify-between
              rounded-[14px]
              border
              px-5
              py-5
              text-right
              transition

              ${
                mode === "researcher"
                  ? "border-[#3B82F6] bg-[#EFF6FF]"
                  : "border-[#CBD5E1] bg-white"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <UserRound
                size={34}
                strokeWidth={1.7}
                className="text-[#164A68]"
              />

              <div>
                <h3 className="text-[20px] font-normal text-[#071B2F] sm:text-[22px]">
                  اسم باحث محدد
                </h3>

                <p className="mt-1 text-[14px] text-[#6B7280] sm:text-[15px]">
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
            onClick={() => setMode("field")}
            className={`
              flex
              min-h-[120px]
              w-full
              items-center
              justify-between
              rounded-[14px]
              border
              px-5
              py-5
              text-right
              transition

              ${
                mode === "field"
                  ? "border-[#3B82F6] bg-[#EFF6FF]"
                  : "border-[#CBD5E1] bg-white"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <BookOpen
                size={34}
                strokeWidth={1.7}
                className="text-[#164A68]"
              />

              <div>
                <h3 className="text-[20px] font-normal text-[#071B2F] sm:text-[22px]">
                  مجال البحث فقط
                </h3>

                <p className="mt-1 text-[14px] text-[#6B7280] sm:text-[15px]">
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
        <div
          className="
            mt-7
            grid
            grid-cols-1
            gap-5

            md:grid-cols-2
            md:gap-6
          "
        >
          {/* Researcher Name */}
          <div>
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              اسم الباحث المحدد
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <UserRound
                size={20}
                strokeWidth={1.7}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#164A68]
                "
              />

              <input
                type="text"
                disabled={mode !== "researcher"}
                placeholder="اكتب اسم الباحث هنا"
                className="
                  h-[48px]
                  w-full
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-12
                  pl-4
                  text-[15px]
                  text-[#071B2F]
                  outline-none
                  transition

                  placeholder:text-[#94A3B8]

                  focus:border-[#164A68]

                  disabled:cursor-not-allowed
                  disabled:bg-[#F3F4F6]
                  disabled:opacity-60
                "
              />
            </div>
          </div>

          {/* Research Field */}
          <div>
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              مجال البحث
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <BookOpen
                size={20}
                strokeWidth={1.7}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#164A68]
                "
              />

              <input
                type="text"
                disabled={mode !== "field"}
                placeholder="اكتب مجال البحث هنا"
                className="
                  h-[48px]
                  w-full
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-12
                  pl-4
                  text-[15px]
                  text-[#071B2F]
                  outline-none
                  transition

                  placeholder:text-[#94A3B8]

                  focus:border-[#164A68]

                  disabled:cursor-not-allowed
                  disabled:bg-[#F3F4F6]
                  disabled:opacity-60
                "
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-[14px] text-[#6B7280]">
          يمكنك اختيار أحد الخيارين فقط: اسم الباحث أو مجال البحث.
        </p>
      </div>
    </section>
  );
}