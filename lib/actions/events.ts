// lib/actions/events.ts
// Server action for event registration.
//
// Tables affected: event_registrations (INSERT only)
// RLS status: ✅ RLS is enabled on event_registrations with:
//   - "users insert own registrations" FOR INSERT WITH CHECK (auth.uid() = user_id)
// This server action is correct both now and after RLS is active — user_id
// always comes from the server session, never from the client.
//
// Dependencies:
// 1. The event must exist in the Supabase `events` table by slug.
//    Currently events come from mock data in site-content.ts. If the event
//    slug isn't seeded in Supabase, this will return a clear error.
// 2. The user must have a `profiles` row (FK constraint). If they haven't
//    set up their profile yet, this will fail with a FK violation — handled.
//
// Constraint: unique(event_id, user_id) — one registration per user per event.
// Handled gracefully with a user-friendly error.

"use server";

import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/authorization";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { EventStatus, RegistrationStatus } from "@/lib/types/database";

interface TeamMember {
  name: string;
  email: string;
}

export interface RegistrationPayload {
  fullName: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  answers?: Record<string, string>;
}

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerForEvent(
  eventSlug: string,
  payload: RegistrationPayload
): Promise<RegisterResult> {
  // 1. Server-side auth check — never trust the client
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Service unavailable. Please try again later." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/login?next=/events/${eventSlug}?register=true`);
  }

  // 2. Look up the event's UUID by slug
  //    Events currently come from mock data — if not seeded in Supabase,
  //    this returns null and we surface a clear message.
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, capacity, status")
    .eq("slug", eventSlug)
    .maybeSingle();

  if (eventError) {
    console.error("[registerForEvent] event lookup error:", eventError.message);
    return { success: false, error: "Couldn't look up the event. Please try again." };
  }

  if (!event) {
    return {
      success: false,
      error: "This event isn't connected to the database yet. Registration will be available soon.",
    };
  }

  // 2b. Cancelled events cannot accept new registrations
  if (event.status === "cancelled") {
    return {
      success: false,
      error: "This event has been cancelled and is no longer accepting registrations.",
    };
  }

  // 3. Application-level check for duplicate registration
  const { data: existingReg, error: regError } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (regError) {
    console.error("[registerForEvent] check duplicate error:", regError.message);
    return { success: false, error: "Validation failed. Please try again." };
  }

  if (existingReg) {
    return { success: false, error: "You're already registered for this event." };
  }

  // 4. Application-level check for capacity limits
  if (event.capacity !== null && event.capacity > 0) {
    const { count, error: countError } = await supabase
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id);

    if (countError) {
      console.error("[registerForEvent] check capacity error:", countError.message);
      return { success: false, error: "Capacity check failed. Please try again." };
    }

    if (count !== null && count >= event.capacity) {
      return { success: false, error: "This event is at full capacity. Registration is closed." };
    }
  }

  // 5. Server-side validation of payload fields
  if (!payload.fullName.trim()) return { success: false, error: "Full name is required." };
  if (!payload.email.trim()) return { success: false, error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // 6. Insert into event_registrations
  //    user_id = user.id (session-derived — never from client)
  const { error: insertError } = await supabase
    .from("event_registrations")
    .insert({
      event_id: event.id,
      user_id: user.id,           // session-derived — this is the security guarantee
      full_name: payload.fullName.trim(),
      email: payload.email.trim(),
      github_url: payload.githubUrl.trim() || null,
      linkedin_url: payload.linkedinUrl.trim() || null,
      team_name: payload.teamName?.trim() || null,
      team_members: payload.teamMembers ?? [],
      answers: payload.answers ?? {},
      status: "registered",
    });

  if (insertError) {
    // Unique constraint: user already registered for this event (database fallback)
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "You're already registered for this event.",
      };
    }
    // FK violation: user has no profiles row
    if (insertError.code === "23503" && insertError.message.includes("user_id")) {
      return {
        success: false,
        error: "Please complete your profile setup before registering for events.",
      };
    }
    console.error("[registerForEvent] insert error:", insertError.message);
    return { success: false, error: "Registration failed. Please try again." };
  }

  // 7. Revalidate ISR routes on successful registration
  revalidatePath("/events");
  revalidatePath(`/events/${eventSlug}`);

  return { success: true };
}

export interface CreateEventPayload {
  title: string;
  slug: string;
  category: string;
  description?: string;
  bannerUrl?: string;
  startAt: string;
  endAt?: string;
  isVirtual: boolean;
  meetingUrl?: string;
  location?: string;
  capacity?: number;
  isHackathon: boolean;
  teamConfig?: { min_size: number; max_size: number; allowSolo: boolean } | null;
  customQuestions?: Array<{ id: string; label: string; required: boolean; type: string; options?: string[] }>;
  agenda?: Array<{ time: string; title: string }>;
  speakers?: Array<{ name: string; bio?: string; photo_url?: string }>;
}

export type CreateEventResult =
  | { success: true; slug: string }
  | { success: false; error: string };

export async function createEvent(
  payload: CreateEventPayload
): Promise<CreateEventResult> {
  // 1. Server-side auth check
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Service unavailable. Please try again later." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "You must be logged in to create an event." };
  }

  // 2. Fetch user profile role and chapter led by user
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("id")
    .eq("lead_id", user.id)
    .maybeSingle();

  const isAuthorized =
    (profile && ["admin", "community_admin", "chapter_lead"].includes(profile.role)) ||
    !!chapter;

  if (!isAuthorized) {
    return { success: false, error: "Unauthorized. Only admins, community admins, and chapter leads can create events." };
  }

  // 3. Validation
  const title = payload.title.trim();
  const slug = payload.slug.trim().toLowerCase();
  const category = payload.category;
  
  if (!title) return { success: false, error: "Title is required." };
  if (!slug) return { success: false, error: "Slug is required." };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { success: false, error: "Slug can only contain lowercase letters, numbers, and hyphens." };
  }
  
  const validCategories = ['web3', 'blockchain', 'hackathon', 'open_source', 'workshop', 'internship_session'];
  if (!validCategories.includes(category)) {
    return { success: false, error: "Invalid category selected." };
  }

  if (!payload.startAt) return { success: false, error: "Start date and time is required." };
  const startDate = new Date(payload.startAt);
  if (isNaN(startDate.getTime())) {
    return { success: false, error: "Invalid start date format." };
  }

  if (payload.endAt) {
    const endDate = new Date(payload.endAt);
    if (isNaN(endDate.getTime())) {
      return { success: false, error: "Invalid end date format." };
    }
    if (endDate <= startDate) {
      return { success: false, error: "End date must be strictly after the start date." };
    }
  }

  if (payload.isVirtual && !payload.meetingUrl?.trim()) {
    return { success: false, error: "Meeting URL is required for virtual events." };
  }
  if (!payload.isVirtual && !payload.location?.trim()) {
    return { success: false, error: "Physical location details are required." };
  }

  if (payload.teamConfig) {
    const { min_size, max_size, allowSolo } = payload.teamConfig;
    if (typeof allowSolo !== "boolean") {
      return { success: false, error: "Invalid team configuration: allowSolo must be a boolean." };
    }
    if (!Number.isInteger(min_size) || min_size < 1) {
      return { success: false, error: "Minimum team size must be an integer greater than or equal to 1." };
    }
    if (!Number.isInteger(max_size) || max_size < 1) {
      return { success: false, error: "Maximum team size must be an integer greater than or equal to 1." };
    }
    if (max_size < min_size) {
      return { success: false, error: "Maximum team size must be greater than or equal to minimum team size." };
    }
  }

  if (payload.customQuestions) {
    for (const q of payload.customQuestions) {
      if (q.type === "single_choice" || q.type === "multiple_choice") {
        if (!q.options || q.options.length === 0) {
          return { success: false, error: `Question "${q.label}" must have at least one option.` };
        }
        const validOptions = q.options.filter(opt => opt.trim() !== "");
        if (validOptions.length === 0 || validOptions.length !== q.options.length) {
          return { success: false, error: `Question "${q.label}" cannot have empty options.` };
        }
      }
    }
  }

  // 4. Insert into events
  const { error: insertError } = await supabase
    .from("events")
    .insert({
      title,
      slug,
      category,
      description: payload.description?.trim() || null,
      banner_url: payload.bannerUrl?.trim() || null,
      start_at: payload.startAt,
      end_at: payload.endAt || null,
      is_virtual: payload.isVirtual,
      meeting_url: payload.isVirtual ? (payload.meetingUrl?.trim() || null) : null,
      location: !payload.isVirtual ? (payload.location?.trim() || null) : null,
      capacity: payload.capacity && payload.capacity > 0 ? payload.capacity : null,
      is_hackathon: payload.isHackathon,
      team_config: payload.teamConfig || null,
      custom_questions: payload.customQuestions || [],
      agenda: payload.agenda || [],
      speakers: payload.speakers || [],
      chapter_id: chapter?.id || null,
      created_by: user.id,
      status: "upcoming"
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, error: "An event with this URL slug already exists." };
    }
    console.error("[createEvent] insert error:", insertError.message);
    return { success: false, error: "Failed to create event. Please try again." };
  }

  // 5. Revalidate paths
  revalidatePath("/events");
  revalidatePath("/chapter");

  return { success: true, slug };
}

export interface UpdateEventPayload {
  eventId: string;
  title: string;
  description?: string;
  bannerUrl?: string;
  startAt: string;
  endAt?: string;
  isVirtual: boolean;
  meetingUrl?: string;
  location?: string;
  capacity?: number;
  agenda?: Array<{ time: string; title: string }>;
  speakers?: Array<{ name: string; bio?: string; photo_url?: string }>;
}

export type UpdateEventResult =
  | { success: true; slug: string }
  | { success: false; error: string };

export async function updateEvent(
  payload: UpdateEventPayload
): Promise<UpdateEventResult> {
  // 1. Server-side auth check
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Service unavailable. Please try again later." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "You must be logged in to edit an event." };
  }

  // 2. Fetch target event to verify existence and get chapter_id
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, slug, chapter_id, capacity")
    .eq("id", payload.eventId)
    .maybeSingle();

  if (eventError || !event) {
    return { success: false, error: "Event not found." };
  }

  // 3. Verify chapter ownership (chapter pointed to by event.chapter_id has lead_id = auth.uid())
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id, lead_id")
    .eq("id", event.chapter_id)
    .maybeSingle();

  if (chapterError || !chapter || chapter.lead_id !== user.id) {
    return { success: false, error: "Unauthorized. Only the chapter lead can edit this event." };
  }

  // 4. Validate fields
  const title = payload.title.trim();
  if (!title) return { success: false, error: "Title is required." };

  if (!payload.startAt) return { success: false, error: "Start date and time is required." };
  const startDate = new Date(payload.startAt);
  if (isNaN(startDate.getTime())) {
    return { success: false, error: "Invalid start date format." };
  }

  if (payload.endAt) {
    const endDate = new Date(payload.endAt);
    if (isNaN(endDate.getTime())) {
      return { success: false, error: "Invalid end date format." };
    }
    if (endDate <= startDate) {
      return { success: false, error: "End date must be strictly after the start date." };
    }
  }

  if (payload.isVirtual && !payload.meetingUrl?.trim()) {
    return { success: false, error: "Meeting URL is required for virtual events." };
  }
  if (!payload.isVirtual && !payload.location?.trim()) {
    return { success: false, error: "Physical location details are required." };
  }

  // 5. Capacity-reduction validation
  const newCapacity = payload.capacity && payload.capacity > 0 ? payload.capacity : null;
  const currentCapacity = event.capacity;

  const isCappedOrReduced = 
    (newCapacity !== null && currentCapacity === null) || // changing from unlimited to limited
    (newCapacity !== null && currentCapacity !== null && newCapacity < currentCapacity); // reducing limit

  if (isCappedOrReduced && newCapacity !== null) {
    // Count all non-cancelled registrations
    const { count, error: countError } = await supabase
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .not("status", "eq", "cancelled");

    if (countError) {
      console.error("[updateEvent] count registrations error:", countError.message);
      return { success: false, error: "Failed to verify registration count." };
    }

    const currentRegisteredCount = count ?? 0;
    if (newCapacity < currentRegisteredCount) {
      return { 
        success: false, 
        error: `Cannot reduce capacity below the current number of registered attendees (${currentRegisteredCount}).` 
      };
    }
  }

  // 6. Update database
  const supabasePayload = {
    title,
    description: payload.description?.trim() || null,
    banner_url: payload.bannerUrl?.trim() || null,
    start_at: payload.startAt,
    end_at: payload.endAt || null,
    is_virtual: payload.isVirtual,
    meeting_url: payload.isVirtual ? (payload.meetingUrl?.trim() || null) : null,
    location: !payload.isVirtual ? (payload.location?.trim() || null) : null,
    capacity: newCapacity,
    agenda: payload.agenda || [],
    speakers: payload.speakers || [],
  };

  const { error: updateError } = await supabase
    .from("events")
    .update(supabasePayload)
    .eq("id", payload.eventId)
    .eq("chapter_id", event.chapter_id); // Secondary ownership safeguard

  if (updateError) {
    console.error("[updateEvent] update error:", updateError.message);
    return { success: false, error: "Failed to update event. Please try again." };
  }

  // 7. Revalidate paths
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/chapter");

  return { success: true, slug: event.slug };
}

export interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: EventStatus;
  start_at: string;
  end_at: string | null;
  is_virtual: boolean;
  location: string | null;
  capacity: number | null;
  chapter: { name: string } | null;
  registrations: { count: number }[];
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const { supabase } = await requireRole(["core_team", "super_admin"]);

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, slug, title, category, status, start_at, end_at, is_virtual, location, capacity, chapter:chapters(name), registrations:event_registrations(count)"
    )
    .order("start_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load events.");
  }

  return (data ?? []) as unknown as AdminEvent[];
}

export async function updateAdminEventStatus(
  eventId: string,
  status: EventStatus
) {
  const validStatuses: EventStatus[] = ["upcoming", "ongoing", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid event status." };
  }

  await requireRole(["core_team", "super_admin"]);

  if (!adminClient) {
    return { success: false, error: "Admin service is unavailable." };
  }

  const { data: event } = await adminClient
    .from("events")
    .select("slug")
    .eq("id", eventId)
    .maybeSingle();

  const { error } = await adminClient
    .from("events")
    .update({ status })
    .eq("id", eventId);

  if (error) {
    console.error("[updateAdminEventStatus] update error:", error.message);
    return { success: false, error: "Unable to update event status." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  if (event?.slug) {
    revalidatePath(`/admin/events/${event.slug}`);
    revalidatePath(`/events/${event.slug}`);
  }
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN EVENT MANAGEMENT
// Restricted to core_team and super_admin only. Writes go through the
// service-role adminClient because the `events` and `event_registrations`
// tables only expose read policies to regular clients. Chapter-lead
// createEvent / updateEvent above are unchanged.
// ═══════════════════════════════════════════════════════════════════════════

const VALID_EVENT_CATEGORIES = [
  "web3",
  "blockchain",
  "hackathon",
  "open_source",
  "workshop",
  "internship_session",
] as const;

const VALID_REGISTRATION_STATUSES: RegistrationStatus[] = [
  "registered",
  "waitlisted",
  "attended",
  "cancelled",
];

export interface ChapterOption {
  id: string;
  name: string;
}

export async function getChaptersList(): Promise<ChapterOption[]> {
  const { supabase } = await requireRole(["core_team", "super_admin"]);

  const { data, error } = await supabase
    .from("chapters")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error("Unable to load chapters.");
  }

  return (data ?? []) as unknown as ChapterOption[];
}

// ─── Create (admin) ───────────────────────────────────────────────────────

export interface AdminCreateEventPayload extends CreateEventPayload {
  chapterId?: string | null;
}

export async function adminCreateEvent(
  payload: AdminCreateEventPayload
): Promise<CreateEventResult> {
  const { user } = await requireRole(["core_team", "super_admin"]);

  if (!adminClient) {
    return { success: false, error: "Admin service is unavailable." };
  }

  // 1. Validation
  const title = payload.title.trim();
  const slug = payload.slug.trim().toLowerCase();
  const category = payload.category;

  if (!title) return { success: false, error: "Title is required." };
  if (!slug) return { success: false, error: "Slug is required." };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { success: false, error: "Slug can only contain lowercase letters, numbers, and hyphens." };
  }

  const validCategories = VALID_EVENT_CATEGORIES as readonly string[];
  if (!validCategories.includes(category)) {
    return { success: false, error: "Invalid category selected." };
  }

  if (!payload.startAt) return { success: false, error: "Start date and time is required." };
  const startDate = new Date(payload.startAt);
  if (isNaN(startDate.getTime())) {
    return { success: false, error: "Invalid start date format." };
  }

  if (payload.endAt) {
    const endDate = new Date(payload.endAt);
    if (isNaN(endDate.getTime())) {
      return { success: false, error: "Invalid end date format." };
    }
    if (endDate <= startDate) {
      return { success: false, error: "End date must be strictly after the start date." };
    }
  }

  if (payload.isVirtual && !payload.meetingUrl?.trim()) {
    return { success: false, error: "Meeting URL is required for virtual events." };
  }
  if (!payload.isVirtual && !payload.location?.trim()) {
    return { success: false, error: "Physical location details are required." };
  }

  if (payload.teamConfig) {
    const { min_size, max_size, allowSolo } = payload.teamConfig;
    if (typeof allowSolo !== "boolean") {
      return { success: false, error: "Invalid team configuration: allowSolo must be a boolean." };
    }
    if (!Number.isInteger(min_size) || min_size < 1) {
      return { success: false, error: "Minimum team size must be an integer greater than or equal to 1." };
    }
    if (!Number.isInteger(max_size) || max_size < 1) {
      return { success: false, error: "Maximum team size must be an integer greater than or equal to 1." };
    }
    if (max_size < min_size) {
      return { success: false, error: "Maximum team size must be greater than or equal to minimum team size." };
    }
  }

  if (payload.customQuestions) {
    for (const q of payload.customQuestions) {
      if (q.type === "single_choice" || q.type === "multiple_choice") {
        if (!q.options || q.options.length === 0) {
          return { success: false, error: `Question "${q.label}" must have at least one option.` };
        }
        const validOptions = q.options.filter((opt) => opt.trim() !== "");
        if (validOptions.length === 0 || validOptions.length !== q.options.length) {
          return { success: false, error: `Question "${q.label}" cannot have empty options.` };
        }
      }
    }
  }

  // 2. Validate optional chapter assignment
  const chapterId: string | null = payload.chapterId?.trim() || null;
  if (chapterId) {
    const { data: chapter, error: chapterError } = await adminClient
      .from("chapters")
      .select("id")
      .eq("id", chapterId)
      .maybeSingle();
    if (chapterError || !chapter) {
      return { success: false, error: "The selected chapter does not exist." };
    }
  }

  // 3. Insert via service role (events table has no write RLS policy)
  const { error: insertError } = await adminClient
    .from("events")
    .insert({
      title,
      slug,
      category,
      description: payload.description?.trim() || null,
      banner_url: payload.bannerUrl?.trim() || null,
      start_at: payload.startAt,
      end_at: payload.endAt || null,
      is_virtual: payload.isVirtual,
      meeting_url: payload.isVirtual ? (payload.meetingUrl?.trim() || null) : null,
      location: !payload.isVirtual ? (payload.location?.trim() || null) : null,
      capacity: payload.capacity && payload.capacity > 0 ? payload.capacity : null,
      is_hackathon: payload.isHackathon,
      team_config: payload.teamConfig || null,
      custom_questions: payload.customQuestions || [],
      agenda: payload.agenda || [],
      speakers: payload.speakers || [],
      chapter_id: chapterId,
      created_by: user.id,
      status: "upcoming",
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, error: "An event with this URL slug already exists." };
    }
    console.error("[adminCreateEvent] insert error:", insertError.message);
    return { success: false, error: "Failed to create event. Please try again." };
  }

  // 4. Revalidate admin + public event routes
  revalidatePath("/admin/events");
  revalidatePath("/events");

  return { success: true, slug };
}

// ─── Edit (admin) ─────────────────────────────────────────────────────────

export interface AdminUpdateEventPayload extends UpdateEventPayload {
  chapterId?: string | null;
}

export async function adminUpdateEvent(
  payload: AdminUpdateEventPayload
): Promise<UpdateEventResult> {
  await requireRole(["core_team", "super_admin"]);

  if (!adminClient) {
    return { success: false, error: "Admin service is unavailable." };
  }

  // 1. Fetch target event (no ownership check — admins manage every event)
  const { data: event, error: eventError } = await adminClient
    .from("events")
    .select("id, slug, capacity")
    .eq("id", payload.eventId)
    .maybeSingle();

  if (eventError || !event) {
    return { success: false, error: "Event not found." };
  }

  // 2. Validate fields
  const title = payload.title.trim();
  if (!title) return { success: false, error: "Title is required." };

  if (!payload.startAt) return { success: false, error: "Start date and time is required." };
  const startDate = new Date(payload.startAt);
  if (isNaN(startDate.getTime())) {
    return { success: false, error: "Invalid start date format." };
  }

  if (payload.endAt) {
    const endDate = new Date(payload.endAt);
    if (isNaN(endDate.getTime())) {
      return { success: false, error: "Invalid end date format." };
    }
    if (endDate <= startDate) {
      return { success: false, error: "End date must be strictly after the start date." };
    }
  }

  if (payload.isVirtual && !payload.meetingUrl?.trim()) {
    return { success: false, error: "Meeting URL is required for virtual events." };
  }
  if (!payload.isVirtual && !payload.location?.trim()) {
    return { success: false, error: "Physical location details are required." };
  }

  // 3. Capacity-reduction validation
  const newCapacity = payload.capacity && payload.capacity > 0 ? payload.capacity : null;
  const currentCapacity = event.capacity;

  const isCappedOrReduced =
    (newCapacity !== null && currentCapacity === null) || // switching from unlimited to limited
    (newCapacity !== null && currentCapacity !== null && newCapacity < currentCapacity); // reducing limit

  if (isCappedOrReduced && newCapacity !== null) {
    const { count, error: countError } = await adminClient
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .not("status", "eq", "cancelled");

    if (countError) {
      console.error("[adminUpdateEvent] count registrations error:", countError.message);
      return { success: false, error: "Failed to verify registration count." };
    }

    const currentRegisteredCount = count ?? 0;
    if (newCapacity < currentRegisteredCount) {
      return {
        success: false,
        error: `Cannot reduce capacity below the current number of registered attendees (${currentRegisteredCount}).`,
      };
    }
  }

  // 4. Validate optional chapter assignment
  const chapterId: string | null = payload.chapterId?.trim() || null;
  if (chapterId) {
    const { data: chapter, error: chapterError } = await adminClient
      .from("chapters")
      .select("id")
      .eq("id", chapterId)
      .maybeSingle();
    if (chapterError || !chapter) {
      return { success: false, error: "The selected chapter does not exist." };
    }
  }

  // 5. Update via service role
  const { error: updateError } = await adminClient
    .from("events")
    .update({
      title,
      description: payload.description?.trim() || null,
      banner_url: payload.bannerUrl?.trim() || null,
      start_at: payload.startAt,
      end_at: payload.endAt || null,
      is_virtual: payload.isVirtual,
      meeting_url: payload.isVirtual ? (payload.meetingUrl?.trim() || null) : null,
      location: !payload.isVirtual ? (payload.location?.trim() || null) : null,
      capacity: newCapacity,
      agenda: payload.agenda || [],
      speakers: payload.speakers || [],
      chapter_id: chapterId,
    })
    .eq("id", payload.eventId);

  if (updateError) {
    console.error("[adminUpdateEvent] update error:", updateError.message);
    return { success: false, error: "Failed to update event. Please try again." };
  }

  // 6. Revalidate
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${event.slug}`);
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);

  return { success: true, slug: event.slug };
}

// ─── Cancel / delete (admin) ──────────────────────────────────────────────

export async function adminCancelEvent(eventId: string) {
  return updateAdminEventStatus(eventId, "cancelled");
}

export async function adminDeleteEvent(eventId: string) {
  await requireRole(["core_team", "super_admin"]);

  if (!adminClient) {
    return { success: false, error: "Admin service is unavailable." };
  }

  const { data: event, error: eventError } = await adminClient
    .from("events")
    .select("id, slug")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    return { success: false, error: "Event not found." };
  }

  // Only allow deletion when no registrations exist — otherwise require cancellation.
  const { count, error: countError } = await adminClient
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (countError) {
    console.error("[adminDeleteEvent] count registrations error:", countError.message);
    return { success: false, error: "Failed to verify registrations before deleting." };
  }

  if (count !== null && count > 0) {
    return {
      success: false,
      error: "This event has registrations and cannot be deleted. Cancel the event instead.",
    };
  }

  const { error: deleteError } = await adminClient
    .from("events")
    .delete()
    .eq("id", eventId);

  if (deleteError) {
    console.error("[adminDeleteEvent] delete error:", deleteError.message);
    return { success: false, error: "Failed to delete event. Please try again." };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");

  return { success: true };
}

// ─── Detail + registrations (admin) ───────────────────────────────────────

export interface AdminEventDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  category: string;
  status: EventStatus;
  start_at: string;
  end_at: string | null;
  is_virtual: boolean;
  meeting_url: string | null;
  location: string | null;
  capacity: number | null;
  is_hackathon: boolean;
  chapter_id: string | null;
  chapter: { id: string; name: string } | null;
  registrations: { count: number }[];
  agenda: { time: string; title: string }[] | null;
  speakers: { name: string; bio?: string; photo_url?: string }[] | null;
}

export async function getAdminEventDetail(
  slug: string
): Promise<AdminEventDetail | null> {
  const { supabase } = await requireRole(["core_team", "super_admin"]);

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, slug, title, description, banner_url, category, status, start_at, end_at, is_virtual, meeting_url, location, capacity, is_hackathon, chapter_id, agenda, speakers, chapter:chapters(id, name), registrations:event_registrations(count)"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load event.");
  }

  if (!data) return null;

  return data as unknown as AdminEventDetail;
}

export interface AdminRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  full_name: string | null;
  email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  team_name: string | null;
  team_members: unknown;
  answers: unknown;
  registered_at: string;
  attendee: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  } | null;
}

export async function getAdminEventRegistrations(
  eventId: string
): Promise<AdminRegistration[]> {
  const { supabase } = await requireRole(["core_team", "super_admin"]);

  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      "id, event_id, user_id, status, full_name, email, github_url, linkedin_url, team_name, team_members, answers, registered_at, attendee:profiles(id, username, full_name, avatar_url, role)"
    )
    .eq("event_id", eventId)
    .order("registered_at", { ascending: true });

  if (error) {
    throw new Error("Unable to load registrations.");
  }

  return (data ?? []) as unknown as AdminRegistration[];
}

// ─── Registration status (admin) ──────────────────────────────────────────

export async function updateRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus
) {
  if (!VALID_REGISTRATION_STATUSES.includes(status)) {
    return { success: false, error: "Invalid registration status." };
  }

  await requireRole(["core_team", "super_admin"]);

  if (!adminClient) {
    return { success: false, error: "Admin service is unavailable." };
  }

  const { data: registration, error: regError } = await adminClient
    .from("event_registrations")
    .select("id, event_id")
    .eq("id", registrationId)
    .maybeSingle();

  if (regError || !registration) {
    return { success: false, error: "Registration not found." };
  }

  const { error } = await adminClient
    .from("event_registrations")
    .update({ status })
    .eq("id", registrationId);

  if (error) {
    console.error("[updateRegistrationStatus] update error:", error.message);
    return { success: false, error: "Unable to update registration status." };
  }

  const { data: event } = await adminClient
    .from("events")
    .select("slug")
    .eq("id", registration.event_id)
    .maybeSingle();

  revalidatePath("/admin/events");
  revalidatePath("/events");
  if (event?.slug) {
    revalidatePath(`/admin/events/${event.slug}`);
    revalidatePath(`/events/${event.slug}`);
  }

  return { success: true };
}
