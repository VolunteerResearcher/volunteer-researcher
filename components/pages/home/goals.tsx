import { Reveal } from "@/components/ui/reveal";

const goals = [
  "تعزيز ثقافة التطوع العلمي والبحثي",
  "توسيع الأثر المجتمعي والمعرفي للباحثين",
  "توظيف خبرات الباحثين في خدمة المجتمع",
  "بناء شبكة من الباحثين المتطوعين في مختلف التخصصات",
];

export function Goals() {
  return (
    <section className="bg-white px-4 pb-16 pt-4 md:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <h2 className="mb-8 text-center text-2xl font-normal text-[#071B2F] md:text-3xl">
            أهداف المبادرة
          </h2>
        </Reveal>

        <div className="flex flex-col gap-4">
          {goals.map((goal, index) => (
            <Reveal
              key={goal}
              delay={index * 120}
              className="w-full"
            >
              <div
                className="
                  mx-auto
                  flex min-h-[58px]
                  w-full
                  items-center
                  justify-center
                  rounded-[18px]
                  bg-[#D9D9D9]
                  px-4
                  py-3
                  text-center
                  text-[17px]
                  font-normal
                  leading-7
                  text-[#071B2F]

                  sm:min-h-[64px]
                  sm:text-xl

                  md:min-h-[72px]
                  md:rounded-[20px]
                  md:px-8
                  md:text-2xl

                  lg:text-[28px]
                "
              >
                {goal}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}