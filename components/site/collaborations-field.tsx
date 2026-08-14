"use client";

import { motion } from "framer-motion";

const partners = [
  {
    name: "Google Developer Groups",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9GHDmt_uz87bJadw5lMFMYUAzAamB2FhJ_XML3ZAfiNLzEAOrHVK94esI&s=10",
  },
  {
    name: "Google Gemma Community",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN9oHAyZaI1nA8SJFFVOWtLpYi5nBkoCG6hQBHh74AWuGh_E9FGy6yv64&s=10",
  },
  {
    name: "Kaggle",
    logo: "https://logowik.com/content/uploads/images/kaggle4255.logowik.com.webp",
  },
  {
    name: "IEEE CIS",
    logo: "https://edu.ieee.org/in-reva/wp-content/uploads/sites/33/IEEE-CIS-logo-RGB-300ppi.png",
  },
  {
    name: "Devfolio",
    logo: "https://cdn.iconscout.com/icon/free/png-256/free-devfolio-logo-icon-svg-download-png-1399882.png",
  },
  {
    name: "Red Bull",
    logo: "https://i.pinimg.com/originals/62/16/df/6216dff035f566b5ff43f2a4eac55f32.png",
    scale: 1.3,
  },
  {
    name: "MSRIT — ISE",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGSxq2VcAtDEEVO0eWIlNZ9uHOnZIwrgXwkr86MaInmO5u8KYEAogrM24&s=10",
  },
  {
    name: "Nexus SOC",
    logo: "https://nexus.pk/wp-content/uploads/2023/12/SOC-INFOGRAPHIC.png",
  },
  {
    name: "AI Mobile Coders",
    logo: "https://aimobilecoders.com/assets/aimobilecoder_logo_share.png",
  },
  {
    name: "Enetopia",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRITdZApg6aiSW3S8zxHmx6MYVMahY5CSzKB-6BLEs_yQ&s=10",
  },
  {
    name: "Open Source Connect",
    logo: "https://png.pngtree.com/png-vector/20221003/ourmid/pngtree-open-source-programming-png-image_6264096.png",
  },
  {
    name: "Hackhere",
    logo: "https://nexora-phi-ten.vercel.app/logo.jpeg",
  },
];

const col1 = partners.filter((_, i) => i % 4 === 0);
const col2 = partners.filter((_, i) => i % 4 === 1);
const col3 = partners.filter((_, i) => i % 4 === 2);
const col4 = partners.filter((_, i) => i % 4 === 3);

export function CollaborationsField() {
  const renderCard = (p: typeof partners[0], i: number) => (
    <div
      key={i}
      className="flex aspect-square w-full items-center justify-center rounded-2xl border border-border/30 bg-white p-4 shadow-sm sm:rounded-[1.5rem] sm:p-6"
    >
      <img
        src={p.logo}
        alt={p.name}
        className="h-full w-full object-contain rounded-lg sm:rounded-xl"
        style={{ transform: `scale(${p.scale || 1})` }}
        loading="lazy"
      />
    </div>
  );

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
      {/* LEFT */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="flex max-w-md flex-col justify-center space-y-6"
      >
        <div className="space-y-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary/80">
            Global Ecosystem
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-[3.4rem] md:leading-[1.08]">
            Partners who
            <br />
            <span className="text-primary">power progress.</span>
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground md:text-base md:leading-8">
          We collaborate with the world&apos;s most innovative communities and
          institutions to build platforms where creators can thrive, compete,
          and redefine what&apos;s possible.
        </p>

        <div className="h-px w-14 bg-gradient-to-r from-primary/60 to-transparent" />
      </motion.div>

      {/* RIGHT - Columns */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative flex h-[460px] w-full gap-4 overflow-hidden rounded-[2rem] border border-border/20 bg-muted/30 px-6 py-4 sm:h-[640px] sm:gap-6 sm:px-14 sm:py-8 dark:bg-muted/10"
      >
        <style>{`
          .marquee-container {
            --gap-offset: 8px; /* half of gap-4 (16px) */
          }
          @media (min-width: 640px) {
            .marquee-container {
              --gap-offset: 12px; /* half of gap-6 (24px) */
            }
          }
          @keyframes scroll-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(calc(-50% - var(--gap-offset))); }
          }
          @keyframes scroll-down {
            0% { transform: translateY(calc(-50% - var(--gap-offset))); }
            100% { transform: translateY(0); }
          }
          .animate-scroll-up { animation: scroll-up 55s linear infinite; }
          .animate-scroll-down { animation: scroll-down 55s linear infinite; }
        `}</style>

        {/* Gradient Masks */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-background to-transparent sm:h-32" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-background to-transparent sm:h-32" />

        {/* Col 1 */}
        <div className="marquee-container flex flex-1 flex-col overflow-hidden relative" style={{ willChange: "transform" }}>
          <div className="flex animate-scroll-up flex-col gap-4 sm:gap-6 absolute inset-x-0 top-0">
            <div className="flex flex-col gap-4 sm:gap-6">
              {[...col1, ...col1, ...col1].map(renderCard)}
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[...col1, ...col1, ...col1].map(renderCard)}
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="marquee-container flex flex-1 flex-col overflow-hidden relative" style={{ willChange: "transform" }}>
          <div className="flex animate-scroll-down flex-col gap-4 sm:gap-6 absolute inset-x-0 top-0" style={{ animationDelay: "-11s" }}>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[...col2, ...col2, ...col2].map(renderCard)}
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[...col2, ...col2, ...col2].map(renderCard)}
            </div>
          </div>
        </div>

        {/* Col 3 */}
        <div className="marquee-container flex flex-1 flex-col overflow-hidden relative" style={{ willChange: "transform" }}>
          <div className="flex animate-scroll-up flex-col gap-4 sm:gap-6 absolute inset-x-0 top-0" style={{ animationDelay: "-22s" }}>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[...col3, ...col3, ...col3].map(renderCard)}
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[...col3, ...col3, ...col3].map(renderCard)}
            </div>
          </div>
        </div>

        {/* Col 4 */}
        <div className="marquee-container flex flex-1 flex-col overflow-hidden relative" style={{ willChange: "transform" }}>
          <div className="flex animate-scroll-down flex-col gap-4 sm:gap-6 absolute inset-x-0 top-0" style={{ animationDelay: "-33s" }}>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[...col4, ...col4, ...col4].map(renderCard)}
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              {[...col4, ...col4, ...col4].map(renderCard)}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}