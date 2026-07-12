import { Hono } from 'hono';
import type { Env } from '../types';
import { now } from '../lib/db';

const app = new Hono<{ Bindings: Env }>();

// First-party funnel analytics. No cookies, no IP storage, no third-party
// trackers. Consistent with the local-first privacy positioning: we count
// funnel steps, we do not profile visitors.
const ALLOWED_EVENTS = new Set([
  'page_view',
  'trial_submit',
  'trial_success',
  'trial_error',
  'download_click',
  'pricing_view',
  'checkout_click',
  'template_view',
  'template_submit',
  'template_download',
  'demo_play',
  'datasheet_download',
  'webinar_register',
]);

const ALLOWED_TRACKS = new Set(['forensic', 'clinical', 'general']);

interface EventBody {
  event?: string;
  page?: string;
  track?: string;
  ref?: string;
  sid?: string;
  meta?: Record<string, unknown>;
}

/**
 * POST /api/events
 * body: { event, page?, track?, ref?, sid?, meta? }
 * Fire-and-forget beacon from the marketing site. Always returns 204 quickly;
 * invalid payloads are dropped, not errored, so the client never retries.
 */
app.post('/', async (c) => {
  const raw = await c.req.text().catch(() => '');
  if (!raw || raw.length > 2048) return c.body(null, 204);

  let body: EventBody;
  try {
    body = JSON.parse(raw) as EventBody;
  } catch {
    return c.body(null, 204);
  }

  const event = typeof body.event === 'string' ? body.event : '';
  if (!ALLOWED_EVENTS.has(event)) return c.body(null, 204);

  const clamp = (v: unknown, max: number): string | null =>
    typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null;

  const track = typeof body.track === 'string' && ALLOWED_TRACKS.has(body.track) ? body.track : 'general';
  const meta = body.meta && typeof body.meta === 'object' ? JSON.stringify(body.meta).slice(0, 512) : null;
  const country = c.req.header('cf-ipcountry') ?? null;

  await c.env.DB.prepare(
    `INSERT INTO funnel_events (event, page, track, ref, sid, meta, country, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      event,
      clamp(body.page, 256),
      track,
      clamp(body.ref, 256),
      clamp(body.sid, 64),
      meta,
      country,
      now(),
    )
    .run();

  return c.body(null, 204);
});

export default app;
