import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { 
  Megaphone, 
  Users, 
  Calendar, 
  ArrowRight, 
  Trophy,
  Edit
} from "lucide-react";
import { SectionWrapper } from "@/components/site/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getChapterMembershipRequests } from "@/lib/actions/chapter-membership";
import { ChapterMembershipRequests } from "@/components/chapter/ChapterMembershipRequests";

// Supported leaderboard categories
const CATEGORIES = [
  { id: "event_participation", label: "Event Participation" },
  { id: "contributors", label: "Contributors" },
  { id: "mentors", label: "Mentors" },
  { id: "community_champions", label: "Community Champions" }
];

const PERIODS = [
  { id: "all_time", label: "All Time" },
  { id: "monthly", label: "Monthly" },
  { id: "weekly", label: "Weekly" }
];

interface Announcement {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
}

interface LeaderboardEntry {
  id: string;
  score: number;
  category: string;
  period: string;
  profiles: {
    id: string;
    full_name: string | null;
    username: string;
    avatar_url: string | null;
    role: string;
  } | null;
}

interface MemberProfile {
  id: string;
  full_name: string | null;
  username: string;
  avatar_url: string | null;
  role: string;
}

interface ChapterEvent {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  start_at: string;
  location: string | null;
}

type SearchParams = Promise<{
  category?: string;
  period?: string;
}>;

interface PageProps {
  searchParams: SearchParams;
}

export default async function ChapterLeadDashboard({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams.category || "event_participation";
  const selectedPeriod = resolvedParams.period || "all_time";

  const supabase = await createClient();
  
  if (!supabase) {
    return (
      <SectionWrapper eyebrow="Dashboard" title="Chapter Dashboard" className="pt-36">
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
          <p className="text-yellow-600 dark:text-yellow-400 font-semibold">Supabase is not configured.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please configure your Supabase environment variables to view the Chapter Lead Dashboard.
          </p>
        </div>
      </SectionWrapper>
    );
  }

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch chapter led by this user or fallback to first chapter for global admins
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isGlobalAdmin = profile && ["core_team", "super_admin"].includes(profile.role);

  let { data: chapter } = await supabase
    .from("chapters")
    .select("id, name, city, country, member_count")
    .eq("lead_id", user.id)
    .maybeSingle();

  if (!chapter && isGlobalAdmin) {
    const { data: fallbackChapter } = await supabase
      .from("chapters")
      .select("id, name, city, country, member_count")
      .limit(1)
      .maybeSingle();
    chapter = fallbackChapter;
  }

  if (!chapter) {
    return (
      <SectionWrapper eyebrow="Dashboard" title="Chapter Dashboard" className="pt-36">
        <EmptyState 
          title="No Chapter Assigned" 
          description="You are not designated as the lead for any active chapter. Please contact the core administration."
        />
      </SectionWrapper>
    );
  }

  // 3. Fetch announcements, events, members, and leaderboard in parallel
  const [
    announcementsRes,
    eventsRes,
    membersRes,
    leaderboardRes,
    membershipRequestsRes,
  ] = await Promise.all([
    supabase
      .from("announcements")
      .select("id, title, body, created_at")
      .or(`chapter_id.eq.${chapter.id},is_global.eq.true`)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select("id, slug, title, category, status, start_at, location")
      .eq("chapter_id", chapter.id)
      .order("start_at", { ascending: false })
      .limit(6),
    supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, role")
      .eq("chapter_id", chapter.id)
      .limit(8),
    supabase
      .from("leaderboard_entries")
      .select(`
        id, score, category, period,
        profiles (
          id, full_name, username, avatar_url, role
        )
      `)
      .eq("chapter_id", chapter.id)
      .eq("category", selectedCategory)
      .eq("period", selectedPeriod)
      .order("score", { ascending: false })
      .limit(5),
    getChapterMembershipRequests(chapter.id),
  ]);

  const announcements: Announcement[] = announcementsRes.data || [];
  const events: ChapterEvent[] = eventsRes.data || [];
  const members: MemberProfile[] = membersRes.data || [];
  const leaderboardEntries: LeaderboardEntry[] = (leaderboardRes.data as unknown as LeaderboardEntry[]) || [];
  const membershipRequests = membershipRequestsRes.success ? membershipRequestsRes.data : [];

  return (
    <div className="min-h-screen">
      <SectionWrapper 
        eyebrow="Lead Portal" 
        title={`${chapter.name} Chapter`} 
        description={`Chapter Dashboard for ${chapter.city ? `${chapter.city}, ` : ""}${chapter.country || ""}`}
        className="pt-36 pb-8"
      >
        {/* Statistics Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Members</p>
                <h4 className="font-display text-2xl font-bold mt-1 text-foreground">{members.length || chapter.member_count || 0}</h4>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Events Hosted</p>
                <h4 className="font-display text-2xl font-bold mt-1 text-foreground">{events.length || 0}</h4>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Announcements</p>
                <h4 className="font-display text-2xl font-bold mt-1 text-foreground">{announcements.length || 0}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <ChapterMembershipRequests requests={membershipRequests} />
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Announcements & Events (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Announcements */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Announcements</h3>
                </div>
              </div>

              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <EmptyState 
                    title="No Announcements" 
                    description="No announcements yet. Check back later or create one to broadcast to your members."
                    className="min-h-[200px]"
                  />
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm text-foreground">{announcement.title}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {announcement.body && (
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                          {announcement.body}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Events */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Recent Events</h3>
                </div>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href="/chapter/events/new">
                    + Create Event
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {events.length === 0 ? (
                  <EmptyState 
                    title="No Events" 
                    description="No events scheduled yet. Start planning your first chapter event to engage your community!"
                    className="min-h-[200px]"
                  />
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 hover:border-primary/30 transition-colors">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-primary">{event.category}</div>
                        <h4 className="font-semibold text-sm text-foreground mt-1">{event.title}</h4>
                        <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{new Date(event.start_at).toLocaleDateString()}</span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                          {event.status}
                        </span>
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                          <Link href={`/chapter/events/${event.slug}/edit`}>
                            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                          <Link href={`/events/${event.slug}`}>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Leaderboard & Roster (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Leaderboard */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Leaderboard</h3>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <Link 
                        key={cat.id}
                        href={`/chapter?category=${cat.id}&period=${selectedPeriod}`}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          selectedCategory === cat.id 
                            ? "border-primary bg-primary/10 text-primary font-semibold" 
                            : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Period</p>
                  <div className="flex gap-1.5">
                    {PERIODS.map((per) => (
                      <Link 
                        key={per.id}
                        href={`/chapter?category=${selectedCategory}&period=${per.id}`}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          selectedPeriod === per.id 
                            ? "border-primary bg-primary/10 text-primary font-semibold" 
                            : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {per.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard Content */}
              <div className="space-y-2">
                {leaderboardEntries.length === 0 ? (
                  <EmptyState 
                    title="No Rankings" 
                    description="No leaderboard data available for this category and period."
                    className="min-h-[180px] p-4"
                  />
                ) : (
                  leaderboardEntries.map((entry, index) => {
                    const isTop3 = index < 3;
                    const profile = entry.profiles;
                    const displayName = profile?.full_name || profile?.username || "Anonymous Member";
                    
                    return (
                      <div 
                        key={entry.id} 
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3 transition-colors",
                          isTop3 ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn("font-mono text-xs font-semibold", isTop3 ? "text-primary" : "text-muted-foreground")}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {profile?.avatar_url ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
                              <SafeImage 
                                src={profile.avatar_url} 
                                alt={displayName} 
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                                fallback={
                                  <div className="h-full w-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                                    {displayName.charAt(0).toUpperCase()}
                                  </div>
                                }
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-xs text-foreground line-clamp-1">{displayName}</div>
                            {profile?.role && (
                              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
                                {profile.role}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-display font-semibold text-sm text-foreground">{entry.score} pts</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Member Roster */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">Roster</h3>
                </div>
              </div>

              <div className="space-y-2.5">
                {members.length <= 1 ? (
                  <EmptyState 
                    title="Roster Empty" 
                    description="You are the only member in this chapter so far. Share your chapter link to start recruiting builders!"
                    className="min-h-[180px] p-4"
                  />
                ) : (
                  members.map((member) => {
                    const displayName = member.full_name || member.username || "Anonymous";
                    return (
                      <div key={member.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5">
                        {member.avatar_url ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
                            <SafeImage 
                              src={member.avatar_url} 
                              alt={displayName} 
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                              fallback={
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              }
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-xs text-foreground">{displayName}</h4>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5 block">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      </SectionWrapper>
    </div>
  );
}
