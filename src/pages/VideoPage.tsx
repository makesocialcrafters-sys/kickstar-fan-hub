import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatEuro } from "@/lib/helpers";
import { supabase } from "@/integrations/supabase/client";
import type { Video, Profile } from "@/lib/types";

const PRESET_AMOUNTS = [100, 300, 500, 1000];

const VideoPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [video, setVideo] = useState<Video | null>(null);
  const [player, setPlayer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnVideo, setIsOwnVideo] = useState(false);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(300);
  const [customAmount, setCustomAmount] = useState("");
  const [fanName, setFanName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const effectiveAmount = customAmount ? Math.round(parseFloat(customAmount) * 100) : selectedAmount;

  useEffect(() => {
    const load = async () => {
      const [{ data: vid }, { data: { user } }] = await Promise.all([
        supabase.from('videos').select('*').eq('id', id).single(),
        supabase.auth.getUser(),
      ]);
      if (!vid) { setLoading(false); return; }

      supabase.rpc('increment_view_count', { video_id: id });

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', vid.player_id)
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
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSendTip = async () => {
    if (!effectiveAmount || effectiveAmount < 100 || !video || !player) return;
    setSending(true);
    // TODO: POST to checkout edge function for Stripe
    // For now, insert a tip directly as 'pending'
    await supabase.from('tips').insert({
      player_id: player.id,
      video_id: video.id,
      amount: effectiveAmount,
      fan_name: fanName || null,
      message: message || null,
      status: 'pending',
    });
    setSending(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
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
      {showConfetti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in-up">
          <div className="text-center p-8">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="font-display text-3xl text-neon neon-text-glow">DANKE!</h2>
            <p className="text-muted-foreground mt-2">Dein Support ist angekommen!</p>
          </div>
        </div>
      )}

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
          <Link to={`/p/${player.username}`} className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-card border border-card-border hover:border-neon/30 transition-colors">
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
            <p className="text-foreground font-medium">Das ist dein eigenes Video – teile den Link damit deine Fans dich feiern können!</p>
            <Button
              variant="neon"
              className="rounded-full"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              Link kopieren
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-card-border bg-card p-6 space-y-6">
            <h2 className="font-display text-2xl text-center">🔥 FEIERST DU DAS TOR?</h2>

            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                  className={`rounded-lg border py-3 font-display text-lg transition-all ${
                    selectedAmount === amt && !customAmount
                      ? "border-neon bg-neon/10 text-neon"
                      : "border-card-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  {formatEuro(amt)}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Oder eigenen Betrag eingeben (€)</Label>
              <Input
                type="number"
                min="1"
                step="0.5"
                placeholder="z.B. 7.50"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                className="bg-background border-card-border h-12"
              />
            </div>

            <div className="space-y-4">
              <Input
                value={fanName}
                onChange={(e) => setFanName(e.target.value)}
                placeholder="Dein Name (optional)"
                className="bg-background border-card-border h-12"
              />
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='z.B. "Wahnsinns Schuss!"'
                className="bg-background border-card-border min-h-[80px]"
              />
            </div>

            <Button
              variant="neon"
              className="w-full h-14 rounded-full text-lg"
              onClick={handleSendTip}
              disabled={!effectiveAmount || effectiveAmount < 100 || sending}
            >
              {sending ? "Wird verarbeitet…" : "⚡ Support senden"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
