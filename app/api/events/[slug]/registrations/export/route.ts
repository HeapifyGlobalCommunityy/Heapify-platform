import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
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
    event: cellValue(event.title),
    eventDate: cellValue(new Date(event.start_at).toISOString()),
    registrationId: cellValue(registration.id),
    fullName: cellValue(registration.full_name),
    email: cellValue(registration.email),
    githubUrl: cellValue(registration.github_url),
    linkedinUrl: cellValue(registration.linkedin_url),
    teamName: cellValue(registration.team_name),
    teamMembers: cellValue(registration.team_members),
    answers: cellValue(registration.answers),
    status: cellValue(registration.status),
    registeredAt: cellValue(registration.registered_at),
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Registrations");
  worksheet.columns = [
    { header: "Event", key: "event", width: 28 },
    { header: "Event Date", key: "eventDate", width: 24 },
    { header: "Registration ID", key: "registrationId", width: 38 },
    { header: "Full Name", key: "fullName", width: 24 },
    { header: "Email", key: "email", width: 32 },
    { header: "GitHub URL", key: "githubUrl", width: 32 },
    { header: "LinkedIn URL", key: "linkedinUrl", width: 32 },
    { header: "Team Name", key: "teamName", width: 24 },
    { header: "Team Members", key: "teamMembers", width: 36 },
    { header: "Answers", key: "answers", width: 48 },
    { header: "Status", key: "status", width: 16 },
    { header: "Registered At", key: "registeredAt", width: 28 },
  ];
  worksheet.addRows(rows);

  const buffer = await workbook.xlsx.writeBuffer();
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "-");
  const filename = `${safeSlug}-registrations.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
