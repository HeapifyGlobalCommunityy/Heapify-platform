"use client";

// components/profile/EditProfileForm.tsx
// Client component for editing profile information.
// Form values are validated, submit button gets double-submit protection via useTransition,
// and the updateProfile server action is called.
// On success, redirects the user back to the profile page.

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2, User, AtSign, Globe, Github, Linkedin, Twitter,
  Image as ImageIcon, AlignLeft, ArrowLeft, Save, AlertCircle, CheckCircle2
} from "lucide-react";
import { updateProfile, type ProfileUpdateData } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { STORAGE_BUCKETS, uploadPublicImage } from "@/lib/storage/client";

interface Props {
  initialProfile: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
  };
}

export default function EditProfileForm({ initialProfile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ProfileUpdateData>({
    username: initialProfile.username || "",
    full_name: initialProfile.full_name || "",
    avatar_url: initialProfile.avatar_url || "",
    bio: initialProfile.bio || "",
    github_url: initialProfile.github_url || "",
    linkedin_url: initialProfile.linkedin_url || "",
    twitter_url: initialProfile.twitter_url || "",
    website_url: initialProfile.website_url || "",
  });

  const handleChange = (field: keyof ProfileUpdateData, value: string) => {
    setError(null);
    setSuccess(false);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;

    setError(null);
    setIsUploadingAvatar(true);

    try {
      const avatarUrl = await uploadPublicImage(STORAGE_BUCKETS.avatars, file);
      handleChange("avatar_url", avatarUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Avatar upload failed.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || isUploadingAvatar) return;

    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
          router.refresh();
        }, 1000);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-[2rem] border border-glass-border bg-glass-bg/85 p-8 shadow-[0_30px_100px_-45px_rgba(255,122,0,0.3)] backdrop-blur-xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-glass-border pb-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-primary">Settings</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">Edit Profile Info</h1>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg/50 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-glass-border transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core fields grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">
              Username <span className="text-primary">*</span>
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
              <AtSign className="h-4 w-4 text-zinc-600 shrink-0" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="username"
                disabled={isPending}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-700 outline-none disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">Display Name</label>
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
              <User className="h-4 w-4 text-zinc-600 shrink-0" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                placeholder="Full Name"
                disabled={isPending}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-700 outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Avatar image */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-400">Avatar Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
            disabled={isPending || isUploadingAvatar}
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-zinc-400 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            {isUploadingAvatar ? "Uploading avatar..." : "PNG, JPG, or WebP up to 5 MB."}
          </p>
          <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
            <ImageIcon className="h-4 w-4 text-zinc-600 shrink-0" />
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => handleChange("avatar_url", e.target.value)}
              placeholder="Or paste an external image URL"
              disabled={isPending || isUploadingAvatar}
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-700 outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-400">Bio</label>
          <div className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
            <AlignLeft className="h-4 w-4 text-zinc-600 shrink-0 mt-1" />
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell the community about yourself..."
              disabled={isPending}
              rows={4}
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-700 outline-none resize-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Social Links Section */}
        <div className="border-t border-glass-border pt-6 space-y-6">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-[0.2em]">Social Profiles</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* GitHub */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">GitHub URL</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
                <Github className="h-4 w-4 text-zinc-600 shrink-0" />
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => handleChange("github_url", e.target.value)}
                  placeholder="https://github.com/username"
                  disabled={isPending}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-700 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">LinkedIn URL</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
                <Linkedin className="h-4 w-4 text-zinc-600 shrink-0" />
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleChange("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  disabled={isPending}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-700 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Twitter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Twitter URL</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
                <Twitter className="h-4 w-4 text-zinc-600 shrink-0" />
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => handleChange("twitter_url", e.target.value)}
                  placeholder="https://twitter.com/username"
                  disabled={isPending}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-700 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Personal Website */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Website URL</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 focus-within:border-primary/60 transition-colors">
                <Globe className="h-4 w-4 text-zinc-600 shrink-0" />
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleChange("website_url", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  disabled={isPending}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-700 outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-3.5 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3.5 py-3 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Changes saved successfully! Redirecting...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 border-t border-glass-border pt-6">
          <Button
            type="submit"
            disabled={isPending || success}
            className="flex-1"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            asChild
            disabled={isPending}
            className="w-28"
          >
            <Link href="/profile">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
