/**
 * Email Drip Campaign Service
 * Sprint 16 — Story 8-3: Automated email sequences for user onboarding
 *
 * Supports: Resend, SendGrid, or SMTP transports
 * Drip schedule: Day 0 (welcome), Day 1 (first quote), Day 3 (AI tips),
 *                Day 7 (upgrade), Day 14 (NPS feedback)
 */

// ============================================================================
// Types
// ============================================================================

export type DripEmailType =
  | "welcome"           // Day 0: Welcome + quick start
  | "first_quote"       // Day 1: First quote reminder (if no quotes)
  | "ai_tips"           // Day 3: AI generation tips
  | "upgrade_prompt"    // Day 7: Upgrade to Pro (if active + free plan)
  | "nps_feedback";     // Day 14: NPS survey

export interface DripEmail {
  type: DripEmailType;
  dayOffset: number;
  subject: string;
  condition?: (user: DripUserContext) => boolean;
}

export interface DripUserContext {
  id: string;
  email: string;
  name: string;
  plan: string;
  quotesCount: number;
  lastActiveAt: string | null;
  createdAt: string;
  emailPreferences?: {
    drip_campaign?: boolean;
    marketing?: boolean;
  };
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  unsubscribeUrl?: string;
}

// ============================================================================
// Drip Schedule
// ============================================================================

export const DRIP_SCHEDULE: DripEmail[] = [
  {
    type: "welcome",
    dayOffset: 0,
    subject: "Bienvenue sur DEAL — Créez votre premier devis IA",
  },
  {
    type: "first_quote",
    dayOffset: 1,
    subject: "Avez-vous créé votre premier devis ?",
    condition: (user) => user.quotesCount === 0,
  },
  {
    type: "ai_tips",
    dayOffset: 3,
    subject: "3 astuces pour des devis IA parfaits",
  },
  {
    type: "upgrade_prompt",
    dayOffset: 7,
    subject: "Passez à Pro — Devis illimités et plus",
    condition: (user) => user.plan === "free" && user.quotesCount > 0,
  },
  {
    type: "nps_feedback",
    dayOffset: 14,
    subject: "Votre avis compte — Évaluez DEAL",
  },
];

// ============================================================================
// Email Templates
// ============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.dealofficialapp.com";

function getUnsubscribeUrl(userId: string): string {
  return `${BASE_URL}/api/email/unsubscribe?uid=${userId}`;
}

function wrapTemplate(content: string, userId: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0D1B2A; font-size: 24px; margin: 0;">DEAL</h1>
      <p style="color: #C9A962; font-size: 14px; margin: 4px 0 0;">Devis IA pour artisans belges</p>
    </div>
    ${content}
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
    <p style="color: #999; font-size: 12px; text-align: center;">
      <a href="${getUnsubscribeUrl(userId)}" style="color: #999;">Se désabonner</a> ·
      DEAL SRL · Belgique
    </p>
  </div>
</body>
</html>`;
}

export function getDripEmailHtml(type: DripEmailType, user: DripUserContext): string {
  const templates: Record<DripEmailType, string> = {
    welcome: `
      <h2 style="color: #0D1B2A;">Bienvenue ${user.name} 👋</h2>
      <p>Votre compte DEAL est prêt. Créez votre premier devis IA en moins de 5 minutes :</p>
      <ol>
        <li>Décrivez vos travaux (texte ou dictée vocale)</li>
        <li>L'IA génère un devis professionnel</li>
        <li>Exportez en PDF et envoyez au client</li>
      </ol>
      <a href="${BASE_URL}/quotes/new" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #0D1B2A; text-decoration: none; border-radius: 6px; font-weight: bold;">Créer mon premier devis</a>
    `,
    first_quote: `
      <h2 style="color: #0D1B2A;">Votre premier devis vous attend</h2>
      <p>Bonjour ${user.name},</p>
      <p>Vous n'avez pas encore créé de devis. Essayez maintenant — c'est gratuit et ça prend 2 minutes.</p>
      <a href="${BASE_URL}/quotes/new?mode=sample" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #0D1B2A; text-decoration: none; border-radius: 6px; font-weight: bold;">Essayer avec un exemple</a>
    `,
    ai_tips: `
      <h2 style="color: #0D1B2A;">3 astuces pour des devis parfaits</h2>
      <p>Bonjour ${user.name},</p>
      <ol>
        <li><strong>Soyez précis :</strong> Plus votre description est détaillée, plus le devis est exact</li>
        <li><strong>Utilisez la dictée vocale :</strong> Parlez naturellement, l'IA comprend le jargon métier</li>
        <li><strong>Personnalisez les templates :</strong> Ajoutez votre logo et vos couleurs</li>
      </ol>
      <a href="${BASE_URL}/quotes/new" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #0D1B2A; text-decoration: none; border-radius: 6px; font-weight: bold;">Créer un devis</a>
    `,
    upgrade_prompt: `
      <h2 style="color: #0D1B2A;">Passez au niveau supérieur</h2>
      <p>Bonjour ${user.name},</p>
      <p>Vous avez déjà créé ${user.quotesCount} devis — bravo ! Avec le plan Pro :</p>
      <ul>
        <li>✅ 100 devis/mois (au lieu de 5)</li>
        <li>✅ 10 secteurs d'activité</li>
        <li>✅ Templates PDF premium</li>
        <li>✅ Support prioritaire</li>
      </ul>
      <a href="${BASE_URL}/pricing" style="display: inline-block; padding: 12px 24px; background: #C9A962; color: #0D1B2A; text-decoration: none; border-radius: 6px; font-weight: bold;">Voir les plans →</a>
    `,
    nps_feedback: `
      <h2 style="color: #0D1B2A;">Votre avis compte</h2>
      <p>Bonjour ${user.name},</p>
      <p>Ça fait 2 semaines que vous utilisez DEAL. Comment évaluez-vous votre expérience ?</p>
      <p style="text-align: center; font-size: 24px; letter-spacing: 8px;">
        ${[1,2,3,4,5,6,7,8,9,10].map(n =>
          `<a href="${BASE_URL}/api/email/nps?uid=${user.id}&score=${n}" style="text-decoration: none; color: #0D1B2A;">${n}</a>`
        ).join(' ')}
      </p>
      <p style="text-align: center; color: #999; font-size: 12px;">1 = Pas du tout · 10 = Absolument</p>
    `,
  };

  return wrapTemplate(templates[type], user.id);
}

// ============================================================================
// Send Email (Provider-agnostic)
// ============================================================================

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.warn("[Email] No email provider configured (RESEND_API_KEY or SENDGRID_API_KEY)");
    return { success: false, error: "No email provider configured" };
  }

  try {
    if (process.env.RESEND_API_KEY) {
      // Resend provider
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: params.from || "DEAL <noreply@dealofficialapp.com>",
          to: params.to,
          subject: params.subject,
          html: params.html,
          reply_to: params.replyTo,
          headers: params.unsubscribeUrl
            ? { "List-Unsubscribe": `<${params.unsubscribeUrl}>` }
            : undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        return { success: false, error };
      }
      return { success: true };
    }

    // Fallback: log in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Email] Would send:", { to: params.to, subject: params.subject });
      return { success: true };
    }

    return { success: false, error: "No supported provider" };
  } catch (error: any) {
    console.error("[Email] Send failed:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Drip Campaign Runner
// ============================================================================

export function shouldSendDrip(
  email: DripEmail,
  user: DripUserContext,
  sentEmails: DripEmailType[]
): boolean {
  // Already sent
  if (sentEmails.includes(email.type)) return false;

  // User unsubscribed
  if (user.emailPreferences?.drip_campaign === false) return false;

  // Check day offset
  const daysSinceSignup = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceSignup < email.dayOffset) return false;

  // Check condition
  if (email.condition && !email.condition(user)) return false;

  return true;
}

export async function processDripForUser(
  user: DripUserContext,
  sentEmails: DripEmailType[]
): Promise<DripEmailType[]> {
  const sent: DripEmailType[] = [];

  for (const drip of DRIP_SCHEDULE) {
    if (shouldSendDrip(drip, user, [...sentEmails, ...sent])) {
      const html = getDripEmailHtml(drip.type, user);
      const result = await sendEmail({
        to: user.email,
        subject: drip.subject,
        html,
        unsubscribeUrl: getUnsubscribeUrl(user.id),
      });

      if (result.success) {
        sent.push(drip.type);
      }
    }
  }

  return sent;
}
