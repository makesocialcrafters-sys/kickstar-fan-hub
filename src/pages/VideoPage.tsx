import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Video, Profile } from "@/lib/types";
import TipSection from "@/components/TipSection";
import SuccessOverlay from "@/components/SuccessOverlay";

const VideoPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [video, setVideo] = useState<Video | null>(null);
  const [player, setPlayer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnVideo, setIsOwnVideo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

      setIsOwnVideo(user?.id === vid.player_id);
      setVideo(vid as unknown as Video);
      setPlayer(prof as unknown as Profile);
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      history.replaceState(null, "", window.location.pathname);
    }
  }, [isSuccess]);

  const handleDismissSuccess = useCallback(() => setShowSuccess(false), []);

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
      {showSuccess && <SuccessOverlay onDismiss={handleDismissSuccess} />}

      <div className="container max-w-2xl px-4 pt-6">
        <div className="rounded-xl overflow-hidden bg-secondary aspect-video mb-6">
          {video.video_url ? (
            <video
              src={video.video_url}
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

        <h1 className="font-display text-3xl mb-4">{video.title.toUpperCase()}</h1>

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

        {isOwnVideo ? (
          <div className="rounded-xl border border-card-border bg-card p-6 text-center space-y-4">
            <p className="text-2xl">🎥</p>
            <p className="text-foreground font-medium">
              Das ist dein eigenes Video – teile den Link damit deine Fans dich feiern können!
            </p>
            <Button
              variant="neon"
              className="rounded-full"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              Link kopieren 📋
            </Button>
          </div>
        ) : (
          video && player && <TipSection videoId={video.id} playerId={player.id} />
        )}
      </div>
    </div>
  );
};

export default VideoPage;
