import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionWrapper } from "@/components/site/ui";
import { SafeImage } from "@/components/ui/safe-image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, AlertTriangle, Users } from "lucide-react";

const DIFFICULTY_STYLES: Record<string, { label: string; style: string }> = {
  beginner: { label: "Beginner Friendly", style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" },
  intermediate: { label: "Intermediate", style: "border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400" },
  advanced: { label: "Advanced", style: "border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400" },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  if (!supabase) {
    notFound();
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(`
      name, description, difficulty, tech_stack, repo_url, roadmap_url,
      contribution_guidelines, contributor_count, status,
      project_maintainers(
        profiles(username, full_name, avatar_url)
      )
    `)
    .eq("slug", slug)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Map nested profiles safely
  const maintainersRaw = project.project_maintainers as unknown as Array<{
    profiles: {
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }> | null;

  const maintainers = maintainersRaw
    ?.map((pm) => pm.profiles)
    .filter((profile): profile is NonNullable<typeof profile> => !!profile) || [];

  const diffInfo = DIFFICULTY_STYLES[project.difficulty.toLowerCase()] || {
    label: project.difficulty,
    style: "border-border bg-muted/50 text-muted-foreground",
  };

  return (
    <SectionWrapper
      title=""
      description=""
      className="pt-32 pb-16"
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* Breadcrumbs */}
        <Link
          href="/open-source"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to open source
        </Link>

        {/* Archived Alert */}
        {project.status === "archived" && (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <div>
              <span className="font-semibold">Archived - Read Only:</span> This project is currently archived. No new contributions are being accepted at this time.
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="relative">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${diffInfo.style}`}>
                {diffInfo.label}
              </span>
              {project.status === "archived" && (
                <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-red-500 dark:text-red-400">
                  Archived
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {project.name}
            </h1>

            {/* Description */}
            <p className="mt-4 text-base leading-relaxed text-muted-foreground max-w-2xl">
              {project.description}
            </p>

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech: string) => (
                    <span
                      key={tech}
                      className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-mono text-foreground/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta and CTA buttons */}
            <div className="mt-8 pt-8 border-t border-border flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Contributor Count */}
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  <strong className="text-foreground mr-1">
                    {project.contributor_count || 0}
                  </strong>{" "}
                  Contributors
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {project.repo_url ? (
                  <Button asChild className="rounded-lg px-5">
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      View on GitHub <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button disabled className="rounded-lg px-5 border border-border bg-muted text-muted-foreground cursor-not-allowed">
                    Repository Not Available
                  </Button>
                )}

                {project.roadmap_url && (
                  <Button variant="ghost" asChild className="rounded-lg px-5">
                    <a href={project.roadmap_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      Roadmap
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Guidelines & Maintainers */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Contribution Guidelines - Take 2 cols */}
          <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold tracking-tight mb-4">
              Contribution Guidelines
            </h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {project.contribution_guidelines || "No custom guidelines defined for this project. Please check the repository for contribution rules."}
            </div>
          </div>

          {/* Maintainers - Take 1 col */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold tracking-tight mb-4">
              Maintainers
            </h2>
            {maintainers.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                No maintainers assigned yet.
              </div>
            ) : (
              <div className="space-y-3">
                {maintainers.map((m) => (
                  <div key={m.username} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/40">
                    <SafeImage
                      src={m.avatar_url || ""}
                      alt={m.full_name || m.username}
                      className="w-9 h-9 rounded-full object-cover border border-border bg-muted"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {m.full_name || m.username}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        @{m.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
