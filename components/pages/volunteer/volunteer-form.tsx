"use client";

import { useState } from "react";
import {
  UserRound,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  FileText,
  BookOpen,
  Paperclip,
  Upload,
  ChevronDown,
} from "lucide-react";

export function VolunteerForm() {
  const [researchField, setResearchField] = useState("");
  const [fileName, setFileName] = useState("");

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[1320px]">

        {/* Heading */}
        <div className="mb-8 text-right">
          <h2
            className="
              text-[28px]
              font-normal
              text-[#071B2F]
              sm:text-[32px]
              md:text-[36px]
            "
          >
            الانضمام كمتطوع
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
            يمكنك طلب الانضمام من خلال تعبئة النموذج التالي.
          </p>
        </div>

        {/* Form */}
        <div
          className="
            rounded-[24px]
            border
            border-[#9DB5D8]
            bg-white
            px-5
            py-7
            md:px-8
            md:py-9
          "
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                الاسم الكامل
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <UserRound
                  size={21}
                  strokeWidth={1.7}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  type="text"
                  placeholder="اكتب اسمك الكامل هنا"
                  className="
                    h-[50px]
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
                  "
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                رقم الجوال
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <Phone
                  size={21}
                  strokeWidth={1.7}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  type="tel"
                  placeholder="05xxxxxxxx"
                  className="
                    h-[50px]
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
                  "
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                البريد الإلكتروني
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={21}
                  strokeWidth={1.7}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  type="email"
                  placeholder="example@domain.com"
                  className="
                    h-[50px]
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
                  "
                />
              </div>
            </div>

            {/* Work */}
            <div>
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                جهة العمل
                <span className="mr-1 text-[#6B7280]">
                  (إن وجدت)
                </span>
              </label>

              <div className="relative">
                <Building2
                  size={21}
                  strokeWidth={1.7}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  type="text"
                  placeholder="اكتب جهة العمل هنا"
                  className="
                    h-[50px]
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
                  "
                />
              </div>
            </div>

            {/* General Specialization */}
            <div>
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                التخصص العام
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <GraduationCap
                  size={21}
                  strokeWidth={1.7}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  type="text"
                  placeholder="مثال: علوم الحاسب"
                  className="
                    h-[50px]
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
                  "
                />
              </div>
            </div>

            {/* Detailed Specialization */}
            <div>
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                التخصص الدقيق
              </label>

              <div className="relative">
                <FileText
                  size={21}
                  strokeWidth={1.7}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
                />

                <input
                  type="text"
                  placeholder="مثال: الذكاء الاصطناعي"
                  className="
                    h-[50px]
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
                  "
                />
              </div>
            </div>

            {/* Research Interest */}
            <div>
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                مجال الاهتمام البحثي
                <span className="mr-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <BookOpen
                  size={21}
                  strokeWidth={1.7}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-[#164A68]
                  "
                />

                <select
                  value={researchField}
                  onChange={(e) => setResearchField(e.target.value)}
                  className="
                    h-[50px]
                    w-full
                    cursor-pointer
                    appearance-none
                    rounded-[8px]
                    border
                    border-[#9DB5D8]
                    bg-white
                    pr-12
                    pl-12
                    text-[15px]
                    text-[#071B2F]
                    outline-none
                    transition
                    focus:border-[#164A68]
                  "
                >
                  <option value="">
                    اختر مجال الاهتمام البحثي
                  </option>

                  <option value="health">
                    صحي
                  </option>

                  <option value="engineering">
                    هندسي
                  </option>

                  <option value="technology">
                    تقني
                  </option>

                  <option value="social">
                    اجتماعي
                  </option>

                  <option value="education">
                    تربوي
                  </option>

                  <option value="business">
                    إداري واقتصادي
                  </option>

                  <option value="law">
                    قانوني
                  </option>

                  <option value="humanities">
                    إنساني
                  </option>

                  <option value="environment">
                    بيئي
                  </option>

                  <option value="basic-sciences">
                    علوم أساسية
                  </option>

                  <option value="other">
                    مجالات أخرى
                  </option>
                </select>

                {/* Dropdown Arrow */}
                <ChevronDown
                  size={20}
                  strokeWidth={1.8}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#164A68]
                  "
                />
              </div>
            </div>

            {/* CV */}
            <div>
              <label className="mb-2 block text-[17px] text-[#071B2F]">
                السيرة الذاتية (CV)
                <span className="mr-1 text-red-500">*</span>
              </label>

              <label
                className="
                  flex
                  min-h-[100px]
                  cursor-pointer
                  items-center
                  justify-between
                  rounded-[10px]
                  border
                  border-dashed
                  border-[#9DB5D8]
                  bg-[#F8FAFC]
                  px-5
                  transition
                  hover:border-[#164A68]
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-[#EAF2F8]
                    "
                  >
                    <Paperclip
                      size={24}
                      strokeWidth={1.7}
                      className="text-[#164A68]"
                    />
                  </div>

                  <div>
                    <p className="text-[15px] text-[#071B2F]">
                      {fileName || "اضغط لرفع الملف"}
                    </p>

                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      PDF, DOC, DOCX, PPT
                    </p>

                    <p className="mt-1 text-[12px] text-[#6B7280]">
                      الحد الأقصى 10 ميجابايت
                    </p>
                  </div>
                </div>

                <Upload
                  size={21}
                  strokeWidth={1.7}
                  className="text-[#164A68]"
                />

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setFileName(file.name);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="
              min-h-[46px]
              min-w-[170px]
              rounded-[7px]
              bg-gradient-to-b
              from-[#071B2F]
              to-[#164A68]
              px-8
              text-[15px]
              text-white
              transition
              hover:opacity-90
            "
          >
            إرسال
          </button>

          <button
            type="button"
            className="
              min-h-[46px]
              min-w-[170px]
              rounded-[7px]
              bg-[#D9D9D9]
              px-8
              text-[15px]
              text-[#071B2F]
              transition
              hover:opacity-80
            "
          >
            إلغاء
          </button>
        </div>
      </div>
    </section>
  );
}