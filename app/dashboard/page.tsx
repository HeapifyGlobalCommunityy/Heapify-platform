import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEventHistory, getProfile, getProfileBadges } from "@/lib/supabase/queries";
import { BentoCard, BentoGrid, SectionWrapper } from "@/components/site/ui";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import { Calendar, User as UserIcon, Trophy, Award, ArrowRight, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/login?redirectTo=/dashboard");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const [{ data: profile }, { data: badges }, { data: eventRegistrations }] = await Promise.all([
    getProfile(user.id),
    getProfileBadges(user.id),
    getEventHistory(user.id, 0),
  ]);

  const displayName = profile?.full_name || profile?.username || user.email?.split("@")[0] || "Builder";
  const userRole = profile?.role || "Member";
  const score = profile?.contribution_score ?? 0;
  const eventsCount = eventRegistrations?.length ?? 0;
  const badgesCount = badges?.length ?? 0;

  const metrics = [
    {
      label: "Contribution Score",
      value: `${score} pts`,
      detail: score > 50 ? "Active contributor" : "Building momentum",
      icon: <Trophy className="h-5 w-5 text-primary" />,
    },
    {
      label: "Events Registered",
      value: eventsCount.toString(),
      detail: eventsCount > 0 ? "Upcoming & attended sessions" : "No event registrations yet",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      label: "Badges Earned",
      value: badgesCount.toString(),
      detail: badgesCount > 0 ? "Community achievements unlocked" : "Complete events to earn badges",
      icon: <Award className="h-5 w-5 text-primary" />,
    },
    {
      label: "Account Status",
      value: userRole.toUpperCase(),
      detail: "Verified member account",
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
    },
  ];

  return (
    <div className="pt-36 pb-20 space-y-12">
      {/* User Header / Hero */}
      <section className="px-6">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-glass-border bg-glass-bg dark:bg-[linear-gradient(135deg,rgba(255,122,0,0.08),rgba(255,255,255,0.02),rgba(10,10,10,0.8))] p-8 md:p-10 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {profile?.avatar_url ? (
                <SafeImage
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-20 w-20 rounded-2xl object-cover border border-glass-border shadow-[0_0_30px_rgba(255,122,0,0.2)]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-glass-border bg-primary/10 text-primary font-display font-bold text-2xl shadow-[0_0_30px_rgba(255,122,0,0.2)]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3 py-0.5 text-xs text-primary font-mono uppercase tracking-wider">
                  {userRole}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Welcome back, {displayName}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <Link href="/profile/edit">
                  <UserIcon className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/events">
                  Explore Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <SectionWrapper eyebrow="Member Metrics" title="Activity Overview">
        <BentoGrid className="md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <BentoCard key={metric.label} index={index} eyebrow={metric.label}>
              <div className="flex items-center justify-between">
                <div className="font-display text-4xl font-semibold tracking-tight">
                  {metric.value}
                </div>
                {metric.icon}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{metric.detail}</p>
            </BentoCard>
          ))}
        </BentoGrid>
      </SectionWrapper>

      {/* Event Registrations */}
      <SectionWrapper
        eyebrow="My Schedule"
        title="Event Registrations"
        description="Your upcoming and past event registrations."
      >
        {eventRegistrations && eventRegistrations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {eventRegistrations.map((reg) => {
              const ev = Array.isArray(reg.event) ? reg.event[0] : reg.event;
              if (!ev) return null;
              return (
                <div
                  key={reg.id}
                  className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl space-y-3"
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-primary uppercase tracking-wider">{ev.category}</span>
                    <span className="text-muted-foreground">{reg.status}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">{ev.title}</h3>
                  <div className="text-xs text-muted-foreground">
                    Registered on: {new Date(reg.registered_at).toLocaleDateString()}
                  </div>
                  <Button variant="ghost" asChild className="w-full justify-between mt-4">
                    <Link href={`/events/${ev.slug}`}>
                      View Event <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-10 text-center space-y-4">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="font-display text-lg font-semibold text-white">No registered events yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Browse upcoming community events, workshops, and hackathons to join the schedule.
            </p>
            <Button asChild variant="primary">
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}
