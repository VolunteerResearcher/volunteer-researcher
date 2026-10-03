"use client";

import { useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  BookOpen,
  BadgeCheck,
  Pencil,
  Save,
  X,
} from "lucide-react";

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  organization: string;
  researchField: string;
  role: string;
};

const initialData: ProfileData = {
  fullName: "رولا محمد العنزي",
  email: "example@domain.com",
  phone: "05xxxxxxxx",
  specialization: "علوم الحاسب",
  organization: "جامعة الجوف",
  researchField: "الذكاء الاصطناعي",
  role: "طالب",
};

export function PersonalInfo() {
  const [profile, setProfile] = useState<ProfileData>(initialData);
  const [draft, setDraft] = useState<ProfileData>(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const saveChanges = () => {
    setProfile(draft);
    setIsEditing(false);
  };

  const updateField = (
    field: keyof ProfileData,
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fields = [
    {
      key: "fullName" as const,
      label: "الاسم الكامل",
      icon: UserRound,
      type: "text",
    },
    {
      key: "email" as const,
      label: "البريد الإلكتروني",
      icon: Mail,
      type: "email",
    },
    {
      key: "phone" as const,
      label: "رقم الجوال",
      icon: Phone,
      type: "tel",
    },
    {
      key: "specialization" as const,
      label: "التخصص",
      icon: GraduationCap,
      type: "text",
    },
    {
      key: "organization" as const,
      label: "الجهة",
      icon: Building2,
      type: "text",
    },
    {
      key: "researchField" as const,
      label: "مجال البحث",
      icon: BookOpen,
      type: "text",
    },
  ];

  return (
    <section
      dir="rtl"
      className="bg-white px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto max-w-[1320px]">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[28px] font-normal text-[#071B2F] sm:text-[32px] md:text-[36px]">
              الملف الشخصي
            </h2>

            <p className="mt-2 text-[16px] text-[#6B7280] sm:text-[18px]">
              يمكنك الاطلاع على بياناتك الشخصية ومتابعة طلباتك.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="
                flex min-h-[44px] items-center justify-center gap-2
                rounded-[8px]
                border border-[#164A68]
                bg-white px-5
                text-[15px] text-[#071B2F]
                transition
                hover:bg-[#F8FBFD]
              "
            >
              <Pencil size={18} strokeWidth={1.7} />
              تعديل البيانات
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveChanges}
                className="
                  flex min-h-[44px] items-center justify-center gap-2
                  rounded-[8px]
                  bg-gradient-to-b
                  from-[#071B2F]
                  to-[#164A68]
                  px-5
                  text-[15px] text-white
                  transition
                  hover:opacity-90
                "
              >
                <Save size={18} strokeWidth={1.7} />
                حفظ التعديلات
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                className="
                  flex min-h-[44px] items-center justify-center gap-2
                  rounded-[8px]
                  border border-[#D1D5DB]
                  bg-white px-5
                  text-[15px] text-[#6B7280]
                  transition
                  hover:bg-[#F8FAFC]
                "
              >
                <X size={18} strokeWidth={1.7} />
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div
          className="
            rounded-[24px]
            border border-[#9DB5D8]
            bg-white
            px-5 py-7
            md:px-8 md:py-9
          "
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {fields.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="
                    rounded-[10px]
                    border border-[#D6E4F0]
                    bg-[#F8FBFD]
                    px-4 py-4
                  "
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={21}
                      strokeWidth={1.7}
                      className="shrink-0 text-[#164A68]"
                    />

                    <div className="w-full">
                      <p className="text-[14px] text-[#6B7280]">
                        {item.label}
                      </p>

                      {isEditing ? (
                        <input
                          type={item.type}
                          value={draft[item.key]}
                          onChange={(e) =>
                            updateField(
                              item.key,
                              e.target.value
                            )
                          }
                          className="
                            mt-2
                            h-[42px]
                            w-full
                            rounded-[7px]
                            border border-[#9DB5D8]
                            bg-white
                            px-3
                            text-[15px]
                            text-[#071B2F]
                            outline-none
                            transition
                            focus:border-[#164A68]
                            focus:ring-1
                            focus:ring-[#164A68]/20
                          "
                        />
                      ) : (
                        <p className="mt-1 text-[16px] text-[#071B2F]">
                          {profile[item.key]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Role */}
            <div
              className="
                rounded-[10px]
                border border-[#D6E4F0]
                bg-[#F8FBFD]
                px-4 py-4
              "
            >
              <div className="flex items-center gap-3">
                <BadgeCheck
                  size={21}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#164A68]"
                />

                <div className="w-full">
                  <p className="text-[14px] text-[#6B7280]">
                    الصفة
                  </p>

                  {isEditing ? (
                    <select
                      value={draft.role}
                      onChange={(e) =>
                        updateField("role", e.target.value)
                      }
                      className="
                        mt-2
                        h-[42px]
                        w-full
                        rounded-[7px]
                        border border-[#9DB5D8]
                        bg-white
                        px-3
                        text-[15px]
                        text-[#071B2F]
                        outline-none
                        focus:border-[#164A68]
                      "
                    >
                      <option value="طالب">طالب</option>

                      <option value="طالب دراسات عليا">
                        طالب دراسات عليا
                      </option>

                      <option value="باحث">
                        باحث
                      </option>

                      <option value="عضو هيئة تدريس">
                        عضو هيئة تدريس
                      </option>

                      <option value="موظف">
                        موظف
                      </option>

                      <option value="أخرى">
                        أخرى
                      </option>
                    </select>
                  ) : (
                    <p className="mt-1 text-[16px] text-[#071B2F]">
                      {profile.role}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}