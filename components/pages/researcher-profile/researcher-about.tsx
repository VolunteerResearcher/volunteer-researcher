type ResearcherAboutProps = {
  description: string;
};

export function ResearcherAbout({
  description,
}: ResearcherAboutProps) {
  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-14 md:px-8 md:pb-20"
    >
      <div className="mx-auto max-w-[1320px]">
        {/* Title */}
        <h2
          className="
            mb-6
            text-right
            text-[28px]
            font-normal
            text-[#071B2F]

            sm:text-[32px]
            md:text-[36px]
          "
        >
          نبذة عن الباحث
        </h2>

        {/* About Card */}
        <div
          className="
            flex
            min-h-[190px]
            w-full
            items-center
            justify-center

            rounded-[30px]
            border
            border-[#141A2A]
            bg-white

            px-6
            py-8

            sm:px-10
            md:px-14
          "
        >
          <p
            className="
              max-w-[1100px]
              text-center
              text-[18px]
              font-normal
              leading-[2]
              text-[#071B2F]

              sm:text-[20px]
              md:text-[22px]
            "
          >
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}