import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { relativeTime } from "@/lib/helpers";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { deleteVideoAssets } from "@/lib/storage";
import type { Profile, Video } from "@/lib/types";

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-card-border bg-card p-5 text-center">
    <p className="text-2xl sm:text-3xl font-display text-neon">{value}</p>
    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, videosRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('videos').select('*').eq('player_id', user.id).order('created_at', { ascending: false }),
      ]);
      setProfile(profileRes.data as Profile | null);
      setVideos((videosRes.data as Video[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleDelete = async (video: Video) => {
    setDeletingId(video.id);
    try {
      await deleteVideoAssets(video);
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
    } catch {
      // silently fail
    }
    setDeletingId(null);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
  };

  const handleSaveTitle = async () => {
    if (!editingVideo || !editTitle.trim()) return;
    await supabase.from("videos").update({ title: editTitle.trim() }).eq("id", editingVideo.id);
    setVideos((prev) => prev.map((v) => v.id === editingVideo.id ? { ...v, title: editTitle.trim() } : v));
    setEditingVideo(null);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden…</div>
      </div>
    );
  }

  const firstName = (profile.display_name || "").split(" ")[0];

  return (
    <div className="min-h-screen pb-8">
      <Navbar showProfile username={profile.username || undefined} />
      <div className="container pt-20 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl">HEY, {firstName.toUpperCase()}! 👋</h1>
          <p className="text-muted-foreground mt-1">@{profile.username} · {profile.club_name}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard label="Videos" value={String(videos.length)} />
          <StatCard label="Aufrufe" value={String(videos.reduce((sum, v) => sum + v.view_count, 0))} />
        </div>

        <Link to="/dashboard/upload">
          <Button variant="neon" className="w-full h-14 rounded-xl text-base mb-8">
            + Highlight hochladen
          </Button>
        </Link>

        <div>
          <h2 className="font-display text-2xl mb-4">MEINE HIGHLIGHTS</h2>
          {videos.length === 0 ? (
            <div className="rounded-xl border border-card-border bg-card p-8 text-center">
              <p className="text-4xl mb-2">🎥</p>
              <p className="text-muted-foreground text-sm">Noch keine Videos hochgeladen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="flex gap-4 rounded-xl border border-card-border bg-card p-4 hover:border-neon/30 transition-colors"
                >
                  <Link to={`/v/${v.id}`} className="flex gap-4 flex-1 min-w-0">
                    <div className="w-24 h-16 rounded-lg bg-secondary shrink-0 overflow-hidden flex items-center justify-center">
                      {v.thumbnail_url ? (
                        <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🎥</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground line-clamp-1">{v.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{relativeTime(v.created_at)}</p>
                    </div>
                  </Link>

                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(v)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={deletingId === v.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Video löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            „{v.title}" wird unwiderruflich gelöscht.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(v)}>
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!editingVideo} onOpenChange={(open) => !open && setEditingVideo(null)}>
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
              <Button variant="outline" onClick={() => setEditingVideo(null)}>Abbrechen</Button>
              <Button variant="neon" onClick={handleSaveTitle} disabled={!editTitle.trim()}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
