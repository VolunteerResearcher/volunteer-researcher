"use client";

import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";

type ResearchersToolbarProps = {
  showResearchers: boolean;
  onToggleResearchers: () => void;
};

export function ResearchersToolbar({
  showResearchers,
  onToggleResearchers,
}: ResearchersToolbarProps) {
  return (
    <section className="bg-white px-4 py-8 md:px-8">
      <div
        className="
          mx-auto
          flex
          max-w-[1300px]
          flex-col
          gap-4

          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search
            size={18}
            strokeWidth={1.7}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-[#6B7280]
            "
          />

          <input
            type="text"
            placeholder="ابحث عن باحث أو تخصص أو مجال بحثي ..."
            className="
              h-[46px]
              w-full
              rounded-full
              border
              border-[#E5E7EB]
              bg-white
              pr-11
              pl-4
              text-sm
              text-[#071B2F]
              outline-none
              transition

              placeholder:text-[#6B7280]

              focus:border-[#164A68]

              md:h-[50px]
              md:text-base
            "
          />
        </div>

        {/* Controls */}
        <div
          className="
            flex
            w-full
            items-center
            gap-3

            md:w-auto
          "
        >
          {/* All Researchers */}
          <button
            type="button"
            onClick={onToggleResearchers}
            className="
              flex
              h-[46px]
              flex-1
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#111827]
              px-5
              text-sm
              font-normal
              text-white
              transition
              hover:opacity-90

              md:h-[50px]
              md:flex-none
              md:min-w-[145px]
            "
          >
            {showResearchers ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}

            كل الباحثين
          </button>

          {/* Filter */}
          <Link
            href="/ar/researchers/filter"
            className="
              flex
              h-[46px]
              flex-1
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gradient-to-b
              from-[#071B2F]
              to-[#164A68]
              px-5
              text-sm
              font-normal
              text-white
              transition
              hover:opacity-90

              md:h-[50px]
              md:flex-none
              md:min-w-[130px]
            "
          >
            <SlidersHorizontal size={17} strokeWidth={1.7} />
            فلترة
          </Link>
        </div>
      </div>
    </section>
  );
}