# GTM Status Log

Running log. Newest entries on top. Claude updates every GTM work session. Metric snapshot weekly (Mondays).

---

## 2026-07-11
**Windows installer LIVE.** boreas-workflow app now version-controlled (private repo truckirwin-ai/boreas-workflow). CI (app-release.yml) builds win32 PyInstaller sidecar + NSIS installer on windows-2022 runner; artifact uploaded to R2 boreas-windows.exe (189MB), E2E verified through the signed download link. Trial form now offers macOS + Windows buttons. Exe is UNSIGNED (SmartScreen warning; Authenticode/Azure Trusted Signing = later decision, ~$10/mo). CI fixes: windows-2022 pin (node-gyp vs new VS image), exe/dmg filename canonicalize globs.


**UNBLOCKED: email delivery works.** Resend domain boreasworkflow.com verified (DNS records confirmed correct), new domain-scoped API key created and set on the worker, live test email delivered (email_sent_at set in D1). Trial key emails now send. FROM = Boreas Workflow <no-reply@boreasworkflow.com>.

**UNBLOCKED: apex live.** CNAME @ -> boreasworkflow.pages.dev added (proxied), Pages custom domain validated, https://boreasworkflow.com serves 200.

**UNBLOCKED: signed + notarized installer live.** Robert already had an active Apple Developer membership (Individual, Team AZ24C8B8U9, paid through April 2027). Developer ID Application cert created, app + dmg signed with hardened runtime, notarized by Apple (2 rounds: app, then signed dmg), stapled, Gatekeeper verdict "accepted, source=Notarized Developer ID". Uploaded to R2. Trial downloads now install without any security warnings. Phase 0 = COMPLETE.

**Next Claude actions:** trial nurture email sequence (now unblocked), site analytics, founder counter, template page 1, whitepaper outline, Sharp pitch draft, CE sponsor shortlist.

---

## 2026-07-10 (plan day)

**State of the funnel:**
- Founder seats sold: 0 of 100
- Trials started: 0 real (5 internal test emails)
- Site: live at www.boreasworkflow.com (apex dead, pending DNS)
- Trial flow: live and E2E verified (inline key + macOS download)
- Demo video: live on /demo, final cut

**Shipped today (pre-GTM infrastructure):**
- Free trial flow end-to-end (form, key issue, signed installer download)
- Trial expiry enforcement (server + device layers)
- Proper macOS build (was packing entire repo; now clean 210MB dmg)

**Blockers (Phase 0 gates, all Robert dashboard-side):**
1. Resend sender domain not verified: NO emails deliver (trial keys shown inline only). Blocks all email marketing.
2. Apex boreasworkflow.com dead (needs DNS CNAME in Cloudflare dashboard).
3. macOS app unsigned (needs Apple Developer account, $99/yr).

**Next Claude actions (queued for morning briefs):**
- Site analytics + funnel events
- Founder counter + founder wall section
- Template page #1 (CST report template)
- Compliance whitepaper outline
- Jeremy Sharp pitch draft
- CE sponsor shortlist with contacts
