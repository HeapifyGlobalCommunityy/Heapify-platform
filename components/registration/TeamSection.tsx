"use client";

const inputBase =
  "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-150";
const labelBase = "block text-sm text-zinc-400 mb-1.5";
const errorBase = "text-red-400 text-xs mt-1";

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
  onTeamNameChange: (v: string) => void;
  onTeammateChange: (id: string, field: "name" | "email", value: string) => void;
  onAddTeammate: () => void;
  onRemoveTeammate: (id: string) => void;
}

export default function TeamSection({
  teamConfig,
  mode,
  teamName,
  teammates,
  errors,
  onModeChange,
  onTeamNameChange,
  onTeammateChange,
  onAddTeammate,
  onRemoveTeammate,
}: Props) {
  const totalMembers = 1 + teammates.length; // leader + teammates
  const canAdd = teammates.length < teamConfig.maxSize - 1;
  const canRemove = teammates.length > teamConfig.minSize - 2; // keep at least minSize-1 teammates

  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-[0.28em] text-zinc-600 mb-5">
        03 — Team
      </p>

      {/* Solo / Team toggle — only shown when solo is allowed */}
      {teamConfig.allowSolo && (
        <div className="flex gap-1 p-1 rounded-lg border border-zinc-800 bg-zinc-900/60 w-fit mb-6">
          {(["solo", "team"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-sans transition-all duration-150 capitalize ${
                mode === m
                  ? "bg-primary text-black font-medium"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {m === "solo" ? "Solo" : "Team"}
            </button>
          ))}
        </div>
      )}

      {/* Team fields — shown when team mode is active */}
      {(mode === "team" || !teamConfig.allowSolo) && (
        <div className="space-y-5">
          {/* Team name */}
          <div>
            <label className={labelBase}>Team Name <span className="text-primary">*</span></label>
            <input
              className={inputBase}
              placeholder="Your team name"
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
            />
            {errors.teamName && <p className={errorBase}>{errors.teamName}</p>}
          </div>

          {/* Member count indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600">
              You + {teammates.length} teammate{teammates.length !== 1 ? "s" : ""}
            </span>
            <span className="font-mono text-zinc-400">
              <span className={totalMembers >= teamConfig.minSize ? "text-primary" : "text-zinc-400"}>
                {totalMembers}
              </span>
              <span className="text-zinc-700"> / {teamConfig.maxSize} members</span>
            </span>
          </div>

          {/* Teammate entries */}
          <div className="space-y-3">
            {teammates.map((tm, idx) => (
              <div
                key={tm.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3 transition-all duration-200"
                style={{ animation: "fadeIn 0.2s ease-out" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-600">
                    Teammate {idx + 1}
                  </span>
                  {canRemove && (
                    <button
                      onClick={() => onRemoveTeammate(tm.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors text-lg leading-none"
                      aria-label="Remove teammate"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelBase}>Full Name</label>
                    <input
                      className={inputBase}
                      placeholder="Name"
                      value={tm.name}
                      onChange={(e) => onTeammateChange(tm.id, "name", e.target.value)}
                    />
                    {errors.teammates?.[idx]?.name && (
                      <p className={errorBase}>{errors.teammates[idx].name}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelBase}>Email</label>
                    <input
                      className={inputBase}
                      type="email"
                      placeholder="email@example.com"
                      value={tm.email}
                      onChange={(e) => onTeammateChange(tm.id, "email", e.target.value)}
                    />
                    {errors.teammates?.[idx]?.email && (
                      <p className={errorBase}>{errors.teammates[idx].email}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add teammate button */}
          <button
            onClick={onAddTeammate}
            disabled={!canAdd}
            className="w-full rounded-lg border border-zinc-800 py-2.5 text-sm text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed font-sans"
          >
            + Add teammate
          </button>
          <p className="text-xs text-zinc-700 -mt-2">
            Up to {teamConfig.maxSize} members including you
          </p>
        </div>
      )}
    </div>
  );
}
