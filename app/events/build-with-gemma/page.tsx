import Image from "next/image";
import Link from "next/link";
import { gemmaSprintDate } from "@/lib/site-content";
import { SectionWrapper } from "@/components/site/ui";
import {
  CheckCircle2,
  Trophy,
  Users,
  ArrowLeft,
  Laptop,
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
    "Google for Developers",
    "Kaggle",
    "Devfolio",
    "Enetopia",
    "Open Source Connect",
    "Hackhere",
    "IEEE CIS Bangalore",
  ];
  const uniqueCollaborators = Array.from(new Set(collaborators));

  const highlights = [
    { label: "Format", value: "Offline Sprint + Virtual Briefing", detail: "MSRIT Bengaluru + Online Q&A" },
    { label: "Community", value: "100+ Builders & Prototypers", detail: "Developers, Volunteers & IEEE RITB" },
    { label: "Tech Stack", value: "Google Gemma Models", detail: "Gemma Open Weights & GenAI SDKs" },
    { label: "Collaborators", value: "11 Ecosystem Partners", detail: "Google, Kaggle, RedBull, Devfolio & more" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Back Navigation */}
      <div className="mx-auto max-w-6xl px-6 pt-4 pb-2">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to All Events
        </Link>
      </div>

      {/* 1. Hero Banner */}
      <div className="relative mx-auto max-w-6xl px-6 mt-4">
        <div className="relative w-full h-[50vh] md:h-[65vh] rounded-2xl overflow-hidden border border-border">
          <Image
            src="/images/eventtitlecard.jpg"
            alt="Build with Gemma Sprint Flagship Banner"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                <Trophy className="h-3.5 w-3.5" /> Flagship Event · Concluded
              </span>
              <span className="inline-flex items-center rounded-md border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                {gemmaSprintDate} · MSRIT, Bengaluru
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
              Build with Gemma: Bengaluru AI Sprint
            </h1>

            <p className="max-w-3xl text-sm md:text-base text-white/70 leading-relaxed">
              Official Hackathon Briefing Session &amp; Sprint — bringing together developers, student builders, volunteers, and mentors at Ramaiah Institute of Technology to build AI applications using Google&apos;s Gemma ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics */}
      <SectionWrapper eyebrow="Impact & Reach" title="Event Accomplishments" className="py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors duration-200"
            >
              <span className="text-[10px] font-medium uppercase tracking-widest text-primary/80">
                {item.label}
              </span>
              <p className="mt-3 font-display text-lg font-semibold text-foreground">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* 3. Event Story */}
      <SectionWrapper eyebrow="Event Story" title="Official Briefing & Sprint Summary" className="py-10">
        <div className="max-w-5xl rounded-xl border border-border bg-card p-8 md:p-10 space-y-6">
          <div className="h-px w-10 bg-primary" />
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Celebrating Heapify&apos;s Flagship AI Activation
          </h3>

          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              The <strong className="text-foreground font-medium">Build with Gemma: Bengaluru AI Sprint</strong> was conducted as an official hackathon briefing and building sprint at <strong className="text-foreground font-medium">Ramaiah Institute of Technology (MSRIT)</strong> in Bengaluru.
            </p>
            <p>
              The session prepared registered participants and builders for competition — walking through official hackathon guidelines, key features of Google Gemma 4 models, practical strategies for building effective AI solutions, and a live Q&amp;A session.
            </p>
            <p>
              Guided by 17× hackathon winner <strong className="text-foreground font-medium">Atharva Patwardhan</strong> and ecosystem mentors, teams tackled hands-on prototyping and explored real-world GenAI integration workflows.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-5 border-t border-border">
            {[
              "100% Free & Open Access",
              "Google Gemma Model Integration",
              "IEEE RITB & Partner Collaboration",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 4. Agenda */}
      <SectionWrapper eyebrow="Briefing Agenda" title="Session Overview & Guidelines" className="py-12">
        <div className="max-w-4xl rounded-xl border border-border bg-card p-8 md:p-10">
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-5">Official Briefing Timeline</div>
          <div className="space-y-3">
            {agendaItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* 5. Keynote Speaker */}
      <SectionWrapper title="Keynote Speaker" eyebrow="Mentorship" className="py-10">
        <div className="max-w-4xl rounded-xl border border-border bg-card p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shrink-0 border border-border">
              <Image
                src="/images/guygivingspeech.jpg"
                alt="Atharva Patwardhan"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-primary/80">
                  Official Briefing Speaker
                </div>
                <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">Atharva Patwardhan</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                  17× Hackathon Winner
                </span>
                <span className="rounded-md border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                  SIH 2025 Grand Finalist
                </span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                Atharva delivered an inspiring keynote and briefing session — breaking down technical frameworks for leveraging Google Gemma 4, sharing winning hackathon strategies, and answering participant questions live.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* 6. Community Highlights */}
      <SectionWrapper
        eyebrow="Special Activations"
        title="Community Meets & Workshops"
        description="Highlights from sessions conducted alongside the Gemma Sprint series."
        className="py-12"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {/* Card 1: AI Mobile Coders Workshop */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-5 hover:border-primary/30 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-primary">
                <Laptop className="h-3 w-3" /> Special Workshop
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl font-semibold text-foreground">AI Mobile Coders Workshop</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Specialized hands-on sessions focusing on mobile AI integrations, lightweight model deployments, and optimizing on-device inference using Gemma and Flutter/Android toolchains.
              </p>
            </div>

            <div className="relative w-full h-44 overflow-hidden rounded-lg border border-border">
              <Image
                src="/images/guygivingspeech.jpg"
                alt="AI Mobile Coders Workshop Session"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Card 2: Founder Meet */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-5 hover:border-primary/30 transition-colors duration-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-primary">
                <Users className="h-3 w-3" /> Founder Meet
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl font-semibold text-foreground">Founder & Mentor Meet</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An exclusive networking meet bringing together ecosystem founders, student leaders, volunteers, and IEEE RITB representatives to build long-term tech initiatives.
              </p>
            </div>

            <div className="relative w-full h-44 overflow-hidden rounded-lg border border-border">
              <Image
                src="/images/picofallparticipants.jpg"
                alt="Founder Meet and Community Networking"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* 7. Photo Gallery */}
      <SectionWrapper title="Sprint Photo Gallery" eyebrow="Moments" className="py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { src: "/images/eventtitlecard.jpg", alt: "Build with Gemma Official Banner", caption: "Official Event Title Card" },
            { src: "/images/picofallparticipants.jpg", alt: "Group photo of participants", caption: "Participants, Volunteers & IEEE RITB" },
            { src: "/images/guygivingspeech.jpg", alt: "Keynote presentation", caption: "Keynote Briefing by Atharva Patwardhan" },
            { src: "/images/studsexplainingproj1.jpg", alt: "Students presenting AI project", caption: "Team Presentation & Project Pitching" },
            { src: "/images/explainingproj2.jpg", alt: "Live project demonstration", caption: "Live Prototype Demo & Jury Review" },
            { src: "/images/placeholder-hackathon-floor.jpg", alt: "Hackathon floor", caption: "Hackathon Floor & Mentorship" },
          ].map((photo) => (
            <div key={photo.src} className="rounded-xl overflow-hidden aspect-video relative group border border-border hover:border-primary/30 transition-colors duration-200">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                <span className="text-xs font-medium text-white">{photo.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* 8. Collaborators */}
      <SectionWrapper
        title="Ecosystem Collaborators"
        eyebrow="Partners & Supporters"
        description="Supported by world-class communities, ecosystem platforms, and developer networks."
        className="py-12"
      >
        <div className="flex flex-wrap gap-2 max-w-5xl">
          {uniqueCollaborators.map((partner) => (
            <span
              key={partner}
              className="rounded-full border border-border bg-muted/30 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors duration-200"
            >
              {partner}
            </span>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
