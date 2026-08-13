"use client";

import React from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/navbar";

export default function NavbarWithAuth({ isChapterLead }: { isChapterLead?: boolean }) {
  return (
    <AuthProvider>
      <Navbar isChapterLead={isChapterLead} />
    </AuthProvider>
  );
}
