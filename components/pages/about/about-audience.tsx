import {
  GraduationCap,
  UserRoundCheck,
  Users,
} from "lucide-react";

const audiences = [
  {
    title: "الطلاب",
    description: "في مختلف التخصصات.",
    icon: GraduationCap,
  },
  {
    title: "الباحثون والمتخصصون",
    description: "لتقديم خبراتهم ومشاركتها تطوعيًا.",
    icon: UserRoundCheck,
  },
  {
    title: "المستفيدون",
    description: "من الاستشارات والخدمات البحثية.",
    icon: Users,
  },
];

export function AboutAudience() {
  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-10 md:px-8 md:pb-14"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Title */}
        <div className="mb-7 flex justify-center">
          <div
            className="
              rounded-full
              border
              border-[#9DB5D8]
              bg-white
              px-8
              py-2
            "
          >
            <h2
              className="
                text-[22px]
                font-normal
                text-[#071B2F]

                sm:text-[24px]
                md:text-[26px]
              "
            >
              لمن المبادرة؟
            </h2>
          </div>
        </div>

        {/* Cards */}
        <div
          className="
            grid
            grid-cols-1
            gap-5

            md:grid-cols-3
          "
        >
          {audiences.map((audience) => {
            const Icon = audience.icon;

            return (
              <div
                key={audience.title}
                className="
                  flex
                  min-h-[210px]
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
                  {audience.title}
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
                  {audience.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}