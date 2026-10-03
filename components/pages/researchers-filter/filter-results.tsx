import { ResearcherCard } from "@/components/pages/researchers/researcher-card";
import type { ResearchFilters } from "./filter-form";

type FilterResultsProps = {
  filters: ResearchFilters | null;
};

const researchers = [
  {
    id: 1,
    name: "د. مشاري العنزي",
    title: "أستاذ مشارك في الهندسة الكهربائية",
    university: "جامعة الجوف",
    specialization: "الهندسة الكهربائية",
    department: "كلية الهندسة",
    image: "/brand/researcher.png",
    fields: [
      "الذكاء الاصطناعي",
      "تعلم الآلة",
      "تحليل البيانات",
    ],
    description:
      "باحث في مجال الذكاء الاصطناعي وتطبيقاته في معالجة البيانات الضخمة لخدمة المجتمع.",
  },
  {
    id: 2,
    name: "د. أحمد العتيبي",
    title: "أستاذ مساعد في علوم الحاسب",
    university: "جامعة الجوف",
    specialization: "علوم الحاسب",
    department: "كلية علوم الحاسب والمعلومات",
    image: "/brand/researcher.png",
    fields: [
      "الأمن السيبراني",
      "الشبكات",
      "تحليل البيانات",
    ],
    description:
      "باحث مهتم بالأمن السيبراني وتحليل البيانات وتطوير الحلول التقنية الحديثة.",
  },
  {
    id: 3,
    name: "د. خالد الشمري",
    title: "أستاذ مشارك في نظم المعلومات",
    university: "جامعة الجوف",
    specialization: "نظم المعلومات",
    department: "كلية علوم الحاسب والمعلومات",
    image: "/brand/researcher.png",
    fields: [
      "نظم المعلومات",
      "التحول الرقمي",
      "الذكاء الاصطناعي",
    ],
    description:
      "باحث متخصص في نظم المعلومات والتحول الرقمي وتطبيقات الذكاء الاصطناعي.",
  },
];

export function FilterResults({
  filters,
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
      !name ||
      normalize(researcher.name).includes(name);

    const matchesSpecialization =
      !specialization ||
      normalize(researcher.specialization).includes(
        specialization
      );

    const matchesField =
      !field ||
      researcher.fields.some((item) =>
        normalize(item).includes(field)
      );

    const matchesDepartment =
      !department ||
      normalize(researcher.department).includes(department);

    const searchableText = normalize(
      [
        researcher.name,
        researcher.title,
        researcher.university,
        researcher.specialization,
        researcher.department,
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
                image={researcher.image}
                fields={researcher.fields}
                description={researcher.description}
              />
            ))}
          </div>
        ) : (
          <div
            className="
              rounded-[20px]
              border
              border-[#D9D9D9]
              bg-white
              px-6
              py-12
              text-center
            "
          >
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