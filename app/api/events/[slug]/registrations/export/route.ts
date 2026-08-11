import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { canExportEventRegistrations } from "@/lib/auth/event-registration-export";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ slug: string }> };

function cellValue(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") {
    // Prevent attendee-controlled values from being interpreted as formulas.
    return /^[=+\-@]/.test(value) ? `'${value}` : value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  return JSON.stringify(value);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, start_at, chapter_id")
    .eq("slug", slug)
    .maybeSingle();

  if (eventError) {
    console.error("[exportEventRegistrations] event lookup error:", eventError.message);
    return NextResponse.json({ error: "Unable to load event." }, { status: 500 });
  }

  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  if (!(await canExportEventRegistrations(supabase, user.id, event))) {
    return NextResponse.json({ error: "You cannot export registrations for this event." }, { status: 403 });
  }

  const { data: registrations, error: registrationsError } = await supabase
    .from("event_registrations")
    .select("id, full_name, email, github_url, linkedin_url, team_name, team_members, answers, status, registered_at")
    .eq("event_id", event.id)
    .order("registered_at", { ascending: true });

  if (registrationsError) {
    console.error("[exportEventRegistrations] registrations lookup error:", registrationsError.message);
    return NextResponse.json({ error: "Unable to load registrations." }, { status: 500 });
  }

  const rows = (registrations ?? []).map((registration) => ({
    "Event": cellValue(event.title),
    "Event Date": cellValue(new Date(event.start_at).toISOString()),
    "Registration ID": cellValue(registration.id),
    "Full Name": cellValue(registration.full_name),
    "Email": cellValue(registration.email),
    "GitHub URL": cellValue(registration.github_url),
    "LinkedIn URL": cellValue(registration.linkedin_url),
    "Team Name": cellValue(registration.team_name),
    "Team Members": cellValue(registration.team_members),
    "Answers": cellValue(registration.answers),
    "Status": cellValue(registration.status),
    "Registered At": cellValue(registration.registered_at),
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      "Event", "Event Date", "Registration ID", "Full Name", "Email",
      "GitHub URL", "LinkedIn URL", "Team Name", "Team Members", "Answers",
      "Status", "Registered At",
    ],
  });
  worksheet["!cols"] = [
    { wch: 28 }, { wch: 24 }, { wch: 38 }, { wch: 24 }, { wch: 32 },
    { wch: 32 }, { wch: 32 }, { wch: 24 }, { wch: 36 }, { wch: 48 },
    { wch: 16 }, { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

  const file = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "-");
  const filename = `${safeSlug}-registrations.xlsx`;

  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
