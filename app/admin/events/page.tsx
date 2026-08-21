import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Plus, Ticket } from "lucide-react";
import { SectionWrapper } from "@/components/site/ui";
import { getAdminEvents } from "@/lib/actions/events";
import { AdminEventsTable } from "./AdminEventsTable";

export default async function AdminEventsPage() {
  const events = await getAdminEvents();
  const registrations = events.reduce(
    (total, event) => total + (event.registrations?.[0]?.count ?? 0),
    0
  );
  const stats = [
    { label: "Total events", value: events.length, icon: CalendarDays },
    { label: "Upcoming", value: events.filter((event) => event.status === "upcoming").length, icon: Clock3 },
    { label: "Live now", value: events.filter((event) => event.status === "ongoing").length, icon: CheckCircle2 },
    { label: "Registrations", value: registrations, icon: Ticket },
  ];

  return (
    <SectionWrapper
      eyebrow="Admin / Events"
      title="Events Management"
      description="Review the community calendar, monitor registrations, and keep event status accurate."
      className="pt-36 pb-20"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to admin
        </Link>
        <Link
          href="/admin/events/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#ea6a0e]"
        >
          <Plus className="h-4 w-4" />
          Create event
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-glass-border bg-glass-bg p-10 text-center text-sm text-muted-foreground">
          No events have been created yet.
        </div>
      ) : (
        <AdminEventsTable events={events} />
      )}
    </SectionWrapper>
  );
}
