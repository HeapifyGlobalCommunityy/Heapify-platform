import Image from "next/image";
import { SectionWrapper } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, CheckCircle2 } from "lucide-react";

export default async function BuildWithGemmaPage() {
  const agendaItems = [
    "Hackathon overview and guidelines",
    "Introduction to Google Gemma 4",
    "Features and capabilities of Gemma 4",
    "Tips for building effective AI solutions",
    "Live Q&A session",
  ];

  const collaborators = [
    "NSoC",
    "AI Mobile Coders",
    "RedBull",
    "Google for Developers",
    "Kaggle",
    "Devfolio",
    "Enetopia",
    "Open Source Connect",
    "Hackhere",
    "Google Gemma Community",
    "IEEE CIS",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 1. Hero Banner */}
      <div className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/eventtitlecard.jpg"
          alt="Build with Gemma Banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
        <div className="relative z-10 px-6 text-center max-w-4xl space-y-6 mt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
            12 July 2026 · 3:30 PM – 5:00 PM IST
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Build with Gemma: Bengaluru AI Sprint
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            Official Hackathon Briefing Session
          </p>
        </div>
      </div>

      {/* 2. Event Overview */}
      <SectionWrapper title="Event Overview" eyebrow="Details" className="py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
            <div className="flex items-center gap-3 text-primary">
              <CalendarDays className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Date</span>
            </div>
            <p className="mt-4 font-display text-lg font-semibold">12 July 2026, Sunday</p>
          </div>

          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
            <div className="flex items-center gap-3 text-primary">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Time</span>
            </div>
            <p className="mt-4 font-display text-lg font-semibold">3:30 PM – 5:00 PM IST</p>
          </div>

          <div className="rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
            <div className="flex items-center gap-3 text-primary">
              <MapPin className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Mode</span>
            </div>
            <p className="mt-4 font-display text-lg font-semibold">Online</p>
          </div>
        </div>
      </SectionWrapper>

      {/* 3. About the Session */}
      <SectionWrapper title="About the Session" eyebrow="Introduction" className="py-12 md:py-16">
        <div className="max-w-4xl rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            As part of the Build with Gemma: Bengaluru AI Sprint, this Official Hackathon Briefing Session was designed to help participants prepare for the competition — covering the hackathon guidelines, an introduction to Google Gemma 4, tips for building effective AI solutions, and a live Q&A.
          </p>
        </div>
      </SectionWrapper>

      {/* 4. Agenda */}
      <SectionWrapper title="Session Agenda" eyebrow="Timeline" className="py-12 md:py-16">
        <div className="max-w-3xl rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-8 space-y-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
          {agendaItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-base font-medium text-foreground/90">{item}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* 5. Speaker Card */}
      <SectionWrapper title="Keynote Speaker" eyebrow="Speaker" className="py-12 md:py-16">
        <div className="max-w-4xl rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(255,122,0,0.12)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[1.25rem] overflow-hidden shrink-0">
              <Image
                src="/images/guygivingspeech.jpg"
                alt="Atharva Patwardhan"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">Speaker Profile</span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-white">Atharva Patwardhan</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                  17× Hackathon Winner
                </span>
                <span className="rounded-full border border-glass-border bg-glass-bg px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  SIH 2025 Grand Finalist
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                Atharva shared his invaluable experiences winning multiple hackathons and navigating complex national competitions like the Smart India Hackathon. He gave participants specific strategies to optimize their workflows and push the boundaries of their AI integrations.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* 6. Gallery */}
      <SectionWrapper title="Session Gallery" eyebrow="Moments" className="py-12 md:py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-[1.5rem] overflow-hidden aspect-video relative group border border-glass-border bg-glass-bg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
            <Image
              src="/images/picofallparticipants.jpg"
              alt="Group photo of participants"
              fill
              className="object-cover"
            />
          </div>
          <div className="rounded-[1.5rem] overflow-hidden aspect-video relative group border border-glass-border bg-glass-bg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
            <Image
              src="/images/studsexplainingproj1.jpg"
              alt="Students explaining project"
              fill
              className="object-cover"
            />
          </div>
          <div className="rounded-[1.5rem] overflow-hidden aspect-video relative group border border-glass-border bg-glass-bg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)]">
            <Image
              src="/images/explainingproj2.jpg"
              alt="Project demonstration"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* 7. Collaborators */}
      <SectionWrapper title="Collaborators" eyebrow="Ecosystem" className="py-12 md:py-16">
        <div className="flex flex-wrap gap-3">
          {collaborators.map((partner) => (
            <span
              key={partner}
              className="rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:text-primary"
            >
              {partner}
            </span>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
