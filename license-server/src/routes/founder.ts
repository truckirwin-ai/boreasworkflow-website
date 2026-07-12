import { Hono } from 'hono';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

const FOUNDER_SEATS_TOTAL = 100;

/**
 * GET /api/founder/remaining
 * returns: { total, sold, remaining }
 *
 * Powers the "X of 100 founder seats" counter on the marketing site.
 * While the founder offer runs, every active paid solo subscription is a
 * founder seat (the founder rate is the only solo offer being pushed).
 * If that assumption changes, distinguish by Stripe price id at fulfillment
 * time and add a column instead of changing this query.
 */
app.get('/remaining', async (c) => {
  const row = await c.env.DB.prepare(
    `SELECT COUNT(*) AS sold FROM subscriptions WHERE tier = 'solo' AND status = 'active'`,
  ).first<{ sold: number }>();

  const sold = row?.sold ?? 0;
  const remaining = Math.max(0, FOUNDER_SEATS_TOTAL - sold);

  return c.json(
    { total: FOUNDER_SEATS_TOTAL, sold, remaining },
    200,
    { 'Cache-Control': 'public, max-age=60' },
  );
});

export default app;
