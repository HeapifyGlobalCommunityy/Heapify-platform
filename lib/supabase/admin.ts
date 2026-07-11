// lib/supabase/admin.ts
// Service-role client — bypasses RLS. ONLY used server-side in server actions.
// Never import this in client components or pages.
//
// Why this exists: the `profiles` table has no INSERT RLS policy in the current
// schema (only SELECT and UPDATE). Until the DB team approves:
//   CREATE POLICY "users insert own profile" ON profiles
//     FOR INSERT WITH CHECK (auth.uid() = id);
// …profile creation must go through this client to bypass RLS.
//
// The caller is responsible for ensuring id = auth.uid() before inserting —
// we enforce that in the server actions that use this client.
//
// DB NOTE for team: Add the INSERT policy above to allow switching back to
// the anon key for profile creation and remove this workaround.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("[admin] SUPABASE_SERVICE_ROLE_KEY not configured.");
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
