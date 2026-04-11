import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Trash2, Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteVideoAssets } from "@/lib/storage";
import type { Video, Profile } from "@/lib/types";

const VideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [player, setPlayer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnVideo, setIsOwnVideo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const viewCounted = useRef(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: vid }, { data: { user } }] = await Promise.all([
        supabase.from("videos").select("*").eq("id", id).single(),
        supabase.auth.getUser(),
      ]);
      if (!vid) { setLoading(false); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", vid.player_id).single();
      const own = user?.id === vid.player_id;
      setIsOwnVideo(own);
      setVideo(vid as unknown as Video);
      setNewTitle(vid.title);
      setPlayer(prof as unknown as Profile);
      if (!own && !viewCounted.current) {
        viewCounted.current = true;
        supabase.rpc("increment_view_count", { video_id: id! });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ url, title: video?.title });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!video) return;
    setDeleting(true);
    try {
      await deleteVideoAssets(video);
      navigate("/profil");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!video || !newTitle.trim()) return;
    setSavingTitle(true);
    await supabase.from("videos").update({ title: newTitle.trim() }).eq("id", video.id);
    setVideo({ ...video, title: newTitle.trim() });
    setEditingTitle(false);
    setSavingTitle(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden…</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-5xl">🤷</p>
        <h1 className="font-display text-2xl">Video nicht gefunden</h1>
        <Link to="/entdecken" className="text-sm font-medium" style={{ color: "#00C853" }}>
          Zurück zum Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="tap-target flex items-center justify-center" style={{ color: "#fff" }}>
          <ArrowLeft size={24} />
        </button>
        {isOwnVideo && (
          <button onClick={() => setShowDeleteConfirm(true)} className="tap-target flex items-center justify-center" style={{ color: "#FF3B30" }}>
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Video */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl overflow-hidden bg-secondary aspect-video">
          <video
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            autoPlay
            muted
            playsInline
            controls
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Title & Info */}
      <div className="px-5 space-y-4">
        <div>
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-transparent text-foreground font-display text-xl border-b outline-none pb-1"
                style={{ borderColor: "#00C853" }}
                autoFocus
                maxLength={80}
              />
              <button onClick={handleSaveTitle} disabled={savingTitle} className="tap-target flex items-center justify-center" style={{ color: "#00C853" }}>
                <Check size={22} />
              </button>
              <button onClick={() => { setEditingTitle(false); setNewTitle(video.title); }} className="tap-target flex items-center justify-center" style={{ color: "#666" }}>
                <X size={22} />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <h1 className="font-display text-xl flex-1">{video.title}</h1>
              {isOwnVideo && (
                <button onClick={() => setEditingTitle(true)} className="tap-target flex items-center justify-center shrink-0 mt-0.5" style={{ color: "#666" }}>
                  <Pencil size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Player card */}
        {player && (
          <Link
            to={`/p/${player.username}`}
            className="flex items-center gap-3 py-3 rounded-2xl px-4"
            style={{ background: "#111", border: "1px solid hsl(var(--border))" }}
          >
            <div className="w-10 h-10 rounded-full bg-secondary shrink-0 overflow-hidden flex items-center justify-center text-lg">
              {player.avatar_url ? (
                <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                "⚽"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{player.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {player.club_name}{player.club_name && player.position ? " · " : ""}{player.position}
              </p>
            </div>
            <span className="text-muted-foreground text-sm">→</span>
          </Link>
        )}

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base"
          style={{ background: "#1a1a1a", color: "#fff" }}
        >
          <Share2 size={18} />
          {copied ? "Link kopiert!" : "Link teilen"}
        </button>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg p-5 pb-10 rounded-t-3xl space-y-4" style={{ background: "#111" }}>
            <h2 className="font-display text-xl text-center">Video löschen?</h2>
            <p className="text-sm text-muted-foreground text-center">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-4 rounded-2xl font-semibold text-base"
              style={{ background: "#FF3B30", color: "#fff" }}
            >
              {deleting ? "Wird gelöscht…" : "Ja, löschen"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-4 rounded-2xl font-semibold text-base"
              style={{ background: "#1a1a1a", color: "#fff" }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
