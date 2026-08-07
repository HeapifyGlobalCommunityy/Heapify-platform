// app/forms/[type]/page.tsx
// Dynamic server component: validates type, passes config to DynamicForm client component.

import { notFound } from "next/navigation";
import { SectionWrapper } from "@/components/site/ui";
import DynamicForm from "./DynamicForm";

// ─── Field config types ─────────────────────────────────────────────────────
export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "multi_select";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select / multi_select
}

export interface FormConfig {
  title: string;
  description: string;
  fields: FieldConfig[];
}

// ─── Per-type form configuration ───────────────────────────────────────────
const FORM_CONFIG: Record<string, FormConfig> = {
  sponsor: {
    title: "Sponsor Form",
    description:
      "Partner with Heapify to reach a high-intent technical community. Share your objective and preferred activation format.",
    fields: [
      { name: "org_name", label: "Organisation Name", type: "text", required: true, placeholder: "Acme Corp" },
      { name: "contact_name", label: "Contact Name", type: "text", required: true, placeholder: "Jane Smith" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "jane@acme.com" },
      { name: "website", label: "Website", type: "text", required: false, placeholder: "https://acme.com" },
      {
        name: "sponsorship_tier",
        label: "Sponsorship Tier Interest",
        type: "select",
        required: true,
        options: ["Platinum", "Gold", "Silver", "Community"],
      },
      { name: "objective", label: "Sponsorship Objective", type: "textarea", required: true, placeholder: "What do you hope to achieve through this partnership?" },
      { name: "region", label: "Region / Market", type: "text", required: true, placeholder: "South Asia, EMEA, Global…" },
      { name: "activation_format", label: "Preferred Activation Format", type: "text", required: true, placeholder: "Workshop sponsor, event naming rights, newsletter…" },
    ],
  },

  partnership: {
    title: "Partnership Form",
    description:
      "Propose a collaboration around events, content, internships, or chapter growth.",
    fields: [
      { name: "name", label: "Organisation or Individual Name", type: "text", required: true, placeholder: "TechOrg / Your Name" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
      {
        name: "partnership_type",
        label: "Partnership Type",
        type: "multi_select",
        required: true,
        options: ["Events", "Content", "Internships", "Chapter Growth"],
      },
      { name: "proposal_description", label: "Proposal Description", type: "textarea", required: true, placeholder: "Describe what you'd like to build together." },
      { name: "relevant_link", label: "Relevant Link", type: "text", required: false, placeholder: "https://…" },
      { name: "timeline", label: "Proposed Timeline", type: "text", required: true, placeholder: "Q3 2026, ASAP, flexible…" },
    ],
  },

  volunteer: {
    title: "Volunteer Form",
    description:
      "Join the team behind Heapify events, design, and operations. Pick your area and tell us your availability.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Stavan Khobare" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
      {
        name: "areas_of_interest",
        label: "Areas of Interest",
        type: "multi_select",
        required: true,
        options: ["Operations", "Design", "Events", "Community", "Technical"],
      },
      { name: "availability", label: "Availability", type: "text", required: true, placeholder: "Weekends, 5 hrs/week, flexible…" },
      { name: "relevant_experience", label: "Relevant Experience", type: "textarea", required: false, placeholder: "Previous volunteering, projects, or roles that are relevant." },
      { name: "portfolio_link", label: "Portfolio Link (optional)", type: "text", required: false, placeholder: "https://…" },
    ],
  },

  speaker: {
    title: "Speaker Form",
    description:
      "Propose a talk, workshop, panel, or fireside. We're looking for practitioners with real community value to share.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Stavan Khobare" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
      { name: "talk_title", label: "Talk Title", type: "text", required: true, placeholder: "Building Multi-chain dApps at Scale" },
      {
        name: "format",
        label: "Format",
        type: "select",
        required: true,
        options: ["Talk", "Workshop", "Panel", "Fireside"],
      },
      { name: "abstract", label: "Abstract", type: "textarea", required: true, placeholder: "A brief summary of what you'll cover." },
      {
        name: "audience_level",
        label: "Audience Level",
        type: "select",
        required: true,
        options: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      },
      { name: "bio", label: "Speaker Bio", type: "textarea", required: true, placeholder: "Who are you and what's your background?" },
      { name: "past_speaking_links", label: "Past Speaking Links (optional)", type: "text", required: false, placeholder: "YouTube, Loom, conference page URLs…" },
    ],
  },

  mentor: {
    title: "Mentor Form",
    description:
      "Support Heapify contributors with career guidance, technical reviews, and feedback loops.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Stavan Khobare" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
      { name: "areas_of_expertise", label: "Areas of Expertise", type: "textarea", required: true, placeholder: "Web3, System Design, Career Transitions…" },
      { name: "years_of_experience", label: "Years of Experience", type: "number", required: true, placeholder: "5" },
      { name: "availability_commitment", label: "Availability Commitment", type: "text", required: true, placeholder: "2 sessions/month, async only, flexible…" },
      { name: "linkedin_portfolio", label: "LinkedIn / Portfolio", type: "text", required: false, placeholder: "https://linkedin.com/in/…" },
      { name: "motivation", label: "Why do you want to mentor?", type: "textarea", required: true, placeholder: "Tell us what drives you to support other builders." },
    ],
  },

  chapter_lead: {
    title: "Chapter Lead Form",
    description:
      "Launch or expand a Heapify chapter in your city, campus, or region.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Stavan Khobare" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
      { name: "proposed_chapter_name", label: "Proposed Chapter Name", type: "text", required: true, placeholder: "Heapify Bengaluru" },
      {
        name: "chapter_type",
        label: "Chapter Type",
        type: "select",
        required: true,
        options: ["City", "College", "Regional"],
      },
      { name: "city", label: "City", type: "text", required: true, placeholder: "Bengaluru" },
      { name: "country", label: "Country", type: "text", required: true, placeholder: "India" },
      { name: "why_lead", label: "Why do you want to lead this chapter?", type: "textarea", required: true, placeholder: "What's your motivation and what would you build?" },
      { name: "prior_leadership_experience", label: "Prior Leadership Experience", type: "textarea", required: false, placeholder: "Previous clubs, communities, or initiatives you've run." },
      { name: "expected_member_estimate", label: "Expected Member Estimate", type: "number", required: true, placeholder: "50" },
    ],
  },

  ambassador: {
    title: "Ambassador Form",
    description:
      "Represent Heapify locally — expand our reach on campuses, within companies, or across your community.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Stavan Khobare" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
      { name: "affiliation", label: "College / Company / Community Affiliation", type: "text", required: true, placeholder: "MSRIT, Google, Dev Community XYZ…" },
      { name: "city_region", label: "City / Region", type: "text", required: true, placeholder: "Bengaluru, Karnataka" },
      { name: "why_ambassador", label: "Why do you want to be an Ambassador?", type: "textarea", required: true, placeholder: "Tell us what drives you to represent Heapify." },
      { name: "prior_community_experience", label: "Prior Experience Representing Communities", type: "textarea", required: false, placeholder: "Campus ambassador roles, community leadership, etc." },
      { name: "reach_platforms", label: "Reach / Platforms You'd Use (optional)", type: "text", required: false, placeholder: "LinkedIn, Twitter, campus notice boards, Discord…" },
    ],
  },

  contact: {
    title: "Contact",
    description:
      "General inquiries, press, and non-standard collaboration requests. We read everything.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Stavan Khobare" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
      {
        name: "topic",
        label: "Topic",
        type: "select",
        required: true,
        options: ["General Inquiry", "Partnership", "Press", "Other"],
      },
      { name: "message", label: "Message", type: "textarea", required: true, placeholder: "What would you like to share with the team?" },
    ],
  },
};

// ─── Page ───────────────────────────────────────────────────────────────────
export default async function FormPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const config = FORM_CONFIG[type];

  if (!config) {
    notFound();
  }

  return (
    <SectionWrapper
      title={config.title}
      description={config.description}
      className="pt-40 pb-20 animate-fade-in"
    >
      <div className="mt-10 max-w-2xl mx-auto">
        <DynamicForm formType={type} config={config} />
      </div>
    </SectionWrapper>
  );
}
