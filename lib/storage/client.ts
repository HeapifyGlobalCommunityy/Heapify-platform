"use client";

import { createClient } from "@/lib/supabase/client";

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  eventBanners: "event-banners",
} as const;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadPublicImage(
  bucket: string,
  file: File
): Promise<string> {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    throw new Error("Please select a PNG, JPG, or WebP image.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Images must be 5 MB or smaller.");
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to upload an image.");
  }

  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
