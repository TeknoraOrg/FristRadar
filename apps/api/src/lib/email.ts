import type { Env } from '../types';

export async function sendEmail(to: string, subject: string, html: string, env: Env): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM || 'FristRadar <noreply@fristradar.de>';

  if (!apiKey) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[Email] Failed to send to ${to}: ${response.status} ${text}`);
  }
}

export function emailVerificationOtpTemplate(params: { code: string }) {
  return {
    subject: 'Dein FristRadar Verifizierungscode',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2>E-Mail-Verifizierung</h2>
        <p>Dein Verifizierungscode lautet:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
          ${params.code}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">Dieser Code ist 10 Minuten gueltig.</p>
      </div>
    `,
  };
}

export function passwordResetOtpTemplate(params: { code: string }) {
  return {
    subject: 'FristRadar Passwort zuruecksetzen',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2>Passwort zuruecksetzen</h2>
        <p>Dein Code zum Zuruecksetzen des Passworts:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
          ${params.code}
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">Dieser Code ist 10 Minuten gueltig.</p>
      </div>
    `,
  };
}
