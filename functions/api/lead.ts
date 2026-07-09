// Cloudflare Pages Function: POST /api/lead  — DISABLED
//
// SECURITY/ARCH (2026-06): Trial signup and lead capture are handled by the
// license Worker (license-server) at POST /api/trial/start, which mints a real
// Ed25519-signed trial license and emails the buyer. This Pages endpoint issued
// an unsigned placeholder trial key (legacy "PSG-TRIAL-" format that the
// rebranded app no longer accepts) and is disabled to avoid handing out
// non-functional keys and a second, divergent fulfillment path. The previous
// implementation is preserved in git history.

export const onRequestPost: PagesFunction = async () =>
  new Response(
    'Gone: trial signup is handled by the license Worker (license-server: POST /api/trial/start).',
    { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
