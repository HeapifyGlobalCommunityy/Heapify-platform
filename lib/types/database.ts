/**
 * TypeScript types mirroring the Supabase database schema.
 * Source of truth: supabase/schema.sql
 *
 * These types are used for Phase 0 mock data and will be
 * swapped to Supabase-generated types in Phase 1 without
 * needing to rewrite any component.
 */

export type UserRole =
  | "member"
  | "mentor"
  | "chapter_admin"
  | "core_team"
  | "super_admin";

export type EventCategory =
  | "web3"
  | "blockchain"
  | "hackathon"
  | "open_source"
  | "workshop"
  | "internship_session";

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export type RegistrationStatus =
  | "registered"
  | "waitlisted"
  | "cancelled"
  | "attended";

export type ChapterType = "city" | "college" | "regional";
export type ChapterStatus = "active" | "pending" | "inactive";

// ---- Core Tables ----

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  contribution_score: number;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  chapter_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  name: string;
  type: ChapterType;
  city: string | null;
  country: string | null;
  lead_id: string | null;
  banner_url: string | null;
  description: string | null;
  member_count: number;
  status: ChapterStatus;
  created_at: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string; // kept as string for mock compat; tighten to EventCategory in Phase 1
  status: string;   // kept as string for mock compat; tighten to EventStatus in Phase 1
  banner_url: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
  is_virtual: boolean;
  meeting_url: string | null;
  agenda: AgendaItem[] | null;
  speakers: SpeakerItem[] | null;
  capacity: number | null;
  chapter_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  registered_at: string;
}

// ---- Embedded Sub-types ----

export interface AgendaItem {
  time: string;
  title: string;
}

export interface SpeakerItem {
  name: string;
  bio?: string;
  photo_url?: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  url: string;
  tags: string[] | null;
  added_by: string | null;
  created_at: string;
}
