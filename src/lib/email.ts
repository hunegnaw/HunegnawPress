/**
 * Email sending via the Elastic Email API (v2).
 *
 * Configuration (all optional — if the API key is missing, sends are skipped
 * gracefully so dependent flows like newsletter signup still succeed):
 *   ELASTIC_EMAIL_API_KEY  — your Elastic Email API key
 *   EMAIL_FROM             — the sender address, e.g. noreply@yourdomain.com
 *   EMAIL_FROM_NAME        — the sender display name, e.g. "Hunegnaw Press"
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.ELASTIC_EMAIL_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || "";

  if (!apiKey || !from) {
    return { success: false, skipped: true };
  }

  try {
    const body = new URLSearchParams({
      apikey: apiKey,
      from,
      fromName,
      to,
      subject,
      bodyHtml: html,
      bodyText: text || stripHtml(html),
      isTransactional: "true",
    });

    const res = await fetch("https://api.elasticemail.com/v2/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = (await res.json()) as { success?: boolean; error?: string };

    if (!res.ok || data.success === false) {
      const error = data.error || `Elastic Email responded ${res.status}`;
      console.error("Email send failed:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("Email send error:", message);
    return { success: false, error: message };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
