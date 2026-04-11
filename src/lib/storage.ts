import { supabase } from "@/integrations/supabase/client";
import type { Video } from "@/lib/types";

const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
const ALLOWED_THUMBNAIL_TYPES = ['image/jpeg', 'image/png'];

export function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) return 'Nur MP4- und MOV-Dateien sind erlaubt.';
  if (file.size > MAX_VIDEO_SIZE) return 'Datei zu groß. Max. 20 MB erlaubt.';
  return null;
}

export function validateThumbnailFile(file: File): string | null {
  if (!ALLOWED_THUMBNAIL_TYPES.includes(file.type)) return 'Nur JPG- und PNG-Dateien sind erlaubt.';
  if (file.size > MAX_THUMBNAIL_SIZE) return 'Datei zu groß. Max. 5 MB erlaubt.';
  return null;
}

function extractStoragePath(publicUrl: string, bucket: string): string | null {
  try {
    const marker = `/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export async function deleteVideoAssets(video: Video): Promise<void> {
  if (video.video_url) {
    const path = extractStoragePath(video.video_url, "videos");
    if (path) await supabase.storage.from("videos").remove([path]);
  }
  if (video.thumbnail_url) {
    const path = extractStoragePath(video.thumbnail_url, "thumbnails");
    if (path) await supabase.storage.from("thumbnails").remove([path]);
  }
  await supabase.from("videos").delete().eq("id", video.id);
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
  if (error) throw new Error('Avatar-Upload fehlgeschlagen: ' + error.message);
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadThumbnail(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('thumbnails').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error('Thumbnail-Upload fehlgeschlagen: ' + error.message);
  const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadVideo(userId: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  onProgress?.(20);
  const { error } = await supabase.storage.from('videos').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error('Video-Upload fehlgeschlagen: ' + error.message);
  onProgress?.(90);
  const { data } = supabase.storage.from('videos').getPublicUrl(path);
  onProgress?.(100);
  return data.publicUrl;
}
