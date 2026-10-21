
import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  ClipboardList,
  Star,
} from "lucide-react";

type ResearcherCardProps = {
  id: string;
  name: string;
  title: string;
  university: string;
  fields: string[];
  description: string;

  // التقييمات المعتمدة من الإدارة
  rating?: number;
  reviewsCount?: number;
};

export function ResearcherCard({
  id,
  name,
  title,
  university,
  fields,
  description,
  rating,
  reviewsCount = 0,
}: ResearcherCardProps) {
  const safeRating =
    typeof rating === "number" && Number.isFinite(rating)
      ? Math.max(0, Math.min(5, rating))
      : 0;

  const hasReviews = reviewsCount > 0;

  return (
    <article
      dir="rtl"
      className="
        w-full
        rounded-[30px]
        border
        border-[#141A2A]
        bg-white
        px-5
        py-6
        md:px-8
        md:py-7
      "
    >
      <div
        className="
          grid
          grid-cols-1
          items-center
          gap-7
          lg:grid-cols-[1fr_1.15fr_220px]
          lg:gap-8
        "
      >
        {/* Researcher Information */}
        <div className="flex flex-col justify-center">
          <h2
            className="
              text-[24px]
              font-normal
              text-[#071B2F]
              sm:text-[28px]
              lg:text-[30px]
            "
          >
            {name}
          </h2>

          <p
            className="
              mt-2
              text-[16px]
              text-[#6B7280]
              sm:text-[18px]
            "
          >
            {title}
          </p>

          {/* Approved Rating */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {hasReviews ? (
              <>
                <div
                  className="flex items-center gap-1"
                  aria-label={`تقييم الباحث ${safeRating.toFixed(1)} من 5`}
                >
                  {Array.from(
                    { length: 5 },
                    (_, index) => {
                      const fillPercent = Math.max(
                        0,
                        Math.min(
                          100,
                          (safeRating - index) * 100
                        )
                      );

                      return (
                        <span
                          key={index}
                          className="relative inline-flex h-[18px] w-[18px] shrink-0"
                        >
                          <Star
                            size={18}
                            strokeWidth={1.7}
                            className="absolute inset-0 text-[#CBD5E1]"
                          />

                          <span
                            className="absolute inset-0 overflow-hidden"
                            style={{
                              width: `${fillPercent}%`,
                            }}
                          >
                            <Star
                              size={18}
                              strokeWidth={1.7}
                              className="fill-[#E5A000] text-[#E5A000]"
                            />
                          </span>
                        </span>
                      );
                    }
                  )}
                </div>

                <span className="text-[14px] font-semibold text-[#071B2F]">
                  {safeRating.toFixed(1)}
                  <span className="mr-1 font-normal text-[#94A3B8]">
                    / 5
                  </span>
                </span>

                <span className="text-xs text-[#6B7280]">
                  ({reviewsCount} تقييمات معتمدة)
                </span>
              </>
            ) : (
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <Star size={17} strokeWidth={1.7} />
                <span className="text-xs">
                  لا توجد تقييمات معتمدة بعد
                </span>
              </div>
            )}
          </div>

          {/* University */}
          <div className="mt-3 flex items-center gap-2 text-[#6B7280]">
            <MapPin
              size={18}
              strokeWidth={1.8}
              className="shrink-0 text-[#164A68]"
            />

            <span className="text-[15px] sm:text-[16px]">
              {university}
            </span>
          </div>
        </div>

        {/* Research Fields */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap
              className="h-7 w-7 text-[#164A68]"
              strokeWidth={1.8}
            />

            <h3
              className="
                text-[21px]
                font-normal
                text-[#071B2F]
                sm:text-[24px]
              "
            >
              أهم المجالات البحثية
            </h3>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {fields.map((field) => (
              <span
                key={field}
                className="
                  rounded-full
                  bg-[#D9D9D9]
                  px-4
                  py-1
                  text-[13px]
                  text-[#071B2F]
                  sm:text-[14px]
                "
              >
                {field}
              </span>
            ))}
          </div>

          <p
            className="
              mx-auto
              mt-5
              max-w-[480px]
              text-[16px]
              leading-7
              text-[#6B7280]
              sm:text-[18px]
              sm:leading-8
            "
          >
            {description}
          </p>
        </div>

        {/* Actions */}
        <div
          className="
            flex
            flex-col
            gap-4
            lg:border-r
            lg:border-[#D1D5DB]
            lg:pr-7
          "
        >
          {/* Profile */}
          <Link
            href={`/ar/researchers/${id}`}
            className="
              flex
              min-h-[44px]
              w-full
              items-center
              justify-center
              gap-2
              whitespace-nowrap
              rounded-[7px]
              bg-gradient-to-b
              from-[#071B2F]
              to-[#164A68]
              px-4
              text-[14px]
              font-normal
              text-white
              transition
              hover:opacity-90
            "
          >
            <ClipboardList
              size={17}
              strokeWidth={1.7}
            />

            عرض الملف الشخصي
          </Link>

          {/* Consultation */}
          <Link
            href="/ar/consultation"
            className="
              flex
              min-h-[44px]
              w-full
              items-center
              justify-center
              gap-2
              whitespace-nowrap
              rounded-[7px]
              bg-[#D9D9D9]
              px-4
              text-[14px]
              font-normal
              text-[#071B2F]
              transition
              hover:opacity-80
            "
          >
            <GraduationCap
              size={18}
              strokeWidth={1.7}
            />

            طلب استشارة بحثية
          </Link>
        </div>
      </div>
    </article>
  );
}
