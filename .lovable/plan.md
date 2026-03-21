

## Fix: Self-tipping prevention & anonymous fan access on /v/[id]

### Problem
1. Logged-in players can tip their own videos
2. Fans might encounter auth walls — this must never happen

### Changes — single file: `src/pages/VideoPage.tsx`

**Add auth check in the data loading `useEffect`:**
- Call `supabase.auth.getUser()` alongside the video/profile fetch
- Store `isOwnVideo` boolean in state (`user?.id === vid.player_id`)

**Conditional rendering below the player card:**

- **Own video** (`isOwnVideo === true`): Hide the entire tip section. Show an info box instead: "Das ist dein eigenes Video 🎥 – teile den Link damit deine Fans dich feiern können!" with a "Link kopieren" button.

- **Not own video OR not logged in** (`isOwnVideo === false`): Show the tip section exactly as-is. No login button, no register link, no auth prompts of any kind.

No other files need changes. The tip insert already uses the anon key (public RLS policy `Anyone can insert tips`), so anonymous fans can tip without authentication.

