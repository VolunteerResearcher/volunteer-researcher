import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  CloudDownload,
} from "lucide-react";

type ProfileCardProps = {
  name: string;
  title: string;
  location: string;
  university: string;
  image: string;
  fields: string[];
  cvUrl?: string;
};

export function ProfileCard({
  name,
  title,
  location,
  university,
  image,
  fields,
  cvUrl = "#",
}: ProfileCardProps) {
  return (
    <section className="bg-white px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1320px]">
        <article
          dir="rtl"
          className="
            w-full
            rounded-[30px]
            border
            border-[#141A2A]
            bg-white
            px-5
            py-6

            md:px-8
            md:py-8
          "
        >
          <div
            className="
              grid
              grid-cols-1
              items-center
              gap-8

              lg:grid-cols-[1fr_260px]
              lg:gap-10
            "
          >
            {/* Researcher Details */}
            <div className="flex flex-col gap-6">
              <div
                className="
                  flex
                  flex-col
                  items-center
                  gap-5
                  text-center

                  sm:flex-row
                  sm:items-center
                  sm:text-right
                "
              >
                <div
                  className="
                    relative
                    h-[130px]
                    w-[130px]
                    shrink-0

                    sm:h-[150px]
                    sm:w-[150px]
                  "
                >
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="rounded-full object-cover"
                    sizes="150px"
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      text-[26px]
                      font-normal
                      text-[#071B2F]

                      sm:text-[30px]
                      lg:text-[34px]
                    "
                  >
                    {name}
                  </h2>

                  <p
                    className="
                      mt-2
                      text-[16px]
                      text-[#6B7280]

                      sm:text-[18px]
                    "
                  >
                    {title}
                  </p>

                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      items-center
                      justify-center
                      gap-x-4
                      gap-y-2
                      text-[#6B7280]

                      sm:justify-start
                    "
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={18}
                        strokeWidth={1.8}
                        className="text-[#164A68]"
                      />
                      <span className="text-[15px] sm:text-[16px]">
                        {location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <GraduationCap
                        size={18}
                        strokeWidth={1.8}
                        className="text-[#164A68]"
                      />
                      <span className="text-[15px] sm:text-[16px]">
                        {university}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-[17px] text-[#071B2F]">
                      المجالات البحثية :
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                      {fields.map((field) => (
                        <span
                          key={field}
                          className="
                            rounded-full
                            bg-[#D9D9D9]
                            px-4
                            py-1
                            text-[13px]
                            text-[#071B2F]

                            sm:text-[14px]
                          "
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CV Button */}
            <div className="flex items-center justify-center lg:justify-start">
              <Link
                href={cvUrl}
                className="
                  flex
                  min-h-[48px]
                  w-full
                  max-w-[240px]
                  items-center
                  justify-center
                  gap-3
                  whitespace-nowrap
                  rounded-[7px]

                  bg-gradient-to-b
                  from-[#071B2F]
                  to-[#164A68]

                  px-5
                  text-[15px]
                  font-normal
                  text-white

                  transition
                  hover:opacity-90
                "
              >
                <CloudDownload
                  size={22}
                  strokeWidth={1.7}
                />

                تحميل السيرة الذاتية
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}