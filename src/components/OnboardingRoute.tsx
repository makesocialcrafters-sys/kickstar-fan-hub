import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.username) {
    return <Navigate to="/profil" replace />;
  }

  return <>{children}</>;
};

export default OnboardingRoute;
