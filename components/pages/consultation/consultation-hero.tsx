import { Reveal } from "@/components/ui/reveal";

export function ConsultationHero() {
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
      <div className="absolute inset-0">
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
                font-sans
                text-right
                text-[38px]
                font-normal
                leading-tight
                text-[#071B2F]

                sm:text-[48px]
                md:text-[58px]
                lg:text-[68px]
              "
            >
              طلب استشارة بحثية
            </h1>
          </Reveal>
        </div>
      </div>
    </section>
  );
}