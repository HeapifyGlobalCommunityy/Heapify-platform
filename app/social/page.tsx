import { socialChannels } from "@/lib/site-content";
import { SectionWrapper, SocialCard } from "@/components/site/ui";

export default function SocialHubPage() {
  return (
    <>
      <SectionWrapper
        title="Social Hub"
        description="Connect with the global network across all platforms. We sync async."
        className="pt-40"
      >
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {socialChannels.map((channel) => (
            <SocialCard
              key={channel.title}
              title={channel.title}
              description={channel.description}
              href={channel.href}
            />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
