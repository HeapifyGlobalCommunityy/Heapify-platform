import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SectionWrapper, CategoryResourcesClient } from "@/components/site/ui";

const VALID_CATEGORIES: Record<string, string> = {
  roadmaps: "Roadmaps",
  blogs: "Blogs",
  notes: "Notes",
  open_source: "Open Source",
  blockchain: "Blockchain",
  cybersecurity: "Cybersecurity",
  ai: "AI",
};

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;

  // 1. Validation
  if (!VALID_CATEGORIES[category] || category === "recordings") {
    notFound();
  }

  const categoryTitle = VALID_CATEGORIES[category];

  // 2. Pagination
  const page = Math.max(1, parseInt(resolvedSearchParams?.page as string) || 1);
  const limit = 30;
  const offset = (page - 1) * limit;

  // 3. Supabase Query
  const supabase = await createClient();
  if (!supabase) {
    notFound();
  }

  const { data: fetchResults, error } = await supabase
    .from("resources")
    .select("title, url, tags, created_at")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit); // Fetch 31 rows (offset to offset + 30)

  if (error) {
    console.error("Error fetching resources:", error);
    notFound();
  }

  // 4. Next Page Logic
  const hasNextPage = (fetchResults || []).length > limit;
  const resources = hasNextPage ? (fetchResults || []).slice(0, limit) : (fetchResults || []);

  return (
    <SectionWrapper
      title={`${categoryTitle} Resources`}
      description={`Curated learning tracks, references, and deep-dives for ${categoryTitle.toLowerCase()}.`}
      className="pt-40 pb-12 animate-fade-in"
    >
      <div className="mt-8">
        <CategoryResourcesClient
          resources={resources}
          hasNextPage={hasNextPage}
          page={page}
          categoryTitle={categoryTitle}
        />
      </div>
    </SectionWrapper>
  );
}
