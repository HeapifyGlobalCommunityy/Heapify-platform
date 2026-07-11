export type DemoProfile = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  bio: string;
  chapter: string;
  contributionScore: number;
  eventsAttended: number;
  projectsShipped: number;
  certificates: number;
};

const DEMO_PROFILE_STORAGE_KEY = "heapify-demo-profile";

export const DEFAULT_DEMO_PROFILE: DemoProfile = {
  id: "demo-rahul",
  fullName: "Rahul",
  email: "rahul@heapify.local",
  username: "rahul.dev",
  role: "Community Builder",
  bio: "Local demo profile for Heapify platform development.",
  chapter: "Mumbai Chapter",
  contributionScore: 92,
  eventsAttended: 18,
  projectsShipped: 7,
  certificates: 4,
};

export function readDemoProfile(): DemoProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as DemoProfile;
  } catch {
    return null;
  }
}

export function saveDemoProfile(profile: DemoProfile = DEFAULT_DEMO_PROFILE) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearDemoProfile() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY);
}

export function isDemoProfileActive() {
  return Boolean(readDemoProfile());
}
