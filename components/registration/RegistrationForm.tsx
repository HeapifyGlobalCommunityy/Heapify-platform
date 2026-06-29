"use client";

import { useState } from "react";
import PersonalInfoSection from "./PersonalInfoSection";
import TeamSection, { Teammate } from "./TeamSection";
import CustomQuestionsSection, { CustomQuestion } from "./CustomQuestionsSection";
import SubmitButton, { SubmitState } from "./SubmitButton";
import ConfirmationView from "./ConfirmationView";

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
    // Clear error on change
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
    // await supabase.from('event_registrations').insert({ event_id, user_id, status: 'registered', ... })
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

  return (
    <div className="w-full max-w-2xl mx-auto px-6 lg:px-10 pt-8 lg:pt-10 pb-16 space-y-10">
      {/* Form header */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
          Register for {event.title}
        </h1>
        <p className="text-sm text-zinc-500 font-sans">
          You&apos;re almost in. Fill in the details below.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800" />

      {/* Section 1 + 2 — Personal Info & Social Profiles */}
      <PersonalInfoSection
        values={values}
        errors={errors}
        onChange={handleValueChange}
      />

      <div className="h-px bg-zinc-800" />

      {/* Section 3 — Team (conditional) */}
      {showTeamSection && event.teamConfig && (
        <>
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
          <div className="h-px bg-zinc-800" />
        </>
      )}

      {/* Section 4 — Custom Questions (conditional) */}
      {event.customQuestions.length > 0 && (
        <>
          <CustomQuestionsSection
            sectionIndex={showTeamSection ? 4 : 3}
            questions={event.customQuestions}
            answers={answers}
            errors={answerErrors}
            onChange={handleAnswerChange}
          />
          <div className="h-px bg-zinc-800" />
        </>
      )}

      {/* Submit */}
      <SubmitButton
        state={submitState}
        onClick={handleSubmit}
      />
    </div>
  );
}
