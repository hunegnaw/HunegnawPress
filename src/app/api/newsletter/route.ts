import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { getOrganization } from "@/lib/organization";

const newsletterLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    const rateLimit = newsletterLimiter(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Determine whether this is a fresh subscription (new email or a
    // previously unsubscribed one) so we only send the welcome email then.
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { unsubscribedAt: true },
    });
    const isNewSubscription = !existing || existing.unsubscribedAt !== null;

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {
        unsubscribedAt: null,
        subscribedAt: new Date(),
      },
      create: {
        email,
      },
    });

    // Fire the welcome email (best effort — never fail the signup over it).
    if (isNewSubscription) {
      try {
        const org = await getOrganization();
        await sendEmail({
          to: email,
          subject: `Welcome to the ${org?.name || "newsletter"} newsletter`,
          html: buildWelcomeEmail(org),
        });
      } catch (err) {
        console.error("Welcome email error:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildWelcomeEmail(
  org: { name: string; secondaryColor: string; website: string | null } | null
): string {
  const name = org?.name || "our newsletter";
  const accent = org?.secondaryColor || "#2563eb";
  const site = org?.website || "";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${accent};height:6px;"></td>
            </tr>
            <tr>
              <td style="padding:40px 40px 16px;">
                <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#0f172a;">You're subscribed 🎉</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
                  Thanks for subscribing to the <strong>${name}</strong> newsletter. You'll be the
                  first to hear about new releases, stories, and announcements.
                </p>
                ${
                  site
                    ? `<p style="margin:24px 0 0;"><a href="${site}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;padding:12px 24px;border-radius:6px;">Visit our site</a></p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 40px;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                  You received this email because you subscribed at ${name}.<br/>
                  © ${year} ${name}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
