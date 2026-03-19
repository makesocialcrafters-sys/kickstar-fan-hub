import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Supabase auth.signInWithPassword
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="font-display text-3xl text-neon">FOOTYTIPS</Link>
          <h1 className="font-display text-4xl mt-6 mb-2">ANMELDEN</h1>
          <p className="text-muted-foreground">Willkommen zurück!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Dein Passwort"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="bg-card border-card-border h-12"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" variant="neon" className="w-full h-12 rounded-full text-base" disabled={loading}>
            {loading ? "Wird geladen…" : "Anmelden"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link to="/register" className="text-neon hover:underline">Registrieren</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
