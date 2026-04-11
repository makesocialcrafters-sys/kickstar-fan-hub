import { Link } from "react-router-dom";
import FootballFieldBg from "@/components/FootballFieldBg";

const Landing = () => (
  <div className="min-h-screen" style={{ background: "#080808" }}>

    {/* Hero */}
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <FootballFieldBg />
      <div className="relative z-10 max-w-4xl animate-fade-up">

        <p className="text-sm font-bold tracking-[0.3em] uppercase mb-6" style={{ color: "#00C853" }}>
          SCORLINK
        </p>

        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.9] mb-6" style={{ color: "#fff" }}>
          DEIN TOR.{" "}
          <span style={{ color: "#00C853" }}>DEIN FAME.</span>{" "}
          DEIN SUPPORT.
        </h1>

        <p className="text-base sm:text-lg max-w-xl mx-auto mb-12" style={{ color: "#888" }}>
          Die Plattform, auf der Amateurfußballer ihre besten Momente teilen – und Fans sie supporten.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto text-left">

          {/* Spieler */}
          <div className="rounded-2xl p-6" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
            <Link to="/register">
              <button
                className="w-full rounded-full py-3 px-6 font-bold text-base mb-5"
                style={{ background: "#00C853", color: "#000", boxShadow: "0 0 24px #00C85350" }}
              >
                Kostenloses Profil erstellen
              </button>
            </Link>
            <div>
              <p className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: "#00C853" }}>⚽ Für Spieler</p>
              {["Registrieren & Profil anlegen", "Highlight-Video hochladen", "Persönlichen Link teilen", "Von Fans supporten lassen"].map((step, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-bold mt-0.5" style={{ color: "#00C853" }}>{i + 1}.</span>
                  <span className="text-sm" style={{ color: "#aaa" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fan */}
          <div className="rounded-2xl p-6" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
            <Link to="/entdecken">
              <button
                className="w-full rounded-full py-3 px-6 font-bold text-base mb-5"
                style={{ background: "transparent", color: "#fff", border: "1px solid #333" }}
              >
                Spieler entdecken
              </button>
            </Link>
            <div>
              <p className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: "#00C853" }}>👀 Für Fans</p>
              {["Kein Account nötig", "Feed durchscrollen & Videos anschauen", "Lieblingsspieler finden", "Spieler mit Trinkgeld supporten"].map((step, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-bold mt-0.5" style={{ color: "#00C853" }}>{i + 1}.</span>
                  <span className="text-sm" style={{ color: "#aaa" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>

    {/* CTA Bottom */}
    <section className="py-16 px-4 text-center" style={{ background: "#00C853" }}>
      <div className="container max-w-3xl">
        <h2 className="font-display text-4xl sm:text-5xl mb-4" style={{ color: "#000" }}>
          BEREIT FÜR DEINEN MOMENT?
        </h2>
        <p className="mb-8 text-lg" style={{ color: "rgba(0,0,0,0.6)" }}>
          Erstelle jetzt dein kostenloses Profil und zeig der Welt deine Highlights.
        </p>
        <Link to="/register">
          <button
            className="rounded-full px-10 py-4 text-lg font-bold"
            style={{ background: "#000", color: "#fff" }}
          >
            Jetzt starten →
          </button>
        </Link>
      </div>
    </section>

  </div>
);

export default Landing;
