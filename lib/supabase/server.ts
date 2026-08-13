import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("URL:", supabaseUrl);
  console.log("KEY:", supabaseKey ? "FOUND" : "NOT FOUND");

  const invalidUrl = !supabaseUrl || supabaseUrl.includes("your-project.supabase.co");
  const invalidKey = !supabaseKey || supabaseKey.includes("your-anon-key");

  if (invalidUrl || invalidKey) {
    console.warn(
      "Supabase is not configured or is using placeholder environment values. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to real credentials."
    );
    return null as unknown as ReturnType<typeof createServerClient>;
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          );
        } catch {}
      },
    },
  });
}