import { Hono } from 'hono';
import type { Env } from '../types';
import { stripeClient } from '../lib/stripe';
import { fulfillPaidCheckout } from '../lib/fulfillment';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/fulfill?session_id=cs_xxx
 *
 * Synchronous fulfillment endpoint called by the /thanks page after a successful
 * Stripe Checkout redirect. Idempotent with the webhook: either one can arrive first
 * and fulfill; the other returns the same data.
 *
 * Returns: { tier, tokens, installers, portal_url }
 *
 * This is the endpoint that powers "buy now, get license immediately on the success
 * page"  -  no email required to start using the app.
 */
app.get('/', async (c) => {
  const sessionId = c.req.query('session_id');
  if (!sessionId) return c.json({ error: 'missing_session_id' }, 400);

  const stripe = stripeClient(c.env);
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    // Do not leak Stripe/internal error text to the caller.
    console.error('fulfill_session_retrieve_failed', err);
    return c.json({ error: 'unknown_session' }, 404);
  }

  try {
    const result = await fulfillPaidCheckout(c.env, stripe, session);
    // Note: this endpoint is reachable by anyone holding the (high-entropy)
    // session_id, which appears in the /thanks URL. Return only what the success
    // page needs to render the license; omit customer_email so a leaked
    // session_id does not also disclose the buyer's email address.
    return c.json({
      tier: result.tier,
      tokens: result.tokens,
      installers: result.installers,
      portal_url: result.portal_url,
    });
  } catch (err) {
    console.error('fulfill_failed', err);
    return c.json({ error: 'fulfillment_failed' }, 500);
  }
});

export default app;
