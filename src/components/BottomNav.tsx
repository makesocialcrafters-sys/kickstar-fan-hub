import { Link, useLocation } from "react-router-dom";
import { Home, Plus, User } from "lucide-react";

const BottomNav = () => {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bottom-nav"
      style={{
        background: "rgba(10,10,10,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid hsl(var(--border))",
      }}
    >
      <div className="flex items-center justify-around px-6 pt-3 pb-2 max-w-lg mx-auto">
        <Link to="/entdecken" className="flex flex-col items-center gap-1 tap-target justify-center">
          <Home
            size={24}
            strokeWidth={isActive("/entdecken") ? 2.5 : 1.5}
            color={isActive("/entdecken") ? "#00C853" : "#666666"}
          />
          <span
            className="text-[10px] font-medium tracking-wide"
            style={{ color: isActive("/entdecken") ? "#00C853" : "#666666" }}
          >
            Entdecken
          </span>
        </Link>

        <Link
          to="/dashboard/upload"
          className="flex items-center justify-center rounded-full tap-target"
          style={{
            width: 56,
            height: 56,
            background: "#00C853",
            boxShadow: "0 0 24px #00C85350",
            marginBottom: 8,
          }}
        >
          <Plus size={28} color="#000" strokeWidth={2.5} />
        </Link>

        <Link to="/profil" className="flex flex-col items-center gap-1 tap-target justify-center">
          <User
            size={24}
            strokeWidth={isActive("/profil") ? 2.5 : 1.5}
            color={isActive("/profil") ? "#00C853" : "#666666"}
          />
          <span
            className="text-[10px] font-medium tracking-wide"
            style={{ color: isActive("/profil") ? "#00C853" : "#666666" }}
          >
            Profil
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
