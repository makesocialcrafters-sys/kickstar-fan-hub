import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil } from "lucide-react";
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
  const [deleting, setDeleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const viewCounted = useRef(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: vid }, { data: { user } }] = await Promise.all([
        supabase.from("videos").select("*").eq("id", id).single(),
        supabase.auth.getUser(),
      ]);
      if (!vid) { setLoading(false); return; }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", vid.player_id)
        .single();

      const own = user?.id === vid.player_id;
      setIsOwnVideo(own);
      setVideo(vid as unknown as Video);
      setPlayer(prof as unknown as Profile);
      setLoading(false);

      // Increment view count for non-own videos
      if (!own && !viewCounted.current) {
        viewCounted.current = true;
        supabase.rpc("increment_view_count", { video_id: vid.id });
      }
    };
    load();
  }, [id]);

  const handleSaveTitle = async () => {
    if (!video || !editTitle.trim()) return;
    await supabase.from("videos").update({ title: editTitle.trim() }).eq("id", video.id);
    setVideo({ ...video, title: editTitle.trim() });
    setEditingTitle(false);
  };

  const handleDelete = async () => {
    if (!video) return;
    setDeleting(true);
    try {
      await deleteVideoAssets(video);
      navigate("/dashboard");
    } catch {
      setDeleting(false);
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">🤷</p>
        <h1 className="font-display text-3xl">VIDEO NICHT GEFUNDEN</h1>
        <Link to="/" className="text-neon hover:underline text-sm">Zur Startseite</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {isOwnVideo && <Navbar showProfile />}
      <div className={`container max-w-2xl px-4 ${isOwnVideo ? 'pt-20' : 'pt-6'}`}>
        <div className="rounded-xl overflow-hidden bg-secondary aspect-video mb-6">
          {video.video_url ? (
            <video
              src={video.video_url}
              poster={video.thumbnail_url || undefined}
              autoPlay
              muted
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-5xl">⚽</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <h1 className="font-display text-3xl">{video.title.toUpperCase()}</h1>
          {isOwnVideo && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => { setEditTitle(video.title); setEditingTitle(true); }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>

        {player && (
          <Link
            to={`/p/${player.username}`}
            className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-card border border-card-border hover:border-neon/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl shrink-0 overflow-hidden">
              {player.avatar_url ? (
                <img src={player.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                "⚽"
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">{player.display_name}</p>
              <p className="text-xs text-muted-foreground">{player.club_name} · {player.position}</p>
            </div>
          </Link>
        )}

        {isOwnVideo && (
          <div className="rounded-xl border border-card-border bg-card p-6 text-center space-y-4">
            <p className="text-2xl">🎥</p>
            <p className="text-foreground font-medium">
              Das ist dein eigenes Video – teile den Link damit deine Fans dich feiern können!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="neon"
                className="rounded-full"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                Link kopieren 📋
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" className="rounded-full" disabled={deleting}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Video löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Das Video wird unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Wird gelöscht…" : "Löschen"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      <Dialog open={editingTitle} onOpenChange={(open) => !open && setEditingTitle(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Titel bearbeiten</DialogTitle>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
            maxLength={100}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTitle(false)}>Abbrechen</Button>
            <Button variant="neon" onClick={handleSaveTitle} disabled={!editTitle.trim()}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoPage;
