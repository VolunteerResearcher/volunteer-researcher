
"use client";

import { Turnstile } from "@marsidev/react-turnstile";

type TurnstileWidgetProps = {
  onVerify: (token: string) => void;
  onExpire: () => void;
};

export function TurnstileWidget({
  onVerify,
  onExpire,
}: TurnstileWidgetProps) {
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return (
      <p className="text-sm text-red-600">
        إعدادات التحقق الأمني غير مكتملة.
      </p>
    );
  }

  return (
    <div className="flex justify-start" dir="rtl">
      <Turnstile
        siteKey={siteKey}
        options={{
          theme: "light",
          size: "normal",
        }}
        onSuccess={onVerify}
        onExpire={onExpire}
        onError={onExpire}
      />
    </div>
  );
}
