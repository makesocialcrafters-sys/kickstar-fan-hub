

## Titelbild (Thumbnail) für Highlight-Videos

### Überblick
Spieler können beim Upload ein Titelbild (JPG/PNG) für ihr Video auswählen. Das Bild wird in Supabase Storage gespeichert und überall angezeigt, wo Videos dargestellt werden.

### Änderungen

**1. Datenbank-Migration**
- Neue Spalte `thumbnail_url` (text, nullable) zur `videos`-Tabelle hinzufügen.

**2. Storage**
- Neuen öffentlichen Bucket `thumbnails` erstellen (per Migration).
- RLS-Policy: Authentifizierte User können in ihren eigenen Ordner hochladen.

**3. Upload-Logik (`src/lib/storage.ts`)**
- Neue Funktion `uploadThumbnail(userId, file)` — lädt Bild in `thumbnails/{userId}/{timestamp}.{ext}` hoch, gibt Public URL zurück.
- Validierung: nur JPG/PNG, max 5 MB.

**4. Upload-Seite (`src/pages/Upload.tsx`)**
- Neuer optionaler Bereich unter dem Video-Dropzone: "Titelbild auswählen" mit Bildvorschau.
- Separater File-Input für Bilder (accept: image/jpeg, image/png).
- Beim Submit: Thumbnail zuerst hochladen, dann `thumbnail_url` mit in den DB-Insert übergeben.

**5. Video-Typ (`src/lib/types.ts`)**
- `thumbnail_url?: string` zum `Video`-Interface hinzufügen.

**6. Anzeige des Titelbilds**
- **Dashboard** (`Dashboard.tsx`): Thumbnail als kleines Vorschaubild neben dem Videotitel in der Liste.
- **PlayerProfile** (`PlayerProfile.tsx`): Thumbnail in der Video-Karte anzeigen.
- **VideoPage** (`VideoPage.tsx`): Thumbnail als Poster-Attribut des Video-Elements verwenden.
- **Entdecken** (`Entdecken.tsx`): Falls Videos dort angezeigt werden, ebenfalls Thumbnail nutzen.

### Technische Details

```sql
-- Migration
ALTER TABLE public.videos ADD COLUMN thumbnail_url text;

INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

CREATE POLICY "Users can upload own thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Thumbnails are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'thumbnails');
```

