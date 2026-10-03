import {
  FileText,
  Search,
  UserCheck,
  MessageSquareText,
  CircleCheck,
  ChevronLeft,
} from "lucide-react";

const steps = [
  {
    title: "تقديم الطلب",
    icon: FileText,
  },
  {
    title: "مراجعة الطلب",
    icon: Search,
  },
  {
    title: "توجيهه للباحث المناسب",
    icon: UserCheck,
  },
  {
    title: "تقديم الاستشارة",
    icon: MessageSquareText,
  },
  {
    title: "اكتمال الخدمة",
    icon: CircleCheck,
  },
];

export function AboutProcess() {
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
              كيف تعمل المبادرة؟
            </h2>
          </div>
        </div>

        {/* Steps */}
        <div
          className="
            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2

            lg:grid-cols-5
            lg:gap-3
          "
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative flex items-center"
              >
                <div
                  className="
                    flex
                    min-h-[150px]
                    w-full
                    flex-col
                    items-center
                    justify-center
                    rounded-[20px]
                    border
                    border-[#9DB5D8]
                    bg-white
                    px-4
                    py-5
                    text-center
                  "
                >
                  <Icon
                    size={34}
                    strokeWidth={1.8}
                    className="text-[#164A68]"
                  />

                  <h3
                    className="
                      mt-4
                      text-[17px]
                      font-normal
                      leading-6
                      text-[#071B2F]

                      sm:text-[18px]
                    "
                  >
                    {step.title}
                  </h3>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className="
                      hidden
                      lg:flex
                      lg:w-8
                      lg:items-center
                      lg:justify-center
                    "
                  >
                    <ChevronLeft
                      size={22}
                      strokeWidth={1.8}
                      className="text-[#164A68]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Description */}
        <div
          className="
            mt-6
            rounded-[20px]
            border
            border-[#9DB5D8]
            bg-white
            px-5
            py-5
            text-center

            sm:px-8
          "
        >
          <p
            className="
              text-[16px]
              leading-7
              text-[#071B2F]

              sm:text-[18px]
              sm:leading-8
            "
          >
            تتم إدارة طلبات الاستشارات من خلال المنصة وفق آلية منظمة تضمن
            توجيه كل طلب إلى الباحث المناسب ومتابعته حتى استكمال الخدمة.
          </p>
        </div>
      </div>
    </section>
  );
}