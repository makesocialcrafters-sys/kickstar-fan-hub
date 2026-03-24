import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatEuro } from "@/lib/helpers";
import { supabase } from "@/integrations/supabase/client";

const PRESET_AMOUNTS = [100, 300, 500, 1000];

interface TipSectionProps {
  videoId: string;
  playerId: string;
}

export default function TipSection({ videoId, playerId }: TipSectionProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(300);
  const [customAmount, setCustomAmount] = useState("");
  const [fanName, setFanName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveAmount = customAmount
    ? Math.round(parseFloat(customAmount) * 100)
    : selectedAmount;

  const handleTip = async () => {
    if (!effectiveAmount || effectiveAmount < 100) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("checkout", {
        body: {
          videoId,
          playerId,
          amount: effectiveAmount,
          fanName: fanName.trim() || null,
          message: message.trim() || null,
        },
      });

      if (fnError) throw fnError;
      if (!data?.url) throw new Error("Keine Checkout-URL erhalten");

      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout-Fehler:", err);
      setError("Zahlung konnte nicht gestartet werden. Bitte versuche es nochmal.");
      setLoading(false);
    }
  };

  return (
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

      {error && <p className="text-destructive text-sm text-center">{error}</p>}

      <Button
        variant="neon"
        className="w-full h-14 rounded-full text-lg"
        onClick={handleTip}
        disabled={!effectiveAmount || effectiveAmount < 100 || loading}
      >
        {loading
          ? "Wird weitergeleitet…"
          : `🍺 ${effectiveAmount ? formatEuro(effectiveAmount) : "Betrag wählen"} Trinkgeld senden`}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Sichere Zahlung via Stripe · Keine App nötig
      </p>
    </div>
  );
}
