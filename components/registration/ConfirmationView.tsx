"use client";

import Link from "next/link";
import { CheckCircle2, Calendar, Users } from "lucide-react";

interface Props {
  event: {
    title: string;
    date: string;
    slug: string;
  };
  isTeamEvent: boolean;
  teamName: string;
  totalMembers?: number;
}

export default function ConfirmationView({ event, isTeamEvent, teamName, totalMembers }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 lg:px-10 pt-16 pb-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>

        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white">
          You&apos;re registered
        </h1>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          A confirmation has been sent to your email. We&apos;ll follow up with next steps closer to the event.
        </p>

        <div className="mt-8 w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-left space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <div>
              <div className="text-xs text-zinc-500">Event</div>
              <div className="text-sm font-medium text-white">{event.title}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{event.date}</div>
            </div>
          </div>

          {isTeamEvent && (
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div>
                <div className="text-xs text-zinc-500">Team</div>
                <div className="text-sm font-medium text-white">
                  {teamName || "Unnamed team"}
                  {totalMembers ? ` · ${totalMembers} member${totalMembers === 1 ? "" : "s"}` : ""}
                </div>
              </div>
            </div>
          )}
        </div>

        <Link
          href={`/events/${event.slug}`}
          className="mt-8 text-sm text-primary hover:underline"
        >
          Back to event details
        </Link>
      </div>
    </div>
  );
}
