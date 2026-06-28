import { Metadata } from "next";
import { brand } from "@/lib/site-content";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: `Login - ${brand.name}`,
  description: "Sign in to access your dashboard and community resources.",
};

export default function LoginPage() {
  return <AuthCard mode="login" />;
}
