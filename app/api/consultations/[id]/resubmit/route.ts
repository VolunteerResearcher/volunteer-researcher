
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_HELP_TYPES = new Set([
  "research",
  "methodology",
  "analysis",
  "review",
  "other",
]);

const ALLOWED_FILES: Record<
  string,
  { mimeTypes: string[]; signatures: number[][] }
> = {
  pdf: {
    mimeTypes: ["application/pdf"],
    signatures: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  },
  doc: {
    mimeTypes: ["application/msword"],
    signatures: [[0xd0, 0xcf, 0x11, 0xe0]],
  },
  docx: {
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    signatures: [[0x50, 0x4b, 0x03, 0x04]],
  },
  ppt: {
    mimeTypes: ["application/vnd.ms-powerpoint"],
    signatures: [[0xd0, 0xcf, 0x11, 0xe0]],
  },
  pptx: {
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    signatures: [[0x50, 0x4b, 0x03, 0x04]],
  },
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

function hasSignature(
  bytes: Uint8Array,
  signature: number[]
) {
  return signature.every(
    (byte, index) => bytes[index] === byte
  );
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  let uploadedPath: string | null = null;

  try {
    const { id } = await params;

    const isValidId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      );

    if (!isValidId) {
      return jsonError("رقم الطلب غير صالح.", 400);
    }

    const supabase = await createClient();

    const { data: claimsData, error: authError } =
      await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (authError || !userId) {
      return jsonError(
        "يجب تسجيل الدخول لاستكمال الطلب.",
        401
      );
    }

    const admin = createAdminClient();

    const { data: profile, error: profileError } =
      await admin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (
      profileError ||
      profile?.role !== "beneficiary"
    ) {
      return jsonError(
        "هذا الإجراء متاح للمستفيدين فقط.",
        403
      );
    }

    const { data: existing, error: existingError } =
      await admin
        .from("consultation_requests")
        .select(
          "id, beneficiary_id, status, assigned_researcher_id, attachment_path"
        )
        .eq("id", id)
        .eq("beneficiary_id", userId)
        .maybeSingle();

    if (existingError) {
      console.error(
        "Load consultation error:",
        existingError.message
      );

      return jsonError(
        "تعذر التحقق من الطلب.",
        500
      );
    }

    if (!existing) {
      return jsonError(
        "الطلب غير موجود ضمن طلبات حسابك.",
        404
      );
    }

    if (
      existing.status !== "needs_revision" ||
      existing.assigned_researcher_id !== null
    ) {
      return jsonError(
        "هذا الطلب غير متاح للتعديل حاليًا.",
        409
      );
    }

    const contentType =
      request.headers.get("content-type") || "";

    if (
      !contentType
        .toLowerCase()
        .includes("multipart/form-data")
    ) {
      return jsonError(
        "صيغة بيانات الطلب غير صحيحة.",
        400
      );
    }

    const formData = await request.formData();

    const title = String(
      formData.get("title") || ""
    ).trim();

    const description = String(
      formData.get("description") || ""
    ).trim();

    const helpType = String(
      formData.get("helpType") || ""
    ).trim();

    const additionalNotes = String(
      formData.get("additionalNotes") || ""
    ).trim();

    const attachmentValue =
      formData.get("attachment");

    const attachment =
      attachmentValue instanceof File &&
      attachmentValue.size > 0
        ? attachmentValue
        : null;

    if (
      title.length < 3 ||
      title.length > 200
    ) {
      return jsonError(
        "عنوان الطلب يجب أن يكون بين 3 و200 حرف.",
        400
      );
    }

    if (
      description.length < 10 ||
      description.length > 1000
    ) {
      return jsonError(
        "وصف الطلب يجب أن يكون بين 10 و1000 حرف.",
        400
      );
    }

    if (!ALLOWED_HELP_TYPES.has(helpType)) {
      return jsonError(
        "يرجى اختيار نوع المساعدة المطلوبة.",
        400
      );
    }

    if (additionalNotes.length > 2000) {
      return jsonError(
        "الملاحظات الإضافية يجب ألا تتجاوز 2000 حرف.",
        400
      );
    }

    let fileBytes: Uint8Array | null = null;
    let fileMimeType: string | null = null;
    let fileExtension: string | null = null;

    if (attachment) {
      if (attachment.size > MAX_FILE_SIZE) {
        return jsonError(
          "حجم الملف يجب ألا يتجاوز 10 ميجابايت.",
          400
        );
      }

      fileExtension =
        attachment.name
          .split(".")
          .pop()
          ?.toLowerCase() || "";

      const allowedFile =
        ALLOWED_FILES[fileExtension];

      if (!allowedFile) {
        return jsonError(
          "نوع الملف غير مدعوم. الصيغ المسموحة: PDF وDOC وDOCX وPPT وPPTX.",
          400
        );
      }

      if (
        !allowedFile.mimeTypes.includes(
          attachment.type
        )
      ) {
        return jsonError(
          "صيغة الملف المرفق غير صحيحة.",
          400
        );
      }

      fileBytes = new Uint8Array(
        await attachment.arrayBuffer()
      );

      const validSignature =
        allowedFile.signatures.some(
          (signature) =>
            hasSignature(fileBytes!, signature)
        );

      if (!validSignature) {
        return jsonError(
          "تعذر التحقق من سلامة الملف المرفق.",
          400
        );
      }

      fileMimeType = attachment.type;
    }

    if (
      attachment &&
      fileBytes &&
      fileExtension &&
      fileMimeType
    ) {
      uploadedPath =
        `${userId}/${id}/${randomUUID()}.${fileExtension}`;

      const { error: uploadError } =
        await admin.storage
          .from("consultation-attachments")
          .upload(uploadedPath, fileBytes, {
            contentType: fileMimeType,
            upsert: false,
          });

      if (uploadError) {
        console.error(
          "Resubmit attachment upload error:",
          uploadError.message
        );

        return jsonError(
          "تعذر رفع المرفق الجديد.",
          500
        );
      }
    }

    const updateData = {
      title,
      description,
      help_type: helpType,
      additional_notes:
        additionalNotes || null,
      attachment_path:
        uploadedPath ?? existing.attachment_path,
      status: "pending",
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } =
      await admin
        .from("consultation_requests")
        .update(updateData)
        .eq("id", id)
        .eq("beneficiary_id", userId)
        .eq("status", "needs_revision")
        .is("assigned_researcher_id", null)
        .select("id, status")
        .maybeSingle();

    if (updateError || !updated) {
      if (uploadedPath) {
        await admin.storage
          .from("consultation-attachments")
          .remove([uploadedPath]);
      }

      if (updateError) {
        console.error(
          "Resubmit consultation error:",
          updateError.message
        );

        return jsonError(
          "تعذر حفظ التعديلات.",
          500
        );
      }

      return jsonError(
        "تعذر إعادة إرسال الطلب؛ ربما تغيرت حالته.",
        409
      );
    }

    return NextResponse.json({
      success: true,
      requestId: updated.id,
      status: updated.status,
      message:
        "تم حفظ التعديلات وإعادة إرسال الطلب للإدارة بنجاح.",
    });
  } catch (error) {
    console.error(
      "Unexpected resubmit error:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    if (uploadedPath) {
      try {
        const admin = createAdminClient();

        await admin.storage
          .from("consultation-attachments")
          .remove([uploadedPath]);
      } catch {
        // الاحتفاظ بالخطأ الأصلي
      }
    }

    return jsonError(
      "حدث خطأ غير متوقع أثناء إعادة إرسال الطلب.",
      500
    );
  }
}
