

## Stripe Payment Integration for FootyTips

### Overview
Implement the complete Stripe checkout flow: two edge functions (checkout + webhook), a TipSection component, a SuccessOverlay with canvas confetti, and wire everything into VideoPage.

### Prerequisites — Secrets
The following secrets need to be added before the edge functions will work:
- **STRIPE_SECRET_KEY** — from Stripe Dashboard → Developers → API Keys
- **STRIPE_WEBHOOK_SECRET** — from Stripe Dashboard → Developers → Webhooks

These will be requested via the `add_secret` tool during implementation.

### Changes

**1. Add secrets: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`**

**2. Create `supabase/functions/checkout/index.ts`**
- Accepts `{ videoId, playerId, amount, fanName, message }`
- Creates a pending tip in DB, then creates a Stripe checkout session
- Returns `{ url }` for redirect
- CORS headers included

**3. Create `supabase/functions/stripe-webhook/index.ts`**
- Verifies Stripe signature
- On `checkout.session.completed`: updates tip status to `completed` using `tip_id` from metadata
- The existing `update_player_earnings` trigger handles earnings automatically

**4. Create `src/components/TipSection.tsx`**
- Extracted tip UI: preset amounts (1€, 3€, 5€, 10€), custom input, fan name, message
- Calls `supabase.functions.invoke("checkout")` and redirects to Stripe
- Props: `videoId`, `playerId`

**5. Create `src/components/SuccessOverlay.tsx`**
- Canvas-based confetti animation (no external dependency needed)
- Auto-dismisses after 4 seconds, click to dismiss
- "DANKE! Dein Support ist angekommen!"

**6. Update `src/pages/VideoPage.tsx`**
- Remove inline tip form and confetti overlay
- Import and use `<TipSection>` and `<SuccessOverlay>`
- On `?success=true`: show overlay, clean URL with `history.replaceState`
- Keep existing `isOwnVideo` logic (share box vs tip section)

### Stripe Webhook Setup (user action after deploy)
Register webhook URL in Stripe Dashboard:
- URL: `https://pxzcezracqyrbnixlycg.supabase.co/functions/v1/stripe-webhook`
- Event: `checkout.session.completed`

