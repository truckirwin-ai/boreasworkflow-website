import { Hono } from 'hono';
import type { Env } from '../types';
import { now } from '../lib/db';
import { sendEmail } from '../lib/email';

const app = new Hono<{ Bindings: Env }>();

// Email-gated report template downloads (SEO templates cluster).
// Add new templates here as their pages go live.
const TEMPLATES: Record<string, { name: string; file: string; track: 'forensic' | 'clinical' }> = {
  cst: {
    name: 'Competency to Stand Trial (CST) Report Template',
    file: 'boreas-cst-report-template.docx',
    track: 'forensic',
  },
  'violence-risk': {
    name: 'Violence Risk Assessment Report Template',
    file: 'boreas-violence-risk-report-template.docx',
    track: 'forensic',
  },
  'child-custody': {
    name: 'Child Custody Evaluation Report Template',
    file: 'boreas-child-custody-report-template.docx',
    track: 'forensic',
  },
};

/**
 * POST /api/templates/request
 * body: { email, template }
 * Captures the lead, emails the download link, and returns the link inline
 * (same pattern as the trial flow: the email is the capture, not a wall).
 */
app.post('/request', async (c) => {
  const body = await c.req.json<{ email?: string; template?: string }>().catch(() => null);
  if (!body?.email || !body?.template) return c.json({ error: 'bad_request' }, 400);

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'invalid_email' }, 400);
  }

  const tpl = TEMPLATES[body.template];
  if (!tpl) return c.json({ error: 'unknown_template' }, 400);

  const url = `${c.env.APP_URL}/templates/${tpl.file}`;

  await c.env.DB.prepare(
    `INSERT INTO template_leads (email, template, track, created_at) VALUES (?, ?, ?, ?)`,
  )
    .bind(email, body.template, tpl.track, now())
    .run();

  const text = `Here is your download link:

${tpl.name}
${url}

The template is a Word document. Every heading, table, and boilerplate block is editable; replace the bracketed placeholders with your own language.

Boreas Workflow generates reports like this one from your case file, in your own voice, with every diagnostic decision audit-logged and PHI kept on your machine. 10-day free trial, no card: ${c.env.APP_URL}/download#trial

Questions: support@boreasworkflow.com

Foundry SMB
`;

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:20px;margin:0 0 8px;">Your template is ready</h1>
<p style="margin:0 0 20px;color:#444;">${tpl.name}</p>
<p style="margin:0 0 20px;"><a href="${url}" style="display:inline-block;background:#0969da;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none;font-weight:600;">Download the template (.docx)</a></p>
<p style="margin:0 0 20px;color:#444;">Every heading, table, and boilerplate block is editable; replace the bracketed placeholders with your own language.</p>
<p style="margin:0 0 20px;color:#444;">Boreas Workflow generates reports like this one from your case file, in your own voice, with every diagnostic decision audit-logged and PHI kept on your machine. <a href="${c.env.APP_URL}/download#trial">10-day free trial, no card.</a></p>
<p style="margin:0;color:#666;font-size:13px;">Questions: <a href="mailto:support@boreasworkflow.com">support@boreasworkflow.com</a></p>
</body></html>`;

  // Lead capture must not fail the download if email delivery hiccups.
  try {
    await sendEmail(c.env, { to: email, subject: `Your ${tpl.name}`, html, text });
  } catch (err) {
    console.error('template_email_failed', err);
  }

  return c.json({ ok: true, url });
});

export default app;
