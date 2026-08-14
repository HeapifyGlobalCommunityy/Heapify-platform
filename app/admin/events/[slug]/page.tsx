import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, Pencil, Video } from "lucide-react";
import { SectionWrapper } from "@/components/site/ui";
import { ExportRegistrationsButton } from "@/components/events/ExportRegistrationsButton";
import { requireRole } from "@/lib/auth/authorization";
import {
  getAdminEventDetail,
  getAdminEventRegistrations,
} from "@/lib/actions/events";
import { cn } from "@/lib/utils";
import { EventManagementActions } from "./EventManagementActions";
import { RegistrationsPanel } from "./RegistrationsPanel";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const statusStyles: Record<string, string> = {
  upcoming: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  ongoing: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  completed: "border-border bg-muted text-muted-foreground",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

export default async function AdminEventDetailPage({ params }: PageProps) {
  const { slug } = await params;

  await requireRole(["core_team", "super_admin"]);

  const event = await getAdminEventDetail(slug);
  if (!event) notFound();

  const registrations = await getAdminEventRegistrations(event.id);

  const counts = registrations.reduce<Record<string, number>>((acc, registration) => {
    acc[registration.status] = (acc[registration.status] ?? 0) + 1;
    return acc;
  }, {});
  const total = registrations.length;
  const registeredCount = counts["registered"] ?? 0;
  const waitlistedCount = counts["waitlisted"] ?? 0;
  const attendedCount = counts["attended"] ?? 0;
  const cancelledCount = counts["cancelled"] ?? 0;

  const metrics = [
    { label: "Total registrations", value: total.toLocaleString() },
    { label: "Registered", value: registeredCount.toLocaleString() },
    { label: "Waitlisted", value: waitlistedCount.toLocaleString() },
    { label: "Attended", value: attendedCount.toLocaleString() },
    { label: "Cancelled", value: cancelledCount.toLocaleString() },
    {
      label: "Capacity",
      value: event.capacity ? `${registeredCount.toLocaleString()} / ${event.capacity.toLocaleString()}` : "Unlimited",
    },
  ];

  return (
    <SectionWrapper
      eyebrow="Admin / Events"
      title={event.title}
      description="Review event details, operational metrics, and attendee registrations."
      className="pt-36 pb-20"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <EventManagementActions
            eventId={event.id}
            title={event.title}
            status={event.status}
            registrationCount={total}
          />
          <Link
            href={`/admin/events/${event.slug}/edit`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-foreground/20 px-3 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-foreground/20 px-3 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Public view
          </Link>
          <ExportRegistrationsButton slug={event.slug} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-3 py-1 text-xs font-medium capitalize", statusStyles[event.status])}>
              {event.status}
            </span>
            <span className="text-xs capitalize text-muted-foreground">
              {event.category.replaceAll("_", " ")}
            </span>
            <span className="text-xs text-muted-foreground">· {event.chapter?.name ?? "Global"}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {event.description || "No description provided."}
          </p>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatDate(event.start_at)}
              {event.end_at ? ` — ${formatDate(event.end_at)}` : ""}
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              {event.is_virtual ? (
                <Video className="h-4 w-4 text-primary" />
              ) : (
                <MapPin className="h-4 w-4 text-primary" />
              )}
              {event.is_virtual ? "Virtual" : event.location ?? "Location TBA"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {metrics.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-4 backdrop-blur-xl"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Registrations
          </h3>
          <span className="text-xs text-muted-foreground">{total} total</span>
        </div>
        <RegistrationsPanel
          eventSlug={event.slug}
          registrations={registrations}
        />
      </div>
    </SectionWrapper>
  );
}
