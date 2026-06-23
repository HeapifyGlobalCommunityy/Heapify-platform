import { formEntries } from "@/lib/site-content";
import { CTAComponent, FormCard, SectionWrapper } from "@/components/site/ui";

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Forms Portal" title="Premium intake cards for every community workflow" description="Each form is shown as a high-trust call to action so sponsors, mentors, speakers, and volunteers feel equally first-class." className="pt-36">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {formEntries.map((entry) => (
            <FormCard key={entry.title} title={entry.title} description={entry.description} />
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="All forms are placeholders for now, designed to connect later."
        description="The frontend already carries the right structure for future submission, validation, and Supabase integration without a redesign.
        "
        actions={[
          { label: "Open events", href: "/events" },
          { label: "Read about", href: "/about", variant: "ghost" },
        ]}
      />
    </>
  );
}
