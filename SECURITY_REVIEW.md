# Boreas Website — Security Review

**Date:** June 19, 2026
**Scope:** `boreas-website/` — static site (`public/`), Cloudflare Pages Functions (`functions/`), and the license Worker (`license-server/`).
**Method:** full source read of every Pages Function, the Worker routes and crypto, security headers, secret handling, committed-file audit, and client-side JavaScript.

---

## Deployment status

**Confirmed deployed via Cloudflare Pages + GitHub integration.** The deployed directory `public/` has no uncommitted changes, and local `main` equals `origin/main` (`eb944f6`). The Boreas rebrand commits ("Rebrand site to Boreas Workflow", "Move site files to public directory, finish Boreas rename") are on the branch Pages auto-builds, so a push-triggered production deploy of the rebranded site has occurred. The live URL responded (redirect to `/`) but could not be fully rendered from the review sandbox — **verify the live render and the latest Pages deployment status in a browser / the Cloudflare dashboard.**

---

## Overall assessment

The site is **well-built and security-conscious.** No critical vulnerabilities and no leaked secrets. The form/payment code consistently applies input validation, body-size caps, honeypots, rate limiting, HTML-escaped email output, correct Stripe signature verification, and timing-safe comparisons. The issues below are mostly operational/configuration and defense-in-depth, plus one architectural ambiguity worth resolving before taking real payments.

---

## Strengths (verified)

- **Security headers (`public/_headers`)**: HSTS with `preload` (2yr), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a scoped `Permissions-Policy` (geolocation/mic/camera off; payment limited to Stripe), and a real CSP with `default-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`, and a restricted `form-action`.
- **No secrets committed.** Secret scan across the repo is clean. All Worker/Pages secrets are injected via `wrangler secret` / Pages env vars; `wrangler.toml` carries only non-secret vars and placeholders. The Stripe key in `download.html` is a **publishable** key (`pk_live_…`), which is meant to be public — not a leak.
- **Form endpoints** (`lead`, `checkout`, `enterprise`, `support`, `feedback`): enforce `application/json`, cap body at 32 KB, validate every field against allow-lists, use honeypot fields, rate-limit per IP via KV, HTML-escape all user input in outbound emails, and return generic error messages.
- **Stripe webhooks**: signature verified over the **raw** request body with a timestamp tolerance and constant-time compare — in both the Pages handler and the Worker (`constructEventAsync`).
- **License signing**: Ed25519 (EdDSA via `jose`) with issuer + expiry. Installer/download links are HMAC-signed tokens with expiry; platform is resolved through fixed maps, so **no path traversal**.
- **Anti-piracy**: seats are bound to a device fingerprint on first activation; later activations require the same fingerprint.
- **Client-side**: no `innerHTML` / `eval` / `document.write` sinks, no `target="_blank"` missing `rel="noopener"`, external origins limited to Google Fonts, Unsplash, and Stripe.

---

## Findings & recommendations

### HIGH — Resolve the duplicate Stripe/fulfillment paths before taking live payments

Two separate, divergent implementations of checkout + webhook fulfillment exist:

- **Pages Functions**: `functions/api/checkout.ts`, `functions/api/stripe-webhook.ts`
- **License Worker**: `license-server/src/routes/checkout.ts`, `…/webhooks.ts`, `…/fulfill.ts`

The Pages webhook (`stripe-webhook.ts`) fulfills by POSTing to `${LICENSE_WORKER_URL}/issue` with a bearer secret — **but the Worker exposes no `/issue` route** (its routes are `/api/fulfill`, `/api/webhooks/stripe`, `/api/checkout`, `/api/license/activate`, `/api/license/refresh`, `/api/trial/start`, `/api/portal`).

Risk: depending on which webhook URL is registered in Stripe, fulfillment is either **broken** (404 to a missing endpoint) or, if both handlers receive the event, **double license issuance + duplicate emails**.

**Action:** choose ONE fulfillment path, point the Stripe webhook at only that one, delete/disable the other, and fix the `/issue` vs `/api/fulfill` mismatch. Add idempotency keyed on the Stripe event/session id so retries don't double-issue.

### MEDIUM — Rate limiting is fail-open and depends on a KV binding

Every form handler begins with `if (!env.RATE_LIMIT) return true;`. If the `RATE_LIMIT` KV namespace is **not bound** on the Pages project, all rate limiting silently disappears and the form endpoints become unthrottled — enabling email-bombing through Resend (cost, sender-reputation/deliverability damage). The honeypots only stop naive bots.

**Action:** confirm the `RATE_LIMIT` KV namespace is bound in production for the Pages project. Add Cloudflare WAF rate-limiting rules and/or Turnstile on the form endpoints as defense-in-depth that does not depend on app code.

### MEDIUM — Fulfillment is retrievable by `session_id` alone

`GET /api/fulfill?session_id=cs_…` (Worker) returns the customer's license tokens, installer links, and portal URL to anyone who presents a completed session id. That id appears in the `/thanks.html?session_id=…` URL — i.e., in the address bar, browser history, and `Referer` headers — so it is not a strong secret for handing out license credentials repeatedly.

**Action:** make fulfillment retrieval one-time or short-TTL, or bind it to a value only the buyer holds (e.g., an emailed confirmation token), rather than the session id alone.

### MEDIUM — Internal error details returned to clients

`license-server` `/api/fulfill` and `/api/webhooks/stripe` return `detail: String(err)`, and the Pages `stripe-webhook` returns `fulfillment error: ${message}` / `license_issue_failed: …`. These can leak Stripe, D1, or internal error text to callers.

**Action:** log full errors server-side (`console.error`), return generic messages (`{ error: 'internal_error' }`) to clients.

### LOW — CSP allows `script-src 'unsafe-inline'`

Inline `<script>` blocks drive the forms, so `'unsafe-inline'` is currently required, which weakens the CSP as an XSS backstop. No XSS sink was found client-side and server output is escaped, so practical risk is low.

**Action (hardening):** move inline JS to external `.js` files (or use CSP hashes/nonces) and drop `'unsafe-inline'` from `script-src`.

### LOW — Worker CORS fallback returns the first allowed origin for disallowed origins

In `license-server/src/index.ts`, when an Origin isn't in the allow-set the handler returns the first allowed origin instead of omitting the header. Not exploitable (the browser still blocks a mismatched origin), but cleaner to return no ACAO for disallowed origins.

### LOW — Rate-limit counter is not atomic

The KV `get`-then-`put` pattern can undercount under concurrent requests, allowing minor overage of the per-hour cap. Acceptable for spam control; note it isn't a hard limit.

### LOW (consistency, not security) — Old "PSG" license/token prefixes remain

`functions/api/lead.ts` emits placeholder trial keys as `PSG-TRIAL-…`, and `license-server/src/lib/tokens.ts` generates seat tokens as `PSG-XXXX-XXXX-XXXX` — both leftover "Psygil"-derived prefixes. The desktop app's setup validator now expects `BOREAS-…`. Reconcile the license-key/seat-token formats across the app and the website so issued keys match what the app accepts.

### Privacy note — external images from Unsplash

`img-src` loads stock images from `images.unsplash.com`, exposing visitor IPs to a third party. Minor, but it slightly undercuts a strict "no tracker" posture; consider self-hosting those images.

---

## Suggested priority order

1. Resolve the duplicate fulfillment path + `/issue` mismatch + add idempotency (HIGH).
2. Confirm the `RATE_LIMIT` KV binding in production; add WAF/Turnstile (MEDIUM).
3. Tighten `/api/fulfill` retrieval and strip error `detail` from client responses (MEDIUM).
4. Reconcile `PSG-` vs `BOREAS-` key formats (LOW, consistency).
5. CSP/Unsplash hardening (LOW).
