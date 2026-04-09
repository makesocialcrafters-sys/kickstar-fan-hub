import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/lib/types";

export default function Entdecken() {
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, club_name, position, avatar_url, total_earnings, bio, created_at")
        .not("username", "is", null)
        .order("total_earnings", { ascending: false });

      setPlayers((data as Profile[]) ?? []);
      setLoading(false);
    }
    loadPlayers();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="font-display text-xl text-neon">
            SCORLINK
          </Link>
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Einloggen
          </Link>
        </div>
      </nav>

      <div className="container py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl mb-3">
            ALLE SPIELER
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Entdecke Amateurfußballer und feier ihre besten Momente.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-card-border bg-card p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && players.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⚽</p>
            <p className="text-muted-foreground">
              Noch keine Spieler registriert.
            </p>
          </div>
        )}

        {/* Players Grid */}
        {!loading && players.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => (
              <Link
                key={player.id}
                to={`/p/${player.username}`}
                className="group rounded-xl border border-card-border bg-card p-6 transition-colors hover:border-neon/40"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-4">
                  {player.avatar_url ? (
                    <img
                      src={player.avatar_url}
                      alt={player.display_name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl">
                      ⚽
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-lg truncate">
                      {player.display_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{player.username}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {player.club_name && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      🏟 {player.club_name}
                    </span>
                  )}
                  {player.position && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {player.position}
                    </span>
                  )}
                </div>


                {/* CTA */}
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Profil ansehen →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
