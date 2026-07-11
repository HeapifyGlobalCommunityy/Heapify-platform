// lib/actions/profile.ts
// Server actions for the profile page.
// loadMoreEventHistory: derives user_id from session, never from client.

"use server";

import { createClient } from "@/lib/supabase/server";
import { EVENT_HISTORY_PAGE_SIZE } from "@/lib/supabase/queries";
import type { EventHistoryRow } from "@/components/profile/EventHistoryClient";

export async function loadMoreEventHistory(
  userId: string,
  page: number
): Promise<{ rows: EventHistoryRow[]; hasMore: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { rows: [], hasMore: false };

  // Verify the caller is actually this user — don't trust the client-supplied userId
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== userId) {
    return { rows: [], hasMore: false };
  }

  const from = page * EVENT_HISTORY_PAGE_SIZE;
  const to = from + EVENT_HISTORY_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      `id, status, registered_at,
       event:events(id, slug, title, category, start_at, status)`
    )
    .eq("user_id", user.id) // always the verified session user
    .order("registered_at", { ascending: false })
    .range(from, to);

  if (error || !data) return { rows: [], hasMore: false };

  return {
    rows: data as EventHistoryRow[],
    hasMore: data.length === EVENT_HISTORY_PAGE_SIZE,
  };
}
