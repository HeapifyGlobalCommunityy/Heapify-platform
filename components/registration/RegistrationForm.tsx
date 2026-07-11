"use client";

import { useState, type ReactNode } from "react";
import PersonalInfoSection from "./PersonalInfoSection";
import TeamSection, { Teammate } from "./TeamSection";
import CustomQuestionsSection, { CustomQuestion } from "./CustomQuestionsSection";
import SubmitButton, { SubmitState } from "./SubmitButton";
import ConfirmationView from "./ConfirmationView";

// ═══════════════════════════════════════════════════════════════════════════
// Redesigned for visual hierarchy and polish — same exact field names, state
// shape, and validation logic as before, so nothing about the data contract
// changes. Only the presentation layer (spacing, grouping, typography,
// section framing) is new.
// ═══════════════════════════════════════════════════════════════════════════

interface TeamConfig {
  minSize: number;
  maxSize: number;
  allowSolo: boolean;
}

interface EventProps {
  title: string;
  slug: string;
  date: string;
  isHackathon: boolean;
  teamConfig: TeamConfig | null;
  customQuestions: CustomQuestion[];
}

interface FormValues {
  fullName: string;
  email: string;
  github: string;
  linkedin: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  socialLinks?: string;
  teamName?: string;
  teammates?: Record<number, { name?: string; email?: string }>;
  answers?: Record<string, string>;
}

function genId() {
  return `tm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function RegistrationForm({ event }: { event: EventProps }) {
  const [values, setValues] = useState<FormValues>({
    fullName: "", email: "", github: "", linkedin: "",
  });
  const [mode, setMode] = useState<"solo" | "team">(
    event.teamConfig?.allowSolo ? "solo" : "team"
  );
  const [teamName, setTeamName] = useState("");
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const showTeamSection = event.isHackathon && event.teamConfig !== null;
  const isTeamMode = showTeamSection && (mode === "team" || !event.teamConfig?.allowSolo);

  function handleValueChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleTeammateChange(id: string, field: "name" | "email", value: string) {
    setTeammates((prev) =>
      prev.map((tm) => (tm.id === id ? { ...tm, [field]: value } : tm))
    );
  }

  function handleAddTeammate() {
    if (!event.teamConfig) return;
    if (teammates.length < event.teamConfig.maxSize - 1) {
      setTeammates((prev) => [...prev, { id: genId(), name: "", email: "" }]);
    }
  }

  function handleRemoveTeammate(id: string) {
    setTeammates((prev) => prev.filter((tm) => tm.id !== id));
  }

  function handleAnswerChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setAnswerErrors((prev) => ({ ...prev, [id]: "" }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    let valid = true;

    if (!values.fullName.trim()) { newErrors.fullName = "Full name is required."; valid = false; }
    if (!values.email.trim()) { newErrors.email = "Email is required."; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) { newErrors.email = "Enter a valid email."; valid = false; }

    if (!values.github.trim() && !values.linkedin.trim()) {
      newErrors.socialLinks = "Please provide at least one social profile.";
      valid = false;
    }

    if (isTeamMode) {
      if (!teamName.trim()) { newErrors.teamName = "Team name is required."; valid = false; }
      const tmErrors: Record<number, { name?: string; email?: string }> = {};
      const emailsSeen = new Set<string>();

      teammates.forEach((tm, i) => {
        const hasName = tm.name.trim();
        const hasEmail = tm.email.trim();
        if (hasName && !hasEmail) {
          tmErrors[i] = { email: "Email required if name is filled." };
          valid = false;
        } else if (!hasName && hasEmail) {
          tmErrors[i] = { name: "Name required if email is filled." };
          valid = false;
        } else if (hasName && hasEmail) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tm.email)) {
            tmErrors[i] = { email: "Enter a valid email." };
            valid = false;
          } else if (tm.email.toLowerCase() === values.email.toLowerCase()) {
            tmErrors[i] = { email: "Teammate email cannot match yours." };
            valid = false;
          } else if (emailsSeen.has(tm.email.toLowerCase())) {
            tmErrors[i] = { email: "Duplicate teammate email." };
            valid = false;
          } else {
            emailsSeen.add(tm.email.toLowerCase());
          }
        }
      });
      if (Object.keys(tmErrors).length > 0) newErrors.teammates = tmErrors;
    }

    const newAnswerErrors: Record<string, string> = {};
    event.customQuestions.forEach((q) => {
      if (q.required && !answers[q.id]?.trim()) {
        newAnswerErrors[q.id] = "This field is required.";
        valid = false;
      }
    });

    setErrors(newErrors);
    setAnswerErrors(newAnswerErrors);
    return valid;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSubmitState("loading");
    // TODO: Connect to Supabase
    setTimeout(() => {
      setSubmitState("success");
    }, 1500);
  }

  if (submitState === "success") {
    return (
      <ConfirmationView
        event={{ title: event.title, date: event.date, slug: event.slug }}
        isTeamEvent={isTeamMode}
        teamName={teamName}
        totalMembers={isTeamMode ? 1 + teammates.filter((t) => t.name.trim()).length : undefined}
      />
    );
  }

  // Total section count drives both the numbering and the little progress
  // dots at the top — gives the form a sense of "here's how much is left",
  // which is a small but real hook to keep people moving through it.
  const sectionCount = 2 + (showTeamSection ? 1 : 0) + (event.customQuestions.length > 0 ? 1 : 0);

  return (
    <div className="w-full max-w-2xl mx-auto px-6 lg:px-10 pt-8 lg:pt-10 pb-16">

      {/* ── Header ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: sectionCount }).map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-primary/25 overflow-hidden">
              <div className="h-full w-full bg-primary/70 rounded-full" />
            </div>
          ))}
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
            Register for {event.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            You&apos;re almost in — this takes about a minute.
          </p>
        </div>
      </div>

      {/* ── Sections, each in its own card for clear visual grouping ── */}
      <div className="mt-8 space-y-5">
        <FormSection index={1} title="Personal information">
          <PersonalInfoSection
            values={values}
            errors={errors}
            onChange={handleValueChange}
          />
        </FormSection>

        {showTeamSection && event.teamConfig && (
          <FormSection index={2} title="Team">
            <TeamSection
              teamConfig={event.teamConfig}
              mode={mode}
              teamName={teamName}
              teammates={teammates}
              errors={{ teamName: errors.teamName, teammates: errors.teammates }}
              onModeChange={setMode}
              onTeamNameChange={setTeamName}
              onTeammateChange={handleTeammateChange}
              onAddTeammate={handleAddTeammate}
              onRemoveTeammate={handleRemoveTeammate}
            />
          </FormSection>
        )}

        {event.customQuestions.length > 0 && (
          <FormSection index={showTeamSection ? 3 : 2} title="Additional information">
            <CustomQuestionsSection
              sectionIndex={showTeamSection ? 3 : 2}
              questions={event.customQuestions}
              answers={answers}
              errors={answerErrors}
              onChange={handleAnswerChange}
            />
          </FormSection>
        )}
      </div>

      <div className="mt-8">
        <SubmitButton state={submitState} onClick={handleSubmit} />
      </div>
    </div>
  );
}

// ─── Section card wrapper — gives every section a consistent frame ─────────

function FormSection({
  index, title, children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-mono font-semibold">
          {index}
        </span>
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
