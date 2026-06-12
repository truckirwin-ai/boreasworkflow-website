// Cloudflare Pages Function: POST /api/feedback
//
// Accepts product feedback with optional contact information. Submissions can
// be anonymous, but the form still uses a honeypot and rate limiting to keep
// bot traffic down.

interface Env {
  RESEND_API_KEY: string;
  FEEDBACK_FROM_EMAIL?: string;
  FEEDBACK_TO_EMAIL?: string;
  RATE_LIMIT?: KVNamespace;
}

interface FeedbackPayload {
  area: string;
  urgency: string;
  role?: string;
  context?: string;
  problem: string;
  success?: string;
  feedback?: string;
  name?: string;
  email?: string;
  updates?: boolean;
  company?: string;
}

const DEFAULT_FROM = 'Boreas Workflow Feedback <feedback@boreasworkflow.com>';
const DEFAULT_TO = 'feedback@boreasworkflow.com';
const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_WINDOW_SECONDS = 3600;
const RATE_LIMIT_MAX = 5;
const VALID_AREAS = new Set(['workflow', 'records', 'intake', 'reports', 'organization', 'collaboration', 'billing', 'other']);
const VALID_URGENCY = new Set(['critical', 'high', 'medium', 'low']);

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const ct = ctx.request.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) {
      return json({ ok: false, error: 'expected application/json' }, 415);
    }

    const raw = await ctx.request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: 'payload too large' }, 413);
    }

    const payload = parseFeedbackPayload(raw);
    if (!payload.ok) {
      return json({ ok: false, error: payload.error }, 400);
    }

    if ((payload.data.company ?? '').trim().length > 0) {
      return json({ ok: true });
    }

    const ip = ctx.request.headers.get('cf-connecting-ip') ?? 'unknown';
    const rateOk = await checkRateLimit(ctx.env, `feedback:${ip}`);
    if (!rateOk) {
      return json({ ok: false, error: 'rate limit exceeded, try again later' }, 429);
    }

    if (!ctx.env.RESEND_API_KEY) {
      return json({ ok: false, error: 'mail not configured' }, 503);
    }

    const from = ctx.env.FEEDBACK_FROM_EMAIL ?? DEFAULT_FROM;
    const to = ctx.env.FEEDBACK_TO_EMAIL ?? DEFAULT_TO;
    const { subject, html, text } = renderFeedbackEmail(payload.data, ip);

    await sendViaResend(ctx.env.RESEND_API_KEY, {
      from,
      to,
      reply_to: payload.data.email && payload.data.updates ? payload.data.email : '',
      subject,
      html,
      text,
    });

    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'internal error, try again later' }, 500);
  }
};

type ParseResult = { ok: true; data: FeedbackPayload } | { ok: false; error: string };

function parseFeedbackPayload(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'invalid json' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'invalid payload' };
  }
  const obj = parsed as Record<string, unknown>;

  const area = asString(obj.area, 40);
  const urgency = asString(obj.urgency, 20);
  const role = asString(obj.role, 120) ?? '';
  const context = asString(obj.context, 160) ?? '';
  const problem = asString(obj.problem, 5000);
  const success = asString(obj.success, 3000) ?? '';
  const feedback = asString(obj.feedback, 4000) ?? '';
  const name = asString(obj.name, 120) ?? '';
  const email = asString(obj.email, 200) ?? '';
  const updates = Boolean(obj.updates);
  const company = asString(obj.company, 200) ?? '';

  if (!area || !VALID_AREAS.has(area)) return { ok: false, error: 'invalid area' };
  if (!urgency || !VALID_URGENCY.has(urgency)) return { ok: false, error: 'invalid urgency' };
  if (!problem || problem.length < 10) return { ok: false, error: 'problem is too short' };
  if (email && !isEmail(email)) return { ok: false, error: 'valid email is required' };
  if (updates && !email) return { ok: false, error: 'email is required to receive updates' };

  return { ok: true, data: { area, urgency, role, context, problem, success, feedback, name, email, updates, company } };
}

async function checkRateLimit(env: Env, key: string): Promise<boolean> {
  if (!env.RATE_LIMIT) return true;
  const raw = await env.RATE_LIMIT.get(key);
  const count = raw ? Number(raw) : 0;
  if (count >= RATE_LIMIT_MAX) return false;
  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return true;
}

function renderFeedbackEmail(p: FeedbackPayload, ip: string): { subject: string; html: string; text: string } {
  const subject = `[feedback/${p.urgency}/${p.area}] ${p.problem.slice(0, 80)}`;
  const contact = p.name || p.email ? 'Yes' : 'No';
  const updates = p.updates ? 'Yes' : 'No';

  const text = `New product feedback

Area:      ${p.area}
Urgency:   ${p.urgency}
Role:      ${p.role || '-'}
Context:   ${p.context || '-'}
Name:      ${p.name || '-'}
Email:     ${p.email || '-'}
Updates:   ${updates}
Contact:   ${contact}
IP:        ${ip}

Problem:
${p.problem}

Success:
${p.success || '-'}

More:
${p.feedback || '-'}
`;

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:18px;margin:0 0 12px;">New product feedback</h1>
<table style="border-collapse:collapse;font-size:14px;margin:0 0 20px;">
<tr><td style="padding:4px 12px 4px 0;color:#666;">Area</td><td style="padding:4px 0;">${escapeHtml(p.area)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Urgency</td><td style="padding:4px 0;">${escapeHtml(p.urgency)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Role</td><td style="padding:4px 0;">${escapeHtml(p.role || '-')}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Context</td><td style="padding:4px 0;">${escapeHtml(p.context || '-')}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td style="padding:4px 0;">${escapeHtml(p.name || '-')}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td style="padding:4px 0;">${p.email ? `<a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a>` : '-'}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Updates</td><td style="padding:4px 0;">${escapeHtml(updates)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Contact</td><td style="padding:4px 0;">${escapeHtml(contact)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">IP</td><td style="padding:4px 0;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(ip)}</td></tr>
</table>
<h2 style="font-size:14px;margin:0 0 8px;">Problem</h2>
<div style="background:#f6f6f4;border:1px solid #e6e4de;border-radius:6px;padding:14px;font-size:14px;white-space:pre-wrap;margin:0 0 16px;">${escapeHtml(p.problem)}</div>
<h2 style="font-size:14px;margin:0 0 8px;">Success</h2>
<div style="background:#f6f6f4;border:1px solid #e6e4de;border-radius:6px;padding:14px;font-size:14px;white-space:pre-wrap;margin:0 0 16px;">${escapeHtml(p.success || '-')}</div>
<h2 style="font-size:14px;margin:0 0 8px;">More</h2>
<div style="background:#f6f6f4;border:1px solid #e6e4de;border-radius:6px;padding:14px;font-size:14px;white-space:pre-wrap;">${escapeHtml(p.feedback || '-')}</div>
</body></html>`;

  return { subject, html, text };
}

async function sendViaResend(apiKey: string, args: { from: string; to: string; reply_to?: string; subject: string; html: string; text: string }): Promise<void> {
  const payload: Record<string, unknown> = {
    from: args.from,
    to: [args.to],
    subject: args.subject,
    html: args.html,
    text: args.text,
  };
  if (args.reply_to) payload.reply_to = args.reply_to;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`resend_failed: ${res.status} ${body}`);
  }
}

function asString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
