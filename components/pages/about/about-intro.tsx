import {
  TrendingUp,
  Lightbulb,
  Users,
} from "lucide-react";

const pillars = [
  {
    title: "التطوع العلمي",
    description:
      "تعزيز ثقافة التطوع العلمي والمساهمة بالخبرات البحثية.",
    icon: TrendingUp,
  },
  {
    title: "تبادل المعرفة",
    description:
      "تسهيل وصول المستفيدين إلى الخبرات البحثية المناسبة.",
    icon: Lightbulb,
  },
  {
    title: "خدمة المجتمع",
    description:
      "تحويل الخبرات الأكاديمية إلى قيمة معرفية تخدم المجتمع.",
    icon: Users,
  },
];

export function AboutIntro() {
  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Main Description */}
        <div
          className="
            rounded-[22px]
            border
            border-[#9DB5D8]
            bg-white
            px-5
            py-7
            text-center

            sm:px-8
            md:px-12
            md:py-8
          "
        >
          <p
            className="
              mx-auto
              max-w-[1000px]
              text-[18px]
              font-normal
              leading-8
              text-[#071B2F]

              sm:text-[20px]
              sm:leading-9

              md:text-[22px]
            "
          >
            مبادرة بحثية مجتمعية تهدف إلى توظيف خبرات الباحثين والمتخصصين
            بصورة تطوعية لتقديم الاستشارات والتوجيه العلمي والبحثي
            للمستفيدين، وتعزيز ثقافة التطوع العلمي وتبادل المعرفة وخدمة
            المجتمع.
          </p>
        </div>

        {/* Pillars */}
        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-5

            md:grid-cols-3
          "
        >
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <div
                key={pillar.title}
                className="
                  flex
                  min-h-[230px]
                  flex-col
                  items-center
                  justify-center
                  rounded-[22px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  px-5
                  py-6
                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-[#EAF2F8]
                  "
                >
                  <Icon
                    size={32}
                    strokeWidth={1.8}
                    className="text-[#164A68]"
                  />
                </div>

                <h3
                  className="
                    mt-4
                    text-[22px]
                    font-normal
                    text-[#071B2F]

                    sm:text-[24px]
                  "
                >
                  {pillar.title}
                </h3>

                <p
                  className="
                    mt-3
                    max-w-[280px]
                    text-[16px]
                    leading-7
                    text-[#6B7280]

                    sm:text-[17px]
                  "
                >
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}