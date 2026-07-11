"use client";

import { type ReactNode } from "react";
import { Plus, X, Users, User, AlertCircle } from "lucide-react";

export interface Teammate {
  id: string;
  name: string;
  email: string;
}

interface TeamConfig {
  minSize: number;
  maxSize: number;
  allowSolo: boolean;
}

interface Props {
  teamConfig: TeamConfig;
  mode: "solo" | "team";
  teamName: string;
  teammates: Teammate[];
  errors: {
    teamName?: string;
    teammates?: Record<number, { name?: string; email?: string }>;
  };
  onModeChange: (mode: "solo" | "team") => void;
  onTeamNameChange: (value: string) => void;
  onTeammateChange: (id: string, field: "name" | "email", value: string) => void;
  onAddTeammate: () => void;
  onRemoveTeammate: (id: string) => void;
}

export default function TeamSection({
  teamConfig, mode, teamName, teammates, errors,
  onModeChange, onTeamNameChange, onTeammateChange, onAddTeammate, onRemoveTeammate,
}: Props) {
  const isTeamMode = mode === "team" || !teamConfig.allowSolo;

  return (
    <div className="space-y-4">
      {teamConfig.allowSolo && (
        <div className="flex gap-2 p-1 rounded-xl bg-zinc-950/60 border border-zinc-800">
          <ModeButton
            active={mode === "solo"}
            icon={<User className="h-3.5 w-3.5" />}
            label="Solo"
            onClick={() => onModeChange("solo")}
          />
          <ModeButton
            active={mode === "team"}
            icon={<Users className="h-3.5 w-3.5" />}
            label="Team"
            onClick={() => onModeChange("team")}
          />
        </div>
      )}

      {isTeamMode && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Team name
            </label>
            <div
              className={[
                "rounded-xl border bg-zinc-950/60 px-3.5 py-2.5",
                errors.teamName ? "border-red-500/50" : "border-zinc-800 focus-within:border-primary/60",
              ].join(" ")}
            >
              <input
                type="text"
                value={teamName}
                placeholder="Team Axiom"
                onChange={(e) => onTeamNameChange(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
              />
            </div>
            {errors.teamName && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.teamName}
              </p>
            )}
          </div>

          <p className="text-xs text-zinc-500">
            {teamConfig.minSize}–{teamConfig.maxSize} members total, including you.
          </p>

          {teammates.length > 0 && (
            <div className="space-y-3">
              {teammates.map((tm, i) => {
                const tmError = errors.teammates?.[i];
                return (
                  <div
                    key={tm.id}
                    className="flex gap-2 items-start rounded-xl border border-zinc-800 bg-zinc-950/40 p-3"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          value={tm.name}
                          placeholder={`Teammate ${i + 1} name`}
                          onChange={(e) => onTeammateChange(tm.id, "name", e.target.value)}
                          className={[
                            "w-full rounded-lg border bg-zinc-950/60 px-3 py-2 text-sm text-white",
                            "placeholder:text-zinc-600 outline-none transition-colors",
                            tmError?.name ? "border-red-500/50" : "border-zinc-800 focus:border-primary/60",
                          ].join(" ")}
                        />
                        {tmError?.name && (
                          <p className="mt-1 text-[11px] text-red-400">{tmError.name}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="email"
                          value={tm.email}
                          placeholder="Email"
                          onChange={(e) => onTeammateChange(tm.id, "email", e.target.value)}
                          className={[
                            "w-full rounded-lg border bg-zinc-950/60 px-3 py-2 text-sm text-white",
                            "placeholder:text-zinc-600 outline-none transition-colors",
                            tmError?.email ? "border-red-500/50" : "border-zinc-800 focus:border-primary/60",
                          ].join(" ")}
                        />
                        {tmError?.email && (
                          <p className="mt-1 text-[11px] text-red-400">{tmError.email}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveTeammate(tm.id)}
                      aria-label="Remove teammate"
                      className="mt-1.5 shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {teammates.length < teamConfig.maxSize - 1 && (
            <button
              type="button"
              onClick={onAddTeammate}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add teammate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active, icon, label, onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
        active ? "bg-primary text-white" : "text-zinc-400 hover:text-zinc-200",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
