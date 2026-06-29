import { notFound } from "next/navigation";
import { eventCatalog, eventDetail, featuredEvents } from "@/lib/site-content";
import { registrationConfigs, defaultRegistrationConfig } from "@/lib/registration-configs";
import RegisterModal from "@/components/registration/RegisterModal";
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
  const mergedEventForModal = {
    title: event.title,
    slug: event.slug,
    category: event.category,
    isHackathon: regConfig.isHackathon,
    date: event.date,
    time: event.time,
    location: event.location,
    capacity: regConfig.capacity,
    registeredCount: regConfig.registeredCount,
    bannerUrl: null as string | null,
    teamConfig: regConfig.teamConfig,
    customQuestions: regConfig.customQuestions,
  };

  const showRegisterModal = register === "true" && event.status.toLowerCase() !== "past";
  const isPast = event.status.toLowerCase() === "past";

  return (
    <>
      <EventDetailClient
        event={event}
        slug={slug}
        related={related}
        isPast={isPast}
      />

      {showRegisterModal && (
        <RegisterModal event={mergedEventForModal} onCloseHref={`/events/${slug}`} />
      )}
    </>
  );
}