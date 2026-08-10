import { BentoCard, BentoGrid, CTAComponent, SectionWrapper } from "@/components/site/ui";
import { requireRole } from "@/lib/auth/authorization";
const controls = [
  { title: "Events Management", description: "Review and approve Luma-grade events." },
  { title: "Projects Review", description: "Moderate open-source submissions." },
  { title: "Sponsor Portal", description: "Manage B2B partners and billing." },
  { title: "Applications", description: "Review mentor and chapter lead applications." },
  { title: "Global Chapters", description: "Monitor regional nodes and metrics." },
  { title: "Content Engine", description: "Publish resources, blogs, and roadmaps." },
];

export default async function AdminPage() {
  await requireRole(["core_team","super_admin"]);
  return (
    <>
      <SectionWrapper eyebrow="Admin" title="Command Center" description="Role-based management represented as a premium control dashboard placeholder." className="pt-36">
        <BentoGrid className="md:grid-cols-2 xl:grid-cols-3 mt-8">
          {controls.map((control, index) => (
            <BentoCard
              key={control.title}
              index={index}
              eyebrow="Manage"
              title={control.title}
              description={control.description}
            />
          ))}
        </BentoGrid>
      </SectionWrapper>

      <CTAComponent
        title="Later, this route can accept auth, permissions, and live data."
        description="For now, it remains a visual placeholder that matches the product-grade system around it."
        actions={[
          { label: "Open dashboard", href: "/dashboard" },
          { label: "View team", href: "/team", variant: "ghost" },
        ]}
      />
    </>
  );
}
