import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/helpers";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
                <Link
                  key={v.id}
                  to={`/v/${v.id}`}
                  className="flex gap-4 rounded-xl border border-card-border bg-card p-4 hover:border-neon/30 transition-colors"
                >
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
