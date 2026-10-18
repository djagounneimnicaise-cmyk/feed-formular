import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { email, action, code } = body;

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // --- VERIFY CODE ---
    if (action === "verify" && code) {
      const { data: otpRecord } = await supabase
        .from("otp_codes")
        .select("id, code, expires_at, used")
        .eq("email", normalizedEmail)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!otpRecord) {
        return new Response(
          JSON.stringify({ error: "No valid code found. Please request a new code." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (new Date(otpRecord.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "Code has expired. Please request a new code." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (otpRecord.code !== code.trim()) {
        return new Response(
          JSON.stringify({ error: "Invalid code. Please try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Mark code as used
      await supabase
        .from("otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);

      // For admin login (no password), generate a magic link token
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

      if (linkError || !linkData) {
        // User might not exist yet (signup flow) — just return verified
        return new Response(
          JSON.stringify({ success: true, verified: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Extract the token hash from the magic link
      const properties = linkData.properties;
      const hashedToken = properties?.hashed_token;

      if (hashedToken) {
        return new Response(
          JSON.stringify({ success: true, verified: true, token: hashedToken }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- SEND CODE ---
    // Rate limit: max 5 codes per 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", normalizedEmail)
      .gte("created_at", tenMinAgo);

    if (count && count >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many codes requested. Please wait 10 minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Generate new code
    const otpCode = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Invalidate previous unused codes
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("email", normalizedEmail)
      .eq("used", false);

    // Insert new code
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        email: normalizedEmail,
        code: otpCode,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to generate code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch Resend API key from Supabase Vault (encrypted storage)
    const { data: vaultKey, error: vaultError } = await supabase
      .rpc("get_vault_secret", { key_name: "RESEND_API_KEY" });
    const resendApiKey = vaultError ? undefined : (vaultKey as string | undefined);

    const emailSubject = "Votre code de vérification — Feed Formular";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #059669; font-size: 24px; margin: 0;">Feed Formular</h1>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">PRAVET PLUS</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; text-align: center;">
          <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px;">Code de vérification</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 20px;">
            Voici votre code de vérification à 6 chiffres :
          </p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #059669; padding: 16px; background: #ecfdf5; border-radius: 8px; display: inline-block;">
            ${otpCode}
          </div>
          <p style="color: #64748b; font-size: 12px; margin: 20px 0 0;">
            Ce code expire dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez cet email.
          </p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
          © 2026 PRAVET PLUS — Bénin, Zinvié
        </p>
      </div>
    `;

    if (resendApiKey && resendApiKey !== 'PLACEHOLDER_REPLACE_ME') {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Feed Formular <noreply@resend.dev>",
          to: [normalizedEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error("Resend error:", errText);
        return new Response(
          JSON.stringify({ error: "Failed to send email. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else {
      console.log("No RESEND_API_KEY — code generated but email not sent");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Code sent successfully" }),
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
