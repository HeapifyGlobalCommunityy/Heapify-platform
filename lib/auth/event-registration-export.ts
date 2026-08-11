import type { SupabaseClient } from "@supabase/supabase-js";

type ExportEvent = { chapter_id: string | null };

/**
 * Resource-level authorization for event registration exports.
 * Chapter leads are identified by chapters.lead_id, not by a profile role.
 */
export async function canExportEventRegistrations(
  supabase: SupabaseClient,
  userId: string,
  event: ExportEvent
): Promise<boolean> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, chapter_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) return false;

  if (profile.role === "core_team" || profile.role === "super_admin") {
    return true;
  }

  if (!event.chapter_id) return false;

  if (profile.role === "chapter_admin" && profile.chapter_id === event.chapter_id) {
    return true;
  }

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id")
    .eq("id", event.chapter_id)
    .eq("lead_id", userId)
    .maybeSingle();

  return !chapterError && !!chapter;
}
