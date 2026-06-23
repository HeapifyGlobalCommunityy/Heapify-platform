import { CTAComponent, SectionWrapper } from "@/components/site/ui";

const chapters = [
  { name: "Bengaluru", type: "University", members: "124 members" },
  { name: "Nairobi", type: "City", members: "88 members" },
  { name: "São Paulo", type: "Regional", members: "102 members" },
  { name: "London", type: "Professional", members: "76 members" },
];

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Chapters" title="A distributed network of local nodes" description="A premium chapter surface for global, city, and campus-led communities." className="pt-36">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {chapters.map((chapter) => (
            <div key={chapter.name} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80">{chapter.type}</div>
              <h3 className="mt-3 font-display text-xl font-semibold">{chapter.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{chapter.members}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Chapter data can later be hydrated from Supabase without a visual redesign."
        description="The page is intentionally structured like a real network directory, not a placeholder list."
        actions={[
          { label: "Apply as chapter lead", href: "/forms/join" },
          { label: "See team", href: "/team", variant: "ghost" },
        ]}
      />
    </>
  );
}
