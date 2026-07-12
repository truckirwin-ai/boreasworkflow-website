import { Hono } from 'hono';
import type { Env } from '../types';
import { now } from '../lib/db';
import { unsubscribeSig } from '../lib/nurture';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET  /api/email/unsubscribe?e=<email>&s=<sig>  human click from the footer link
 * POST /api/email/unsubscribe?e=<email>&s=<sig>  RFC 8058 one-click (List-Unsubscribe-Post)
 *
 * Signature is HMAC-SHA256('unsub|' + email) with DOWNLOAD_SIGNING_SECRET, so a
 * third party cannot unsubscribe arbitrary addresses.
 */
async function handle(c: { env: Env; req: { query: (k: string) => string | undefined } }): Promise<{ ok: boolean; email?: string }> {
  const email = (c.req.query('e') ?? '').trim().toLowerCase();
  const sig = c.req.query('s') ?? '';
  if (!email || !sig) return { ok: false };

  const expected = await unsubscribeSig(c.env, email);
  if (!timingSafeEqual(sig, expected)) return { ok: false };

  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO email_suppressions (email, reason, created_at) VALUES (?, 'unsubscribe', ?)`,
  )
    .bind(email, now())
    .run();
  return { ok: true, email };
}

app.get('/', async (c) => {
  const result = await handle(c);
  if (!result.ok) return c.text('Invalid unsubscribe link.', 400);
  return c.html(`<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:20px;margin:0 0 12px;">You are unsubscribed.</h1>
<p style="margin:0 0 8px;">No more trial emails will be sent to ${escapeHtml(result.email!)}.</p>
<p style="margin:0;color:#666;font-size:13px;">Transactional emails you request directly (license keys, receipts) are unaffected. Questions: support@boreasworkflow.com</p>
</body></html>`);
});

app.post('/', async (c) => {
  const result = await handle(c);
  if (!result.ok) return c.json({ error: 'invalid_link' }, 400);
  return c.json({ ok: true });
});

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default app;
