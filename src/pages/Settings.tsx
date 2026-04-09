import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, MapPin, AtSign, Trash2, CreditCard } from "lucide-react";
import { Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/lib/storage";
import { slugify } from "@/lib/helpers";
import type { Profile } from "@/lib/types";

const POSITIONS = [
  "Torwart", "Innenverteidiger", "Außenverteidiger",
  "Defensives Mittelfeld", "Zentrales Mittelfeld", "Offensives Mittelfeld",
  "Linksaußen", "Rechtsaußen", "Mittelstürmer",
];

const SectionCard = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
    <div className="flex items-center gap-2.5">
      <Icon className="w-5 h-5 text-neon" />
      <h2 className="font-display text-xl tracking-wide">{title}</h2>
    </div>
    {children}
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [clubName, setClubName] = useState("");
  const [position, setPosition] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Username availability
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
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

  // Check username availability (debounced)
  const checkAvailability = useCallback(
    (u: string) => {
      if (!u || u.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      if (u === originalUsername) {
        setUsernameAvailable(true);
        return;
      }
      setCheckingUsername(true);
      const timer = setTimeout(async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", u)
          .maybeSingle();
        setUsernameAvailable(!data || data.id === user?.id);
        setCheckingUsername(false);
      }, 400);
      return () => clearTimeout(timer);
    },
    [user?.id, originalUsername]
  );

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

  const handleSave = async () => {
    if (!user || !profile) return;
    if (!displayName.trim()) {
      toast.error("Name darf nicht leer sein.");
      return;
    }
    if (!username || username.length < 3) {
      toast.error("Username muss mindestens 3 Zeichen lang sein.");
      return;
    }
    if (usernameAvailable === false) {
      toast.error("Dieser Username ist leider vergeben.");
      return;
    }

    setSaving(true);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        avatar_url = await uploadAvatar(user.id, avatarFile);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          club_name: clubName.trim() || null,
          position: position || null,
          username,
          avatar_url,
        })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      setOriginalUsername(username);
      setAvatarFile(null);
      toast.success("Profil gespeichert! ✅");
    } catch (err: any) {
      console.error("Save failed:", err);
      toast.error("Speichern fehlgeschlagen. Bitte versuche es nochmal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "LÖSCHEN" || !user) return;
    setDeleting(true);
    try {
      // Delete profile data (cascade will handle videos/tips via FK)
      // Note: actual auth user deletion requires admin/service role
      // For now we clear the profile and sign out
      await supabase.from("profiles").update({
        username: null,
        display_name: null,
        bio: null,
        club_name: null,
        position: null,
        avatar_url: null,
      }).eq("id", user.id);

      await signOut();
      toast.success("Dein Konto wurde deaktiviert.");
      navigate("/");
    } catch (err) {
      console.error("Delete failed:", err);
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
    <div className="min-h-screen pb-12">
      <Navbar showProfile username={profile.username || undefined} />
      <div className="container pt-20 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-7 h-7 text-neon" />
          <h1 className="font-display text-3xl sm:text-4xl">EINSTELLUNGEN</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Picture & Name */}
          <SectionCard icon={User} title="PROFIL">
            <div className="flex items-start gap-5">
              <label className="cursor-pointer group shrink-0">
                <div className="w-20 h-20 rounded-full bg-secondary border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden group-hover:border-neon transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-2xl">📷</span>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-xs text-muted-foreground text-center mt-1">Ändern</p>
              </label>
              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Dein Name"
                    className="bg-background border-border h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Kurze Beschreibung…"
                    className="bg-background border-border min-h-[70px]"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Club & Position */}
          <SectionCard icon={MapPin} title="VEREIN & POSITION">
            <div className="space-y-1.5">
              <Label>Vereinsname</Label>
              <Input
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="FC Beispielstadt"
                className="bg-background border-border h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      position === pos
                        ? "border-neon bg-neon/10 text-neon"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Username */}
          <SectionCard icon={AtSign} title="USERNAME">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <div className="relative">
                <Input
                  value={username}
                  onChange={(e) => setUsername(slugify(e.target.value))}
                  placeholder="dein-username"
                  className="bg-background border-border h-11 pr-10"
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
          </SectionCard>

          {/* Payment Info (placeholder) */}
          <SectionCard icon={CreditCard} title="ZAHLUNGSINFORMATIONEN">
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-muted-foreground text-sm">
                💳 Zahlungsinformationen werden bald verfügbar sein.
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Hier kannst du später dein Stripe-Konto verbinden, um Auszahlungen zu erhalten.
              </p>
            </div>
          </SectionCard>

          {/* Save */}
          <Button
            variant="neon"
            className="w-full h-12 rounded-xl text-base"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Wird gespeichert…" : "Änderungen speichern"}
          </Button>

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/30 bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h2 className="font-display text-xl tracking-wide text-destructive">KONTO LÖSCHEN</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Wenn du dein Konto löschst, werden dein Profil und alle zugehörigen Daten unwiderruflich entfernt.
            </p>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Konto löschen…
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-destructive font-medium">
                  Gib <span className="font-bold">LÖSCHEN</span> ein um fortzufahren:
                </p>
                <Input
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="LÖSCHEN"
                  className="bg-background border-destructive/50 h-11"
                />
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleteText !== "LÖSCHEN" || deleting}
                  >
                    {deleting ? "Wird gelöscht…" : "Endgültig löschen"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
