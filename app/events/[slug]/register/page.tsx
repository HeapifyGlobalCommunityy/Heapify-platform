import { notFound, redirect } from "next/navigation";
import { eventCatalog } from "@/lib/site-content";
import { registrationConfigs, defaultRegistrationConfig } from "@/lib/registration-configs";
import EventSummaryPanel from "@/components/registration/EventSummaryPanel";
import RegistrationForm from "@/components/registration/RegistrationForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Find the event in the catalog
  const catalogEvent = eventCatalog.find((e) => e.slug === slug);
  if (!catalogEvent) {
    notFound();
  }

  // If the event has already passed, block direct registration and redirect to detail page
  if (catalogEvent.status.toLowerCase() === "past") {
    redirect(`/events/${slug}`);
  }

  // Get the registration configuration
  const regConfig = registrationConfigs[slug] || defaultRegistrationConfig;

  const mergedEvent = {
    title: catalogEvent.title,
    slug: catalogEvent.slug,
    category: catalogEvent.category,
    isHackathon: regConfig.isHackathon,
    date: catalogEvent.date,
    time: catalogEvent.time,
    location: catalogEvent.location,
    capacity: regConfig.capacity,
    registeredCount: regConfig.registeredCount,
    bannerUrl: null as string | null,
    teamConfig: regConfig.teamConfig,
    customQuestions: regConfig.customQuestions,
  };

  return (
    // Desktop: 40/60 split panels, each independently scrollable.
    // Mobile: stacked, page scrolls normally.
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-background">
      <EventSummaryPanel event={mergedEvent} />

      {/* Right panel */}
      <main className="lg:flex-1 lg:h-full lg:overflow-y-auto border-t border-zinc-800 lg:border-t-0">
        <RegistrationForm event={mergedEvent} />
      </main>
    </div>
  );
}
