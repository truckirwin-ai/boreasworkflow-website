import type { Env, Subscription } from '../types';
import { sendEmail } from './email';
import { now } from './db';

/**
 * Trial nurture sequence (day 3 / 7 / 10). Day 0 rides the key-delivery
 * fulfillment email. Copy source: docs/gtm/TRIAL_NURTURE_SEQUENCE.md
 * (neutral variants; subscriptions carry no track tag).
 *
 * Invariants:
 *   - never email a suppressed address (email_suppressions)
 *   - never send the same step twice (nurture_sends primary key)
 *   - never send stale copy: a step more than STALE_AFTER_DAYS past due is
 *     recorded as skipped, not sent (protects trials that predate the cron)
 *   - nurture stops on conversion (converted_to_sub_id) and on any
 *     non-active status
 */

const SITE = 'https://boreasworkflow.com';
const API = 'https://api.boreasclinical.com';
const PRICING_URL = `${SITE}/download`;
const SUPPORT = 'support@boreasworkflow.com';

export const NURTURE_STEPS = [3, 7, 10] as const;
export type NurtureStep = (typeof NURTURE_STEPS)[number];

const STALE_AFTER_DAYS = 3;

export async function unsubscribeSig(env: Env, email: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.DOWNLOAD_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`unsub|${email}`));
  return b64url(new Uint8Array(sig));
}

export async function unsubscribeUrl(env: Env, email: string): Promise<string> {
  const s = await unsubscribeSig(env, email);
  return `${API}/api/email/unsubscribe?e=${encodeURIComponent(email)}&s=${s}`;
}

interface StepEmail {
  subject: string;
  text: string;
  html: string;
}

function buildStepEmail(step: NurtureStep, unsubUrl: string): StepEmail {
  let subject: string;
  let body: string;

  if (step === 3) {
    subject = 'Have you run a case through yet?';
    body = `Quick check: have you taken a case to the report stage yet? That is where the trial earns its keep.

If you have not, here is the shortest path:
1. Open a demo case from the case list.
2. Move it through to the diagnostics stage and render your decisions.
3. Generate the report draft and read it in your own structure.

Most people are surprised by two things: how much of the first draft is usable, and how completely the case file stays local.

Stuck on anything? Reply here or reach ${SUPPORT}.

Foundry SMB`;
  } else if (step === 7) {
    subject = 'Founder pricing is capped at 100 seats';
    body = `You are three days from the end of your trial, so here is the honest pitch.

The first 100 seats lock in founder pricing at $199 per seat per month, for the life of the account. After 100, the rate is $299. This is not a fake countdown. When the seats are gone, the founder rate is gone.

If Boreas has saved you real time on even one report during the trial, the math is straightforward: one recovered afternoon a week pays for the seat several times over.

Claim your founder seat: ${PRICING_URL}

Want a walkthrough before you decide, or have a practice with several evaluators? Reply and we will set up 15 minutes.

Foundry SMB`;
  } else {
    subject = 'Your trial ends today';
    body = `Your trial ends today. Two things to know:

- Your data is yours. It never left your machine, and nothing is deleted from anywhere on our side, because it was never on our side.
- The founder rate is still open while seats remain: $199 per seat per month for life, first 100 seats. Activate here: ${PRICING_URL}

If now is not the time, that is fine. Reply and tell me what was missing or what got in the way. That feedback shapes what we build next, and I read every one.

If you want to come back later, your key can be reactivated. Just email ${SUPPORT}.

Thanks for giving it an honest look.

Foundry SMB`;
  }

  const text = `${body}

Unsubscribe from trial emails: ${unsubUrl}
`;

  const paragraphs = body
    .split('\n\n')
    .map((p) => `<p style="margin:0 0 16px;white-space:pre-wrap;">${escapeHtml(p)}</p>`)
    .join('\n');

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
${paragraphs}
<p style="margin:24px 0 0;color:#999;font-size:12px;"><a href="${unsubUrl}" style="color:#999;">Unsubscribe from trial emails</a></p>
</body></html>`;

  return { subject, text, html };
}

export interface NurtureResult {
  considered: number;
  sent: number;
  skipped_stale: number;
}

export async function runNurture(env: Env): Promise<NurtureResult> {
  const t = now();
  const cutoff = t - NURTURE_STEPS[0] * 86400;

  const res = await env.DB.prepare(
    `SELECT * FROM subscriptions
     WHERE tier = 'trial' AND status = 'active' AND converted_to_sub_id IS NULL
       AND created_at <= ?
       AND customer_email NOT IN (SELECT email FROM email_suppressions)`,
  )
    .bind(cutoff)
    .all<Subscription>();

  const subs = res.results ?? [];
  let sent = 0;
  let skippedStale = 0;

  for (const sub of subs) {
    const elapsedDays = Math.floor((t - sub.created_at) / 86400);
    const due = [...NURTURE_STEPS].reverse().find((s) => elapsedDays >= s);
    if (!due) continue;

    const already = await env.DB.prepare(
      `SELECT 1 AS x FROM nurture_sends WHERE subscription_id = ? AND step = ?`,
    )
      .bind(sub.id, due)
      .first();
    if (already) continue;

    const stale = elapsedDays > due + STALE_AFTER_DAYS;
    if (stale) {
      skippedStale++;
    } else {
      const unsubUrl = await unsubscribeUrl(env, sub.customer_email);
      const msg = buildStepEmail(due, unsubUrl);
      try {
        await sendEmail(env, {
          to: sub.customer_email,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          replyTo: SUPPORT,
          headers: {
            'List-Unsubscribe': `<${unsubUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });
        sent++;
      } catch (e) {
        // Leave nurture_sends unwritten so the next run retries this step.
        console.error('nurture_send_failed', sub.id, due, e);
        continue;
      }
    }

    // Record the due step plus every earlier step so late signups never
    // receive out-of-order or stacked emails.
    const stmts = NURTURE_STEPS.filter((s) => s <= due).map((s) =>
      env.DB.prepare(
        `INSERT OR IGNORE INTO nurture_sends (subscription_id, step, sent_at) VALUES (?, ?, ?)`,
      ).bind(sub.id, s, t),
    );
    await env.DB.batch(stmts);
  }

  console.log('nurture_run', JSON.stringify({ considered: subs.length, sent, skipped_stale: skippedStale }));
  return { considered: subs.length, sent, skipped_stale: skippedStale };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
