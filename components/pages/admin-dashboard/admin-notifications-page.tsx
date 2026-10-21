
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Filter,
  ClipboardList,
  UserRoundPlus,
  Star,
  UserRoundX,
  MessageSquare,
  CheckCheck,
  Check,
  ArrowUpLeft,
  Inbox,
} from "lucide-react";

type NotificationType =
  | "طلب جديد"
  | "تسجيل باحث"
  | "تقييم جديد"
  | "اعتذار باحث"
  | "معلومات إضافية";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  time: string;
  href: string;
  isRead: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "NOT-1001",
    type: "طلب جديد",
    title: "طلب مساعدة بحثية جديد",
    description:
      "قدمت سارة محمد طلبًا جديدًا بعنوان تطوير نموذج ذكاء اصطناعي، وهو بانتظار مراجعة الإدارة.",
    date: "2026/10/15",
    time: "10:30 ص",
    href: "/ar/admin-dashboard/requests/REQ-1024",
    isRead: false,
  },
  {
    id: "NOT-1002",
    type: "تسجيل باحث",
    title: "باحث جديد بانتظار المراجعة",
    description:
      "قدمت د. نورة العتيبي طلب الانضمام كباحثة متطوعة، ويرجى مراجعة بياناتها.",
    date: "2026/10/15",
    time: "09:15 ص",
    href: "/ar/admin-dashboard/researchers/RES-1004",
    isRead: false,
  },
  {
    id: "NOT-1003",
    type: "تقييم جديد",
    title: "تقييم جديد بانتظار الاعتماد",
    description:
      "قدمت هدى أحمد تقييمًا للباحث د. فهد القحطاني بعد اكتمال طلبها البحثي.",
    date: "2026/10/14",
    time: "04:20 م",
    href: "/ar/admin-dashboard/reviews",
    isRead: false,
  },
  {
    id: "NOT-1004",
    type: "اعتذار باحث",
    title: "اعتذار باحث عن تنفيذ طلب",
    description:
      "اعتذر أحد الباحثين عن قبول طلب بحثي، ويحتاج الطلب إلى إعادة تعيين باحث مناسب.",
    date: "2026/10/14",
    time: "01:45 م",
    href: "/ar/admin-dashboard/requests",
    isRead: false,
  },
  {
    id: "NOT-1005",
    type: "معلومات إضافية",
    title: "وصول معلومات إضافية من مستفيد",
    description:
      "أرسلت ريم أحمد معلومات إضافية بخصوص طلب تصميم استبيان بحثي.",
    date: "2026/10/13",
    time: "11:10 ص",
    href: "/ar/admin-dashboard/requests/REQ-1018",
    isRead: true,
  },
  {
    id: "NOT-1006",
    type: "تسجيل باحث",
    title: "طلب انضمام باحث متطوع",
    description:
      "قدمت أ. ريم الحربي طلب الانضمام إلى منصة باحث متطوع.",
    date: "2026/10/12",
    time: "08:30 م",
    href: "/ar/admin-dashboard/researchers/RES-1005",
    isRead: true,
  },
];

const notificationStyles: Record<
  NotificationType,
  {
    icon: typeof Bell;
    bg: string;
    color: string;
  }
> = {
  "طلب جديد": {
    icon: ClipboardList,
    bg: "bg-[#EAF2F8]",
    color: "text-[#164A68]",
  },
  "تسجيل باحث": {
    icon: UserRoundPlus,
    bg: "bg-[#F0EEFF]",
    color: "text-[#6554A4]",
  },
  "تقييم جديد": {
    icon: Star,
    bg: "bg-[#FFF5DC]",
    color: "text-[#B77900]",
  },
  "اعتذار باحث": {
    icon: UserRoundX,
    bg: "bg-[#FFF0F1]",
    color: "text-[#B4233A]",
  },
  "معلومات إضافية": {
    icon: MessageSquare,
    bg: "bg-[#E8F7EE]",
    color: "text-[#2E7D4F]",
  },
};

export function AdminNotificationsPage() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("الكل");
  const [typeFilter, setTypeFilter] = useState("الكل");

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !query ||
        [
          notification.title,
          notification.description,
          notification.type,
        ].some((value) =>
          value.toLowerCase().includes(query)
        );

      const matchesRead =
        readFilter === "الكل" ||
        (readFilter === "غير مقروء" &&
          !notification.isRead) ||
        (readFilter === "مقروء" &&
          notification.isRead);

      const matchesType =
        typeFilter === "الكل" ||
        notification.type === typeFilter;

      return matchesSearch && matchesRead && matchesType;
    });
  }, [notifications, search, readFilter, typeFilter]);

  const markAsRead = (id: string) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  return (
    <section
      dir="rtl"
      className="min-h-screen bg-[#F8FBFD] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#071B2F] sm:text-3xl">
              إدارة الإشعارات
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#64748B]">
              متابعة آخر الأحداث والتنبيهات المتعلقة
              بالطلبات والباحثين والتقييمات.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-[#164A68] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#123E58] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={18} />
            تحديد الكل كمقروء
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Bell}
            label="إجمالي الإشعارات"
            value={notifications.length}
          />

          <StatCard
            icon={Inbox}
            label="غير المقروءة"
            value={unreadCount}
          />

          <StatCard
            icon={CheckCheck}
            label="المقروءة"
            value={notifications.length - unreadCount}
          />
        </div>

        {/* Notifications */}
        <div className="rounded-[24px] border border-[#D7E3EF] bg-white p-5 sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#071B2F]">
              قائمة الإشعارات
            </h2>

            <p className="mt-2 text-sm text-[#64748B]">
              تصفحي الإشعارات وحددي ما تمت مراجعته.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
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
                placeholder="ابحثي في الإشعارات..."
                className="h-11 w-full rounded-xl border border-[#D7E3EF] bg-white pr-11 pl-4 text-sm text-[#071B2F] outline-none placeholder:text-[#94A3B8] focus:border-[#164A68]"
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />

              <select
                value={readFilter}
                onChange={(event) =>
                  setReadFilter(event.target.value)
                }
                className="h-11 w-full cursor-pointer rounded-xl border border-[#D7E3EF] bg-white pr-10 pl-4 text-sm text-[#071B2F] outline-none focus:border-[#164A68] lg:w-[175px]"
              >
                <option value="الكل">جميع الإشعارات</option>
                <option value="غير مقروء">غير مقروءة</option>
                <option value="مقروء">مقروءة</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="h-11 w-full cursor-pointer rounded-xl border border-[#D7E3EF] bg-white px-4 text-sm text-[#071B2F] outline-none focus:border-[#164A68] lg:w-[180px]"
            >
              <option value="الكل">جميع الأنواع</option>
              <option value="طلب جديد">طلبات جديدة</option>
              <option value="تسجيل باحث">تسجيل الباحثين</option>
              <option value="تقييم جديد">التقييمات</option>
              <option value="اعتذار باحث">اعتذارات الباحثين</option>
              <option value="معلومات إضافية">
                معلومات إضافية
              </option>
            </select>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const style =
                notificationStyles[notification.type];

              const Icon = style.icon;

              return (
                <article
                  key={notification.id}
                  className={`rounded-[18px] border p-4 transition sm:p-5 ${
                    notification.isRead
                      ? "border-[#E5EDF3] bg-white"
                      : "border-[#C7DCE9] bg-[#F3F9FC]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.bg} ${style.color}`}
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-[#071B2F]">
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span className="rounded-full bg-[#164A68] px-3 py-1 text-[11px] text-white">
                            جديد
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-7 text-[#64748B]">
                        {notification.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                        <span>{notification.type}</span>
                        <span>•</span>
                        <span>{notification.date}</span>
                        <span>•</span>
                        <span>{notification.time}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Link
                          href={notification.href}
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-[#164A68] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#123E58]"
                        >
                          <ArrowUpLeft size={15} />
                          عرض التفاصيل
                        </Link>

                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(notification.id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-[#D7E3EF] bg-white px-4 py-2.5 text-xs font-medium text-[#164A68] transition hover:bg-[#EAF2F8]"
                          >
                            <Check size={15} />
                            تحديد كمقروء
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="py-14 text-center">
                <Inbox
                  size={38}
                  className="mx-auto text-[#94A3B8]"
                />

                <p className="mt-4 text-sm text-[#64748B]">
                  لا توجد إشعارات مطابقة للبحث.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-xs leading-6 text-[#94A3B8]">
          ملاحظة: الإشعارات الحالية تجريبية،
          وحالة القراءة تُحفظ داخل الصفحة فقط.
          سيتم ربطها بالأحداث الفعلية وقاعدة
          البيانات لاحقًا.
        </p>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bell;
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
