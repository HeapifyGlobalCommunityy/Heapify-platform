import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import NavbarWithAuth from "@/components/layout/NavbarWithAuth";
import { Footer } from "@/components/layout/footer";
import { PageTransition, ScrollProgressBar } from "@/components/site/ui";
import { SmoothScroll } from "@/components/layout/smooth-scroll";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Heapify Global — Build with People Who Ship",
  description:
    "A global community of engineers, builders, and open-source contributors. Learn, build, contribute, lead.",
  metadataBase: new URL("https://heapify.community"),
  openGraph: {
    title: "Heapify Global",
    description:
      "A global community of engineers, builders, and open-source contributors.",
    type: "website",
  },
  icons: {
    icon: "/Heapify_withbg.jpeg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { createClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  let isChapterLead = false;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: chapter } = await supabase
        .from("chapters")
        .select("id")
        .eq("lead_id", user.id)
        .maybeSingle();
      isChapterLead = !!chapter;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning className={`light ${fraunces.variable} ${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        suppressHydrationWarning
        className={`${fraunces.variable} ${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <SmoothScroll>
            <ScrollProgressBar />
            <NavbarWithAuth isChapterLead={isChapterLead} />
            <main className="min-h-screen pt-20">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
