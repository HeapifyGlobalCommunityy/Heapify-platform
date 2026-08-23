import { ImageResponse } from "next/og";
import { getEventBySlug } from "@/lib/supabase/queries";
import { eventCatalog } from "@/lib/site-content";

export const alt = "Heapify Event";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: dbEv } = await getEventBySlug(slug);
  const staticEv = eventCatalog.find((e) => e.slug === slug);

  const title = dbEv?.title || staticEv?.title || "Heapify Global Community Event";
  const category = (dbEv?.category || staticEv?.category || "COMMUNITY").toUpperCase();
  const location = dbEv?.location || (dbEv?.is_virtual ? "Virtual Session" : staticEv?.location || "Global Online");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(255, 122, 0, 0.2), transparent 45%)",
          padding: "60px 80px",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              padding: "6px 18px",
              borderRadius: "50px",
              backgroundColor: "rgba(255, 122, 0, 0.15)",
              border: "1px solid rgba(255, 122, 0, 0.4)",
              color: "#ff7a00",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            {category}
          </div>
          <div style={{ color: "#a1a1aa", fontSize: "20px" }}>Heapify Global Community</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "980px" }}>
          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            {title}
          </div>
          <div style={{ color: "#a1a1aa", fontSize: "24px" }}>📍 {location}</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
          }}
        >
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#ff7a00", letterSpacing: "1px" }}>
            HEAPIFY.ORG
          </div>
          <div style={{ fontSize: "18px", color: "#a1a1aa" }}>For Builders, Not Spectators</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
