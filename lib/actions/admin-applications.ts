"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/types/database";


export async function getAdminSubmissions() {
  const { supabase } = await requireRole(["core_team", "super_admin"]);

  const { data, error } = await supabase
    .from("form_submissions")
    .select("id, form_type, payload, status, created_at, submitted_by")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load submissions.");
  }

  return data ?? [];
}

export async function updateSubmissionStatus(
  id: string,
  status: ApplicationStatus
) {
  if (!APPLICATION_STATUSES.includes(status)) {
    return { success: false, error: "Invalid submission status." };
  }

  const { supabase } = await requireRole(["core_team", "super_admin"]);

  const { error } = await supabase
    .from("form_submissions")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { success: false, error: "Unable to update submission status." };
  }

  revalidatePath("/admin/submissions");
  return { success: true };
}
