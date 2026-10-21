
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fileTypeFromBuffer } from "file-type";
import { unzipSync } from "fflate";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/security/verify-turnstile";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_REQUEST_SIZE = 11 * 1024 * 1024;

const allowedExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
]);

const allowedResearchFields = new Set([
  "health",
  "engineering",
  "technology",
  "social",
  "education",
  "business",
  "law",
  "humanities",
  "environment",
  "basic-sciences",
  "other",
]);

const mimeTypes: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx:
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

function hasOfficeStructure(
  bytes: Uint8Array,
  extension: "docx" | "pptx"
): boolean {
  try {
    const names = new Set<string>();

    // نفحص أسماء الملفات داخل أرشيف Office
    // دون فك ضغط محتوياتها.
    unzipSync(bytes, {
      filter: (entry) => {
        names.add(entry.name);
        return false;
      },
    });

    if (
      names.size === 0 ||
      names.size > 10000 ||
      !names.has("[Content_Types].xml") ||
      !names.has("_rels/.rels")
    ) {
      return false;
    }

    if (extension === "docx") {
      return names.has("word/document.xml");
    }

    return names.has("ppt/presentation.xml");
  } catch {
    return false;
  }
}

async function validateCV(
  file: File,
  extension: string
): Promise<{
  valid: boolean;
  contentType?: string;
  bytes?: Uint8Array;
}> {
  if (
    !allowedExtensions.has(extension) ||
    file.size === 0 ||
    file.size > MAX_FILE_SIZE
  ) {
    return { valid: false };
  }

  const bytes = new Uint8Array(
    await file.arrayBuffer()
  );

  const detected = await fileTypeFromBuffer(bytes);

  if (!detected) {
    return { valid: false };
  }

  if (extension === "pdf") {
    if (detected.mime !== "application/pdf") {
      return { valid: false };
    }

    return {
      valid: true,
      contentType: mimeTypes.pdf,
      bytes,
    };
  }

  if (extension === "doc" || extension === "ppt") {
    if (detected.mime !== "application/x-cfb") {
      return { valid: false };
    }

    return {
      valid: true,
      contentType: mimeTypes[extension],
      bytes,
    };
  }

  if (extension === "docx" || extension === "pptx") {
    const expectedMime = mimeTypes[extension];

    const isOfficeArchive =
      detected.mime === "application/zip" ||
      detected.mime === expectedMime;

    if (!isOfficeArchive) {
      return { valid: false };
    }

    if (!hasOfficeStructure(bytes, extension)) {
      return { valid: false };
    }

    return {
      valid: true,
      contentType: expectedMime,
      bytes,
    };
  }

  return { valid: false };
}

function getTrustedRedirectURL(): string | null {
  const configuredURL =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredURL) {
    try {
      const parsed = new URL(configuredURL);

      const isLocalhost =
        parsed.hostname === "localhost" &&
        parsed.protocol === "http:";

      const isProduction =
        parsed.hostname ===
          "volunteer-researcher-dmja.vercel.app" &&
        parsed.protocol === "https:";

      if (isLocalhost || isProduction) {
        return `${parsed.origin}/ar/researcher-login?confirmed=true`;
      }
    } catch {
      return null;
    }

    return null;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000/ar/researcher-login?confirmed=true";
  }

  return "https://volunteer-researcher-dmja.vercel.app/ar/researcher-login?confirmed=true";
}

export async function POST(request: NextRequest) {
  try {
    const contentType =
      request.headers.get("content-type") || "";

    const contentLength = Number(
      request.headers.get("content-length") || "0"
    );

    if (!contentType.includes("multipart/form-data")) {
      return jsonError(
        "صيغة الطلب غير صحيحة.",
        415
      );
    }

    if (
      !Number.isFinite(contentLength) ||
      contentLength < 0 ||
      contentLength > MAX_REQUEST_SIZE
    ) {
      return jsonError(
        "حجم الطلب يتجاوز الحد المسموح.",
        413
      );
    }

    const formData = await request.formData();

    const fullName = getText(
      formData,
      "fullName"
    );

    const email = getText(
      formData,
      "email"
    ).toLowerCase();

    const password = getText(
      formData,
      "password"
    );

    const phone = getText(
      formData,
      "phone"
    );

    const workplace = getText(
      formData,
      "workplace"
    );

    const generalSpecialization = getText(
      formData,
      "generalSpecialization"
    );

    const detailedSpecialization = getText(
      formData,
      "detailedSpecialization"
    );

    const researchField = getText(
      formData,
      "researchField"
    );

    // الحقول الجديدة
    const researcherBio = getText(
      formData,
      "researcherBio"
    );

    const skillsAndExpertise = getText(
      formData,
      "skillsAndExpertise"
    );

    const turnstileToken = getText(
      formData,
      "turnstileToken"
    );

    const cv = formData.get("cv");

    // التحقق من بيانات النموذج
    if (
      !fullName ||
      fullName.length > 150 ||
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 ||
      password.length > 128 ||
      !/^05[0-9]{8}$/.test(phone) ||
      workplace.length > 200 ||
      !generalSpecialization ||
      generalSpecialization.length > 150 ||
      detailedSpecialization.length > 150 ||
      !allowedResearchFields.has(researchField) ||
      researcherBio.length < 20 ||
      researcherBio.length > 1000 ||
      skillsAndExpertise.length < 5 ||
      skillsAndExpertise.length > 1000
    ) {
      return jsonError(
        "يرجى التأكد من صحة بيانات النموذج، بما فيها نبذة الباحث والمهارات ومجالات الخبرة.",
        400
      );
    }

    if (!(cv instanceof File)) {
      return jsonError(
        "يرجى إرفاق السيرة الذاتية.",
        400
      );
    }

    const extension =
      cv.name
        .split(".")
        .pop()
        ?.toLowerCase() || "";

    const validatedCV = await validateCV(
      cv,
      extension
    );

    if (
      !validatedCV.valid ||
      !validatedCV.bytes ||
      !validatedCV.contentType
    ) {
      return jsonError(
        "ملف السيرة الذاتية غير صالح أو لا يطابق صيغته، أو يتجاوز 10 ميجابايت.",
        400
      );
    }

    // التحقق الأمني
    const verified = await verifyTurnstile(
      turnstileToken
    );

    if (!verified) {
      return jsonError(
        "تعذر إكمال التحقق الأمني. يرجى إعادة المحاولة.",
        403
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      return jsonError(
        "إعدادات التسجيل غير مكتملة.",
        503
      );
    }

    const redirectURL =
      getTrustedRedirectURL();

    if (!redirectURL) {
      return jsonError(
        "إعدادات رابط تأكيد البريد غير صحيحة.",
        503
      );
    }

    // إنشاء حساب الباحث
    const signupClient = createClient(
      supabaseUrl,
      publishableKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          flowType: "implicit",
        },
      }
    );

    const {
      data: signupData,
      error: signupError,
    } = await signupClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: "researcher",
        },
        emailRedirectTo: redirectURL,
      },
    });

    if (signupError) {
      console.error(
        "Researcher signup failed:",
        signupError.message
      );

      return jsonError(
        "تعذر إنشاء الحساب. تأكدي من صحة البريد الإلكتروني أو استخدمي تسجيل الدخول إذا كان لديك حساب سابق.",
        400
      );
    }

    const user = signupData.user;

    if (
      !user ||
      !user.id ||
      !user.identities ||
      user.identities.length === 0 ||
      signupData.session !== null
    ) {
      return jsonError(
        "إذا كان البريد جديدًا، يرجى التحقق من رسالة التأكيد. وإذا كان لديك حساب سابق، استخدمي تسجيل الدخول.",
        409
      );
    }

    const admin = createAdminClient();

    // حفظ السيرة الذاتية في التخزين الخاص
    const cvPath =
      `${user.id}/${crypto.randomUUID()}.${extension}`;

    const fileBlob = new Blob(
      [new Uint8Array(validatedCV.bytes)],
      {
        type: validatedCV.contentType,
      }
    );

    const { error: uploadError } =
      await admin.storage
        .from("researcher-cvs")
        .upload(cvPath, fileBlob, {
          contentType: validatedCV.contentType,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Researcher CV upload failed:",
        uploadError.message
      );

      return jsonError(
        "تم إنشاء الحساب، لكن تعذر حفظ السيرة الذاتية. لا تعيدي إنشاء الحساب؛ سنحتاج إلى استكمال الطلب بطريقة آمنة.",
        500
      );
    }

    // حفظ طلب الباحث مع النبذة والمهارات
    const { error: applicationError } =
      await admin
        .from("pending_researcher_applications")
        .insert({
          user_id: user.id,
          phone,
          workplace: workplace || null,
          general_specialization:
            generalSpecialization,
          detailed_specialization:
            detailedSpecialization || null,
          research_field: researchField,
          researcher_bio: researcherBio,
          skills_and_expertise:
            skillsAndExpertise,
          cv_path: cvPath,
        });

    if (applicationError) {
      console.error(
        "Researcher application save failed:",
        applicationError.message
      );

      const { error: cleanupError } =
        await admin.storage
          .from("researcher-cvs")
          .remove([cvPath]);

      if (cleanupError) {
        console.error(
          "Researcher CV cleanup failed:",
          cleanupError.message
        );
      }

      return jsonError(
        "تم إنشاء الحساب، لكن تعذر حفظ طلب الانضمام. لا تعيدي التسجيل بنفس البريد حتى نستكمل الطلب.",
        500
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "تم إنشاء الحساب وحفظ طلب الانضمام والسيرة الذاتية. يرجى تأكيد بريدك الإلكتروني، ثم تسجيل الدخول لمتابعة حالة طلبك.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Researcher registration error:",
      error
    );

    return jsonError(
      "حدث خطأ أثناء معالجة التسجيل. يرجى المحاولة لاحقًا.",
      500
    );
  }
}
