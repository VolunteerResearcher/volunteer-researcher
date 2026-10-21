
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ListFilter,
  Paperclip,
  Upload,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
];

export function ConsultationForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [helpType, setHelpType] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setErrorMessage("");

    const file = event.target.files?.[0] || null;

    if (!file) {
      setAttachment(null);
      return;
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setAttachment(null);
      event.target.value = "";
      setErrorMessage(
        "نوع الملف غير مدعوم. يرجى اختيار PDF أو Word أو PowerPoint."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setAttachment(null);
      event.target.value = "";
      setErrorMessage(
        "حجم الملف يجب ألا يتجاوز 10 ميجابايت."
      );
      return;
    }

    setAttachment(file);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (title.trim().length < 3 || title.trim().length > 200) {
      setErrorMessage(
        "عنوان الطلب يجب أن يكون بين 3 و200 حرف."
      );
      return;
    }

    if (
      description.trim().length < 10 ||
      description.trim().length > 1000
    ) {
      setErrorMessage(
        "وصف الطلب يجب أن يكون بين 10 و1000 حرف."
      );
      return;
    }

    if (!helpType) {
      setErrorMessage("يرجى اختيار نوع المساعدة المطلوبة.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("helpType", helpType);
      formData.append(
        "additionalNotes",
        additionalNotes.trim()
      );

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await fetch("/api/consultations", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        if (response.status === 401) {
          setErrorMessage(
            "يجب تسجيل الدخول بحساب مستفيد قبل إرسال الاستشارة."
          );
        } else {
          setErrorMessage(
            result.error ||
              "تعذر إرسال طلب الاستشارة. يرجى المحاولة مرة أخرى."
          );
        }
        return;
      }

      setSuccessMessage(
        result.message ||
          "تم إرسال طلب الاستشارة بنجاح."
      );

      setTitle("");
      setDescription("");
      setHelpType("");
      setAttachment(null);
      setAdditionalNotes("");

      const fileInput = document.getElementById(
        "consultation-attachment"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      router.refresh();
    } catch (error) {
      console.error("Consultation submission error:", error);
      setErrorMessage(
        "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      dir="rtl"
      className="bg-white px-4 pb-14 md:px-8 md:pb-20"
    >
      <div className="mx-auto max-w-[1320px]">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
        >
          {/* Request Title */}
          <div className="md:col-span-2">
            <label
              htmlFor="consultation-title"
              className="mb-2 block text-[17px] text-[#071B2F]"
            >
              عنوان الطلب
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <FileText
                size={20}
                strokeWidth={1.7}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <input
                id="consultation-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={200}
                required
                disabled={isSubmitting}
                placeholder="اكتب عنوان مختصر للطلب"
                className="h-[48px] w-full rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-4 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-60"
              />
            </div>
          </div>

          {/* Request Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="consultation-description"
              className="mb-2 block text-[17px] text-[#071B2F]"
            >
              وصف الطلب / الاستشارة المطلوبة
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <FileText
                size={20}
                strokeWidth={1.7}
                className="absolute right-4 top-4 text-[#164A68]"
              />

              <textarea
                id="consultation-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={1000}
                required
                disabled={isSubmitting}
                placeholder="يرجى توضيح تفاصيل طلبك ..."
                className="min-h-[130px] w-full resize-none rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-4 pt-3 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-60"
              />
            </div>

            <p className="mt-1 text-left text-[13px] text-[#6B7280]">
              {description.length}/1000
            </p>
          </div>

          {/* Help Type */}
          <div>
            <label
              htmlFor="consultation-help-type"
              className="mb-2 block text-[17px] text-[#071B2F]"
            >
              نوع المساعدة المطلوبة
              <span className="mr-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <ListFilter
                size={20}
                strokeWidth={1.7}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <select
                id="consultation-help-type"
                value={helpType}
                onChange={(event) =>
                  setHelpType(event.target.value)
                }
                required
                disabled={isSubmitting}
                className="h-[48px] w-full appearance-none rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-4 text-[15px] text-[#071B2F] outline-none focus:border-[#164A68] disabled:opacity-60"
              >
                <option value="">اختر نوع المساعدة</option>
                <option value="research">استشارة بحثية</option>
                <option value="methodology">منهجية البحث</option>
                <option value="analysis">تحليل البيانات</option>
                <option value="review">مراجعة بحث</option>
                <option value="other">أخرى</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label
              htmlFor="consultation-attachment"
              className="mb-2 block text-[17px] text-[#071B2F]"
            >
              إرفاق ملف
              <span className="mr-1 text-[#6B7280]">
                (إن وجد)
              </span>
            </label>

            <label
              htmlFor="consultation-attachment"
              className="flex min-h-[95px] cursor-pointer items-center justify-between rounded-[10px] border border-dashed border-[#9DB5D8] bg-[#F8FAFC] px-5 transition hover:border-[#164A68]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF2F8]">
                  <Paperclip
                    size={22}
                    strokeWidth={1.7}
                    className="text-[#164A68]"
                  />
                </div>

                <div>
                  <p className="text-[15px] text-[#071B2F]">
                    {attachment
                      ? attachment.name
                      : "اضغط لرفع ملف"}
                  </p>

                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    PDF, DOC, DOCX, PPT
                  </p>
                </div>
              </div>

              <Upload
                size={21}
                strokeWidth={1.7}
                className="text-[#164A68]"
              />

              <input
                id="consultation-attachment"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
              />
            </label>
          </div>

          {/* Additional Notes */}
          <div className="md:col-span-2">
            <label
              htmlFor="consultation-notes"
              className="mb-2 block text-[17px] text-[#071B2F]"
            >
              ملاحظات إضافية
            </label>

            <div className="relative">
              <FileText
                size={20}
                strokeWidth={1.7}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#164A68]"
              />

              <input
                id="consultation-notes"
                type="text"
                value={additionalNotes}
                onChange={(event) =>
                  setAdditionalNotes(event.target.value)
                }
                maxLength={2000}
                disabled={isSubmitting}
                placeholder="يمكنك إضافة أي ملاحظات أخرى ..."
                className="h-[48px] w-full rounded-[8px] border border-[#9DB5D8] bg-white pr-12 pl-4 text-[15px] text-[#071B2F] outline-none transition placeholder:text-[#94A3B8] focus:border-[#164A68] disabled:opacity-60"
              />
            </div>
          </div>

          {/* Login Notice */}
          <div className="md:col-span-2 flex items-start gap-3 rounded-[10px] border border-[#D6E4F0] bg-[#F8FBFD] px-4 py-3">
            <Info
              size={20}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-[#164A68]"
            />

            <p className="text-[14px] leading-6 text-[#071B2F]">
              لإرسال طلب الاستشارة، يجب أن يكون لديك حساب وأن تكون
              مسجل الدخول. يمكنك تعبئة النموذج، ولكن لن يتم إرسال الطلب
              إلا بعد تسجيل الدخول.
            </p>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div
              role="alert"
              className="md:col-span-2 flex items-start gap-3 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700"
            >
              <AlertCircle
                size={20}
                className="mt-1 shrink-0"
              />
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="md:col-span-2 flex items-start gap-3 rounded-[10px] border border-green-200 bg-green-50 px-4 py-3 text-sm leading-7 text-green-700"
            >
              <CheckCircle2
                size={20}
                className="mt-1 shrink-0"
              />
              <p>{successMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="md:col-span-2 flex flex-col gap-3 pt-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-[46px] min-w-[160px] items-center justify-center gap-2 rounded-[7px] bg-gradient-to-b from-[#071B2F] to-[#164A68] px-8 text-[15px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  جارٍ الإرسال...
                </>
              ) : (
                "إرسال"
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setTitle("");
                setDescription("");
                setHelpType("");
                setAttachment(null);
                setAdditionalNotes("");
                setErrorMessage("");
                setSuccessMessage("");

                const fileInput =
                  document.getElementById(
                    "consultation-attachment"
                  ) as HTMLInputElement | null;

                if (fileInput) {
                  fileInput.value = "";
                }
              }}
              className="min-h-[46px] min-w-[160px] rounded-[7px] bg-[#D9D9D9] px-8 text-[15px] text-[#071B2F] transition hover:opacity-80 disabled:opacity-60"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
