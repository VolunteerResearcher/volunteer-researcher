
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  LogIn,
  ShieldCheck,
  Ban,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

type ResearcherProfile = {
  full_name: string | null;
  role: string;
  approval_status: string | null;
  rejection_reason: string | null;
};

const statusContent = {
  pending: {
    title: "طلب انضمامك قيد المراجعة",
    description:
      "تم استلام طلب انضمامك كباحث متطوع، وهو الآن قيد المراجعة من قِبل إدارة المنصة. يمكنك العودة إلى هذه الصفحة لاحقًا لمتابعة حالة الطلب.",
    label: "قيد المراجعة",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  approved: {
    title: "تهانينا! تم اعتماد حسابك",
    description:
      "يسعدنا إبلاغك بأنه تمت الموافقة على انضمامك كباحث متطوع في منصة باحث متطوع. يمكنك الآن الانتقال إلى لوحة الباحث والبدء باستخدام خدمات المنصة.",
    label: "تم الاعتماد",
    badge: "bg-green-50 text-green-700 border-green-200",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  rejected: {
    title: "نعتذر، لم تتم الموافقة على طلبك",
    description:
      "بعد مراجعة طلب الانضمام، تعذّر اعتماده في الوقت الحالي. يمكنك الاطلاع على سبب الرفض أدناه.",
    label: "لم يتم الاعتماد",
    badge: "bg-red-50 text-red-700 border-red-200",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  suspended: {
    title: "حساب الباحث موقوف مؤقتًا",
    description:
      "تم إيقاف حسابك كباحث متطوع مؤقتًا. لا يمكنك الوصول إلى لوحة الباحث حتى تتم إعادة تفعيل حسابك من قِبل الإدارة.",
    label: "موقوف مؤقتًا",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
} satisfies Record<
  ApplicationStatus,
  {
    title: string;
    description: string;
    label: string;
    badge: string;
    iconBg: string;
    iconColor: string;
  }
>;

function isApplicationStatus(
  value: string | null
): value is ApplicationStatus {
  return (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "suspended"
  );
}

export function ResearcherStatusPage() {
  const router = useRouter();

  const [status, setStatus] =
    useState<ApplicationStatus | null>(null);

  const [researcherName, setResearcherName] =
    useState("");

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitialStatus() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          router.replace("/ar/researcher-login");
          return;
        }

        setIsAuthenticated(true);

        const { data, error } = await supabase
          .from("profiles")
          .select(
            "full_name, role, approval_status, rejection_reason"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        if (error || !data) {
          setErrorMessage(
            "تعذر تحميل حالة طلبك من قاعدة البيانات. يرجى المحاولة مرة أخرى."
          );
          return;
        }

        const profile = data as ResearcherProfile;

        if (profile.role !== "researcher") {
          router.replace("/ar/profile");
          return;
        }

        if (
          !isApplicationStatus(
            profile.approval_status
          )
        ) {
          setErrorMessage(
            "حالة الحساب غير معروفة. يرجى التواصل مع الإدارة."
          );
          return;
        }

        setStatus(profile.approval_status);
        setResearcherName(
          profile.full_name || ""
        );
        setRejectionReason(
          profile.rejection_reason || ""
        );

        if (
          profile.approval_status === "approved"
        ) {
          router.replace(
            "/ar/researcher-dashboard"
          );
        }
      } catch (error) {
        console.error(
          "Researcher status loading error:",
          error
        );

        if (active) {
          setErrorMessage(
            "حدث خطأ أثناء تحميل حالة طلبك. يرجى المحاولة مرة أخرى."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialStatus();

    return () => {
      active = false;
    };
  }, [router]);

  async function refreshStatus() {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/ar/researcher-login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, role, approval_status, rejection_reason"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data) {
        setErrorMessage(
          "تعذر تحديث حالة الطلب. يرجى المحاولة مرة أخرى."
        );
        return;
      }

      const profile = data as ResearcherProfile;

      if (profile.role !== "researcher") {
        router.replace("/ar/profile");
        return;
      }

      if (
        !isApplicationStatus(
          profile.approval_status
        )
      ) {
        setErrorMessage(
          "حالة الحساب غير معروفة. يرجى التواصل مع الإدارة."
        );
        return;
      }

      setStatus(profile.approval_status);
      setResearcherName(
        profile.full_name || ""
      );
      setRejectionReason(
        profile.rejection_reason || ""
      );

      if (
        profile.approval_status === "approved"
      ) {
        router.replace(
          "/ar/researcher-dashboard"
        );
      }
    } catch (error) {
      console.error(
        "Researcher status refresh error:",
        error
      );

      setErrorMessage(
        "حدث خطأ أثناء تحديث حالة الطلب."
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[75vh] items-center justify-center bg-[#F8FBFD] px-4"
      >
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto animate-spin text-[#164A68]"
          />
          <p className="mt-5 text-sm text-[#64748B]">
            جارٍ التحقق من حساب الباحث...
          </p>
        </div>
      </main>
    );
  }

  if (!status) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[75vh] items-center justify-center bg-[#F8FBFD] px-4 py-14"
      >
        <div className="w-full max-w-[510px] rounded-[24px] border border-[#D7E3EF] bg-white p-8 text-center shadow-sm">
          <AlertCircle
            size={42}
            className="mx-auto text-[#B4233A]"
          />

          <h1 className="mt-5 text-xl font-semibold text-[#071B2F]">
            تعذر عرض حالة طلب الباحث
          </h1>

          <p className="mt-4 text-sm leading-8 text-[#64748B]">
            {errorMessage ||
              "لم نتمكن من تحديد حالة حسابك حاليًا."}
          </p>

          {isAuthenticated && (
            <button
              type="button"
              onClick={refreshStatus}
              disabled={isRefreshing}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#164A68] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {isRefreshing ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={18} />
              )}
              إعادة المحاولة
            </button>
          )}
        </div>
      </main>
    );
  }

  const current = statusContent[status];

  return (
    <main
      dir="rtl"
      className="min-h-[75vh] bg-[#F8FBFD] px-4 py-14 md:py-20"
    >
      <div className="mx-auto max-w-[640px]">
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white px-6 py-10 shadow-sm sm:px-10">
          <div className="text-center">
            <div
              className={`mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full ${current.iconBg}`}
            >
              {status === "pending" ? (
                <Clock3
                  size={37}
                  strokeWidth={1.6}
                  className={current.iconColor}
                />
              ) : status === "approved" ? (
                <CheckCircle2
                  size={37}
                  strokeWidth={1.6}
                  className={current.iconColor}
                />
              ) : status === "rejected" ? (
                <XCircle
                  size={37}
                  strokeWidth={1.6}
                  className={current.iconColor}
                />
              ) : (
                <Ban
                  size={37}
                  strokeWidth={1.6}
                  className={current.iconColor}
                />
              )}
            </div>

            <span
              className={`inline-flex rounded-full border px-4 py-1.5 text-[13px] font-medium ${current.badge}`}
            >
              {current.label}
            </span>

            <h1 className="mt-5 text-[25px] font-semibold text-[#071B2F] sm:text-[28px]">
              {current.title}
            </h1>

            {researcherName && (
              <p className="mt-3 text-sm font-medium text-[#164A68]">
                أهلًا، {researcherName}
              </p>
            )}

            <p className="mt-4 text-[15px] leading-8 text-[#6B7280]">
              {current.description}
            </p>
          </div>

          {status === "pending" && (
            <div className="mt-8 rounded-[12px] border border-[#D7E3EF] bg-[#F8FBFD] px-5 py-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={23}
                  className="mt-1 shrink-0 text-[#164A68]"
                />

                <div>
                  <h2 className="text-[15px] font-semibold text-[#071B2F]">
                    كيف تتابع حالة طلبك؟
                  </h2>

                  <p className="mt-2 text-[14px] leading-7 text-[#6B7280]">
                    يمكنك تسجيل الدخول في أي وقت
                    باستخدام بريدك الإلكتروني وكلمة
                    المرور اللذين أنشأت بهما حسابك،
                    وستظهر لك حالة طلبك بعد تحديثها
                    من قِبل الإدارة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === "approved" && (
            <div className="mt-8">
              <Link
                href="/ar/researcher-dashboard"
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[9px] bg-gradient-to-b from-[#071B2F] to-[#164A68] px-5 text-[15px] font-medium text-white transition hover:opacity-90"
              >
                الانتقال إلى لوحة الباحث
                <ArrowLeft size={19} />
              </Link>
            </div>
          )}

          {status === "rejected" && (
            <div className="mt-8 rounded-[12px] border border-red-200 bg-red-50 px-5 py-5">
              <h2 className="text-[15px] font-semibold text-[#991B1B]">
                سبب عدم الاعتماد
              </h2>

              <p className="mt-2 whitespace-pre-wrap break-words text-[14px] leading-7 text-[#7F1D1D]">
                {rejectionReason ||
                  "لم يتم توضيح سبب الرفض. يرجى التواصل مع الإدارة."}
              </p>
            </div>
          )}

          {status === "suspended" && (
            <div className="mt-8 rounded-[12px] border border-slate-200 bg-slate-50 px-5 py-5">
              <div className="flex items-start gap-3">
                <Ban
                  size={22}
                  className="mt-1 shrink-0 text-slate-600"
                />

                <div>
                  <h2 className="text-[15px] font-semibold text-[#071B2F]">
                    إيقاف مؤقت للحساب
                  </h2>

                  <p className="mt-2 text-[14px] leading-7 text-[#6B7280]">
                    بيانات حسابك وطلب انضمامك
                    محفوظة. ستتمكن من العودة إلى
                    لوحة الباحث بعد إعادة تفعيل
                    حسابك من الإدارة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 border-t border-[#E5E7EB] pt-6">
            <button
              type="button"
              onClick={refreshStatus}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-2 rounded-[9px] border border-[#D7E3EF] bg-white px-5 py-3 text-[14px] font-medium text-[#164A68] transition hover:bg-[#F8FBFD] disabled:opacity-60"
            >
              {isRefreshing ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={18} />
              )}
              تحديث حالة الطلب
            </button>

            <Link
              href="/ar/researcher-login"
              className="flex items-center justify-center gap-2 text-[14px] font-medium text-[#164A68] transition hover:underline"
            >
              <LogIn size={18} />
              العودة إلى تسجيل دخول الباحث
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
