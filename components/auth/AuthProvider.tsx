"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Profile = any;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const client = supabase;
    let mounted = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subscription: any = null;

    async function init() {
      const { data: { user: u } } = await client.auth.getUser();
      if (!mounted) return;
      setUser(u ?? null);
      if (u) {
        const { data: p } = await client
          .from("profiles")
          .select("id, username, full_name, avatar_url, role, chapter_id")
          .eq("id", u.id)
          .maybeSingle();
        setProfile(p ?? null);
      } else {
        setProfile(null);
      }
      setLoading(false);

      const { data } = client.auth.onAuthStateChange(async (_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          const { data: p } = await client
            .from("profiles")
            .select("id, username, full_name, avatar_url, role, chapter_id")
            .eq("id", newUser.id)
            .maybeSingle();
          setProfile(p ?? null);
        } else {
          setProfile(null);
        }
      });
      subscription = data.subscription;
    }

    init();
    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, role, chapter_id")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(p ?? null);
  };

  const signOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
