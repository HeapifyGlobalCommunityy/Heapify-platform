import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { eventDetail } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { EventCard, SectionWrapper } from "@/components/site/ui";

// Dummy detail page using hardcoded eventDetail
// In a real app, you would fetch by params.slug
export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  return (
    <>
      <article className="pt-32">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Link>
          
          <div className="mt-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,0,0.12),rgba(10,10,10,0.8))] p-10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <div className="w-64 h-64 bg-primary/30 rounded-full blur-[100px]" />
            </div>
            <div className="relative">
              <div className="text-xs font-mono uppercase tracking-[0.28em] text-primary">{eventDetail.category} • {eventDetail.status}</div>
              <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight">{eventDetail.title}</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{eventDetail.banner}</p>
              
              <div className="mt-10 flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div className="text-sm font-medium">{eventDetail.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Time</div>
                    <div className="text-sm font-medium">{eventDetail.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm font-medium">{eventDetail.location}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-16 grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2 space-y-12">
            <div>
              <h2 className="font-display text-2xl font-semibold">Agenda</h2>
              <div className="mt-6 space-y-4">
                {eventDetail.agenda.map((item, i) => (
                  <div key={i} className="flex gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="font-mono text-sm text-primary/80">{item.time}</div>
                    <div className="text-sm text-foreground/90">{item.item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold">Speakers</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {eventDetail.speakers.map((speaker, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="h-12 w-12 rounded-full border border-primary/20 bg-primary/10" />
                    <div>
                      <div className="font-semibold text-sm">{speaker.name}</div>
                      <div className="text-xs text-muted-foreground">{speaker.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <h3 className="font-display font-semibold text-xl">Registration</h3>
              <p className="mt-3 text-sm text-muted-foreground">Secure your spot for this experience. Approval required.</p>
              
              <div className="mt-6 flex flex-col gap-3">
                <Button className="w-full justify-center">
                  <Ticket className="mr-2 h-4 w-4" /> Register now
                </Button>
                <div className="text-center text-xs text-muted-foreground mt-2">
                  Registration is managed securely.
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <SectionWrapper title="Related Events" className="border-t border-white/10">
        <div className="grid gap-5 lg:grid-cols-2">
          {eventDetail.related.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}