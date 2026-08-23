import Link from "next/link";
import { requireRole } from "@/lib/auth/authorization";
import { BentoCard, BentoGrid, CTAComponent, SectionWrapper } from "@/components/site/ui";
import { getAdminEvents } from "@/lib/actions/events";
import { getAdminSubmissions } from "@/lib/actions/admin-applications";
import { Calendar, Inbox, Users, Building2, ShieldCheck, ArrowRight } from "lucide-react";

export default async function AdminPage() {
  await requireRole(["core_team", "super_admin"]);

  const [events, submissions] = await Promise.all([
    getAdminEvents().catch(() => []),
    getAdminSubmissions().catch(() => []),
  ]);

  const activeEventsCount = events.filter((e) => e.status === "upcoming" || e.status === "ongoing").length;

  const controls = [
    {
      title: "Events Management",
      description: `${events.length} total events (${activeEventsCount} active). Create, edit, and export attendee data.`,
      href: "/admin/events",
      badge: `${events.length} events`,
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      title: "Form Submissions",
      description: `${submissions.length} total community applications, chapter lead requests, and sponsor inquiries.`,
      href: "/admin/submissions",
      badge: `${submissions.length} inquiries`,
      icon: <Inbox className="h-5 w-5 text-primary" />,
    },
    {
      title: "Global Chapters",
      description: "Manage city & campus chapter leads, permissions, and member activity.",
      href: "/chapters",
      badge: "Chapters",
      icon: <Building2 className="h-5 w-5 text-primary" />,
    },
    {
      title: "Open Source Projects",
      description: "Review open-source project submissions and contributor growth.",
      href: "/open-source",
      badge: "Projects",
      icon: <Users className="h-5 w-5 text-primary" />,
    },
  ];

  return (
    <>
      <SectionWrapper
        eyebrow="Admin"
        title="Platform Command Center"
        description="Global administration, event management, and community submissions inbox."
        className="pt-36"
      >
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-mono tracking-wider">
              <span>Total Events</span>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{events.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-mono tracking-wider">
              <span>Active Events</span>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-primary">{activeEventsCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-mono tracking-wider">
              <span>Submissions Inbox</span>
              <Inbox className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{submissions.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-mono tracking-wider">
              <span>Access Level</span>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-xl font-bold text-primary">CORE TEAM</p>
          </div>
        </div>

        <BentoGrid className="md:grid-cols-2 mt-8">
          {controls.map((control, index) => (
            <Link key={control.title} href={control.href} className="block group">
              <BentoCard
                index={index}
                eyebrow={control.badge}
                title={control.title}
                description={control.description}
              >
                <div className="mt-4 flex items-center justify-between border-t border-glass-border pt-4">
                  {control.icon}
                  <span className="text-xs font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Manage <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </BentoCard>
            </Link>
          ))}
        </BentoGrid>
      </SectionWrapper>

      <CTAComponent
        title="Admin Control Center Active"
        description="All event creation, submission reviews, and platform configuration changes take effect live across the site."
        actions={[
          { label: "Create New Event", href: "/admin/events/new" },
          { label: "View Member Dashboard", href: "/dashboard", variant: "ghost" },
        ]}
      />
    </>
  );
}

