import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { Upload as UploadIcon } from "lucide-react";

const MAX_SIZE = 20971520; // 20MB

const Upload = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    setError("");
    if (!["video/mp4", "video/quicktime"].includes(f.type)) {
      setError("Nur MP4 und MOV Dateien sind erlaubt.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Die Datei darf maximal 20 MB groß sein.");
      return;
    }
    setFile(f);
    if (!title) {
      const name = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 150));
      setProgress(i);
    }
    setUploading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen">
        <Navbar showProfile username="max-mustermann" />
        <div className="container pt-24 max-w-lg text-center">
          <div className="animate-fade-in-up space-y-6">
            <p className="text-6xl">🔥</p>
            <h1 className="font-display text-4xl text-neon neon-text-glow">UPLOAD ERFOLGREICH!</h1>
            <div className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between gap-3">
              <span className="text-sm truncate">footytips.app/v/abc123</span>
              <Button
                variant="neonOutline"
                size="sm"
                onClick={() => navigator.clipboard.writeText("footytips.app/v/abc123")}
              >
                Kopieren
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 h-12 rounded-full" onClick={() => { setDone(false); setFile(null); setTitle(""); setProgress(0); }}>
                Weiteres Video
              </Button>
              <Button variant="neon" className="flex-1 h-12 rounded-full" onClick={() => navigate("/dashboard")}>
                Zum Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar showProfile username="max-mustermann" />
      <div className="container pt-24 max-w-lg">
        <h1 className="font-display text-4xl mb-8 text-center">HIGHLIGHT HOCHLADEN</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
              dragOver ? "border-neon bg-neon/5" : file ? "border-neon/50 bg-card" : "border-card-border bg-card hover:border-muted-foreground/50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/quicktime"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <UploadIcon className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
            {file ? (
              <p className="text-foreground font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-foreground font-medium">Video hierher ziehen</p>
                <p className="text-muted-foreground text-sm mt-1">oder klicken zum Auswählen · MP4/MOV · max. 20 MB</p>
              </>
            )}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Titel</Label>
              <span className={`text-xs ${title.length > 80 ? "text-destructive" : "text-muted-foreground"}`}>
                {title.length}/80
              </span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              placeholder="z.B. Traumtor aus 25 Metern"
              className="bg-card border-card-border h-12"
              required
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 [&>div]:bg-neon" />
              <p className="text-sm text-muted-foreground text-center">{progress}%</p>
            </div>
          )}

          <Button
            type="submit"
            variant="neon"
            className="w-full h-12 rounded-full"
            disabled={!file || !title.trim() || uploading || title.length > 80}
          >
            {uploading ? "Wird hochgeladen…" : "Video hochladen"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
