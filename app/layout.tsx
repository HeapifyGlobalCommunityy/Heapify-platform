import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/site/ui";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Heapify Global",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar isChapterLead={isChapterLead} />
          <main className="min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
