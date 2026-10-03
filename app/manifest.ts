import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Heapify Global Community",
    short_name: "Heapify",
    description:
      "A global community of engineers, builders, and open-source contributors. Learn, build, contribute, lead.",
    start_url: "/",
    display: "standalone",
    background_color: "#E8ECF2",
    theme_color: "#FF7A00",
    icons: [
      {
        src: "/Heapify_withbg.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "maskable",
      },
      {
        src: "/heapify-mascot.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
