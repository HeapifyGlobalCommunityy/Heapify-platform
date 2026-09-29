import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEventHistory, getProfile, getProfileBadges } from "@/lib/supabase/queries";
import { BentoCard, BentoGrid, SectionWrapper } from "@/components/site/ui";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import {
  Calendar,
  User as UserIcon,
  Trophy,
  Award,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Settings,
  Sparkles,
} from "lucide-react";

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
  const userRole = profile?.role || "member";
  const score = profile?.contribution_score ?? 0;
  const eventsCount = eventRegistrations?.length ?? 0;
  const badgesCount = badges?.length ?? 0;

  const isAdmin = ["core_team", "super_admin"].includes(userRole);
  const isChapterLead =
    userRole === "chapter_admin" ||
    (Array.isArray(profile?.led_chapters) && profile.led_chapters.length > 0);

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
      detail: eventsCount > 0 ? "Upcoming & attended sessions" : "No registrations yet",
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      label: "Badges Earned",
      value: badgesCount.toString(),
      detail: badgesCount > 0 ? "Community achievements" : "Complete events to earn badges",
      icon: <Award className="h-5 w-5 text-primary" />,
    },
    {
      label: "Account Status",
      value: userRole.replace("_", " ").toUpperCase(),
      detail: profile?.chapter ? `Member of ${profile.chapter.name}` : "Verified global builder",
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
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3 py-0.5 text-xs text-primary font-mono uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> {userRole.replace("_", " ")}
                  </span>
                  {profile?.chapter && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" /> {profile.chapter.name}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  Welcome back, {displayName}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <Button asChild variant="primary">
                  <Link href="/admin">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin Portal
                  </Link>
                </Button>
              )}
              {isChapterLead && (
                <Button asChild variant="ghost">
                  <Link href="/chapter">
                    <Building2 className="mr-2 h-4 w-4" /> Chapter Portal
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost">
                <Link href="/profile/edit">
                  <Settings className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </div>
          </div>

          {/* Social Links Bar if configured */}
          {(profile?.github_url || profile?.linkedin_url || profile?.twitter_url || profile?.website_url) && (
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-glass-border pt-6 text-xs text-muted-foreground">
              <span className="font-mono uppercase tracking-wider text-[10px]">Connected Accounts:</span>
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Twitter className="h-3.5 w-3.5" /> Twitter
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
          )}
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
        description="Your registered events and upcoming community sessions."
        action={{ label: "Explore all events", href: "/events", variant: "ghost" }}
      >
        {eventRegistrations && eventRegistrations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {eventRegistrations.map((reg) => {
              const ev = Array.isArray(reg.event) ? reg.event[0] : reg.event;
              if (!ev) return null;
              return (
                <div
                  key={reg.id}
                  className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-primary uppercase tracking-wider">{ev.category}</span>
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-primary text-[10px] uppercase font-semibold">
                      {reg.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
                      {ev.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Start Date: {new Date(ev.start_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <Button variant="ghost" asChild className="w-full justify-between mt-2 border border-glass-border">
                    <Link href={`/events/${ev.slug}`}>
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-10 text-center space-y-4 mt-6">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="font-display text-lg font-semibold text-foreground">No registered events yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Browse upcoming community events, workshops, and hackathons to join the schedule.
            </p>
            <Button asChild variant="primary">
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        )}
      </SectionWrapper>

      {/* Badges & Achievements Section */}
      <SectionWrapper
        eyebrow="Achievements"
        title="Community Badges"
        description="Badges and recognition awarded for participation, hackathons, and contributions."
      >
        {badges && badges.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6">
            {badges.map((item, idx) => {
              const b = Array.isArray(item.badge) ? item.badge[0] : item.badge;
              if (!b) return null;
              return (
                <div
                  key={b.id || idx}
                  className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-5 backdrop-blur-xl flex items-start gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary font-bold">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-semibold">{b.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{b.description || "Earned badge"}</p>
                    <span className="mt-2 inline-block font-mono text-[10px] text-muted-foreground">
                      Awarded: {new Date(item.awarded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-8 text-center space-y-3 mt-6">
            <Award className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="font-display text-base font-semibold text-foreground">No badges earned yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Participate in hackathons, complete challenges, or contribute to open-source initiatives to unlock badges!
            </p>
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}

