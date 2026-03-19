import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatEuro } from "@/lib/helpers";
import { useEffect } from "react";

const PRESET_AMOUNTS = [100, 300, 500, 1000];

const mockVideo = {
  id: "v1",
  title: "Traumtor aus 25 Metern",
  video_url: "",
  view_count: 342,
};

const mockPlayer = {
  display_name: "Mario Gomez",
  club_name: "FC Beispielstadt",
  position: "Mittelstürmer",
  avatar_url: "",
};

const VideoPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const [selectedAmount, setSelectedAmount] = useState<number | null>(300);
  const [customAmount, setCustomAmount] = useState("");
  const [fanName, setFanName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const effectiveAmount = customAmount ? Math.round(parseFloat(customAmount) * 100) : selectedAmount;

  useEffect(() => {
    if (isSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSendTip = async () => {
    if (!effectiveAmount || effectiveAmount < 100) return;
    setLoading(true);
    // TODO: POST to /api/checkout
    setTimeout(() => {
      setLoading(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }, 1000);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Success overlay */}
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
        {/* Video player */}
        <div className="rounded-xl overflow-hidden bg-secondary aspect-video mb-6 flex items-center justify-center">
          {mockVideo.video_url ? (
            <video
              src={mockVideo.video_url}
              autoPlay
              muted
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <p className="text-5xl mb-2">⚽</p>
              <p className="text-muted-foreground text-sm">Video-Player</p>
            </div>
          )}
        </div>

        <h1 className="font-display text-3xl mb-4">{mockVideo.title.toUpperCase()}</h1>

        {/* Player info */}
        <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-card border border-card-border">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl shrink-0">
            {mockPlayer.avatar_url ? (
              <img src={mockPlayer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              "⚽"
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{mockPlayer.display_name}</p>
            <p className="text-xs text-muted-foreground">{mockPlayer.club_name} · {mockPlayer.position}</p>
          </div>
        </div>

        {/* Tip section */}
        <div className="rounded-xl border border-card-border bg-card p-6 space-y-6">
           <h2 className="font-display text-2xl text-center">🔥 FEIERST DU DAS TOR?</h2>

          {/* Amount buttons */}
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

          {/* Custom amount */}
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

          {/* Fan info */}
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
            disabled={!effectiveAmount || effectiveAmount < 100 || loading}
          >
            {loading ? "Wird verarbeitet…" : "⚡ Support senden"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
