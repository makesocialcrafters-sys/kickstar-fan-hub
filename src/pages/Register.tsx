import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Supabase auth.signUp
    // Simulate for now
    setTimeout(() => {
      setLoading(false);
      navigate("/onboarding");
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="font-display text-3xl text-neon">FOOTYTIPS</Link>
          <h1 className="font-display text-4xl mt-6 mb-2">KONTO ERSTELLEN</h1>
          <p className="text-muted-foreground">Werde Teil der Community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Vollständiger Name</Label>
            <Input
              id="name"
              placeholder="Max Mustermann"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-card border-card-border h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="max@beispiel.de"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-card border-card-border h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mindestens 6 Zeichen"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="bg-card border-card-border h-12"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" variant="neon" className="w-full h-12 rounded-full text-base" disabled={loading}>
            {loading ? "Wird erstellt…" : "Registrieren"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Schon ein Konto?{" "}
          <Link to="/login" className="text-neon hover:underline">Anmelden</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
