import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, playerId, amount, fanName, message } = await req.json();

    if (!playerId || !amount || amount < 100) {
      return new Response(
        JSON.stringify({ error: "Mindestbetrag ist 1€" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", playerId)
      .single();

    const playerName = profile?.display_name || "Spieler";

    // Insert pending tip
    const { data: tip, error: tipError } = await supabase
      .from("tips")
      .insert({
        player_id: playerId,
        video_id: videoId || null,
        amount,
        fan_name: fanName || null,
        message: message || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (tipError) throw tipError;

    const origin = req.headers.get("origin") || "https://footykick.lovable.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amount,
            product_data: {
              name: `Support für ${playerName}`,
              description: message
                ? `"${message.slice(0, 100)}"`
                : `Trinkgeld für ${playerName}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        tip_id: tip.id,
        player_id: playerId,
        video_id: videoId || "",
      },
      success_url: videoId
        ? `${origin}/v/${videoId}?success=true`
        : `${origin}/p/${playerId}?success=true`,
      cancel_url: videoId
        ? `${origin}/v/${videoId}`
        : `${origin}/p/${playerId}`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
