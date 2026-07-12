import { Hono } from 'hono';
import type { Env } from '../types';
import { now } from '../lib/db';
import { sendEmail } from '../lib/email';

const app = new Hono<{ Bindings: Env }>();

// Webinar registration capture. Add new webinars here as their pages go live.
const WEBINARS: Record<string, { name: string }> = {
  'defensible-ai': {
    name: 'Defensible Use of AI in Psychological Assessment',
  },
};

const TRACKS = new Set(['forensic', 'clinical', 'general']);

/**
 * POST /api/webinar/register
 * body: { email, webinar, track? }
 * Captures the registration and sends a confirmation. Date TBA registrations
 * receive the invite by email once scheduling lands.
 */
app.post('/register', async (c) => {
  const body = await c.req.json<{ email?: string; webinar?: string; track?: string }>().catch(() => null);
  if (!body?.email || !body?.webinar) return c.json({ error: 'bad_request' }, 400);

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'invalid_email' }, 400);
  }

  const webinar = WEBINARS[body.webinar];
  if (!webinar) return c.json({ error: 'unknown_webinar' }, 400);

  const track = TRACKS.has(body.track ?? '') ? (body.track as string) : 'general';

  await c.env.DB.prepare(
    `INSERT INTO webinar_leads (email, webinar, track, created_at) VALUES (?, ?, ?, ?)`,
  )
    .bind(email, body.webinar, track, now())
    .run();

  const text = `You are registered.

${webinar.name}

The live date is being finalized with our presenting clinician. Your invite, with the date, time, and join link, will arrive at this address as soon as it is set. Registrants also receive the session recording.

In the meantime, the free report templates and the product demo are at ${c.env.APP_URL}.

Questions: support@boreasworkflow.com

Foundry SMB
`;

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:20px;margin:0 0 8px;">You are registered.</h1>
<p style="margin:0 0 20px;color:#444;">${webinar.name}</p>
<p style="margin:0 0 20px;color:#444;">The live date is being finalized with our presenting clinician. Your invite, with the date, time, and join link, will arrive at this address as soon as it is set. Registrants also receive the session recording.</p>
<p style="margin:0 0 20px;color:#444;">In the meantime, the <a href="${c.env.APP_URL}/templates/">free report templates</a> and the <a href="${c.env.APP_URL}/demo.html">product demo</a> are worth a look.</p>
<p style="margin:0;color:#666;font-size:13px;">Questions: <a href="mailto:support@boreasworkflow.com">support@boreasworkflow.com</a></p>
</body></html>`;

  // Registration must not fail if email delivery hiccups.
  try {
    await sendEmail(c.env, { to: email, subject: `Registered: ${webinar.name}`, html, text });
  } catch (err) {
    console.error('webinar_email_failed', err);
  }

  return c.json({ ok: true });
});

export default app;
