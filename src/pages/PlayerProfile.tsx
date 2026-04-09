import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { relativeTime } from "@/lib/helpers";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Video } from "@/lib/types";

const PlayerProfile = () => {
  const { username } = useParams();
  const [player, setPlayer] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: vids } = await supabase
        .from('videos')
        .select('*')
        .eq('player_id', profile.id)
        .order('created_at', { ascending: false });

      setPlayer(profile as unknown as Profile);
      setVideos((vids as unknown as Video[]) ?? []);
      setLoading(false);
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden…</div>
      </div>
    );
  }

  if (notFound || !player) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">🤷</p>
        <h1 className="font-display text-3xl">SPIELER NICHT GEFUNDEN</h1>
        <Link to="/" className="text-neon hover:underline text-sm">Zur Startseite</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container max-w-2xl pt-8 px-4">
        <div className="text-center mb-10">
          <div className="w-28 h-28 rounded-full bg-secondary border-2 border-card-border mx-auto mb-4 flex items-center justify-center text-4xl overflow-hidden">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt={player.display_name || ""} className="w-full h-full object-cover" />
            ) : (
              "⚽"
            )}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl">{(player.display_name || "").toUpperCase()}</h1>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {player.club_name && <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">{player.club_name}</span>}
            {player.position && <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">{player.position}</span>}
          </div>
          {player.bio && (
            <p className="text-muted-foreground mt-4 max-w-md mx-auto text-sm leading-relaxed">{player.bio}</p>
          )}
        </div>

        <h2 className="font-display text-2xl mb-4">HIGHLIGHTS</h2>
        {videos.length === 0 ? (
          <div className="rounded-xl border border-card-border bg-card p-8 text-center">
            <p className="text-4xl mb-2">🎥</p>
            <p className="text-muted-foreground text-sm">Noch keine Videos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {videos.map((v) => (
              <Link
                key={v.id}
                to={`/v/${v.id}`}
                className="rounded-xl border border-card-border bg-card overflow-hidden hover:border-neon/30 transition-colors group"
              >
                <div className="aspect-video bg-secondary flex items-center justify-center overflow-hidden">
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <video src={v.video_url} muted playsInline preload="metadata" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{relativeTime(v.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
