"use client";

import { type ReactNode } from "react";
import { User, Mail, Github, Linkedin, AlertCircle } from "lucide-react";

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
}

interface Props {
  values: FormValues;
  errors: FormErrors;
  onChange: (field: string, value: string) => void;
}

export default function PersonalInfoSection({ values, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Field
        label="Full name"
        icon={<User className="h-4 w-4" />}
        value={values.fullName}
        placeholder="Ada Lovelace"
        error={errors.fullName}
        onChange={(v) => onChange("fullName", v)}
      />

      <Field
        label="Email"
        icon={<Mail className="h-4 w-4" />}
        type="email"
        value={values.email}
        placeholder="ada@email.com"
        error={errors.email}
        onChange={(v) => onChange("email", v)}
      />

      {errors.socialLinks && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{errors.socialLinks}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <Field
          label="GitHub"
          icon={<Github className="h-4 w-4" />}
          value={values.github}
          placeholder="github.com/username"
          onChange={(v) => onChange("github", v)}
        />
        <Field
          label="LinkedIn"
          icon={<Linkedin className="h-4 w-4" />}
          value={values.linkedin}
          placeholder="linkedin.com/in/name"
          onChange={(v) => onChange("linkedin", v)}
        />
      </div>
    </div>
  );
}

// ─── Shared field component ──────────────────────────────────────────────

function Field({
  label, icon, value, placeholder, error, type = "text", onChange,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  placeholder: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-1.5">
        {label}
      </label>
      <div
        className={[
          "flex items-center gap-2.5 rounded-xl border bg-zinc-950/60 px-3.5 py-2.5",
          "transition-colors duration-150",
          error
            ? "border-red-500/50 focus-within:border-red-500"
            : "border-zinc-800 focus-within:border-primary/60",
        ].join(" ")}
      >
        <span className="text-zinc-600 shrink-0">{icon}</span>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-base text-white placeholder:text-zinc-600 outline-none"
        />
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
