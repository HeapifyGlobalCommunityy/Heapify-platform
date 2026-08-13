import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        // After exchange, ensure a `profiles` row exists for this user.
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Check if profile exists
            const { data: existing } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", user.id)
              .maybeSingle();

            if (!existing) {
              // Build profile from available metadata
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const meta = (user.user_metadata || {}) as Record<string, any>;
              const full_name = meta.full_name || meta.name || user.user_metadata?.name || user.email || null;
              const avatar_url = meta.avatar_url || meta.picture || null;
              const username = (user.email || "").split("@")[0] || null;

              await supabase
                .from("profiles")
                .insert({
                  id: user.id,
                  username,
                  full_name,
                  avatar_url,
                  created_at: new Date().toISOString(),
                });
            }
          }
        } catch (e) {
          // non-fatal: proceed to redirect even if profile creation fails
          console.error("Profile creation after OAuth failed:", e);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  // or back to the homepage if there's an error
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`);
}
