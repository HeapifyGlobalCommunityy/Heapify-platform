import { ImageResponse } from "next/og";
import { getEventBySlug } from "@/lib/supabase/queries";
import { eventCatalog } from "@/lib/site-content";
import fs from "fs/promises";
import path from "path";

export const alt = "Heapify Event";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function getLogoDataUrl() {
  try {
    const logoPath = path.join(process.cwd(), "public", "Heapify_withbg.jpeg");
    const fileBuffer = await fs.readFile(logoPath);
    return `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ data: dbEv }, logoDataUrl] = await Promise.all([
    getEventBySlug(slug),
    getLogoDataUrl(),
  ]);

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
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(255, 122, 0, 0.22), transparent 45%)",
          padding: "60px 80px",
          color: "#ffffff",
        }}
      >
        {/* Top Header Row with Community Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {logoDataUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoDataUrl}
                width="54"
                height="54"
                style={{
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 122, 0, 0.4)",
                  objectFit: "cover",
                }}
                alt="Heapify Logo"
              />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: 800 }}>Heapify</span>
              <span style={{ color: "#a1a1aa", fontSize: "14px", letterSpacing: "1px" }}>GLOBAL COMMUNITY</span>
            </div>
          </div>

          <div
            style={{
              padding: "8px 20px",
              borderRadius: "50px",
              backgroundColor: "rgba(255, 122, 0, 0.15)",
              border: "1px solid rgba(255, 122, 0, 0.4)",
              color: "#ff7a00",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            {category}
          </div>
        </div>

        {/* Content Body */}
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

        {/* Footer Bar */}
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
