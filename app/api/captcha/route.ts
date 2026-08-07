import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/captcha/verify";

export async function POST(request: NextRequest) {
  try {
    const { token } = (await request.json()) as { token?: string };

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Captcha token is required." },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const remoteIp = forwardedFor?.split(",")[0]?.trim() ?? null;
    const result = await verifyTurnstileToken({ token, remoteIp });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Captcha verification failed.",
          errorCodes: result["error-codes"] ?? [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected captcha verification error.";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
