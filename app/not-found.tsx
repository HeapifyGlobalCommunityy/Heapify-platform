import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MapPin, Trophy } from "lucide-react";

export default function NotFound() {
  const quickLinks = [
    { href: "/events", label: "Upcoming Events", icon: Calendar, desc: "Hackathons, meetups, and workshops" },
    { href: "/challenges", label: "Active Challenges", icon: Trophy, desc: "Solve real-world coding bounties" },
    { href: "/chapters", label: "Local Chapters", icon: MapPin, desc: "Connect with builders in your city" },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Mascot & 404 Header */}
        <div className="relative inline-block">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto relative mb-6">
            <Image
              src="/heapify-mascot.png"
              alt="Heapify Mascot"
              fill
              className="object-contain drop-shadow-md animate-bounce [animation-duration:3s]"
              priority
            />
          </div>
          <span className="eyebrow text-primary/80">Error 404</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-foreground mt-2">
            Lost in the <span className="text-glow">Codebase?</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-3 max-w-md mx-auto leading-relaxed">
            The page you are looking for doesn&apos;t exist, has been migrated, or was swallowed by an unhandled promise.
          </p>
        </div>

        {/* Primary Return Button */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium text-sm sm:text-base hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Quick Links Grid */}
        <div className="pt-8 border-t border-border/60">
          <p className="text-xs uppercase font-mono tracking-widest text-muted-foreground mb-4">
            Popular Destinations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="p-4 rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {link.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
