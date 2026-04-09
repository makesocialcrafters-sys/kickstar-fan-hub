import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = ({ showProfile, username }: { showProfile?: boolean; username?: string }) => {
  const { signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="font-display text-2xl text-neon tracking-wider">
          SCORLINK
        </Link>
        <div className="flex items-center gap-3">
          {showProfile && username && (
            <a
              href={`/p/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Mein Profil →
            </a>
          )}
          {showProfile && (
            <Link to="/dashboard/settings" className="text-muted-foreground hover:text-neon transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          )}
          {showProfile && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={signOut}>
              Abmelden
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
