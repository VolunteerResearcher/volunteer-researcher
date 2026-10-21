
import { ResearcherCard } from "@/components/pages/researchers/researcher-card";
import type { PublicResearcher } from "@/components/pages/researchers/researchers-page";
import type { ResearchFilters } from "./filter-form";

type FilterResultsProps = {
  filters: ResearchFilters | null;
  researchers: PublicResearcher[];
};

export function FilterResults({
  filters,
  researchers,
}: FilterResultsProps) {
  if (!filters) {
    return null;
  }

  const normalize = (value: string) =>
    value.trim().toLowerCase();

  const filteredResearchers = researchers.filter((researcher) => {
    const name = normalize(filters.name);
    const specialization = normalize(filters.specialization);
    const field = normalize(filters.field);
    const department = normalize(filters.department);
    const keywords = normalize(filters.keywords);

    const matchesName =
      !name || normalize(researcher.name).includes(name);

    const matchesSpecialization =
      !specialization ||
      normalize(researcher.title).includes(specialization) ||
      researcher.fields.some((item) =>
        normalize(item).includes(specialization)
      );

    const matchesField =
      !field ||
      researcher.fields.some((item) =>
        normalize(item).includes(field)
      );

    // لا توجد بيانات قسم أكاديمي مستقلة حاليًا.
    // نبحث في جهة العمل والتخصص بدل اختراع قسم غير موجود.
    const matchesDepartment =
      !department ||
      normalize(researcher.university).includes(department) ||
      normalize(researcher.title).includes(department);

    const searchableText = normalize(
      [
        researcher.name,
        researcher.title,
        researcher.university,
        ...researcher.fields,
        researcher.description,
      ].join(" ")
    );

    const matchesKeywords =
      !keywords || searchableText.includes(keywords);

    return (
      matchesName &&
      matchesSpecialization &&
      matchesField &&
      matchesDepartment &&
      matchesKeywords
    );
  });

  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-16 md:px-8 md:pb-20"
    >
      <div className="mx-auto max-w-[1320px]">
        {filteredResearchers.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredResearchers.map((researcher) => (
              <ResearcherCard
                key={researcher.id}
                id={researcher.id}
                name={researcher.name}
                title={researcher.title}
                university={researcher.university}
                fields={researcher.fields}
                description={researcher.description}
                rating={researcher.rating}
                reviewsCount={researcher.reviewsCount}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-[#D9D9D9] bg-white px-6 py-12 text-center">
            <p className="text-[20px] text-[#071B2F]">
              لم يتم العثور على باحث مطابق لخيارات البحث.
            </p>

            <p className="mt-2 text-[15px] text-[#6B7280]">
              جرّب تعديل بيانات البحث ثم أعد المحاولة.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
