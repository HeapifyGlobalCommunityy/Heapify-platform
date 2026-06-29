"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import EventSummaryPanel from "./EventSummaryPanel";
import RegistrationForm from "./RegistrationForm";

interface TeamConfig {
  minSize: number;
  maxSize: number;
  allowSolo: boolean;
}

interface CustomQuestion {
  id: string;
  label: string;
  type: "select" | "text" | "textarea";
  options?: string[];
  required: boolean;
}

interface Props {
  event: {
    title: string;
    slug: string;
    category: string;
    isHackathon: boolean;
    date: string;
    time: string;
    location: string;
    capacity: number;
    registeredCount: number;
    bannerUrl: string | null;
    teamConfig: TeamConfig | null;
    customQuestions: CustomQuestion[];
  };
  onCloseHref: string;
}

export default function RegisterModal({ event, onCloseHref }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock scroll on background body and prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-10 bg-black/80 backdrop-blur-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      {/* Modal card */}
      <div className="relative w-full max-w-6xl h-full lg:h-[85vh] rounded-3xl border border-zinc-800 bg-zinc-950/95 overflow-hidden shadow-2xl flex flex-col lg:flex-row animate-[fade-up_0.35s_ease-out]">
        {/* Close Button */}
        <Link
          href={onCloseHref}
          scroll={false}
          className="absolute top-4 right-4 z-50 p-2 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-150"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </Link>

        {/* 40% Left Panel - Event Summary */}
        <EventSummaryPanel event={event} />

        {/* 60% Right Panel - Registration Form */}
        <main className="flex-1 h-full overflow-y-auto border-t border-zinc-800 lg:border-t-0">
          <RegistrationForm event={event} />
        </main>
      </div>
    </div>
  );
}
