
import {
  GraduationCap,
  MapPin,
  Star,
} from "lucide-react";

type ProfileCardProps = {
  name: string;
  title: string;
  location: string;
  university: string;
  fields: string[];

  // التقييمات المعتمدة من الإدارة فقط
  rating?: number;
  reviewsCount?: number;
};

export function ProfileCard({
  name,
  title,
  location,
  university,
  fields,
  rating = 0,
  reviewsCount = 0,
}: ProfileCardProps) {
  const safeRating =
    typeof rating === "number" && Number.isFinite(rating)
      ? Math.max(0, Math.min(5, rating))
      : 0;

  const hasReviews = reviewsCount > 0;

  return (
    <section className="bg-white px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1320px]">
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
            md:py-8
          "
        >
          {/* Researcher Information */}
          <div className="flex flex-col gap-6">
            <div className="min-w-0 text-right">
              {/* Name */}
              <h2
                className="
                  text-[26px]
                  font-normal
                  text-[#071B2F]
                  sm:text-[30px]
                  lg:text-[34px]
                "
              >
                {name}
              </h2>

              {/* Specialization */}
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

              {/* Approved Researcher Rating */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
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
                              className="relative inline-flex h-5 w-5"
                            >
                              <Star
                                size={20}
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
                                  size={20}
                                  strokeWidth={1.7}
                                  className="fill-[#E5A000] text-[#E5A000]"
                                />
                              </span>
                            </span>
                          );
                        }
                      )}
                    </div>

                    <span className="text-[16px] font-semibold text-[#071B2F]">
                      {safeRating.toFixed(1)}
                      <span className="mr-1 text-sm font-normal text-[#94A3B8]">
                        / 5
                      </span>
                    </span>

                    <span className="text-[13px] text-[#6B7280]">
                      ({reviewsCount} تقييمات معتمدة)
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-[#94A3B8]">
                    <Star size={19} strokeWidth={1.7} />
                    <span className="text-sm">
                      لا توجد تقييمات معتمدة بعد
                    </span>
                  </div>
                )}
              </div>

              {/* Location and University */}
              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  gap-x-4
                  gap-y-2
                  text-[#6B7280]
                "
              >
                <div className="flex items-center gap-2">
                  <MapPin
                    size={18}
                    strokeWidth={1.8}
                    className="text-[#164A68]"
                  />

                  <span className="text-[15px] sm:text-[16px]">
                    {location}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <GraduationCap
                    size={18}
                    strokeWidth={1.8}
                    className="text-[#164A68]"
                  />

                  <span className="text-[15px] sm:text-[16px]">
                    {university}
                  </span>
                </div>
              </div>

              {/* Research Fields */}
              <div className="mt-5">
                <p className="mb-3 text-[17px] text-[#071B2F]">
                  المجالات البحثية :
                </p>

                <div className="flex flex-wrap gap-3">
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
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
