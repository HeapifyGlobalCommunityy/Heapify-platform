"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export interface ChapterMembershipRequest {
  id: string;
  status: string;
  created_at: string;
  submitted_by: string | null;
  payload: Record<string, unknown>;
}

async function getLeadChapter() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, chapter: null, user: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, chapter: null, user: null };

  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, name")
    .eq("lead_id", user.id)
    .maybeSingle();

  return { supabase, chapter, user };
}

export async function getChapterMembershipRequests(): Promise<ChapterMembershipRequest[]> {
  const { chapter } = await getLeadChapter();
  if (!chapter || !adminClient) return [];

  const { data, error } = await adminClient
    .from("form_submissions")
    .select("id, status, created_at, submitted_by, payload")
    .eq("form_type", "chapter_member")
    .eq("status", "pending")
    .eq("payload->>chapter_id", chapter.id)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as ChapterMembershipRequest[];
}

export type ChapterMembershipResult =
  | { success: true }
  | { success: false; error: string };

export async function reviewChapterMembership(
  submissionId: string,
  decision: "accepted" | "rejected"
): Promise<ChapterMembershipResult> {
  const { chapter, user } = await getLeadChapter();
  if (!chapter || !user || !adminClient) {
    return { success: false, error: "Only the chapter lead can review requests." };
  }

  const { data: submission, error: submissionError } = await adminClient
    .from("form_submissions")
    .select("id, status, submitted_by, payload")
    .eq("id", submissionId)
    .eq("form_type", "chapter_member")
    .maybeSingle();

  if (submissionError || !submission || submission.status !== "pending") {
    return { success: false, error: "This request is no longer pending." };
  }

  if (submission.payload?.chapter_id !== chapter.id) {
    return { success: false, error: "This request belongs to another chapter." };
  }

  if (decision === "accepted") {
    if (!submission.submitted_by) {
      return { success: false, error: "This request is not linked to a user account." };
    }

    const { data: updatedProfile, error: profileError } = await adminClient
      .from("profiles")
      .update({ chapter_id: chapter.id, updated_at: new Date().toISOString() })
      .eq("id", submission.submitted_by)
      .is("chapter_id", null)
      .select("id")
      .maybeSingle();

    if (profileError || !updatedProfile) {
      return { success: false, error: "The applicant may already belong to a chapter." };
    }
  }

  const { error: statusError } = await adminClient
    .from("form_submissions")
    .update({ status: decision })
    .eq("id", submissionId)
    .eq("status", "pending");

  if (statusError) {
    return { success: false, error: "Unable to update this request." };
  }

  revalidatePath("/chapter");
  revalidatePath("/admin/submissions");
  return { success: true };
}
