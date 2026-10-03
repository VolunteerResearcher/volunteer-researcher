import { Reveal } from "@/components/ui/reveal";

export function BeneficiaryRegisterHero() {
  return (
    <section
      className="
        relative
        w-full
        min-h-[220px]
        bg-cover
        bg-center
        sm:min-h-[280px]
        md:min-h-[340px]
        lg:min-h-[390px]
      "
      style={{
        backgroundImage: "url('/brand/researchers-hero.png')",
      }}
    >
      <div
        className="
          absolute
          right-5
          top-[34%]
          -translate-y-1/2

          sm:right-10
          sm:top-[35%]

          md:right-16
          md:top-[36%]

          lg:right-24
          lg:top-[37%]
        "
      >
        <Reveal>
          <h1
            className="
              text-right
              text-[36px]
              font-normal
              leading-tight
              text-[#071B2F]

              sm:text-[46px]
              md:text-[56px]
              lg:text-[66px]
            "
          >
            التسجيل كمستفيد جديد
          </h1>
        </Reveal>
      </div>
    </section>
  );
}