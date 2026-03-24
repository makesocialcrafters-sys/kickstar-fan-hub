import { useEffect, useRef, useCallback } from "react";

interface SuccessOverlayProps {
  onDismiss: () => void;
}

export default function SuccessOverlay({ onDismiss }: SuccessOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stableOnDismiss = useCallback(onDismiss, [onDismiss]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#CAFF00", "#00D97E", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"];
    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      r: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.angle += p.spin;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
        ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    const timer = setTimeout(stableOnDismiss, 4000);
    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timer);
    };
  }, [stableOnDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm cursor-pointer"
      onClick={stableOnDismiss}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="relative text-center p-8">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="font-display text-4xl text-neon neon-text-glow mb-2">DANKE!</h2>
        <p className="text-muted-foreground text-lg">Dein Support ist angekommen!</p>
        <p className="text-muted-foreground/60 text-sm mt-2">Tippen zum Schließen</p>
      </div>
    </div>
  );
}
