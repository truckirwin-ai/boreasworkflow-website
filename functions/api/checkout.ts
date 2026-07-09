// Cloudflare Pages Function: POST /api/checkout  — DISABLED
//
// SECURITY/ARCH (2026-06): Checkout is consolidated in the license Worker
// (license-server) at POST /api/checkout, which is the path the marketing site
// targets via site-config.json `api_base`. This same-origin Pages duplicate is
// disabled so there is a single, authoritative checkout + fulfillment pipeline.
// The previous implementation is preserved in git history.

export const onRequestPost: PagesFunction = async () =>
  new Response(
    'Gone: checkout is handled by the license Worker (license-server: POST /api/checkout).',
    { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
