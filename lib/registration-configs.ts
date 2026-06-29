/**
 * Per-event registration configuration.
 *
 * Each entry maps an event slug → its specific registration behavior.
 * In Phase 1, this moves to the `events` table as JSON columns:
 *   - events.is_hackathon (boolean)
 *   - events.team_config (json)
 *   - events.custom_questions (json)
 *   - events.capacity (int)
 *   - events.registered_count (int, computed from event_registrations)
 */

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
  teamConfig: TeamConfig | null;
  customQuestions: CustomQuestion[];
  capacity: number;
  registeredCount: number;
}

// TODO: Connect to Supabase — replace this map with DB queries in Phase 1
export const registrationConfigs: Record<string, RegistrationConfig> = {
  "global-builder-night": {
    isHackathon: false,
    teamConfig: null,
    capacity: 500,
    registeredCount: 214,
    customQuestions: [
      {
        id: "q1",
        label: "How did you hear about Builder Night?",
        type: "select",
        options: ["Discord", "Twitter/X", "LinkedIn", "Friend", "Other"],
        required: false,
      },
    ],
  },
  "web3-systems-lab": {
    isHackathon: false,
    teamConfig: null,
    capacity: 100,
    registeredCount: 38,
    customQuestions: [
      {
        id: "q1",
        label: "What's your current Web3 experience level?",
        type: "select",
        options: ["None — just curious", "Some reading", "Built something small", "Shipped production"],
        required: true,
      },
      {
        id: "q2",
        label: "What specific area do you want to explore?",
        type: "text",
        required: false,
      },
    ],
  },
  "merge-sprint-weekend": {
    isHackathon: false,
    teamConfig: null,
    capacity: 200,
    registeredCount: 200, // sold out
    customQuestions: [],
  },
  "founders-qa-live": {
    isHackathon: false,
    teamConfig: null,
    capacity: 200,
    registeredCount: 112,
    customQuestions: [
      {
        id: "q1",
        label: "Do you have a question for the founders?",
        type: "textarea",
        required: false,
      },
    ],
  },
  "chapter-launch-playbook": {
    isHackathon: false,
    teamConfig: null,
    capacity: 50,
    registeredCount: 29,
    customQuestions: [
      {
        id: "q1",
        label: "Are you planning to launch a chapter?",
        type: "select",
        options: ["Yes — actively planning", "Thinking about it", "Just learning"],
        required: true,
      },
      {
        id: "q2",
        label: "Which city or institution would your chapter be in?",
        type: "text",
        required: false,
      },
    ],
  },
  "build-week-zero": {
    isHackathon: true,
    teamConfig: { minSize: 2, maxSize: 4, allowSolo: true },
    capacity: 80,
    registeredCount: 61,
    customQuestions: [
      {
        id: "q1",
        label: "What's your primary tech stack?",
        type: "text",
        required: true,
      },
      {
        id: "q2",
        label: "What do you want to build this weekend?",
        type: "textarea",
        required: false,
      },
    ],
  },
};

export const defaultRegistrationConfig: RegistrationConfig = {
  isHackathon: false,
  teamConfig: null,
  customQuestions: [],
  capacity: 100,
  registeredCount: 0,
};
