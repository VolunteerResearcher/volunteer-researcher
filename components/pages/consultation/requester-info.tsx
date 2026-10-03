import {
  UserRound,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";

export function RequesterInfo() {
  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-8 md:px-8"
    >
      <div className="mx-auto max-w-[1320px]">
        <h2
          className="
            mb-6
            text-right
            text-[26px]
            font-normal
            text-[#071B2F]

            sm:text-[30px]
            md:text-[34px]
          "
        >
          بيانات مقدم الطلب
        </h2>

        <div
          className="
            grid
            grid-cols-1
            gap-5

            md:grid-cols-2
            md:gap-6
          "
        >
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              الاسم الكامل
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <UserRound
                size={20}
                strokeWidth={1.7}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#164A68]
                "
              />

              <input
                type="text"
                placeholder="مثال: رولا محمد العنزي"
                className="
                  h-[48px]
                  w-full
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-12
                  pl-4
                  text-[15px]
                  text-[#071B2F]
                  outline-none
                  transition

                  placeholder:text-[#94A3B8]

                  focus:border-[#164A68]
                "
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              رقم الجوال
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <Phone
                size={20}
                strokeWidth={1.7}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#164A68]
                "
              />

              <input
                type="tel"
                placeholder="05xxxxxxxx"
                className="
                  h-[48px]
                  w-full
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-12
                  pl-4
                  text-[15px]
                  text-[#071B2F]
                  outline-none
                  transition

                  placeholder:text-[#94A3B8]

                  focus:border-[#164A68]
                "
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              البريد الإلكتروني
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <Mail
                size={20}
                strokeWidth={1.7}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#164A68]
                "
              />

              <input
                type="email"
                placeholder="example@domain.com"
                className="
                  h-[48px]
                  w-full
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-12
                  pl-4
                  text-[15px]
                  text-[#071B2F]
                  outline-none
                  transition

                  placeholder:text-[#94A3B8]

                  focus:border-[#164A68]
                "
              />
            </div>
          </div>

          {/* Specialization */}
          <div>
            <label className="mb-2 block text-[17px] text-[#071B2F]">
              التخصص
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <GraduationCap
                size={20}
                strokeWidth={1.7}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#164A68]
                "
              />

              <input
                type="text"
                placeholder="مثال: علوم الحاسب"
                className="
                  h-[48px]
                  w-full
                  rounded-[8px]
                  border
                  border-[#9DB5D8]
                  bg-white
                  pr-12
                  pl-4
                  text-[15px]
                  text-[#071B2F]
                  outline-none
                  transition

                  placeholder:text-[#94A3B8]

                  focus:border-[#164A68]
                "
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}