"use client";

import { useState } from "react";
import {
  FileText,
  ListFilter,
  Paperclip,
  Upload,
  Info,
} from "lucide-react";

export function ConsultationForm() {
  const [description, setDescription] = useState("");
  const [helpType, setHelpType] = useState("");

  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-14 md:px-8 md:pb-20"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">

          {/* Request Title */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              عنوان الطلب
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <FileText
                size={20}
                strokeWidth={1.7}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <input
                type="text"
                placeholder="اكتب عنوان مختصر للطلب"
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
                "
              />
            </div>
          </div>

          {/* Request Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              وصف الطلب / الاستشارة المطلوبة
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <FileText
                size={20}
                strokeWidth={1.7}
                className="absolute right-4 top-4 text-[#164A68]"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                placeholder="يرجى توضيح تفاصيل طلبك ..."
                className="
                  min-h-[130px]
                  w-full
                  resize-none
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-12
                  pl-4
                  pt-3
                  text-[15px]
                  text-[#071B2F]
                  outline-none
                  transition
                  placeholder:text-[#94A3B8]
                  focus:border-[#164A68]
                "
              />
            </div>

            <p className="mt-1 text-left text-[13px] text-[#6B7280]">
              {description.length}/1000
            </p>
          </div>

          {/* Help Type */}
          <div>
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              نوع المساعدة المطلوبة
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <ListFilter
                size={20}
                strokeWidth={1.7}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <select
                value={helpType}
                onChange={(e) => setHelpType(e.target.value)}
                className="
                  h-[48px]
                  w-full
                  appearance-none
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-12
                  pl-4
                  text-[15px]
                  text-[#071B2F]
                  outline-none
                  focus:border-[#164A68]
                "
              >
                <option value="">اختر نوع المساعدة</option>
                <option value="research">استشارة بحثية</option>
                <option value="methodology">منهجية البحث</option>
                <option value="analysis">تحليل البيانات</option>
                <option value="review">مراجعة بحث</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              إرفاق ملف
              <span className="mr-1 text-[#6B7280]">(إن وجد)</span>
            </label>

            <label
              className="
                flex
                min-h-[95px]
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
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF2F8]">
                  <Paperclip
                    size={22}
                    strokeWidth={1.7}
                    className="text-[#164A68]"
                  />
                </div>

                <div>
                  <p className="text-[15px] text-[#071B2F]">
                    اضغط لرفع ملف
                  </p>

                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    PDF, DOC, DOCX, PPT
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
              />
            </label>
          </div>

          {/* Additional Notes */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              ملاحظات إضافية
            </label>

            <div className="relative">
              <FileText
                size={20}
                strokeWidth={1.7}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <input
                type="text"
                placeholder="يمكنك إضافة أي ملاحظات أخرى ..."
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
                "
              />
            </div>
          </div>

          {/* Login Notice */}
          <div
            className="
              md:col-span-2
              flex
              items-start
              gap-3
              rounded-[10px]
              border
              border-[#D6E4F0]
              bg-[#F8FBFD]
              px-4
              py-3
            "
          >
            <Info
              size={20}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-[#164A68]"
            />

            <p className="text-[14px] leading-6 text-[#071B2F]">
              لإرسال طلب الاستشارة، يجب أن يكون لديك حساب وأن تكون
              مسجل الدخول. يمكنك تعبئة النموذج، ولكن لن يتم إرسال الطلب
              إلا بعد تسجيل الدخول.
            </p>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex flex-col gap-3 pt-3 sm:flex-row">
            <button
              type="button"
              className="
                min-h-[46px]
                min-w-[160px]
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
                min-w-[160px]
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
      </div>
    </section>
  );
}