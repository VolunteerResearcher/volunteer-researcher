
import { ResearcherCard } from "./researcher-card";
import type { PublicResearcher } from "./researchers-page";

type ResearchersListProps = {
  researchers: PublicResearcher[];
};

export function ResearchersList({
  researchers,
}: ResearchersListProps) {
  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-14 md:px-8 md:pb-20"
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6">
        {researchers.length === 0 ? (
          <div className="rounded-[24px] border border-[#D7E3EF] bg-[#F8FBFD] px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-[#071B2F]">
              لا يوجد باحثون معتمدون حاليًا
            </h2>

            <p className="mt-3 text-sm text-[#64748B]">
              سيظهر هنا الباحثون بعد اعتماد حساباتهم من الإدارة.
            </p>
          </div>
        ) : (
          researchers.map((researcher) => (
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
          ))
        )}
      </div>
    </section>
  );
}
