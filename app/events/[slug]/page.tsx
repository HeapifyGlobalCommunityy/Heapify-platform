// app/events/[slug]/page.tsx
import { notFound } from "next/navigation";
import { eventCatalog, eventDetail, featuredEvents } from "@/lib/site-content";
import { registrationConfigs, defaultRegistrationConfig } from "@/lib/registration-configs";
import EventDetailClient from "@/components/events/EventDetailClient";

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ register?: string }>;
}) {
  const { slug } = await params;
  const { register } = await searchParams;

  const catalogEvent = eventCatalog.find((e) => e.slug === slug);
  if (!catalogEvent) notFound();

  const event = { ...eventDetail, ...catalogEvent };
  const related = featuredEvents.filter((e) => e.slug !== slug).slice(0, 2);

  const regConfig = registrationConfigs[slug] || defaultRegistrationConfig;

  const mergedEvent = {
    title: event.title,
    slug: event.slug,
    category: event.category,
    isHackathon: regConfig.isHackathon ?? false,
    date: event.date,
    time: event.time,
    location: event.location,
    capacity: regConfig.capacity ?? 0,
    registeredCount: regConfig.registeredCount ?? 0,
    bannerUrl: null as string | null,
    // Always normalize to null — never undefined — so RegistrationForm's
    // optional-chaining on teamConfig?.allowSolo never throws.
    teamConfig: regConfig.teamConfig ?? null,
    customQuestions: regConfig.customQuestions ?? [],
  };

  const isPast = event.status.toLowerCase() === "past";

  // ?register=true opens the registration panel inline.
  // Past events ignore this flag — registration is closed.
  const initialRegistering = register === "true" && !isPast;

  return (
    <EventDetailClient
      event={event}
      mergedEvent={mergedEvent}
      slug={slug}
      related={related}
      isPast={isPast}
      initialRegistering={initialRegistering}
    />
  );
}
