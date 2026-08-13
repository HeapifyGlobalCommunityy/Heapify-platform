import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/site/ui";
import {
  CheckCircle2,
  Trophy,
  Users,
  Sparkles,
  ArrowLeft,
  Laptop,
  Camera,
} from "lucide-react";


export default async function BuildWithGemmaPage() {
  const agendaItems = [
    "Hackathon overview and guidelines",
    "Introduction to Google Gemma 4",
    "Features and capabilities of Gemma 4",
    "Tips for building effective AI solutions",
    "Live Q&A session",
  ];

  const collaborators = [
    "NSoC (Nexus Spring of Code)",
    "AI Mobile Coders",
    "RedBull",
    "Google Gemma",
    "NSoC",
    "AI Mobile Coders",
    "RedBull",
    "Google for Developers",
    "Kaggle",
    "Devfolio",
    "Enetopia",
    "Open Source Connect",
    "Hackhere",
    "IEEE CIS Bangalore",
  ];

  const highlights = [
    { label: "Format", value: "Offline Sprint + Virtual Briefing", detail: "MSRIT Bengaluru + Online Q&A" },
    { label: "Community", value: "100+ Builders & Prototypers", detail: "Developers, Volunteers & IEEE RITB" },
    { label: "Tech Stack", value: "Google Gemma Models", detail: "Gemma Open Weights & GenAI SDKs" },
    { label: "Collaborators", value: "11 Ecosystem Partners", detail: "Google, Kaggle, RedBull, Devfolio & more" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Top Back Navigation Bar */}
      <div className="mx-auto max-w-6xl px-6 pt-4 pb-2">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Events
        </Link>
      </div>

      {/* 1. Hero Banner */}
      <div className="relative mx-auto max-w-6xl px-6 mt-4">
        <div className="relative w-full h-[50vh] md:h-[65vh] rounded-[2.5rem] overflow-hidden border border-glass-border shadow-[0_20px_80px_rgba(255,122,0,0.15)]">
          <Image
            src="/images/eventtitlecard.jpg"
            alt="Build with Gemma Sprint Flagship Banner"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/20 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary backdrop-blur-md">
                <Trophy className="h-3.5 w-3.5" /> Flagship Event Success Story · Concluded
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-3.5 py-1.5 text-xs font-mono text-muted-foreground backdrop-blur-md">
                12 July 2026 · MSRIT, Bengaluru
              </span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.1]">
              Build with Gemma: Bengaluru AI Sprint
            </h1>
            
            <p className="max-w-3xl text-base md:text-lg text-muted-foreground font-normal leading-relaxed">
              Official Hackathon Briefing Session & Sprint — bringing together developers, student builders, volunteers, and mentors at Ramaiah Institute of Technology to build groundbreaking AI applications using Google&apos;s Gemma ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & Impact Ribbon */}
      <SectionWrapper eyebrow="Impact & Reach" title="Event Accomplishments" className="py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[1.75rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(255,122,0,0.1)]"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary/80">
                {item.label}
              </span>
              <p className="mt-3 font-display text-xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* 3. Detailed Event Summary & Success Story */}
      <SectionWrapper eyebrow="Event Story" title="Official Briefing & Sprint Summary" className="py-10">
        <div className="space-y-6 max-w-5xl">
          <div className="rounded-[2rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-8 md:p-10 space-y-6 transition-all duration-300 hover:border-primary/30">
            <h3 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary shrink-0" />
              Celebrating Heapify&apos;s Flagship AI Activation
            </h3>
            
            <div className="space-y-4 text-base leading-relaxed text-zinc-300">
              <p>
                The <strong className="text-white font-semibold">Build with Gemma: Bengaluru AI Sprint</strong> was conducted as an official hackathon briefing and building sprint at <strong className="text-white">Ramaiah Institute of Technology (MSRIT)</strong> in Bengaluru.
              </p>
              <p>
                The session prepared registered participants and builders for competition — walking through official hackathon guidelines, key features of Google Gemma 4 models, practical strategies for building effective AI solutions, and a live Q&A session.
              </p>
              <p>
                Guided by 17× hackathon winner <strong className="text-white">Atharva Patwardhan</strong> and ecosystem mentors, teams tackled hands-on prototyping and explored real-world GenAI integration workflows.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-glass-border">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-zinc-200">100% Free & Open Access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-zinc-200">Google Gemma Model Integration</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-zinc-200">IEEE RITB & Partner Collaboration</span>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* 4. Agenda */}
      <SectionWrapper eyebrow="Briefing Agenda" title="Session Overview & Guidelines" className="py-12">
        <div className="max-w-4xl rounded-[2rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-8 md:p-10 space-y-4 transition-all duration-300 hover:border-primary/30">
          <div className="font-mono text-xs text-primary uppercase tracking-widest mb-4">Official Briefing Timeline</div>
          <div className="space-y-3">
            {agendaItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3.5">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-base font-medium text-zinc-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 5. Keynote Speaker Spotlight */}
      <SectionWrapper title="Keynote Speaker" eyebrow="Mentorship" className="py-10">
        <div className="max-w-4xl rounded-[2.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-8 md:p-10 transition-all duration-300 hover:border-primary/40 shadow-[0_12px_40px_rgba(255,122,0,0.1)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[1.75rem] overflow-hidden shrink-0 border border-glass-border shadow-lg">
              <Image
                src="/images/guygivingspeech.jpg"
                alt="Atharva Patwardhan"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/90 font-semibold">
                  Official Briefing Speaker
                </span>
                <h3 className="font-display text-3xl font-bold tracking-tight text-white">Atharva Patwardhan</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
                  🏆 17× Hackathon Winner
                </span>
                <span className="rounded-full border border-glass-border bg-glass-bg px-3.5 py-1 text-xs font-medium text-zinc-300">
                  🚀 SIH 2025 Grand Finalist
                </span>
              </div>
              
              <p className="text-sm leading-relaxed text-zinc-300 max-w-xl">
                Atharva delivered an inspiring keynote and briefing session — breaking down technical frameworks for leveraging Google Gemma 4, sharing winning hackathon strategies, and answering participant questions live.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* 6. Special Community Highlights & Placeholders */}
      <SectionWrapper
        eyebrow="Special Activations"
        title="Community Meets & Workshops"
        description="Highlights from sessions conducted alongside the Gemma Sprint series."
        className="py-12"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: AI Mobile Coders Workshop */}
          <div className="rounded-[2rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-8 space-y-6 transition-all duration-300 hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono text-primary">
                <Laptop className="h-3.5 w-3.5" /> Special Workshop
              </span>
              <span className="text-xs font-mono text-zinc-400">Collaboration</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-white">AI Mobile Coders Workshop</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Specialized hands-on sessions focusing on mobile AI integrations, lightweight model deployments, and optimizing on-device inference using Gemma and Flutter/Android toolchains.
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-dashed border-zinc-700 bg-zinc-900/60 flex flex-col items-center justify-center text-center p-6 group hover:border-primary/50 transition-colors">
              <Camera className="h-8 w-8 text-zinc-500 group-hover:text-primary transition-colors mb-2" />
              <span className="text-xs font-mono font-semibold text-zinc-300">
                [Image Placeholder: AI Mobile Coders Workshop Session]
              </span>
              <span className="text-[11px] text-zinc-500 mt-1">
                Upload session photo to public/images/ai-mobile-coders.jpg
              </span>
            </div>
          </div>

          {/* Card 2: Founder Meet & Leadership Networking */}
          <div className="rounded-[2rem] border border-glass-border bg-glass-bg backdrop-blur-xl p-8 space-y-6 transition-all duration-300 hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono text-primary">
                <Users className="h-3.5 w-3.5" /> Founder Meet
              </span>
              <span className="text-xs font-mono text-zinc-400">Leadership</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-white">Founder & Mentor Meet</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An exclusive networking meet bringing together ecosystem founders, student leaders, volunteers, and IEEE RITB representatives to build long-term tech initiatives.
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-dashed border-zinc-700 bg-zinc-900/60 flex flex-col items-center justify-center text-center p-6 group hover:border-primary/50 transition-colors">
              <Camera className="h-8 w-8 text-zinc-500 group-hover:text-primary transition-colors mb-2" />
              <span className="text-xs font-mono font-semibold text-zinc-300">
                [Image Placeholder: Founder Meet & Community Networking]
              </span>
              <span className="text-[11px] text-zinc-500 mt-1">
                Upload founder photo to public/images/founder-meet.jpg
              </span>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* 7. Event Gallery */}
      <SectionWrapper title="Sprint Photo Gallery" eyebrow="Moments" className="py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Photo 1: Title Card */}
          <div className="rounded-[1.75rem] overflow-hidden aspect-video relative group border border-glass-border bg-glass-bg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(255,122,0,0.15)]">
            <Image
              src="/images/eventtitlecard.jpg"
              alt="Build with Gemma Official Banner"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
              <span className="text-xs font-mono font-medium text-white">Official Event Title Card</span>
            </div>
          </div>

          {/* Photo 2: Group Photo */}
          <div className="rounded-[1.75rem] overflow-hidden aspect-video relative group border border-glass-border bg-glass-bg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(255,122,0,0.15)]">
            <Image
              src="/images/picofallparticipants.jpg"
              alt="Group photo of participants and volunteers"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
              <span className="text-xs font-mono font-medium text-white">Participants, Volunteers & IEEE RITB Team</span>
            </div>
          </div>

          {/* Photo 3: Keynote Speech */}
          <div className="rounded-[1.75rem] overflow-hidden aspect-video relative group border border-glass-border bg-glass-bg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(255,122,0,0.15)]">
            <Image
              src="/images/guygivingspeech.jpg"
              alt="Keynote presentation by Atharva Patwardhan"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
              <span className="text-xs font-mono font-medium text-white">Keynote Briefing by Atharva Patwardhan</span>
            </div>
          </div>

          {/* Photo 4: Students Explaining Project 1 */}
          <div className="rounded-[1.75rem] overflow-hidden aspect-video relative group border border-glass-border bg-glass-bg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(255,122,0,0.15)]">
            <Image
              src="/images/studsexplainingproj1.jpg"
              alt="Students presenting AI project"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
              <span className="text-xs font-mono font-medium text-white">Team Presentation & Project Pitching</span>
            </div>
          </div>

          {/* Photo 5: Project Demo 2 */}
          <div className="rounded-[1.75rem] overflow-hidden aspect-video relative group border border-glass-border bg-glass-bg transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(255,122,0,0.15)]">
            <Image
              src="/images/explainingproj2.jpg"
              alt="Live project demonstration"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
              <span className="text-xs font-mono font-medium text-white">Live Prototype Demo & Jury Review</span>
            </div>
          </div>

          {/* Photo 6: General Community Placeholder */}
          <div className="rounded-[1.75rem] overflow-hidden aspect-video relative group border border-dashed border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center p-6 text-center hover:border-primary/50 transition-colors">
            <Camera className="h-7 w-7 text-zinc-500 group-hover:text-primary transition-colors mb-2" />
            <span className="text-xs font-mono font-medium text-zinc-300">
              [Image Placeholder: Hackathon Floor & Mentorship]
            </span>
            <span className="text-[10px] text-zinc-500 mt-1">
              Add more event photos to public/images/
            </span>
          </div>
        </div>
      </SectionWrapper>

      {/* 8. Ecosystem Collaborators & Partners */}
      <SectionWrapper
        title="Ecosystem Collaborators"
        eyebrow="Partners & Supporters"
        description="Graciously supported by world-class communities, ecosystem platforms, and developer networks."
        className="py-12"
      >
        <div className="flex flex-wrap gap-3 max-w-5xl">
          {collaborators.map((partner) => (
            <span
              key={partner}
              className="rounded-full border border-glass-border bg-glass-bg px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-[0.2em] text-zinc-300 transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_rgba(255,122,0,0.2)]"
            >
              {partner}
            </span>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
