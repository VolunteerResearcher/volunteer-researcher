import { Reveal } from "@/components/ui/reveal";

export function Hero() {
  return (
    <section
      className="
        relative
        w-full
        min-h-[300px]
        bg-cover
        bg-center
        sm:min-h-[380px]
        md:min-h-[540px]
      "
      style={{
        backgroundImage: "url('/brand/hero.png')",
      }}
    >
      <div
        className="
          absolute inset-0
          flex items-center justify-center
          px-3
          sm:px-5
          md:px-6
        "
      >
        <Reveal className="w-full max-w-[620px]">
          <div
            className="
              mx-auto
              w-[92%]
              rounded-[16px]
              bg-white/45
              px-4
              py-5
              text-center
              backdrop-blur-[2px]

              sm:w-[85%]
              sm:rounded-[20px]
              sm:px-6
              sm:py-7

              md:w-full
              md:rounded-[24px]
              md:px-8
              md:py-10
            "
          >
            <h1
              className="
                text-[34px]
                font-normal
                leading-tight
                text-[#0B3554]

                sm:text-4xl
                md:text-5xl
              "
            >
              باحث متطوع
            </h1>

            <h2
              className="
                mt-2
                text-[23px]
                font-normal
                leading-tight
                text-[#0B3554]

                sm:text-2xl

                md:mt-4
                md:text-3xl
              "
            >
              نبحث معًا لنقدم أثرًا
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-[520px]
                text-[16px]
                leading-7
                text-[#0B3554]

                sm:text-base
                sm:leading-7

                md:mt-5
                md:text-xl
                md:leading-8
              "
            >
              منصة تطوعية تربط المستفيدين بالباحثين في مختلف
              التخصصات والمجالات البحثية
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}