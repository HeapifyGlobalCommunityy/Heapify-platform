import { formEntries } from "@/lib/site-content";
import { FormCard, SectionWrapper } from "@/components/site/ui";
import { ParallaxDolphinWatermark } from "@/components/site/scroll-decorations";

export default function FormsPortalPage() {
  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background dolphin watermarks */}
      <ParallaxDolphinWatermark
        className="absolute -right-8 sm:right-6 top-32 w-36 h-36 sm:w-48 sm:h-48 opacity-[0.08] mix-blend-multiply"
        speed={30}
        direction="down"
        initialRotate={18}
        flip={true}
      />
      <ParallaxDolphinWatermark
        className="absolute -left-10 sm:left-6 top-[55%] w-40 h-40 sm:w-52 sm:h-52 opacity-[0.07] mix-blend-multiply"
        speed={40}
        direction="up"
        initialRotate={-16}
      />

      <SectionWrapper
        title="Get Involved"
        description="Whether you want to sponsor, speak, mentor, or volunteer, find the right pathway into the community."
        className="pt-28 sm:pt-36"
      >
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {formEntries.map((form) => (
            <FormCard
              key={form.title}
              title={form.title}
              description={form.description}
              type={form.type}
            />
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
