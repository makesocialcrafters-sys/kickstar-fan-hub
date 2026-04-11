import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Video, ImagePlus, X, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadVideo, validateVideoFile, uploadThumbnail, validateThumbnailFile } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFile = (f: File) => {
    setError("");
    const err = validateVideoFile(f);
    if (err) { setError(err); return; }
    setFile(f);
    if (!title) {
      const name = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  const handleThumbnail = (f: File) => {
    const err = validateThumbnailFile(f);
    if (err) { setError(err); return; }
    setThumbnail(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbPreview(null);
    if (thumbRef.current) thumbRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setUploading(true);
    setError("");
    try {
      let thumbnailUrl: string | undefined;
      if (thumbnail) {
        thumbnailUrl = await uploadThumbnail(user.id, thumbnail);
        setProgress(10);
      }
      const videoUrl = await uploadVideo(user.id, file, (p) => setProgress(thumbnail ? 10 + p * 0.9 : p));
      const { data, error: dbError } = await supabase
        .from("videos")
        .insert({ player_id: user.id, title, video_url: videoUrl, thumbnail_url: thumbnailUrl ?? null })
        .select("id")
        .single();
      if (dbError) throw dbError;
      setVideoId(data.id);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    const link = `${window.location.origin}/v/${videoId}`;
    const doCopy = () => {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 pb-28">
        <p className="text-6xl mb-4">🔥</p>
        <h1 className="font-display text-3xl mb-2">Highlight online!</h1>
        <p className="text-muted-foreground text-sm mb-6">Teile den Link mit deinen Fans</p>
        <div
          className="w-full rounded-2xl flex items-center justify-between gap-3 px-4 py-3 mb-6"
          style={{ background: "#111", border: "1px solid hsl(var(--border))" }}
        >
          <p className="text-sm text-foreground truncate">{link}</p>
          <button onClick={doCopy} className="shrink-0">
            {copied ? <Check size={18} color="#00C853" /> : <Copy size={18} color="#666" />}
          </button>
        </div>
        <button
          onClick={doCopy}
          className="w-full py-4 rounded-2xl font-semibold text-base mb-3"
          style={{ background: "#00C853", color: "#000" }}
        >
          {copied ? "Kopiert! ✓" : "Link kopieren"}
        </button>
        <button
          onClick={() => navigate("/profil")}
          className="w-full py-4 rounded-2xl font-semibold text-base"
          style={{ background: "#1a1a1a", color: "#fff" }}
        >
          Zum Profil
        </button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="tap-target flex items-center justify-center" style={{ color: "#fff" }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-display text-xl">Highlight hochladen</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-5">
        {/* Video picker */}
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{
            background: file ? "#0a1f0a" : "#111",
            border: `2px dashed ${file ? "#00C853" : "#2a2a2a"}`,
            minHeight: 160,
            padding: 24,
          }}
        >
          <input ref={fileRef} type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Video size={32} color={file ? "#00C853" : "#444"} />
          {file ? (
            <>
              <p className="text-sm text-foreground font-medium">{file.name}</p>
              <p className="text-xs" style={{ color: "#00C853" }}>✓ Bereit zum Hochladen</p>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground font-medium">Video auswählen</p>
              <p className="text-xs text-muted-foreground">MP4 oder MOV · max. 20 MB</p>
            </>
          )}
        </div>

        {/* Thumbnail */}
        {thumbPreview ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))" }}>
            <img src={thumbPreview} alt="Titelbild" className="w-full aspect-video object-cover" />
            <button type="button" onClick={removeThumbnail} className="absolute top-2 right-2 rounded-full p-1.5" style={{ background: "rgba(0,0,0,0.6)" }}>
              <X size={16} color="#fff" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => thumbRef.current?.click()}
            className="w-full rounded-2xl flex items-center gap-3 cursor-pointer px-4"
            style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 56 }}
          >
            <ImagePlus size={20} color="#444" />
            <span className="text-sm text-muted-foreground">Titelbild hinzufügen (optional)</span>
          </div>
        )}
        <input ref={thumbRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])} />

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Titel</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 80))}
            placeholder="z.B. Traumtor gegen den FC Rivalen"
            className="w-full rounded-2xl px-4 outline-none text-foreground text-base"
            style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 56, caretColor: "#00C853" }}
            required
          />
          <p className="text-xs text-right" style={{ color: title.length > 70 ? "#FF3B30" : "#444" }}>
            {title.length}/80
          </p>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        {/* Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "#00C853" }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || !title.trim() || uploading || title.length > 80}
          className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
          style={{ background: "#00C853", color: "#000" }}
        >
          {uploading ? `Hochladen… ${Math.round(progress)}%` : "Hochladen"}
        </button>
      </form>

      <BottomNav />
    </div>
  );
};

export default Upload;
