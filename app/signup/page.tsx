import { Metadata } from "next";
import { brand } from "@/lib/site-content";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: `Sign Up - ${brand.name}`,
  description: "Create an account to join the community.",
};

export default function SignUpPage() {
  return <AuthCard mode="signup" />;
}
