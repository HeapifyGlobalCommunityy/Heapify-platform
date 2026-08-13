import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionWrapper } from "@/components/site/ui";
import { getAdminSubmissions } from "@/lib/actions/admin-applications";
import { SubmissionFilters } from "./SubmissionFilters";

export default async function AdminSubmissionsPage() {
  const submissions = await getAdminSubmissions();

  return (
    <SectionWrapper
      eyebrow="Admin"
      title="Submissions"
      description="Review community inquiries and applications submitted through Heapify forms."
      className="pt-36 pb-20"
    >
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-glass-border bg-glass-bg p-8 text-center text-sm text-muted-foreground">
          No submissions yet.
        </div>
      ) : (
        <SubmissionFilters submissions={submissions} />
      )}
    </SectionWrapper>
  );
}
