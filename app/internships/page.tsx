import { BentoCard, BentoGrid, CTAComponent, SectionWrapper, StatusBadge } from "@/components/site/ui";

const roles = [
  { title: "Frontend Engineer", company: "Partner Studio", type: "Remote", stage: "Open", desc: "Build interactive dashboards for Web3 protocols." },
  { title: "Community Operations", company: "Global Platform", type: "Hybrid", stage: "Open", desc: "Manage event logistics and community moderation." },
  { title: "Design Intern", company: "Builder Tools", type: "Onsite", stage: "Soon", desc: "Assist with design systems and marketing assets." },
  { title: "Developer Relations", company: "Infra Partner", type: "Remote", stage: "Open", desc: "Write tutorials and build sample applications." },
];

export default function InternshipsPage() {
  return (
    <>
      <SectionWrapper eyebrow="Internships" title="Curated Opportunities" description="A premium placeholder surface for partner opportunities, aligned with the rest of the community platform." className="pt-36">
        <BentoGrid className="md:grid-cols-2 mt-8">
          {roles.map((role, index) => (
            <BentoCard
              key={role.title}
              index={index}
              eyebrow={role.company}
              title={role.title}
              description={role.desc}
            >
              <div className="mt-4 flex items-center justify-between border-t border-glass-border pt-5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={role.stage} />
                  <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    {role.type}
                  </span>
                </div>
                <span className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">Apply Now &rarr;</span>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
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
