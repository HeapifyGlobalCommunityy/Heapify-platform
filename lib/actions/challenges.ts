// lib/actions/challenges.ts
// Server action for challenge submissions.
// CRITICAL: user_id is always derived from the authenticated session
// server-side. The client never sends a user_id — whatever the browser
// sends is ignored. This is correct both now (no RLS on challenge_submissions)
// and after RLS Change 1 is approved — genuine defence in depth.
//
// DB NOTE (no change made): Until RLS Change 1 is approved, a direct
// Supabase REST call (bypassing this server action, e.g. via curl with
// the anon key) can still insert a challenge_submission row with any
// user_id. This server action is secure; the raw API is not yet. Flag
// for DB team: see spec section 8, Change 1.

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SubmitChallengeResult =
  | { success: true }
  | { success: false; error: string };

export async function submitChallengeEntry(
  challengeId: string,
  submissionUrl: string
): Promise<SubmitChallengeResult> {
  // 1. Get server-side session — never trust any client-supplied identity
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Service unavailable. Please try again later." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect rather than return error — this is a hard auth boundary
    redirect("/login?next=/challenges");
  }

  // 2. Basic server-side validation
  if (!submissionUrl.trim()) {
    return { success: false, error: "Submission URL cannot be empty." };
  }

  try {
    new URL(submissionUrl); // throws if invalid URL
  } catch {
    return { success: false, error: "Please enter a valid URL (e.g. https://github.com/...)." };
  }

  if (!challengeId) {
    return { success: false, error: "Invalid challenge." };
  }

  // 3. Insert — user_id comes from session, never from the client
  const { error: insertError } = await supabase
    .from("challenge_submissions")
    .insert({
      challenge_id: challengeId,
      user_id: user.id, // server-derived — this is the security guarantee
      submission_url: submissionUrl.trim(),
    });

  if (insertError) {
    console.error("[submitChallengeEntry] insert error:", insertError.message);
    return { success: false, error: "Failed to submit. Please try again." };
  }

  return { success: true };
}
