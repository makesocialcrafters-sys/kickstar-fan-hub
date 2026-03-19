import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FootballFieldBg from "@/components/FootballFieldBg";

const steps = [
  { emoji: "⚽", title: "PROFIL ANLEGEN", desc: "Erstelle dein Spielerprofil in unter 2 Minuten." },
  { emoji: "🎥", title: "VIDEO HOCHLADEN", desc: "Lade deine besten Tore und Aktionen als Highlight hoch." },
  { emoji: "💰", title: "LINK TEILEN & KASSIEREN", desc: "Teile deinen Link und lass dich von Fans mit Trinkgeld feiern." },
];

const Landing = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <FootballFieldBg />
      <div className="relative z-10 max-w-4xl animate-fade-in-up">
        <h1 className="font-display text-6xl sm:text-8xl md:text-9xl leading-[0.9] mb-6">
          DEIN TOR.{" "}
          <span className="text-neon neon-text-glow">DEIN RUHM.</span>{" "}
          DEIN BIER.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
          Die Plattform, auf der Amateurfußballer ihre besten Momente teilen – und Fans ihnen ein Bier ausgeben.
        </p>
        <Link to="/register">
          <Button variant="neon" size="lg" className="text-lg px-10 py-6 rounded-full animate-pulse-neon">
            Kostenloses Profil erstellen
          </Button>
        </Link>
      </div>
    </section>

    {/* How it works */}
    <section className="py-24 px-4">
      <div className="container max-w-5xl">
        <h2 className="font-display text-4xl sm:text-5xl text-center mb-16">SO EINFACH GEHT'S</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-card-border bg-card p-8 text-center"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="text-5xl mb-4">{s.emoji}</div>
              <h3 className="font-display text-2xl mb-3 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="bg-neon py-16 px-4 text-center">
      <div className="container max-w-3xl">
        <h2 className="font-display text-4xl sm:text-5xl text-neon-foreground mb-4">
          BEREIT FÜR DEINEN MOMENT?
        </h2>
        <p className="text-neon-foreground/70 mb-8 text-lg">
          Erstelle jetzt dein kostenloses Profil und zeig der Welt deine Highlights.
        </p>
        <Link to="/register">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-neon-foreground text-neon-foreground hover:bg-neon-foreground hover:text-neon rounded-full px-10 py-6 text-lg font-bold"
          >
            Jetzt starten →
          </Button>
        </Link>
      </div>
    </section>
  </div>
);

export default Landing;
