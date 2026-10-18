import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type VerifyBody = {
  transactionId?: string;
  plan?: string;
  amount?: number;
};

const VALID_PLANS: Record<string, number> = {
  daily: 500,
  three_days: 1200,
  weekly: 2500,
  biweekly: 3500,
  monthly: 6000,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    // The Authorization header carries the user's JWT — createClient with that
    // header binds the client to the caller, so auth.uid() resolves to them
    // when the RPC activates the subscription.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as VerifyBody;
    const transactionId = typeof body.transactionId === "string" ? body.transactionId.trim() : "";
    const plan = typeof body.plan === "string" ? body.plan.trim() : "";
    const amount = typeof body.amount === "number" ? body.amount : 0;

    if (!transactionId || transactionId.length > 64) {
      return new Response(
        JSON.stringify({ error: "Invalid transaction id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const expectedAmount = VALID_PLANS[plan];
    if (!expectedAmount) {
      return new Response(
        JSON.stringify({ error: "Invalid plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Read the merchant API keys from the encrypted Vault (never from the browser).
    const { data: publicKey } = await admin.rpc("get_vault_secret", { key_name: "KKIAPAY_PUBLIC_KEY" });
    const { data: privateKey } = await admin.rpc("get_vault_secret", { key_name: "KKIAPAY_PRIVATE_KEY" });

    if (!publicKey || !privateKey) {
      console.error("Kkiapay keys missing from vault");
      return new Response(
        JSON.stringify({ error: "Payment service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify the transaction against KKiaPay's own servers — the browser's
    // success event alone is never trusted.
    const verifyRes = await fetch("https://api.kkiapay.me/operations/transactions/verify", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${privateKey}`,
        "X-API-KEY": publicKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionId }),
    });

    if (!verifyRes.ok) {
      console.error("Kkiapay verify failed", verifyRes.status, await verifyRes.text());
      return new Response(
        JSON.stringify({ error: "Verification failed. Please contact support." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const tx = await verifyRes.json();
    if (tx.status !== "SUCCESS") {
      return new Response(
        JSON.stringify({ error: "Payment not confirmed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (typeof tx.amount !== "number" || tx.amount < expectedAmount || amount > tx.amount) {
      return new Response(
        JSON.stringify({ error: "Payment amount does not match the plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Activates via RPC bound to the caller's JWT (sets the user_id + dates server-side).
    const userClient = createClient(supabaseUrl, authHeader.replace("Bearer ", "").trim(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: rpcData, error: rpcError } = await userClient.rpc("activate_subscription", {
      p_plan: plan,
      p_transaction_id: transactionId,
    });

    if (rpcError || !rpcData) {
      console.error("activate_subscription failed", rpcError);
      return new Response(
        JSON.stringify({ error: "Could not activate the subscription. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, expiresAt: rpcData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
