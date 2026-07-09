// Cloudflare Pages Function: POST /api/stripe-webhook  — DISABLED
//
// SECURITY/ARCH (2026-06): Stripe fulfillment is consolidated in the license
// Worker (license-server) at POST /api/webhooks/stripe. That handler verifies
// the Stripe signature and runs the idempotent fulfillPaidCheckout path
// (UNIQUE(stripe_session_id) + email_sent_at guards), so an event can only ever
// fulfill once.
//
// This Pages endpoint was a divergent duplicate that POSTed to a non-existent
// Worker `/issue` route, which would have broken fulfillment or, if both
// handlers received the event, issued duplicate licenses. It is disabled.
// Register the Stripe webhook against the Worker only. The previous
// implementation is preserved in git history.

export const onRequestPost: PagesFunction = async () =>
  new Response(
    'Gone: Stripe webhooks are handled by the license Worker (license-server: POST /api/webhooks/stripe).',
    { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
