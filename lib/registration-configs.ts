// lib/registration-configs.ts
// ─── IMPORTANT ────────────────────────────────────────────────────────────────
// Every field that RegistrationForm reads must be explicitly set to a safe
// value in defaultRegistrationConfig. Undefined causes runtime crashes.
// teamConfig MUST be null (not undefined) when unused.
// customQuestions MUST be [] (not undefined) when unused.
// ──────────────────────────────────────────────────────────────────────────────

export interface TeamConfig {
  minSize: number;
  maxSize: number;
  allowSolo: boolean;
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: "select" | "text" | "textarea";
  options?: string[];
  required: boolean;
}

export interface RegistrationConfig {
  isHackathon: boolean;
  capacity: number;
  registeredCount: number;
  teamConfig: TeamConfig | null; // null means "not a team event" — NEVER undefined
  customQuestions: CustomQuestion[]; // empty array means "no extra questions" — NEVER undefined
}

// ─── Default — used when no event-specific config is found ────────────────────
export const defaultRegistrationConfig: RegistrationConfig = {
  isHackathon: false,
  capacity: 100,
  registeredCount: 0,
  teamConfig: null,       // ← must be null, not undefined
  customQuestions: [],    // ← must be [], not undefined
};

// ─── Per-event configs ────────────────────────────────────────────────────────
// Add an entry here for each event slug that needs custom configuration.
// Every entry must satisfy RegistrationConfig (all fields required).

export const registrationConfigs: Record<string, RegistrationConfig> = {
  // Example: a hackathon with team support and custom questions
  "build-the-future-hackathon-2025": {
    isHackathon: true,
    capacity: 100,
    registeredCount: 72,
    teamConfig: {
      allowSolo: true,
      minSize: 2,
      maxSize: 4,
    },
    customQuestions: [
      {
        id: "tech_stack",
        label: "Preferred tech stack",
        type: "text",
        required: false,
      },
      {
        id: "portfolio",
        label: "Portfolio / project link",
        type: "text",
        required: false,
      },
      {
        id: "idea",
        label: "What do you want to build?",
        type: "textarea",
        required: false,
      },
    ],
  },

  // Example: a workshop — no teams, simple questions
  "intro-to-llms-workshop": {
    isHackathon: false,
    capacity: 50,
    registeredCount: 30,
    teamConfig: null,
    customQuestions: [
      {
        id: "experience",
        label: "Years of experience with AI/ML",
        type: "select",
        options: ["< 1 year", "1–3 years", "3–5 years", "5+ years"],
        required: true,
      },
      {
        id: "role",
        label: "Current role",
        type: "text",
        required: false,
      },
    ],
  },

  // Example: a webinar — bare minimum
  "community-ama-webinar": {
    isHackathon: false,
    capacity: 500,
    registeredCount: 210,
    teamConfig: null,
    customQuestions: [
      {
        id: "referral",
        label: "How did you hear about us?",
        type: "text",
        required: false,
      },
    ],
  },
};
