// Cloudflare Pages Function: GET /api/installer  — DISABLED
//
// SECURITY/ARCH (2026-06): Installer delivery is consolidated on the canonical
// download endpoint GET /download/:platform (functions/download/[platform].ts),
// which the license Worker's fulfillment emails link to and which verifies the
// shared DOWNLOAD_SIGNING_SECRET HMAC token before streaming from R2. This
// second installer endpoint (a different token format keyed on
// INSTALLER_TOKEN_SECRET, used only by the now-disabled Pages webhook/lead
// duplicates) is disabled. The previous implementation is preserved in git
// history.

export const onRequestGet: PagesFunction = async () =>
  new Response(
    'Gone: installer downloads are served from /download/:platform.',
    { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
