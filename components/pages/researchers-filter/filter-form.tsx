"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export type ResearchFilters = {
  name: string;
  specialization: string;
  field: string;
  department: string;
  keywords: string;
};

type FilterFormProps = {
  onSearch: (filters: ResearchFilters) => void;
};

export function FilterForm({ onSearch }: FilterFormProps) {
  const [filters, setFilters] = useState<ResearchFilters>({
    name: "",
    specialization: "",
    field: "",
    department: "",
    keywords: "",
  });

  const handleChange = (
    field: keyof ResearchFilters,
    value: string
  ) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 text-right">
          <h2 className="text-[28px] font-normal text-[#071B2F] sm:text-[32px] md:text-[36px]">
            ابحث عن باحث
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
        >
          {/* Researcher Name */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-[16px] text-[#071B2F]">
              اسم الباحث
            </label>

            <input
              type="text"
              value={filters.name}
              onChange={(e) =>
                handleChange("name", e.target.value)
              }
              placeholder="قم بكتابة اسم الباحث"
              className="
                h-[48px]
                w-full
                rounded-[8px]
                border
                border-[#E5E7EB]
                bg-white
                px-4
                text-[15px]
                text-[#071B2F]
                outline-none
                transition
                placeholder:text-[#94A3B8]
                focus:border-[#164A68]
              "
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="mb-2 block text-[16px] text-[#071B2F]">
              التخصص
            </label>

            <input
              type="text"
              value={filters.specialization}
              onChange={(e) =>
                handleChange("specialization", e.target.value)
              }
              placeholder="قم بكتابة التخصص"
              className="
                h-[48px]
                w-full
                rounded-[8px]
                border
                border-[#E5E7EB]
                bg-white
                px-4
                text-[15px]
                text-[#071B2F]
                outline-none
                transition
                placeholder:text-[#94A3B8]
                focus:border-[#164A68]
              "
            />
          </div>

          {/* Research Field */}
          <div>
            <label className="mb-2 block text-[16px] text-[#071B2F]">
              المجال البحثي
            </label>

            <input
              type="text"
              value={filters.field}
              onChange={(e) =>
                handleChange("field", e.target.value)
              }
              placeholder="قم بكتابة المجال البحثي"
              className="
                h-[48px]
                w-full
                rounded-[8px]
                border
                border-[#E5E7EB]
                bg-white
                px-4
                text-[15px]
                text-[#071B2F]
                outline-none
                transition
                placeholder:text-[#94A3B8]
                focus:border-[#164A68]
              "
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-2 block text-[16px] text-[#071B2F]">
              الكلية أو القسم
            </label>

            <input
              type="text"
              value={filters.department}
              onChange={(e) =>
                handleChange("department", e.target.value)
              }
              placeholder="قم بكتابة الكلية أو القسم"
              className="
                h-[48px]
                w-full
                rounded-[8px]
                border
                border-[#E5E7EB]
                bg-white
                px-4
                text-[15px]
                text-[#071B2F]
                outline-none
                transition
                placeholder:text-[#94A3B8]
                focus:border-[#164A68]
              "
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="mb-2 block text-[16px] text-[#071B2F]">
              كلمات مفتاحية
            </label>

            <input
              type="text"
              value={filters.keywords}
              onChange={(e) =>
                handleChange("keywords", e.target.value)
              }
              placeholder="قم بكتابة كلمات مفتاحية"
              className="
                h-[48px]
                w-full
                rounded-[8px]
                border
                border-[#E5E7EB]
                bg-white
                px-4
                text-[15px]
                text-[#071B2F]
                outline-none
                transition
                placeholder:text-[#94A3B8]
                focus:border-[#164A68]
              "
            />
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="
                flex
                h-[50px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[7px]
                bg-gradient-to-b
                from-[#071B2F]
                to-[#164A68]
                px-6
                text-[16px]
                font-normal
                text-white
                transition
                hover:opacity-90
              "
            >
              <Search size={18} strokeWidth={1.7} />
              بحث
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}