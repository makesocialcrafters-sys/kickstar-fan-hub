import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = ({ showProfile, username }: { showProfile?: boolean; username?: string }) => (
  <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
    <div className="container flex h-14 items-center justify-between">
      <Link to="/" className="font-display text-2xl text-neon tracking-wider">
        FOOTYTIPS
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
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Abmelden
          </Button>
        )}
      </div>
    </div>
  </nav>
);

export default Navbar;
