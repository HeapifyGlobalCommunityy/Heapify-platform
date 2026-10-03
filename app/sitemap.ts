import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://heapify.community";
  const now = new Date();

  const routes: { path: string; changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"; priority: number }[] = [
    { path: "", changeFrequency: "daily", priority: 1.0 },
    { path: "/events", changeFrequency: "daily", priority: 0.9 },
    { path: "/challenges", changeFrequency: "daily", priority: 0.9 },
    { path: "/chapters", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/open-source", changeFrequency: "weekly", priority: 0.8 },
    { path: "/leaderboard", changeFrequency: "daily", priority: 0.7 },
    { path: "/resources", changeFrequency: "weekly", priority: 0.7 },
    { path: "/team", changeFrequency: "monthly", priority: 0.6 },
    { path: "/sponsor", changeFrequency: "monthly", priority: 0.6 },
    { path: "/social", changeFrequency: "monthly", priority: 0.5 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
