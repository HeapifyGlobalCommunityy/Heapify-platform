import { brand, coreValues, timeline } from "@/lib/site-content";
import { FeatureCard, SectionWrapper } from "@/components/site/ui";

export default function AboutPage() {
  return (
    <>
      <SectionWrapper
        eyebrow="Mission & Vision"
        title="We are building the operating system for global builders"
        description="A look into the community's core purpose, values, and the journey that brought us here."
        className="pt-40"
      >
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div className="rounded-[2rem] border border-glass-border bg-[linear-gradient(135deg,rgba(255,122,0,0.08),rgba(255,255,255,0.02))] p-10 backdrop-blur-xl">
            <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-primary">Mission</h3>
            <p className="mt-6 font-display text-2xl font-medium leading-relaxed text-foreground/90">{brand.mission}</p>
          </div>
          <div className="rounded-[2rem] border border-glass-border bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(255,255,255,0.02))] p-10 backdrop-blur-xl">
            <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-blue-400">Vision</h3>
            <p className="mt-6 font-display text-2xl font-medium leading-relaxed text-foreground/90">{brand.vision}</p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="Core Values"
        title="The principles that guide our network"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value, i) => (
            <FeatureCard
              key={value.title}
              eyebrow={`0${i + 1}`}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        eyebrow="Timeline"
        title="Our journey so far"
        description="From a small local group to a distributed network of builders."
      >
        <div className="relative mt-12 max-w-4xl space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {timeline.map((item) => (
            <div key={item.year} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-glass-border bg-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_12px_rgba(255,122,0,0.8)]" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[1.5rem] border border-glass-border bg-glass-bg backdrop-blur-xl hover:-translate-y-1 transition-transform">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">{item.year}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
