import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatEuro, relativeTime } from "@/lib/helpers";
import Navbar from "@/components/Navbar";

// Mock data
const mockProfile = {
  display_name: "Max Mustermann",
  username: "max-mustermann",
  club_name: "FC Beispielstadt",
  total_earnings: 4250,
};

const mockVideos = [
  { id: "v1", title: "Traumtor aus 25 Metern", view_count: 342, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "v2", title: "Freistoß-Knaller im Derby", view_count: 189, created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "v3", title: "Solo-Run durch die Abwehr", view_count: 76, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
];

const mockTips = [
  { id: "t1", fan_name: "Lukas", message: "Wahnsinns Schuss!", amount: 500, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "t2", fan_name: null, message: "Weiter so!", amount: 300, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "t3", fan_name: "Sarah", message: null, amount: 1000, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
];

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-card-border bg-card p-5 text-center">
    <p className="text-2xl sm:text-3xl font-display text-neon">{value}</p>
    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

const Dashboard = () => {
  const { display_name, username, club_name, total_earnings } = mockProfile;
  const firstName = display_name.split(" ")[0];

  return (
    <div className="min-h-screen pb-8">
      <Navbar showProfile username={username} />
      <div className="container pt-20 max-w-5xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl">HEY, {firstName.toUpperCase()}! 👋</h1>
          <p className="text-muted-foreground mt-1">@{username} · {club_name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Einnahmen" value={formatEuro(total_earnings)} />
          <StatCard label="Videos" value={String(mockVideos.length)} />
          <StatCard label="Trinkgelder" value={String(mockTips.length)} />
        </div>

        {/* Upload CTA */}
        <Link to="/dashboard/upload">
          <Button variant="neon" className="w-full h-14 rounded-xl text-base mb-8">
            + Highlight hochladen
          </Button>
        </Link>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Videos */}
          <div>
            <h2 className="font-display text-2xl mb-4">MEINE HIGHLIGHTS</h2>
            {mockVideos.length === 0 ? (
              <div className="rounded-xl border border-card-border bg-card p-8 text-center">
                <p className="text-4xl mb-2">🎥</p>
                <p className="text-muted-foreground text-sm">Noch keine Videos hochgeladen.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockVideos.map((v) => (
                  <Link
                    key={v.id}
                    to={`/v/${v.id}`}
                    className="block rounded-xl border border-card-border bg-card p-4 hover:border-neon/30 transition-colors"
                  >
                    <p className="font-medium text-foreground">{v.title}</p>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>👁 {v.view_count} Views</span>
                      <span>{relativeTime(v.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div>
            <h2 className="font-display text-2xl mb-4">FAN-NACHRICHTEN</h2>
            {mockTips.length === 0 ? (
              <div className="rounded-xl border border-card-border bg-card p-8 text-center">
                <p className="text-4xl mb-2">💌</p>
                <p className="text-muted-foreground text-sm">Noch keine Trinkgelder erhalten.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockTips.map((t) => (
                  <div key={t.id} className="rounded-xl border border-card-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{t.fan_name || "Anonymer Fan"}</p>
                        {t.message && <p className="text-sm text-muted-foreground italic mt-1">"{t.message}"</p>}
                      </div>
                      <span className="font-display text-xl text-neon shrink-0">{formatEuro(t.amount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{relativeTime(t.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
