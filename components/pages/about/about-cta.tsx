import Link from "next/link";

export function AboutCta() {
  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-14 md:px-8 md:pb-20"
    >
      <div className="mx-auto max-w-[1200px]">
        <div
          className="
            overflow-hidden
            rounded-[24px]

            bg-gradient-to-b
            from-[#071B2F]
            to-[#164A68]

            px-5
            py-8
            text-center
            text-white

            sm:px-8
            md:px-12
            md:py-10
          "
        >
          <h2
            className="
              text-[26px]
              font-normal
              leading-tight

              sm:text-[30px]
              md:text-[36px]
            "
          >
            معًا لصناعة أثر معرفي أكبر
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-[700px]
              text-[16px]
              leading-7
              text-white/75

              sm:text-[18px]
            "
          >
            ساهم بخبرتك كباحث متطوع أو استفد من خبرات الباحثين من خلال
            طلب استشارة بحثية.
          </p>

          <div
            className="
              mt-7
              flex
              flex-col
              items-center
              justify-center
              gap-3

              sm:flex-row
            "
          >
            <Link
              href="/ar/volunteer"
              className="
                flex
                min-h-[48px]
                w-full
                max-w-[240px]
                items-center
                justify-center
                rounded-[8px]
                bg-white
                px-6
                text-[16px]
                font-normal
                text-[#071B2F]

                transition
                hover:opacity-90
              "
            >
              انضم كباحث متطوع
            </Link>

            <Link
              href="/ar/consultation"
              className="
                flex
                min-h-[48px]
                w-full
                max-w-[240px]
                items-center
                justify-center
                rounded-[8px]
                border
                border-white
                bg-transparent
                px-6
                text-[16px]
                font-normal
                text-white

                transition
                hover:bg-white/10
              "
            >
              اطلب استشارة بحثية
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}