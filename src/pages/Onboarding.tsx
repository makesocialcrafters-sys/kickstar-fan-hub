import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/helpers";
import { uploadAvatar } from "@/lib/storage";

const POSITIONS = [
  "Torwart", "Innenverteidiger", "Außenverteidiger",
  "Defensives Mittelfeld", "Zentrales Mittelfeld", "Offensives Mittelfeld",
  "Linksaußen", "Rechtsaußen", "Mittelstürmer",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [clubName, setClubName] = useState("");
  const [position, setPosition] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPositions, setShowPositions] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.user_metadata?.full_name) setDisplayName(user.user_metadata.full_name);
  }, [user]);

  useEffect(() => {
    if (displayName) setUsername(slugify(displayName));
  }, [displayName]);

  const checkAvailability = useCallback((u: string) => {
    if (!u || u.length < 3) { setUsernameAvailable(null); return; }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", u).maybeSingle();
      setUsernameAvailable(!data || data.id === user?.id);
      setCheckingUsername(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [user?.id]);

  useEffect(() => {
    const cleanup = checkAvailability(username);
    return cleanup;
  }, [username, checkAvailability]);

  const handleSave = async () => {
    if (!user) return;
    if (!displayName.trim()) { setError("Bitte gib deinen Namen ein."); return; }
    if (!username || username.length < 3) { setError("Username muss mind. 3 Zeichen haben."); return; }
    if (usernameAvailable === false) { setError("Dieser Username ist vergeben."); return; }
    if (!clubName.trim()) { setError("Bitte gib deinen Verein ein."); return; }
    if (!position) { setError("Bitte wähle deine Position."); return; }
    setSaving(true);
    setError("");
    try {
      let avatar_url: string | null = null;
      if (avatarFile) avatar_url = await uploadAvatar(user.id, avatarFile);
      const { error: dbError } = await supabase.from("profiles")
        .update({
          username,
          display_name: displayName.trim(),
          club_name: clubName.trim(),
          position,
          ...(avatar_url ? { avatar_url } : {}),
        })
        .eq("id", user.id);
      if (dbError) throw dbError;
      await refreshProfile();
      navigate("/entdecken");
    } catch {
      setError("Speichern fehlgeschlagen. Bitte versuche es nochmal.");
    } finally {
      setSaving(false);
    }
  };

  const canSave = displayName.trim() && username.length >= 3 && usernameAvailable !== false && clubName.trim() && position && !saving;

  return (
    <div className="min-h-screen flex flex-col px-5 py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl" style={{ color: "#00C853" }}>SCORLINK</h1>
        <p className="text-muted-foreground text-sm mt-1">Richte dein Profil ein</p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: "#111", border: "2px dashed #2a2a2a" }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">Foto (optional)</p>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
            }} />
          </label>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Max Mustermann"
            className="w-full rounded-2xl px-4 text-foreground text-base outline-none"
            style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 52, caretColor: "#00C853" }}
          />
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Username</label>
          <div className="relative">
            <input
              value={username}
              onChange={(e) => setUsername(slugify(e.target.value))}
              placeholder="maxmuster"
              className="w-full rounded-2xl px-4 text-foreground text-base outline-none pr-12"
              style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 52, caretColor: "#00C853" }}
            />
            {username.length >= 3 && !checkingUsername && usernameAvailable !== null && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameAvailable ? <Check size={18} color="#00C853" /> : <X size={18} color="#FF3B30" />}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            scorlink.app/p/<span style={{ color: "#00C853" }}>{username || "…"}</span>
          </p>
        </div>

        {/* Club */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Verein</label>
          <input
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="FC Beispielstadt"
            className="w-full rounded-2xl px-4 text-foreground text-base outline-none"
            style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 52, caretColor: "#00C853" }}
          />
        </div>

        {/* Position */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Position</label>
          <button
            type="button"
            onClick={() => setShowPositions(!showPositions)}
            className="w-full rounded-2xl px-4 flex items-center justify-between text-base"
            style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 52, color: position ? "#fff" : "#888" }}
          >
            {position || "Position wählen"}
            <ChevronDown size={18} color="#666" />
          </button>
          {showPositions && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid hsl(var(--border))" }}>
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => { setPosition(pos); setShowPositions(false); }}
                  className="w-full px-4 py-3 text-left text-sm flex items-center justify-between"
                  style={{
                    color: position === pos ? "#00C853" : "#fff",
                    background: position === pos ? "#0a1f0a" : "transparent",
                    borderBottom: "1px solid hsl(var(--border))",
                  }}
                >
                  {pos}
                  {position === pos && <Check size={16} color="#00C853" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>

      {/* Submit */}
      <div className="pt-6">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40"
          style={{ background: "#00C853", color: "#000" }}
        >
          {saving ? "Wird gespeichert…" : "Profil erstellen"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
