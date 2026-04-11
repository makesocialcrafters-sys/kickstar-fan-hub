import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import type { Profile, Video } from "@/lib/types";

const Profil = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, videosRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("videos").select("*").eq("player_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(profileRes.data as Profile | null);
      setVideos((videosRes.data as Video[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <h2 className="font-display text-lg text-muted-foreground">@{profile?.username}</h2>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/settings" className="tap-target flex items-center justify-center" style={{ color: "#666" }}>
            <Settings size={22} />
          </Link>
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="tap-target flex items-center justify-center"
            style={{ color: "#666" }}
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center px-5 pb-6">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-4xl overflow-hidden mb-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            "⚽"
          )}
        </div>
        <h1 className="font-display text-2xl">{profile?.display_name || profile?.username}</h1>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          {profile?.club_name && <span>{profile.club_name}</span>}
          {profile?.club_name && profile?.position && <span>·</span>}
          {profile?.position && <span>{profile.position}</span>}
        </div>
        {profile?.bio && <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">{profile.bio}</p>}
        <Link
          to="/dashboard/settings"
          className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold"
          style={{ background: "#1a1a1a", color: "#fff", border: "1px solid hsl(var(--border))" }}
        >
          Profil bearbeiten
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Videos */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-5">
          <p className="text-4xl mb-3">🎥</p>
          <p className="text-muted-foreground text-sm mb-4">Noch keine Highlights</p>
          <Link
            to="/dashboard/upload"
            className="px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: "#00C853", color: "#000" }}
          >
            Erstes Video hochladen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 px-0.5 pt-2">
          {videos.map((v) => (
            <Link key={v.id} to={`/v/${v.id}`}>
              <div className="aspect-square bg-secondary overflow-hidden">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-card">🎥</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Profil;
