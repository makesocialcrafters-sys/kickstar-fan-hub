import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

interface FeedItem {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
  profiles: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    club_name: string | null;
  };
}

const Entdecken = () => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, title, video_url, thumbnail_url, created_at, profiles(username, display_name, avatar_url, club_name)")
        .order("created_at", { ascending: false })
        .limit(30);
      setFeed((data as unknown as FeedItem[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleShare = (e: React.MouseEvent, videoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/v/${videoId}`;
    if (navigator.share) {
      navigator.share({ url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="font-display text-2xl">SCORLINK</h1>
      </div>

      {/* Feed */}
      <div className="px-4 space-y-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "#111" }}>
              <div className="aspect-video bg-secondary" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-32 rounded bg-secondary" />
                <div className="h-3 w-24 rounded bg-secondary" />
              </div>
            </div>
          ))}

        {!loading && feed.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-muted-foreground text-sm">Noch keine Highlights. Sei der Erste!</p>
          </div>
        )}

        {!loading &&
          feed.map((item) => (
            <Link key={item.id} to={`/v/${item.id}`}>
              <div className="rounded-2xl overflow-hidden" style={{ background: "#111" }}>
                <div className="aspect-video bg-secondary overflow-hidden">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🎥</div>
                  )}
                </div>
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-secondary shrink-0 overflow-hidden flex items-center justify-center text-lg">
                      {item.profiles?.avatar_url ? (
                        <img src={item.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        "⚽"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        {item.profiles?.display_name || item.profiles?.username}
                      </p>
                      {item.profiles?.club_name && (
                        <p className="text-xs text-muted-foreground">{item.profiles.club_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleShare(e, item.id)}
                    className="shrink-0 tap-target flex items-center justify-center"
                    style={{ color: "#444" }}
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Entdecken;
