"use client";

import React from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
