import { formEntries } from "@/lib/site-content";
import { FormCard, SectionWrapper } from "@/components/site/ui";

export default function FormsPortalPage() {
  return (
    <>
      <SectionWrapper
        title="Get Involved"
        description="Whether you want to sponsor, speak, mentor, or volunteer, find the right pathway into the community."
        className="pt-40"
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
    </>
  );
}
