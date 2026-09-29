import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import fs from "fs/promises";
import path from "path";

export const alt = "Heapify Open Source Project";
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
  const supabase = await createClient();

  const [logoDataUrl, projectResult] = await Promise.all([
    getLogoDataUrl(),
    supabase ? supabase.from("projects").select("name, description, difficulty, tech_stack").eq("slug", slug).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  let name = "Heapify Open Source Project";
  let description = "Contribute to open source projects built by the Heapify community.";
  let difficulty = "OPEN SOURCE";
  let techStack: string[] = [];

  const project = projectResult.data;
  if (project) {
    name = project.name;
    description = project.description || description;
    difficulty = (project.difficulty || "Open Source").toUpperCase();
    techStack = project.tech_stack || [];
  }

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
          backgroundImage: "radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.22), transparent 45%)",
          padding: "60px 80px",
          color: "#ffffff",
        }}
      >
        {/* Top Header Row with Logo */}
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
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  objectFit: "cover",
                }}
                alt="Heapify Logo"
              />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: 800 }}>Heapify</span>
              <span style={{ color: "#a1a1aa", fontSize: "14px", letterSpacing: "1px" }}>OPEN SOURCE HUB</span>
            </div>
          </div>

          <div
            style={{
              padding: "8px 20px",
              borderRadius: "50px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              color: "#3b82f6",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            {difficulty}
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
            {name}
          </div>
          <div
            style={{
              color: "#a1a1aa",
              fontSize: "22px",
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </div>
          {techStack.length > 0 && (
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              {techStack.slice(0, 5).map((t) => (
                <div
                  key={t}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#d4d4d8",
                    fontSize: "14px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
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
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#3b82f6", letterSpacing: "1px" }}>
            HEAPIFY.ORG/OPEN-SOURCE
          </div>
          <div style={{ fontSize: "18px", color: "#a1a1aa" }}>Contribute & Build Together</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
