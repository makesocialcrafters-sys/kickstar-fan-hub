import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/lib/storage";
import { slugify } from "@/lib/helpers";
import type { Profile } from "@/lib/types";
import BottomNav from "@/components/BottomNav";

const POSITIONS = [
  "Torwart", "Innenverteidiger", "Außenverteidiger",
  "Defensives Mittelfeld", "Zentrales Mittelfeld", "Offensives Mittelfeld",
  "Linksaußen", "Rechtsaußen", "Mittelstürmer",
];

const Settings = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [clubName, setClubName] = useState("");
  const [position, setPosition] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        const p = data as Profile;
        setProfile(p);
        setDisplayName(p.display_name || "");
        setBio(p.bio || "");
        setClubName(p.club_name || "");
        setPosition(p.position || "");
        setUsername(p.username || "");
        setOriginalUsername(p.username || "");
        if (p.avatar_url) setAvatarPreview(p.avatar_url);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const checkAvailability = useCallback((u: string) => {
    if (!u || u.length < 3) { setUsernameAvailable(null); return; }
    if (u === originalUsername) { setUsernameAvailable(true); return; }
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("id").eq("username", u).maybeSingle();
      setUsernameAvailable(!data || data.id === user?.id);
      setCheckingUsername(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [user?.id, originalUsername]);

  useEffect(() => {
    const cleanup = checkAvailability(username);
    return cleanup;
  }, [username, checkAvailability]);

  const handleSave = async () => {
    if (!user || !profile) return;
    if (!displayName.trim()) { toast.error("Name darf nicht leer sein."); return; }
    if (!username || username.length < 3) { toast.error("Username muss mindestens 3 Zeichen lang sein."); return; }
    if (usernameAvailable === false) { toast.error("Dieser Username ist leider vergeben."); return; }
    setSaving(true);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) avatar_url = await uploadAvatar(user.id, avatarFile);
      const { error } = await supabase.from("profiles").update({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        club_name: clubName.trim() || null,
        position: position || null,
        username,
        avatar_url,
      }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      setOriginalUsername(username);
      setAvatarFile(null);
      toast.success("Profil gespeichert! ✅");
    } catch {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "LÖSCHEN" || !user) return;
    setDeleting(true);
    try {
      await supabase.from("profiles").update({
        username: null, display_name: null, bio: null, club_name: null, position: null, avatar_url: null,
      }).eq("id", user.id);
      await signOut();
      toast.success("Dein Konto wurde deaktiviert.");
      navigate("/");
    } catch {
      toast.error("Löschen fehlgeschlagen.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate("/profil")} className="tap-target flex items-center justify-center" style={{ color: "#fff" }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-display text-xl">Einstellungen</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <label className="cursor-pointer">
            <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "#111", border: "2px dashed #2a2a2a" }}>
              {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-2xl">📷</span>}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
            }} />
            <p className="text-xs text-muted-foreground text-center mt-1">Ändern</p>
          </label>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Dein Name" className="w-full rounded-2xl px-4 text-foreground text-base outline-none" style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 52, caretColor: "#00C853" }} />
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Bio <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Kurze Beschreibung…" className="w-full rounded-2xl px-4 py-3 text-foreground text-base outline-none resize-none" style={{ background: "#111", border: "1px solid hsl(var(--border))", minHeight: 80, caretColor: "#00C853" }} />
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Username</label>
          <div className="relative">
            <input value={username} onChange={(e) => setUsername(slugify(e.target.value))} placeholder="dein-username" className="w-full rounded-2xl px-4 text-foreground text-base outline-none pr-12" style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 52, caretColor: "#00C853" }} />
            {username.length >= 3 && !checkingUsername && usernameAvailable !== null && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {usernameAvailable ? <Check size={18} color="#00C853" /> : <X size={18} color="#FF3B30" />}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">scorlink.app/p/<span style={{ color: "#00C853" }}>{username || "…"}</span></p>
        </div>

        {/* Club */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Vereinsname</label>
          <input value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="FC Beispielstadt" className="w-full rounded-2xl px-4 text-foreground text-base outline-none" style={{ background: "#111", border: "1px solid hsl(var(--border))", height: 52, caretColor: "#00C853" }} />
        </div>

        {/* Position */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Position</label>
          <div className="grid grid-cols-2 gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(pos)}
                className="rounded-2xl px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: position === pos ? "#0a1f0a" : "#111",
                  border: `1px solid ${position === pos ? "#00C853" : "hsl(var(--border))"}`,
                  color: position === pos ? "#00C853" : "#888",
                }}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-2xl font-semibold text-base disabled:opacity-40" style={{ background: "#00C853", color: "#000" }}>
          {saving ? "Wird gespeichert…" : "Änderungen speichern"}
        </button>

        {/* Danger zone */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#111", border: "1px solid #331111" }}>
          <div className="flex items-center gap-2">
            <Trash2 size={18} color="#FF3B30" />
            <h2 className="font-display text-base" style={{ color: "#FF3B30" }}>Konto löschen</h2>
          </div>
          <p className="text-xs text-muted-foreground">Dein Profil und alle Daten werden unwiderruflich entfernt.</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#2a1111", color: "#FF3B30" }}>
              Konto löschen…
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: "#FF3B30" }}>Gib <strong>LÖSCHEN</strong> ein:</p>
              <input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="LÖSCHEN" className="w-full rounded-2xl px-4 text-foreground text-base outline-none" style={{ background: "#1a1111", border: "1px solid #551111", height: 48, caretColor: "#FF3B30" }} />
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }} className="flex-1 py-3 rounded-xl text-sm" style={{ background: "#1a1a1a", color: "#888" }}>Abbrechen</button>
                <button onClick={handleDeleteAccount} disabled={deleteText !== "LÖSCHEN" || deleting} className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-40" style={{ background: "#551111", color: "#FF3B30" }}>
                  {deleting ? "Wird gelöscht…" : "Endgültig löschen"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
