import { useParams, Link } from "react-router-dom";
import { formatEuro, relativeTime } from "@/lib/helpers";

// Mock data
const mockPlayer = {
  display_name: "Mario Gomez",
  username: "mario-gomez",
  club_name: "FC Beispielstadt",
  position: "Mittelstürmer",
  bio: "Kreisliga-Legende seit 2018. Torjäger mit Leidenschaft. Immer Bock auf Fußball! ⚽",
  avatar_url: "",
  total_earnings: 8750,
};

const mockVideos = [
  { id: "v1", title: "Traumtor aus 25 Metern", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "v2", title: "Freistoß-Knaller im Derby", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "v3", title: "Solo-Run durch die Abwehr", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "v4", title: "Kopfball in letzter Minute", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const PlayerProfile = () => {
  const { username } = useParams();
  const player = mockPlayer; // TODO: Fetch from Supabase

  return (
    <div className="min-h-screen pb-24">
      <div className="container max-w-2xl pt-8 px-4">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-28 h-28 rounded-full bg-secondary border-2 border-card-border mx-auto mb-4 flex items-center justify-center text-4xl overflow-hidden">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt={player.display_name} className="w-full h-full object-cover" />
            ) : (
              "⚽"
            )}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl">{player.display_name.toUpperCase()}</h1>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">{player.club_name}</span>
            <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">{player.position}</span>
          </div>
          {player.bio && (
            <p className="text-muted-foreground mt-4 max-w-md mx-auto text-sm leading-relaxed">{player.bio}</p>
          )}
          <p className="mt-4 text-sm">
            ⚡ Hat schon <span className="text-neon font-semibold">{formatEuro(player.total_earnings)}</span> von Fans bekommen
          </p>
        </div>

        {/* Videos grid */}
        <h2 className="font-display text-2xl mb-4">HIGHLIGHTS</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mockVideos.map((v) => (
            <Link
              key={v.id}
              to={`/v/${v.id}`}
              className="rounded-xl border border-card-border bg-card overflow-hidden hover:border-neon/30 transition-colors group"
            >
              <div className="aspect-video bg-secondary flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                🎬
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground line-clamp-1">{v.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{relativeTime(v.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border p-4">
        <div className="container max-w-2xl">
          <Link to={`/v/${mockVideos[0]?.id || "v1"}`}>
            <button className="w-full bg-neon text-neon-foreground font-bold py-4 rounded-full text-base neon-glow hover:bg-neon/90 transition-colors">
              Support ihn! 🔥
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
