

## Plan: UI-Redesign — Mobile-First mit BottomNav

### Überblick
Kompletter UI-Umbau: Dashboard und Navbar werden durch eine neue Profil-Seite und eine Bottom-Navigation ersetzt. Neues Farbschema (grün statt neon-gelb), neue Fonts (Syne + DM Sans), mobile-first Layout.

### Änderungen

**Dateien ersetzen (8 Dateien):**

| Datei | Wesentliche Änderung |
|---|---|
| `src/index.css` | Neues Farbschema (#00C853 grün), Syne/DM Sans Fonts, CSS-Variablen, Scrollbar-Hide, safe-area-bottom |
| `tailwind.config.ts` | Container max 480px, grüne Farben, neue Font-Families, fade-up Animation |
| `src/App.tsx` | Route `/dashboard` → `/profil`, GrainOverlay entfernt, Dashboard-Import durch Profil ersetzt |
| `src/lib/storage.ts` | Bereinigter Code mit try/catch in extractStoragePath |
| `src/pages/Entdecken.tsx` | Feed-Layout mit BottomNav, Share-Button, Avatar-Anzeige |
| `src/pages/VideoPage.tsx` | Komplett neu: Inline-Titel-Edit, custom Delete-Confirm, Share-Button, ArrowLeft-Navigation |
| `src/pages/Upload.tsx` | Komplett neu: Custom File-Picker, Fortschrittsbalken, Erfolgsseite mit Link-Kopieren, BottomNav |
| `src/pages/Onboarding.tsx` | Komplett neu: Custom Position-Dropdown, Avatar-Upload, navigiert zu `/entdecken` statt `/dashboard` |

**Neue Dateien (2 Dateien):**

| Datei | Inhalt |
|---|---|
| `src/components/BottomNav.tsx` | 3-Tab Bottom-Navigation: Entdecken, Upload (+), Profil |
| `src/pages/Profil.tsx` | Ersetzt Dashboard: Avatar, Stats, Video-Grid, Settings/Logout-Icons |

**Dateien löschen (2 Dateien):**
- `src/pages/Dashboard.tsx`
- `src/components/Navbar.tsx`

**Zusätzliche Anpassungen (nicht im User-Code, aber nötig):**
- `src/components/OnboardingRoute.tsx`: Redirect `/dashboard` → `/profil`
- `src/pages/Settings.tsx`: Navbar-Import entfernen, BottomNav oder einfachen Back-Link nutzen
- `src/pages/Register.tsx`: Google OAuth `redirectTo` von `/dashboard` → `/profil`
- `src/pages/Login.tsx`: Redirects von `/dashboard` → `/profil` (falls vorhanden)

### Hinweise
- Der User hat den JSX-Code als Pseudo-Code geliefert (ohne korrekte JSX-Tags). Ich werde den Intent korrekt in valides TSX umsetzen.
- Settings.tsx nutzt aktuell `Navbar` — wird auf einen einfachen Back-Link + BottomNav umgestellt.
- Alle Referenzen zu `/dashboard` (außer `/dashboard/upload` und `/dashboard/settings`) werden auf `/profil` geändert.

