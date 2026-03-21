

## Stripe Checkout + Tip Flow Integration

The user wants to implement the full Stripe payment flow with two edge functions (checkout + webhook), a dedicated TipSection component, a SuccessOverlay with confetti, and integrate everything into VideoPage.tsx.

### Prerequisites
- **Stripe must be enabled** using the Stripe tool to collect the secret key
- **canvas-confetti** package needs to be installed

### Changes

**1. Enable Stripe integration**
- Use the `stripe--enable_stripe` tool to set up Stripe and collect the secret key

**2. Create edge function: `supabase/functions/checkout/index.ts`**
- Accepts POST with `{ videoId, playerId, amount, fanName, message }`
- Uses Stripe SDK to create a checkout session (mode: payment, currency: EUR)
- Fetches player's `display_name` from profiles via service role client
- Inserts a `pending` tip row into the `tips` table
- Returns `{ url: session.url }` for redirect
- Includes CORS headers for browser access

**3. Create edge function: `supabase/functions/stripe-webhook/index.ts`**
- Verifies Stripe signature using `STRIPE_WEBHOOK_SECRET`
- On `checkout.session.completed`: updates tip status to `completed`
- The existing `update_player_earnings` DB trigger handles earnings automatically

**4. Create `src/components/TipSection.tsx`**
- Standalone component with preset amounts (1€, 3€, 5€, 10€), custom amount input, fan name, message
- Calls the checkout edge function via `supabase.functions.invoke('checkout', ...)`
- Redirects to Stripe checkout URL on success
- Styled with dark theme colors matching the app

**5. Create `src/components/SuccessOverlay.tsx`**
- Full-screen overlay with confetti animation (canvas-confetti)
- Auto-dismisses after 4 seconds
- Shows "DANKE!" message with close button

**6. Update `src/pages/VideoPage.tsx`**
- Replace inline tip form with `<TipSection videoId={video.id} playerId={player.id} />`
- Replace inline confetti overlay with `<SuccessOverlay>`
- Detect `?success=true` param, show overlay, then clean URL with `history.replaceState`
- Keep `isOwnVideo` logic as-is (share box vs tip section)

**7. Install `canvas-confetti` package**

### Secrets needed
- `STRIPE_SECRET_KEY` — collected via Stripe enable tool
- `STRIPE_WEBHOOK_SECRET` — user will need to configure this in Stripe dashboard after we provide the webhook URL

