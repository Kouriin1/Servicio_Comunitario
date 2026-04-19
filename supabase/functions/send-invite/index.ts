// @ts-nocheck
// Edge Function: send-invite
// Genera un link de invitación con Supabase Admin API y envía el correo
// vía SMTP (Gmail por defecto) usando denomailer.
// Solo los admins pueden llamarla (verificado vía JWT + tabla profiles).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ─── HTML del correo de invitación ───

function buildInviteHtml(data: {
  firstName: string;
  inviteUrl: string;
  inviterName: string;
}): string {
  const safeName = data.firstName || "Estudiante";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#002855,#001a3a); padding:32px; text-align:center;">
            <h1 style="color:#FFB81C; margin:0; font-size:28px; letter-spacing:1px;">USM RED</h1>
            <p style="color:#ffffffcc; margin:6px 0 0; font-size:13px;">Red Académica — Universidad Santa María</p>
          </td>
        </tr>

        <!-- Saludo -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <h2 style="color:#002855; font-size:20px; margin:0 0 12px;">¡Has sido invitado!</h2>
            <p style="color:#333; font-size:15px; margin:0;">Hola <strong>${safeName}</strong>,</p>
            <p style="color:#555; font-size:14px; line-height:1.6; margin:12px 0 0;">
              <strong>${data.inviterName}</strong> te ha invitado a unirte a <strong>USM RED</strong>,
              la red académica de la Universidad Santa María. Para activar tu cuenta y configurar
              tu contraseña, haz click en el botón de abajo.
            </p>
          </td>
        </tr>

        <!-- Botón -->
        <tr>
          <td style="padding:24px 32px;" align="center">
            <a href="${data.inviteUrl}"
               style="display:inline-block; background:#0D6EFD; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:bold; font-size:15px;">
              Activar mi cuenta
            </a>
          </td>
        </tr>

        <!-- Link alternativo -->
        <tr>
          <td style="padding:0 32px 20px;">
            <p style="color:#888; font-size:12px; margin:0 0 6px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="color:#0D6EFD; font-size:12px; word-break:break-all; margin:0;">${data.inviteUrl}</p>
          </td>
        </tr>

        <!-- Aviso -->
        <tr>
          <td style="padding:8px 32px 24px;">
            <p style="color:#999; font-size:12px; margin:0;">
              Este enlace de invitación es personal y de un solo uso. Si no esperabas esta invitación, puedes ignorar este correo.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8; padding:16px 32px; text-align:center; border-top:1px solid #eee;">
            <p style="color:#999; font-size:11px; margin:0;">
              Este correo fue generado automáticamente por USM RED. No responder.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Edge Function ───

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  try {
    const smtpUser = Deno.env.get("SMTP_USER") ?? "";
    const smtpPassword = Deno.env.get("SMTP_PASSWORD") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!smtpUser || !smtpPassword) {
      return jsonResponse(500, {
        error: "missing_smtp_config",
        message: "SMTP_USER y SMTP_PASSWORD no configurados en Secrets.",
      });
    }

    // ─── Autenticación: verificar que el que llama es admin ───
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { error: "missing_authorization_header" });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user: caller },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !caller) {
      return jsonResponse(401, { error: "invalid_user_session" });
    }

    const { data: callerProfile, error: profErr } = await userClient
      .from("profiles")
      .select("role, display_name, first_name")
      .eq("id", caller.id)
      .single();

    if (profErr || callerProfile?.role !== "admin") {
      return jsonResponse(403, { error: "admin_role_required" });
    }

    // ─── Parse body ───
    const body = await req.json().catch(() => null);
    if (!body) return jsonResponse(400, { error: "invalid_body" });

    const { email, first_name, last_name, faculty_id, redirect_to } = body;

    if (!email || typeof email !== "string") {
      return jsonResponse(400, { error: "email_required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return jsonResponse(400, { error: "invalid_email_format" });
    }

    // ─── Validar si el correo ya existe en auth.users ───
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let page = 1;
    const perPage = 1000;
    let existingUser: any = null;

    while (true) {
      const { data: listData, error: listErr } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      });
      if (listErr) break;
      const found = listData?.users?.find(
        (u: any) => (u.email || "").toLowerCase() === normalizedEmail,
      );
      if (found) {
        existingUser = found;
        break;
      }
      if (!listData?.users || listData.users.length < perPage) break;
      page++;
      if (page > 20) break; // hard stop de seguridad (20k usuarios)
    }

    if (existingUser) {
      if (existingUser.email_confirmed_at) {
        return jsonResponse(409, {
          error: "email_already_registered",
          message: "Este correo ya tiene una cuenta activa en USM RED.",
        });
      }
      return jsonResponse(409, {
        error: "invite_already_pending",
        message: "Ya hay una invitación pendiente para este correo. El usuario aún no ha activado su cuenta.",
      });
    }

    // ─── Generar el link de invitación (sin enviar correo automático) ───
    const { data: linkData, error: linkError } = await adminClient.auth.admin
      .generateLink({
        type: "invite",
        email: normalizedEmail,
        options: {
          data: {
            first_name: (first_name || "").toString().trim(),
            last_name: (last_name || "").toString().trim(),
            faculty_id: faculty_id || null,
            invited: true,
            invited_by: caller.id,
          },
          redirectTo: redirect_to || undefined,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      return jsonResponse(400, {
        error: "generate_link_failed",
        details: linkError?.message || "No se pudo generar el link de invitación",
      });
    }

    const inviteUrl = linkData.properties.action_link;
    const inviterName = callerProfile.display_name ||
      callerProfile.first_name || "Un administrador";

    // ─── Enviar correo vía SMTP ───
    const smtpHost = Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") ?? "465", 10);
    const smtpFrom = Deno.env.get("SMTP_FROM") ?? smtpUser;

    const html = buildInviteHtml({
      firstName: (first_name || "").toString().trim(),
      inviteUrl,
      inviterName,
    }).split("\n").map((l) => l.trim()).join("\n");

    const configs = [
      { hostname: smtpHost, port: smtpPort, tls: smtpPort === 465 },
    ];
    if (smtpPort === 465) {
      configs.push({ hostname: smtpHost, port: 587, tls: false });
    }

    let sent = false;
    let lastError = "";

    for (const cfg of configs) {
      try {
        const smtpClient = new SMTPClient({
          connection: {
            hostname: cfg.hostname,
            port: cfg.port,
            tls: cfg.tls,
            auth: { username: smtpUser, password: smtpPassword },
          },
        });

        await smtpClient.send({
          from: `USM RED <${smtpFrom}>`,
          to: normalizedEmail,
          subject: "Invitación a USM RED",
          content: `Has sido invitado a USM RED. Activa tu cuenta aquí: ${inviteUrl}`,
          html,
        });

        await smtpClient.close();
        sent = true;
        break;
      } catch (smtpErr) {
        lastError = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
        console.error(`SMTP ${cfg.hostname}:${cfg.port} falló: ${lastError}`);
      }
    }

    if (!sent) {
      return jsonResponse(500, {
        error: "smtp_all_failed",
        details: lastError,
        tried: configs.map((c) => `${c.hostname}:${c.port}`),
      });
    }

    return jsonResponse(200, {
      success: true,
      message: `Invitación enviada a ${normalizedEmail}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.error("send-invite error:", message);
    return jsonResponse(500, { error: "invite_failed", details: message });
  }
});
