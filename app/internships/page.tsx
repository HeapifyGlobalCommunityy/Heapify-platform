import { CTAComponent, SectionWrapper } from "@/components/site/ui";

const roles = [
  { title: "Frontend Engineer", company: "Partner Studio", type: "Remote", stage: "Open" },
  { title: "Community Operations", company: "Global Platform", type: "Hybrid", stage: "Open" },
  { title: "Design Intern", company: "Builder Tools", type: "Onsite", stage: "Soon" },
  { title: "Developer Relations", company: "Infra Partner", type: "Remote", stage: "Open" },
];

export default function Page() {
  return (
    <>
      <SectionWrapper eyebrow="Internships" title="A curated internship board" description="A premium placeholder surface for partner opportunities, aligned with the rest of the community platform." className="pt-36">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => (
            <div key={role.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary/80">{role.stage}</div>
              <h3 className="mt-3 font-display text-xl font-semibold">{role.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{role.company}</p>
              <p className="mt-3 text-sm text-muted-foreground">{role.type}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <CTAComponent
        title="Partner jobs can be wired into Supabase later without changing the layout."
        description="The current design gives internships the same visual quality as the rest of the platform."
        actions={[
          { label: "Explore resources", href: "/resources" },
          { label: "Contact team", href: "/forms/contact", variant: "ghost" },
        ]}
      />
    </>
  );
}
