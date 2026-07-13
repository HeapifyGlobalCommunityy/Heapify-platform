import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { 
  Megaphone, 
  Users, 
  Calendar, 
  ArrowRight, 
  Trophy
} from "lucide-react";
import { SectionWrapper } from "@/components/site/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <div className="rounded-[1.75rem] border border-yellow-500/30 bg-yellow-500/5 p-6 text-center backdrop-blur-xl">
          <p className="text-yellow-500 font-semibold">Supabase is not configured.</p>
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

  // 2. Fetch chapter led by this user
  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, name, city, country, member_count")
    .eq("lead_id", user.id)
    .maybeSingle();

  if (!chapter) {
    redirect("/");
  }

  const chapterId = chapter.id;

  // 3. Fetch announcements
  const { data: announcementsData } = await supabase
    .from("announcements")
    .select("id, title, body, created_at")
    .eq("audience", "chapter")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false });

  const announcements: Announcement[] = (announcementsData || []) as unknown as Announcement[];

  // 4. Fetch roster (members)
  const { data: membersData } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, role")
    .eq("chapter_id", chapterId)
    .order("full_name", { ascending: true });

  const members: MemberProfile[] = (membersData || []) as unknown as MemberProfile[];

  // 5. Fetch chapter-scoped leaderboard entries
  let leaderboardEntries: LeaderboardEntry[] = [];
  const memberIds = members.map((m) => m.id);
  
  if (memberIds.length > 0) {
    const { data: entries } = await supabase
      .from("leaderboard_entries")
      .select(`
        id,
        score,
        category,
        period,
        profiles:user_id (
          id,
          full_name,
          username,
          avatar_url,
          role
        )
      `)
      .eq("category", selectedCategory)
      .eq("period", selectedPeriod)
      .in("user_id", memberIds)
      .order("score", { ascending: false });
    
    if (entries) {
      leaderboardEntries = entries as unknown as LeaderboardEntry[];
    }
  }

  // 6. Fetch events (limited to 5)
  const { data: eventsData } = await supabase
    .from("events")
    .select("id, slug, title, category, status, start_at, location")
    .eq("chapter_id", chapterId)
    .order("start_at", { ascending: false })
    .limit(5);

  const events: ChapterEvent[] = (eventsData || []) as unknown as ChapterEvent[];

  return (
    <div className="min-h-screen bg-background">
      <SectionWrapper 
        eyebrow="Lead Portal" 
        title={`${chapter.name} Chapter`} 
        description={`Chapter Dashboard for ${chapter.city ? `${chapter.city}, ` : ""}${chapter.country || ""}`}
        className="pt-36 pb-8"
      >
        {/* Statistics Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Members</p>
                <h4 className="font-display text-2xl font-bold mt-1">{members.length || chapter.member_count || 0}</h4>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Events Hosted</p>
                <h4 className="font-display text-2xl font-bold mt-1">{events.length || 0}</h4>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Announcements</p>
                <h4 className="font-display text-2xl font-bold mt-1">{announcements.length || 0}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Announcements & Events (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Announcements */}
            <div className="rounded-[2rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold tracking-tight">Announcements</h3>
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
                    <div key={announcement.id} className="rounded-xl border border-glass-border bg-glass-bg/40 p-4">
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
            <div className="rounded-[2rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold tracking-tight">Recent Events</h3>
                </div>
                <Button variant="ghost" size="sm" asChild className="border border-glass-border hover:bg-glass-bg text-xs">
                  <Link href="/chapter/events/new">
                    + Create Event
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {events.length === 0 ? (
                  <EmptyState 
                    title="No Events" 
                    description="No events scheduled yet. Start planning your first chapter event to engage your community!"
                    className="min-h-[200px]"
                  />
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-xl border border-glass-border bg-glass-bg/40 p-4 hover:border-primary/20 transition-all duration-200">
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
                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                          {event.status}
                        </span>
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
            <div className="rounded-[2rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold tracking-tight">Leaderboard</h3>
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
                          "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          selectedCategory === cat.id 
                            ? "border-primary/40 bg-primary/10 text-primary" 
                            : "border-glass-border bg-glass-bg/50 text-muted-foreground hover:text-foreground"
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
                          "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          selectedPeriod === per.id 
                            ? "border-primary/40 bg-primary/10 text-primary" 
                            : "border-glass-border bg-glass-bg/50 text-muted-foreground hover:text-foreground"
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
                          "flex items-center justify-between rounded-xl border p-3 transition-colors",
                          isTop3 ? "border-primary/30 bg-primary/[0.03]" : "border-glass-border bg-glass-bg/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn("font-mono text-xs font-semibold", isTop3 ? "text-primary" : "text-muted-foreground")}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {profile?.avatar_url ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-glass-border">
                              <SafeImage 
                                src={profile.avatar_url} 
                                alt={displayName} 
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                                fallback={
                                  <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.32),transparent_70%)] flex items-center justify-center text-[10px] font-semibold">
                                    {displayName.charAt(0).toUpperCase()}
                                  </div>
                                }
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.32),transparent_70%)] border border-glass-border flex items-center justify-center text-[10px] font-semibold">
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
            <div className="rounded-[2rem] border border-glass-border bg-glass-bg p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold tracking-tight">Roster</h3>
                </div>
              </div>

              <div className="space-y-3">
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
                      <div key={member.id} className="flex items-center gap-3 rounded-xl border border-glass-border bg-glass-bg/40 p-3">
                        {member.avatar_url ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-glass-border">
                            <SafeImage 
                              src={member.avatar_url} 
                              alt={displayName} 
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                              fallback={
                                <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.32),transparent_70%)] flex items-center justify-center text-[10px] font-semibold">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              }
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.32),transparent_70%)] border border-glass-border flex items-center justify-center text-[10px] font-semibold">
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
