// lib/actions/forms.ts
// Server action for all /forms/[type] submissions.
// - Validates required fields + email format server-side (never trust client).
// - Sets submitted_by from the authenticated session if logged in; null otherwise.
// - Payload is always typed per form_type from FORM_FIELD_REQUIREMENTS.
// - status always inserts as "pending" (DB default).

"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Valid types must match DB check constraint exactly ───────────────────
const VALID_FORM_TYPES = [
  "volunteer",
  "speaker",
  "mentor",
  "partnership",
  "sponsor",
  "chapter_lead",
  "ambassador",
  "contact",
  "chapter_member",
] as const;

type FormType = (typeof VALID_FORM_TYPES)[number];

// ─── Required fields per type (for server-side validation) ─────────────────
// Fields marked as required must be non-empty strings in the payload.
// email fields are also tested against a basic regex.
const REQUIRED_FIELDS: Record<FormType, string[]> = {
  sponsor: [
    "org_name",
    "contact_name",
    "email",
    "sponsorship_tier",
    "objective",
    "region",
    "activation_format",
  ],
  partnership: [
    "name",
    "email",
    "partnership_type",
    "proposal_description",
    "timeline",
  ],
  volunteer: ["name", "email", "areas_of_interest", "availability"],
  speaker: [
    "name",
    "email",
    "talk_title",
    "format",
    "abstract",
    "audience_level",
    "bio",
  ],
  mentor: [
    "name",
    "email",
    "areas_of_expertise",
    "years_of_experience",
    "availability_commitment",
    "motivation",
  ],
  chapter_lead: [
    "name",
    "email",
    "proposed_chapter_name",
    "chapter_type",
    "city",
    "country",
    "why_lead",
    "expected_member_estimate",
  ],
  ambassador: [
    "name",
    "email",
    "affiliation",
    "city_region",
    "why_ambassador",
  ],
  contact: ["name", "email", "topic", "message"],
  chapter_member: ["name", "email", "chapter_id", "why_join"],
};

const EMAIL_FIELDS: Record<FormType, string[]> = {
  sponsor: ["email"],
  partnership: ["email"],
  volunteer: ["email"],
  speaker: ["email"],
  mentor: ["email"],
  chapter_lead: ["email"],
  ambassador: ["email"],
  contact: ["email"],
  chapter_member: ["email"],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Return type ──────────────────────────────────────────────────────────
export type FormSubmitResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

// ─── Server action ─────────────────────────────────────────────────────────
export async function submitForm(
  formType: string,
  payload: Record<string, unknown>
): Promise<FormSubmitResult> {
  // 1. Validate form type
  if (!VALID_FORM_TYPES.includes(formType as FormType)) {
    return { success: false, error: "Invalid form type." };
  }
  const type = formType as FormType;

  // 2. Server-side field validation — independent of client checks
  const required = REQUIRED_FIELDS[type];
  const emailFields = EMAIL_FIELDS[type];
  const fieldErrors: Record<string, string> = {};

  for (const field of required) {
    const value = payload[field];
    // multi-select fields may be arrays — check for empty array too
    if (Array.isArray(value)) {
      if (value.length === 0) {
        fieldErrors[field] = "This field is required.";
      }
    } else if (!value || String(value).trim() === "") {
      fieldErrors[field] = "This field is required.";
    }
  }

  for (const field of emailFields) {
    const value = String(payload[field] ?? "").trim();
    if (value && !EMAIL_REGEX.test(value)) {
      fieldErrors[field] = "Please enter a valid email address.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the highlighted fields before submitting.",
      fieldErrors,
    };
  }

  // 3. Get Supabase client
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, error: "Service temporarily unavailable. Please try again." };
  }

  // 4. Derive submitted_by from session — never trust client-supplied value
  let submittedBy: string | null = null;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    submittedBy = user.id;
  }

  // 5. Sanitize payload (strip any client-supplied submitted_by or status)
  const { submitted_by: _a, status: _b, ...safePayload } = payload as Record<string, unknown>;
  void _a; void _b;

  // 6. Insert — RLS policy: auth.uid() = submitted_by OR submitted_by IS NULL
  const { error } = await supabase.from("form_submissions").insert({
    form_type: type,
    submitted_by: submittedBy,
    payload: safePayload,
    // status defaults to "pending" via DB default — do not set here
  });

  if (error) {
    console.error("[submitForm] insert error:", error.message);
    return {
      success: false,
      error:
        "Failed to submit your form. Please check your connection and try again.",
    };
  }

  return { success: true };
}
