
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Star,
  Search,
  Filter,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  MessageSquare,
} from "lucide-react";

type ReviewStatus = "pending" | "approved" | "rejected";

type Review = {
  id: string;
  requestId: string;
  requestTitle: string;
  beneficiary: string;
  researcher: string;
  researcherId: string;
  rating: number;
  comment: string;
  date: string;
  status: ReviewStatus;
  rejectionReason: string | null;
};

type ReviewRow = {
  id: string;
  consultation_id: string;
  beneficiary_id: string;
  researcher_id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  rejection_reason: string | null;
  created_at: string;
};

const statusLabels: Record<ReviewStatus, string> = {
  pending: "بانتظار المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
};

const statusStyles: Record<ReviewStatus, string> = {
  pending: "bg-[#FFF3D6] text-[#A36A00]",
  approved: "bg-[#E8F7EE] text-[#2E7D4F]",
  rejected: "bg-[#FFE8EC] text-[#B4233A]",
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} من 5 نجوم`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          className={
            index < rating
              ? "fill-[#E5A000] text-[#E5A000]"
              : "fill-none text-[#CBD5E1]"
          }
        />
      ))}
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    calendar: "gregory",
  }).format(new Date(date));
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");

  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const supabase = createClient();

      const { data: reviewData, error: reviewsError } =
        await supabase
          .from("consultation_reviews")
          .select(
            "id, consultation_id, beneficiary_id, researcher_id, rating, comment, status, rejection_reason, created_at"
          )
          .order("created_at", { ascending: false });

      if (reviewsError) {
        throw reviewsError;
      }

      const rows = (reviewData ?? []) as ReviewRow[];

      if (rows.length === 0) {
        setReviews([]);
        return;
      }

      const consultationIds = [
        ...new Set(rows.map((row) => row.consultation_id)),
      ];

      const profileIds = [
        ...new Set(
          rows.flatMap((row) => [
            row.beneficiary_id,
            row.researcher_id,
          ])
        ),
      ];

      const [consultationsResult, profilesResult] =
        await Promise.all([
          supabase
            .from("consultation_requests")
            .select("id, title")
            .in("id", consultationIds),

          supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", profileIds),
        ]);

      if (consultationsResult.error) {
        throw consultationsResult.error;
      }

      if (profilesResult.error) {
        throw profilesResult.error;
      }

      const consultationTitles = new Map<string, string>();

      for (const consultation of consultationsResult.data ?? []) {
        consultationTitles.set(
          consultation.id,
          consultation.title
        );
      }

      const profileNames = new Map<string, string>();

      for (const profile of profilesResult.data ?? []) {
        profileNames.set(
          profile.id,
          profile.full_name || "غير محدد"
        );
      }

      const realReviews: Review[] = rows.map((row) => ({
        id: row.id,
        requestId: row.consultation_id,
        requestTitle:
          consultationTitles.get(row.consultation_id) ??
          "استشارة بحثية",
        beneficiary:
          profileNames.get(row.beneficiary_id) ?? "مستفيد",
        researcher:
          profileNames.get(row.researcher_id) ?? "باحث",
        researcherId: row.researcher_id,
        rating: row.rating,
        comment: row.comment ?? "",
        date: row.created_at,
        status: row.status,
        rejectionReason: row.rejection_reason,
      }));

      setReviews(realReviews);
    } catch (err) {
      console.error("Admin reviews loading error:", err);

      setPageError(
        "تعذر تحميل التقييمات. يرجى تحديث الصفحة والمحاولة مجددًا."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        [
          review.id,
          review.requestId,
          review.requestTitle,
          review.beneficiary,
          review.researcher,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "الكل" ||
        review.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, statusFilter]);

  const pendingCount = reviews.filter(
    (review) => review.status === "pending"
  ).length;

  const approvedCount = reviews.filter(
    (review) => review.status === "approved"
  ).length;

  const rejectedCount = reviews.filter(
    (review) => review.status === "rejected"
  ).length;

  const closeModal = () => {
    if (saving) return;

    setSelectedReview(null);
    setRejectionReason("");
    setError("");
  };

  const moderateReview = async (
    action: "approve" | "reject"
  ) => {
    if (!selectedReview || saving) return;

    if (
      action === "reject" &&
      !rejectionReason.trim()
    ) {
      setError("يرجى كتابة سبب رفض التقييم.");
      return;
    }

    if (
      action === "reject" &&
      rejectionReason.trim().length > 1000
    ) {
      setError("سبب الرفض طويل جدًا.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/reviews/${selectedReview.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            rejectionReason:
              action === "reject"
                ? rejectionReason.trim()
                : null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ?? "تعذرت مراجعة التقييم."
        );
      }

      const updatedStatus: ReviewStatus =
        action === "approve" ? "approved" : "rejected";

      setReviews((previous) =>
        previous.map((review) =>
          review.id === selectedReview.id
            ? {
                ...review,
                status: updatedStatus,
                rejectionReason:
                  action === "reject"
                    ? rejectionReason.trim()
                    : null,
              }
            : review
        )
      );

      setSelectedReview(null);
      setRejectionReason("");
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذرت مراجعة التقييم."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1300px]">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#071B2F] sm:text-3xl">
            إدارة التقييمات
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#64748B]">
            مراجعة تقييمات المستفيدين واعتماد المناسب منها
            لاحتسابها ضمن تقييمات الباحثين.
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={MessageSquare}
            label="إجمالي التقييمات"
            value={reviews.length}
          />

          <StatCard
            icon={Clock3}
            label="بانتظار المراجعة"
            value={pendingCount}
          />

          <StatCard
            icon={CheckCircle2}
            label="التقييمات المعتمدة"
            value={approvedCount}
          />

          <StatCard
            icon={XCircle}
            label="التقييمات المرفوضة"
            value={rejectedCount}
          />
        </div>

        {/* الجدول */}
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#071B2F]">
                قائمة التقييمات
              </h2>

              <p className="mt-2 text-sm text-[#64748B]">
                لا تُحتسب التقييمات إلا بعد اعتماد الإدارة.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="ابحث عن تقييم..."
                  className="h-11 w-full rounded-xl border border-[#D7E3EF] bg-white pr-11 pl-4 text-sm text-[#071B2F] outline-none placeholder:text-[#94A3B8] focus:border-[#164A68] sm:w-[250px]"
                />
              </div>

              <div className="relative">
                <Filter
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-[#D7E3EF] bg-white pr-10 pl-4 text-sm text-[#071B2F] outline-none focus:border-[#164A68] sm:w-[185px]"
                >
                  <option value="الكل">جميع الحالات</option>
                  <option value="pending">
                    بانتظار المراجعة
                  </option>
                  <option value="approved">معتمد</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-right text-xs text-[#64748B]">
                  <th className="px-4 py-3 font-medium">
                    رقم التقييم
                  </th>
                  <th className="px-4 py-3 font-medium">
                    المستفيد
                  </th>
                  <th className="px-4 py-3 font-medium">
                    الباحث
                  </th>
                  <th className="px-4 py-3 font-medium">
                    النجوم
                  </th>
                  <th className="px-4 py-3 font-medium">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 font-medium">
                    الحالة
                  </th>
                  <th className="px-4 py-3 font-medium">
                    التفاصيل
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    className="bg-[#F8FBFD] text-sm text-[#071B2F]"
                  >
                    <td className="rounded-r-xl px-4 py-4">
                      <p className="font-medium">
                        #{review.id.slice(0, 8)}
                      </p>

                      <p className="mt-1 text-xs text-[#94A3B8]">
                        طلب #{review.requestId.slice(0, 8)}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {review.beneficiary}
                    </td>

                    <td className="px-4 py-4">
                      {review.researcher}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={review.rating} />

                        <span className="text-xs text-[#64748B]">
                          {review.rating}/5
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {formatDate(review.date)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs ${statusStyles[review.status]}`}
                      >
                        {statusLabels[review.status]}
                      </span>
                    </td>

                    <td className="rounded-l-xl px-4 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReview(review);
                          setRejectionReason("");
                          setError("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D7E3EF] bg-white px-3 py-2 text-xs font-medium text-[#164A68] transition hover:border-[#164A68] hover:bg-[#EAF2F8]"
                      >
                        <Eye size={15} />
                        عرض التقييم
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <p className="py-14 text-center text-sm text-[#64748B]">
                جارٍ تحميل التقييمات...
              </p>
            )}

            {!loading && pageError && (
              <div className="py-14 text-center">
                <p className="text-sm text-[#B4233A]">
                  {pageError}
                </p>

                <button
                  type="button"
                  onClick={() => void loadReviews()}
                  className="mt-4 text-sm font-medium text-[#164A68] hover:underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {!loading &&
              !pageError &&
              filteredReviews.length === 0 && (
                <div className="py-14 text-center text-sm text-[#64748B]">
                  {reviews.length === 0
                    ? "لا توجد تقييمات فعلية حتى الآن."
                    : "لا توجد تقييمات مطابقة لبحثك."}
                </div>
              )}
          </div>
        </div>

        <p className="mt-5 text-xs leading-6 text-[#94A3B8]">
          التقييمات المعروضة مرتبطة بطلبات الاستشارات
          الفعلية. لا تُعتمد التقييمات إلا بعد مراجعتها
          من الإدارة.
        </p>
      </div>

      {/* نافذة تفاصيل التقييم */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6"
          dir="rtl"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            className="relative max-h-[90vh] w-full max-w-[570px] overflow-y-auto rounded-[24px] bg-white p-6 shadow-xl sm:p-8"
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              aria-label="إغلاق"
              className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <h2
              id="review-dialog-title"
              className="pl-10 text-xl font-semibold text-[#071B2F]"
            >
              تفاصيل التقييم
            </h2>

            <p className="mt-2 text-sm text-[#64748B]">
              #{selectedReview.id.slice(0, 8)}
            </p>

            <div className="mt-6 grid gap-4 rounded-2xl bg-[#F8FBFD] p-5 sm:grid-cols-2">
              <Detail
                label="المستفيد"
                value={selectedReview.beneficiary}
              />

              <Detail
                label="الباحث"
                value={selectedReview.researcher}
              />

              <Detail
                label="عنوان الطلب"
                value={selectedReview.requestTitle}
              />

              <Detail
                label="تاريخ التقييم"
                value={formatDate(selectedReview.date)}
              />
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-[#071B2F]">
                عدد النجوم
              </p>

              <div className="flex items-center gap-3">
                <RatingStars rating={selectedReview.rating} />

                <span className="text-sm font-semibold text-[#071B2F]">
                  {selectedReview.rating} من 5
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-[#071B2F]">
                تعليق المستفيد
              </p>

              <div className="rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] p-4 text-sm leading-8 text-[#475569]">
                {selectedReview.comment.trim() ||
                  "لم يكتب المستفيد تعليقًا."}
              </div>
            </div>

            <div className="mt-5">
              <Link
                href={`/ar/admin-dashboard/requests/${selectedReview.requestId}`}
                onClick={(event) => {
                  if (saving) {
                    event.preventDefault();
                    return;
                  }

                  closeModal();
                }}
                className="text-sm font-medium text-[#164A68] hover:underline"
              >
                عرض الطلب المرتبط ←
              </Link>
            </div>

            {selectedReview.status === "rejected" &&
              selectedReview.rejectionReason && (
                <div className="mt-6 rounded-xl border border-[#F5CBD2] bg-[#FFF7F8] p-4">
                  <p className="text-sm font-medium text-[#B4233A]">
                    سبب الرفض
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[#475569]">
                    {selectedReview.rejectionReason}
                  </p>
                </div>
              )}

            {selectedReview.status === "pending" ? (
              <>
                <div className="mt-6">
                  <label
                    htmlFor="rejection-reason"
                    className="mb-2 block text-sm font-medium text-[#071B2F]"
                  >
                    سبب الرفض
                    <span className="mr-2 text-xs font-normal text-[#94A3B8]">
                      مطلوب عند الرفض فقط
                    </span>
                  </label>

                  <textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(event) => {
                      setRejectionReason(event.target.value);
                      setError("");
                    }}
                    rows={3}
                    disabled={saving}
                    placeholder="اكتبي سبب الرفض إذا قررتِ رفض التقييم..."
                    className="w-full resize-none rounded-xl border border-[#D7E3EF] bg-[#F8FBFD] px-4 py-3 text-sm text-[#071B2F] outline-none focus:border-[#164A68] disabled:opacity-50"
                  />

                  {error && (
                    <p className="mt-2 text-xs text-[#B4233A]">
                      {error}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      void moderateReview("approve")
                    }
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#164A68] px-5 py-3 text-sm font-medium text-white hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 size={17} />
                    {saving
                      ? "جارٍ الحفظ..."
                      : "اعتماد التقييم"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void moderateReview("reject")
                    }
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#B4233A] px-5 py-3 text-sm font-medium text-[#B4233A] hover:bg-[#FFF1F3] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle size={17} />
                    رفض التقييم
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-xl bg-[#F8FBFD] px-4 py-3 text-sm text-[#64748B]">
                حالة التقييم:{" "}
                <span className="font-semibold">
                  {statusLabels[selectedReview.status]}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-[#94A3B8]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-[#071B2F]">
        {value}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#D7E3EF] bg-white p-5">
      <div>
        <p className="text-sm text-[#64748B]">
          {label}
        </p>

        <p className="mt-3 text-[28px] font-semibold text-[#071B2F]">
          {value}
        </p>
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2F8] text-[#164A68]">
        <Icon size={23} strokeWidth={1.8} />
      </div>
    </div>
  );
}
