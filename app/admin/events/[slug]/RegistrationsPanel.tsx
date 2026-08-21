"use client";

import { useMemo, useState } from "react";
import { Mail, Search, Users } from "lucide-react";
import { ExportRegistrationsButton } from "@/components/events/ExportRegistrationsButton";
import { RegistrationStatusControl } from "./RegistrationStatusControl";
import type { AdminRegistration } from "@/lib/actions/events";

const statuses = ["all", "registered", "waitlisted", "attended", "cancelled"] as const;
type FilterStatus = (typeof statuses)[number];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

export function RegistrationsPanel({
  eventSlug,
  registrations,
}: {
  eventSlug: string;
  registrations: AdminRegistration[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");

  const filtered = useMemo(
    () =>
      registrations.filter((registration) => {
        const matchesStatus = status === "all" || registration.status === status;
        const search = query.trim().toLowerCase();
        const haystack = [
          registration.full_name,
          registration.email,
          registration.team_name,
          registration.attendee?.username,
          registration.attendee?.full_name,
        ]
          .filter((value): value is string => typeof value === "string" && value.length > 0)
          .join(" ")
          .toLowerCase();
        const matchesQuery = !search || haystack.includes(search);
        return matchesStatus && matchesQuery;
      }),
    [registrations, query, status]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-glass-bg p-4 backdrop-blur-xl md:flex-row md:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background/50 px-3 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, team, or username"
            className="h-10 w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as FilterStatus)}
          className="h-10 rounded-xl border border-border bg-background/50 px-3 text-sm outline-none"
        >
          {statuses.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All statuses" : option}
            </option>
          ))}
        </select>
        <div className="flex justify-end">
          <ExportRegistrationsButton slug={eventSlug} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-5 py-4">Attendee</th>
              <th className="px-5 py-4">Contact</th>
              <th className="px-5 py-4">Team</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((registration) => {
              const teamMemberCount = Array.isArray(registration.team_members)
                ? registration.team_members.length
                : 0;
              return (
                <tr key={registration.id} className="align-top transition-colors hover:bg-muted/30">
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                        {(registration.attendee?.full_name ?? registration.full_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {registration.attendee?.full_name ?? registration.full_name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{registration.attendee?.username ?? "no account"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <a
                      href={`mailto:${registration.email ?? ""}`}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {registration.email ?? "—"}
                    </a>
                  </td>
                  <td className="px-5 py-5 text-xs text-muted-foreground">
                    {registration.team_name ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {registration.team_name}
                        {teamMemberCount > 0 ? ` · ${teamMemberCount} members` : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-5">
                    <RegistrationStatusControl
                      registrationId={registration.id}
                      status={registration.status}
                    />
                  </td>
                  <td className="px-5 py-5 text-xs text-muted-foreground">
                    {formatDateTime(registration.registered_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No registrations match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
