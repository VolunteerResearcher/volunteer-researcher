
"use client";

import { useEffect, useState } from "react";
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
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  organization: string;
  researchField: string;
  role: string;
};

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  organization: string | null;
  research_field: string | null;
  beneficiary_type: string | null;
  role: string | null;
};

const emptyData: ProfileData = {
  fullName: "",
  email: "",
  phone: "",
  specialization: "",
  organization: "",
  researchField: "",
  role: "student",
};

const beneficiaryTypes: Record<string, string> = {
  student: "طالب",
  "graduate-student": "طالب دراسات عليا",
  researcher: "باحث",
  faculty: "عضو هيئة تدريس",
  employee: "موظف",
  other: "أخرى",
};

function getBeneficiaryTypeLabel(value: string) {
  return beneficiaryTypes[value] || value || "غير محدد";
}

export function PersonalInfo() {
  const [profile, setProfile] = useState<ProfileData>(emptyData);
  const [draft, setDraft] = useState<ProfileData>(emptyData);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(
            "يجب تسجيل الدخول لعرض بيانات الملف الشخصي."
          );
        }

        const { data, error } = await supabase
          .from("profiles")
          .select(
            "full_name, email, phone, specialization, organization, research_field, beneficiary_type, role"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          throw new Error(
            "تعذر جلب بيانات الملف الشخصي: " + error.message
          );
        }

        if (!data) {
          throw new Error(
            "لم يتم العثور على الملف الشخصي لهذا الحساب."
          );
        }

        const row = data as ProfileRow;

        if (row.role !== "beneficiary") {
          throw new Error(
            "هذه الصفحة مخصصة لحسابات المستفيدين."
          );
        }

        const realProfile: ProfileData = {
          fullName: row.full_name || "",
          email: row.email || user.email || "",
          phone: row.phone || "",
          specialization: row.specialization || "",
          organization: row.organization || "",
          researchField: row.research_field || "",
          role: row.beneficiary_type || "student",
        };

        if (!cancelled) {
          setUserId(user.id);
          setProfile(realProfile);
          setDraft(realProfile);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحميل البيانات."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const startEditing = () => {
    setDraft({ ...profile });
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ ...profile });
    setErrorMessage("");
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!userId || isSaving) return;

    setErrorMessage("");
    setSuccessMessage("");

    const cleanFullName = draft.fullName.trim();
    const cleanPhone = draft.phone.trim();
    const cleanSpecialization = draft.specialization.trim();
    const cleanOrganization = draft.organization.trim();
    const cleanResearchField = draft.researchField.trim();

    if (
      !cleanFullName ||
      !cleanPhone ||
      !cleanSpecialization ||
      !cleanResearchField
    ) {
      setErrorMessage(
        "يرجى تعبئة جميع البيانات المطلوبة."
      );
      return;
    }

    if (!/^05\d{8}$/.test(cleanPhone)) {
      setErrorMessage(
        "يرجى إدخال رقم جوال صحيح يبدأ بـ 05 ويتكون من 10 أرقام."
      );
      return;
    }

    if (!beneficiaryTypes[draft.role]) {
      setErrorMessage("يرجى اختيار صفة صحيحة.");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== userId) {
        throw new Error(
          "انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مجددًا."
        );
      }

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          full_name: cleanFullName,
          phone: cleanPhone,
          specialization: cleanSpecialization,
          organization: cleanOrganization || null,
          research_field: cleanResearchField,
          beneficiary_type: draft.role,
        })
        .eq("id", user.id)
        .eq("role", "beneficiary")
        .select("id")
        .maybeSingle();

      if (error) {
        throw new Error(
          "تعذر حفظ التعديلات: " + error.message
        );
      }

      if (!updatedProfile) {
        throw new Error(
          "لم يتم تحديث البيانات. يرجى التحقق من صلاحيات الحساب."
        );
      }

      const savedProfile: ProfileData = {
        fullName: cleanFullName,
        email: profile.email,
        phone: cleanPhone,
        specialization: cleanSpecialization,
        organization: cleanOrganization,
        researchField: cleanResearchField,
        role: draft.role,
      };

      setProfile(savedProfile);
      setDraft(savedProfile);
      setIsEditing(false);
      setSuccessMessage("تم حفظ تعديلات الملف الشخصي بنجاح.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حفظ التعديلات."
      );
    } finally {
      setIsSaving(false);
    }
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
              disabled={isLoading || !userId}
              className="
                flex min-h-[44px] items-center justify-center gap-2
                rounded-[8px]
                border border-[#164A68]
                bg-white px-5
                text-[15px] text-[#071B2F]
                transition
                hover:bg-[#F8FBFD]
                disabled:cursor-not-allowed
                disabled:opacity-50
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
                disabled={isSaving}
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
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isSaving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} strokeWidth={1.7} />
                )}
                {isSaving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="
                  flex min-h-[44px] items-center justify-center gap-2
                  rounded-[8px]
                  border border-[#D1D5DB]
                  bg-white px-5
                  text-[15px] text-[#6B7280]
                  transition
                  hover:bg-[#F8FAFC]
                  disabled:opacity-60
                "
              >
                <X size={18} strokeWidth={1.7} />
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700"
          >
            <AlertCircle
              size={20}
              className="mt-1 shrink-0"
            />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-[10px] border border-green-200 bg-green-50 px-4 py-3 text-sm leading-7 text-green-700"
          >
            <CheckCircle2
              size={20}
              className="mt-1 shrink-0"
            />
            <p>{successMessage}</p>
          </div>
        )}

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
          {isLoading ? (
            <div className="flex min-h-[180px] items-center justify-center gap-3 text-[#164A68]">
              <Loader2
                size={22}
                className="animate-spin"
              />
              <span>جارٍ تحميل بياناتك الشخصية...</span>
            </div>
          ) : userId ? (
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

                        {isEditing && item.key !== "email" ? (
                          <input
                            type={item.type}
                            value={draft[item.key]}
                            onChange={(event) =>
                              updateField(
                                item.key,
                                event.target.value
                              )
                            }
                            disabled={isSaving}
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
                            {profile[item.key] || "غير محدد"}
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
                        onChange={(event) =>
                          updateField(
                            "role",
                            event.target.value
                          )
                        }
                        disabled={isSaving}
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
                        <option value="student">طالب</option>
                        <option value="graduate-student">
                          طالب دراسات عليا
                        </option>
                        <option value="researcher">باحث</option>
                        <option value="faculty">
                          عضو هيئة تدريس
                        </option>
                        <option value="employee">موظف</option>
                        <option value="other">أخرى</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-[16px] text-[#071B2F]">
                        {getBeneficiaryTypeLabel(profile.role)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-[15px] text-[#6B7280]">
              تعذر عرض البيانات الشخصية.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
