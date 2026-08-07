export type TurnstileVerificationResult = {
  success: boolean;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
  hostname?: string;
  challenge_ts?: string;
};

type VerifyTurnstileTokenParams = {
  token: string;
  remoteIp?: string | null;
};

export async function verifyTurnstileToken({
  token,
  remoteIp,
}: VerifyTurnstileTokenParams): Promise<TurnstileVerificationResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is missing.");
  }

  if (!token) {
    return {
      success: false,
      "error-codes": ["missing-input-response"],
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Turnstile verification failed with status ${response.status}.`);
  }

  return (await response.json()) as TurnstileVerificationResult;
}
