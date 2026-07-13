import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface TeamMember {
  full_name: string;
  email: string;
  github_url?: string;
}

interface PhaseZeroTeamMember {
  name: string;
  email: string;
  github?: string;
}

interface RegisterBody {
  full_name: string;
  email: string;
  github_url?: string;
  linkedin_url?: string;
  team_name?: string;
  team_members?: TeamMember[];
  answers?: Record<string, string | string[]>;
}

interface PhaseZeroRegisterBody {
  fullName?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  teamName?: string;
  teammates?: PhaseZeroTeamMember[];
  answers?: Record<string, string | string[]>;
}

type RawRegisterBody = Partial<RegisterBody & PhaseZeroRegisterBody>;

type NormalizedTeamConfig = {
  soloAllowed: boolean;
  teamMin: number;
  teamMax: number;
};

function isTeamMember(member: TeamMember | PhaseZeroTeamMember): member is TeamMember {
  return "full_name" in member;
}

function isPhaseZeroTeamMember(
  member: TeamMember | PhaseZeroTeamMember
): member is PhaseZeroTeamMember {
  return "name" in member;
}

function normalizeTeamConfig(rawConfig: unknown): NormalizedTeamConfig | null {
  if (!rawConfig || typeof rawConfig !== "object") {
    return null;
  }

  const config = rawConfig as Record<string, unknown>;

  const soloAllowed =
    typeof config.solo_allowed === "boolean"
      ? config.solo_allowed
      : typeof config.allowSolo === "boolean"
        ? config.allowSolo
        : null;

  const teamMin =
    typeof config.team_min === "number"
      ? config.team_min
      : typeof config.minSize === "number"
        ? config.minSize
        : null;

  const teamMax =
    typeof config.team_max === "number"
      ? config.team_max
      : typeof config.maxSize === "number"
        ? config.maxSize
        : null;

  if (soloAllowed === null || teamMin === null || teamMax === null) {
    return null;
  }

  return { soloAllowed, teamMin, teamMax };
}

function normalizeBody(body: RawRegisterBody): RegisterBody {
  const rawTeamMembers = Array.isArray(body.team_members)
    ? body.team_members
    : Array.isArray(body.teammates)
      ? body.teammates
      : [];

  const teamMembers = rawTeamMembers.map((member) => {
    const normalizedMember = member as TeamMember | PhaseZeroTeamMember;

    return {
      full_name: isTeamMember(normalizedMember)
        ? normalizedMember.full_name
        : normalizedMember.name,
      email: normalizedMember.email,
      github_url: isTeamMember(normalizedMember)
        ? normalizedMember.github_url
        : isPhaseZeroTeamMember(normalizedMember)
          ? normalizedMember.github
          : undefined,
    };
  });

  return {
    full_name: body.full_name ?? body.fullName ?? "",
    email: body.email ?? "",
    github_url: body.github_url ?? body.github,
    linkedin_url: body.linkedin_url ?? body.linkedin,
    team_name: body.team_name ?? body.teamName,
    team_members: teamMembers,
    answers: body.answers ?? {},
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 }
    );
  }

  // ---------------------------------------------------------------------
  // 1. Auth check — reject unauthenticated requests immediately.
  //    RLS would also block the insert, but failing fast here gives a
  //    clean 401 instead of letting a bad request fall through to a
  //    confusing Postgres-level rejection.
  // ---------------------------------------------------------------------
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ---------------------------------------------------------------------
  // 2. Parse + minimally validate the body shape.
  //    This is NOT full validation yet — just enough to avoid crashing
  //    on garbage input before we even load the event.
  // ---------------------------------------------------------------------
  let rawBody: RawRegisterBody;
  try {
    rawBody = (await req.json()) as RawRegisterBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = normalizeBody(rawBody);

  if (!body.full_name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: "full_name and email are required" },
      { status: 400 }
    );
  }

  // ---------------------------------------------------------------------
  // 3. Load the event by slug.
  // ---------------------------------------------------------------------
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id, status, end_at, capacity, is_hackathon, team_config, custom_questions"
    )
    .eq("slug", slug)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // ---------------------------------------------------------------------
  // 4. Reject cancelled or already-ended events.
  // ---------------------------------------------------------------------
  if (event.status === "cancelled") {
    return NextResponse.json(
      { error: "This event has been cancelled" },
      { status: 409 }
    );
  }

  if (event.end_at && new Date(event.end_at) < new Date()) {
    return NextResponse.json(
      { error: "Registration is closed for this event" },
      { status: 409 }
    );
  }

  // ---------------------------------------------------------------------
  // 5. Team validation, only if the event is team-based.
  //    team_config shape: { solo_allowed, team_min, team_max }
  // ---------------------------------------------------------------------
  const teamConfig = normalizeTeamConfig(event.team_config);

  const teamMembers = body.team_members ?? [];
  const totalTeamSize = teamMembers.length + 1; // +1 for the registrant

  if (teamConfig) {
    const isSolo = teamMembers.length === 0;

    if (isSolo && !teamConfig.soloAllowed) {
      return NextResponse.json(
        { error: "Solo registration is not allowed for this event" },
        { status: 400 }
      );
    }

    if (!isSolo) {
      if (totalTeamSize < teamConfig.teamMin) {
        return NextResponse.json(
          { error: `Team must have at least ${teamConfig.teamMin} members` },
          { status: 400 }
        );
      }
      if (totalTeamSize > teamConfig.teamMax) {
        return NextResponse.json(
          { error: `Team must have at most ${teamConfig.teamMax} members` },
          { status: 400 }
        );
      }
    }
  }

  // ---------------------------------------------------------------------
  // 6. Custom question validation — every required question needs an answer.
  //    custom_questions shape: { id, label, type, required, options? }[]
  // ---------------------------------------------------------------------
  const customQuestions = (event.custom_questions ?? []) as {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }[];

  const answers = body.answers ?? {};
  const missingQuestionIds: string[] = [];
  const validationErrors: string[] = [];

  for (const q of customQuestions) {
    const val = answers[q.id];
    
    // 1. Required Check
    if (q.required) {
      const isEmpty = Array.isArray(val) ? val.length === 0 : (!val || !String(val).trim());
      if (isEmpty) {
        missingQuestionIds.push(q.id);
        continue;
      }
    }

    // 2. Type & Option Validation (only if a value is provided)
    if (val !== undefined && val !== null && val !== "") {
      if (q.type === "number") {
        if (Array.isArray(val) || isNaN(Number(val))) {
          validationErrors.push(`Answer for "${q.label}" must be a valid number.`);
        }
      } else if (q.type === "single_choice") {
        if (Array.isArray(val)) {
          validationErrors.push(`Answer for "${q.label}" cannot be multiple choices.`);
        } else if (q.options && q.options.length > 0 && !q.options.includes(String(val))) {
          validationErrors.push(`Invalid choice for "${q.label}".`);
        }
      } else if (q.type === "multiple_choice") {
        if (!Array.isArray(val)) {
          validationErrors.push(`Answer for "${q.label}" must be an array of choices.`);
        } else if (q.options && q.options.length > 0) {
          const invalidChoices = val.filter(v => !q.options!.includes(String(v)));
          if (invalidChoices.length > 0) {
            validationErrors.push(`Invalid choices for "${q.label}".`);
          }
        }
      }
    }
  }

  if (missingQuestionIds.length > 0 || validationErrors.length > 0) {
    return NextResponse.json(
      {
        error: validationErrors.length > 0 ? validationErrors[0] : "Missing required answers",
        missing_question_ids: missingQuestionIds,
        validation_errors: validationErrors
      },
      { status: 400 }
    );
  }

  // ---------------------------------------------------------------------
  // 7. Capacity check — count only registrations that actually hold a
  //    seat. 'waitlisted' and 'cancelled' don't count against capacity.
  // ---------------------------------------------------------------------
  let registrationStatus: "registered" | "waitlisted" = "registered";

  if (event.capacity != null) {
    const { count, error: countError } = await supabase
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("status", ["registered", "attended"]);

    if (countError) {
      return NextResponse.json(
        { error: "Could not verify event capacity" },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= event.capacity) {
      registrationStatus = "waitlisted";
    }
  }

  // ---------------------------------------------------------------------
  // 8. Insert. RLS's `with check (auth.uid() = user_id)` is the real
  //    enforcement — this insert will fail at the DB level if user_id
  //    doesn't match the session, even if something upstream is wrong.
  // ---------------------------------------------------------------------
  const { data: registration, error: insertError } = await supabase
    .from("event_registrations")
    .insert({
      event_id: event.id,
      user_id: user.id,
      status: registrationStatus,
      full_name: body.full_name.trim(),
      email: body.email.trim(),
      github_url: body.github_url ?? null,
      linkedin_url: body.linkedin_url ?? null,
      team_name: body.team_name ?? null,
      team_members: teamMembers,
      answers,
    })
    .select()
    .single();

  if (insertError) {
    // Postgres unique_violation on (event_id, user_id).
    // Don't leak the raw Postgres error — return a clean, specific message.
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "You're already registered for this event" },
        { status: 409 }
      );
    }

    console.error("Registration insert failed:", insertError);
    return NextResponse.json(
      { error: "Registration failed, please try again" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { registration, status: registrationStatus },
    { status: 201 }
  );
}
