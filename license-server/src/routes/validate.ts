import { Hono } from 'hono';
import type { Env } from '../types';
import { getSeatByToken, getSubscription, now } from '../lib/db';

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /v1/licenses/validate
 * body: { key }
 *
 * Contract expected by the desktop app (src/main/setup/license.ts validateRemote):
 *   200 { ok: true,  tier, seats, expiresAt: ISO8601|null }
 *   200 { ok: false, errorCode: 'EXPIRED'|'REJECTED', errorMessage }
 *
 * The key IS the seat token (BOREAS-XXXXX-XXXXX-XXXXX-XXXXX). The server is the
 * source of truth for trial expiry: trial_ends_at is fixed at trial creation,
 * so re-activating the same key after expiry always returns EXPIRED regardless
 * of any device-side state reset.
 */
app.post('/', async (c) => {
  const body = await c.req.json<{ key: string }>().catch(() => null);
  const key = body?.key?.trim().toUpperCase();
  if (!key) return c.json({ ok: false, errorCode: 'REJECTED', errorMessage: 'Missing license key.' });

  const seat = await getSeatByToken(c.env, key);
  if (!seat) {
    return c.json({ ok: false, errorCode: 'REJECTED', errorMessage: 'Unknown license key.' });
  }

  const sub = await getSubscription(c.env, seat.subscription_id);
  if (!sub) {
    return c.json({ ok: false, errorCode: 'REJECTED', errorMessage: 'License has no active subscription.' });
  }

  if (sub.tier === 'trial') {
    if (sub.status !== 'active' || !sub.trial_ends_at || sub.trial_ends_at <= now()) {
      return c.json({
        ok: false,
        errorCode: 'EXPIRED',
        errorMessage: 'This trial has ended. Purchase a license at boreasworkflow.com/download to continue.',
      });
    }
    return c.json({
      ok: true,
      tier: 'trial',
      seats: 1,
      expiresAt: new Date(sub.trial_ends_at * 1000).toISOString(),
    });
  }

  if (sub.status !== 'active') {
    return c.json({
      ok: false,
      errorCode: sub.status === 'past_due' ? 'EXPIRED' : 'REJECTED',
      errorMessage: 'This subscription is not active. Manage billing at boreasworkflow.com.',
    });
  }

  return c.json({
    ok: true,
    tier: sub.tier,
    seats: sub.seat_limit,
    expiresAt: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
  });
});

export default app;
