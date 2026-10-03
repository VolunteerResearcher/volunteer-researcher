import { ResearcherCard } from "./researcher-card";

const researchers = [
  {
    id: 1,
    name: "د. مشاري العنزي",
    title: "أستاذ مشارك في الهندسة الكهربائية",
    university: "جامعة الجوف",
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
    name: "د. مشاري العنزي",
    title: "أستاذ مشارك في الهندسة الكهربائية",
    university: "جامعة الجوف",
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
    id: 3,
    name: "د. مشاري العنزي",
    title: "أستاذ مشارك في الهندسة الكهربائية",
    university: "جامعة الجوف",
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
    id: 4,
    name: "د. مشاري العنزي",
    title: "أستاذ مشارك في الهندسة الكهربائية",
    university: "جامعة الجوف",
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
    id: 5,
    name: "د. مشاري العنزي",
    title: "أستاذ مشارك في الهندسة الكهربائية",
    university: "جامعة الجوف",
    image: "/brand/researcher.png",
    fields: [
      "الذكاء الاصطناعي",
      "تعلم الآلة",
      "تحليل البيانات",
    ],
    description:
      "باحث في مجال الذكاء الاصطناعي وتطبيقاته في معالجة البيانات الضخمة لخدمة المجتمع.",
  },
];

export function ResearchersList() {
  return (
    <section className="bg-white px-4 pb-14 md:px-8 md:pb-20">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6">
        {researchers.map((researcher) => (
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
    </section>
  );
}