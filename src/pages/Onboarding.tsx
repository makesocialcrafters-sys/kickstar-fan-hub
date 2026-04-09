import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/helpers";
import { Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/lib/storage";

const POSITIONS = [
  "Torwart", "Innenverteidiger", "Außenverteidiger",
  "Defensives Mittelfeld", "Zentrales Mittelfeld", "Offensives Mittelfeld",
  "Linksaußen", "Rechtsaußen", "Mittelstürmer",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Step 2
  const [clubName, setClubName] = useState("");
  const [position, setPosition] = useState("");

  // Step 3
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Pre-fill name from auth metadata
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setDisplayName(user.user_metadata.full_name);
    }
  }, [user]);

  // Auto-generate username from display name
  useEffect(() => {
    if (step === 3 && displayName) {
      setUsername(slugify(displayName));
    }
  }, [step, displayName]);

  // Check username availability
  const checkAvailability = useCallback((u: string) => {
    if (!u || u.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', u)
        .maybeSingle();
      // Available if no match or it's our own profile
      setUsernameAvailable(!data || data.id === user?.id);
      setCheckingUsername(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [user?.id]);

  useEffect(() => {
    const cleanup = checkAvailability(username);
    return cleanup;
  }, [username, checkAvailability]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatar_url: string | null = null;
      if (avatarFile) {
        avatar_url = await uploadAvatar(user.id, avatarFile);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          display_name: displayName,
          club_name: clubName,
          position,
          bio: bio || null,
          ...(avatar_url ? { avatar_url } : {}),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setStep(4);
    } catch (err: any) {
      console.error('Profile update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const progressWidth = `${(Math.min(step, 3) / 3) * 100}%`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="font-display text-3xl text-neon">SCORLINK</span>
        </div>

        {step <= 3 && (
          <div className="mb-8">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-neon rounded-full transition-all duration-500"
                style={{ width: progressWidth }}
              />
            </div>
            <p className="text-muted-foreground text-sm mt-2 text-center">
              Schritt {step} von 3
            </p>
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="font-display text-3xl text-center">DEIN PROFIL</h2>
            <div className="flex flex-col items-center gap-4">
              <label className="cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden group-hover:border-neon transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-3xl">📷</span>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              <p className="text-muted-foreground text-xs">Profilbild hochladen</p>
            </div>
            <div className="space-y-2">
              <Label>Dein vollständiger Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Max Mustermann"
                className="bg-card border-card-border h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Kurzes Bio <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Erzähl was über dich…"
                className="bg-card border-card-border min-h-[80px]"
              />
            </div>
            <Button
              variant="neon"
              className="w-full h-12 rounded-full"
              onClick={() => setStep(2)}
              disabled={!displayName.trim()}
            >
              Weiter →
            </Button>
          </div>
        )}

        {/* Step 2: Club & Position */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="font-display text-3xl text-center">VEREIN & POSITION</h2>
            <div className="space-y-2">
              <Label>Vereinsname</Label>
              <Input
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="FC Beispielstadt"
                className="bg-card border-card-border h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      position === pos
                        ? "border-neon bg-neon/10 text-neon"
                        : "border-card-border bg-card text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 h-12 rounded-full" onClick={() => setStep(1)}>
                ← Zurück
              </Button>
              <Button
                variant="neon"
                className="flex-1 h-12 rounded-full"
                onClick={() => setStep(3)}
                disabled={!clubName.trim() || !position}
              >
                Weiter →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Username */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="font-display text-3xl text-center">DEIN LINK</h2>
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="relative">
                <Input
                  value={username}
                  onChange={(e) => setUsername(slugify(e.target.value))}
                  placeholder="dein-username"
                  className="bg-card border-card-border h-12 pr-10"
                />
                {username.length >= 3 && !checkingUsername && usernameAvailable !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameAvailable ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                scorlink.app/p/<span className="text-neon">{username || "…"}</span>
              </p>
              {username.length >= 3 && !checkingUsername && usernameAvailable === false && (
                <p className="text-destructive text-sm">Dieser Username ist leider vergeben.</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 h-12 rounded-full" onClick={() => setStep(2)}>
                ← Zurück
              </Button>
              <Button
                variant="neon"
                className="flex-1 h-12 rounded-full"
                onClick={handleFinish}
                disabled={!username || !usernameAvailable || saving}
              >
                {saving ? "Wird gespeichert…" : "Profil speichern"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="text-7xl">🎉</div>
            <h2 className="font-display text-4xl text-neon neon-text-glow">PROFIL FERTIG!</h2>
            <p className="text-muted-foreground">Dein öffentliches Profil ist live:</p>
            <div className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between gap-3">
              <span className="text-sm text-foreground truncate">
                scorlink.app/p/{username}
              </span>
              <Button
                variant="neonOutline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${username}`)}
              >
                Kopieren
              </Button>
            </div>
            <Button
              variant="neon"
              className="w-full h-12 rounded-full"
              onClick={() => navigate("/dashboard")}
            >
              Zum Dashboard →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
