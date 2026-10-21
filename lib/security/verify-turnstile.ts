
import "server-only";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
};

const ALLOWED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "volunteer-researcher-dmja.vercel.app",
]);

export async function verifyTurnstile(
  token: string
): Promise<boolean> {
  const secretKey =
    process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secretKey) {
    console.error(
      "[Turnstile] TURNSTILE_SECRET_KEY is missing."
    );
    return false;
  }

  if (!token || token.length > 2048) {
    console.error(
      "[Turnstile] Missing or invalid token."
    );
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error(
        "[Turnstile] Cloudflare HTTP error:",
        response.status
      );
      return false;
    }

    const result =
      (await response.json()) as TurnstileResponse;

    if (!result.success) {
      console.error(
        "[Turnstile] Verification failed:",
        result["error-codes"] ?? []
      );
      return false;
    }

    if (
      !result.hostname ||
      !ALLOWED_HOSTNAMES.has(result.hostname)
    ) {
      console.error(
        "[Turnstile] Hostname not allowed:",
        result.hostname ?? "missing"
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[Turnstile] Verification request failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return false;
  }
}
