# GTM Status Log

Running log. Newest entries on top. Claude updates every GTM work session. Metric snapshot weekly (Mondays).

---

## 2026-07-11 (session 2, Phase 1 kickoff)

**Shipped (code complete, DEPLOY PENDING, see Robert actions):**
- **Site analytics + funnel events (first-party).** New worker endpoints POST /api/events and D1 table funnel_events. No cookies, no IPs, no third-party trackers, DNT/GPC respected; consistent with local-first positioning and $0/mo. Site beacon public/assets/analytics.js on all 16 pages: page_view, trial_submit, download_click, pricing_view, template_submit/download, demo_play, datasheet_download, with forensic/clinical track tagging per page.
- **Founder counter.** GET /api/founder/remaining (counts active solo subs against 100). Live "X of 100" on index hero and download page above pricing. Currently 100 of 100.
- **Template page 1 (forensic track).** /templates/competency-to-stand-trial.html, email-gated via new POST /api/templates/request + template_leads D1 table; sends the file by email (Resend) and shows the link inline. Sanitized Dusky-organized CST .docx built and shipped at /templates/boreas-cst-report-template.docx. /templates/ hub page lists CST live + 5 coming-soon cards. Nav "Templates" link added sitewide; sitemap updated. NOTE: template drafted fresh; align with the in-product CST template when the app repo is available in a session.
- **Whitepaper outline (both tracks).** docs/gtm/WHITEPAPER_OUTLINE.md: "Defensible AI in Psychological Assessment", 7 sections + appendices, advisor review slots marked. Blocked on advisor byline (Open Item 1).
- **Jeremy Sharp pitch draft (clinical track).** docs/gtm/OUTREACH_JEREMY_SHARP.md: interview-first ask, sponsorship held back, 3 subject lines, follow-up plan. Robert to personalize and send.
- **CE sponsor shortlist (both tracks).** docs/gtm/CE_SPONSOR_SHORTLIST.md: 10 candidates with verified APA sponsor status, contacts, pitch angles. Recommended order: CONCEPT/PAU, CO Psychological Association, TZK, At Health, AAFP.
- **AudienceForge exports ingested into boreas GTM project** (data/audienceforge-imports/ + README + docs/AUDIENCEFORGE_IMPORT_PLAN.md). Headline: 7,788 contacts (81.7% phone, 0.2% email), first_500 is a strict subset with 100% phone coverage; PT scrape is 22/498 psychologists (source universe only); practice accounts 97.7% low confidence; all 26 leadership candidates are scrape-inferred. First outbound rec: first_500 filtered to active license + phone (499 rows), call-first, email enrichment needed before sequences.

**ROBERT ACTIONS QUEUED:**
1. Deploy (wrangler is authenticated on your machine, agent sandbox has no Cloudflare auth):
   - `cd "/Users/truckirwin/Desktop/Foundry SMB/Products/boreas-website/license-server" && npm run db:migrate && npm run deploy`
   - `cd "/Users/truckirwin/Desktop/Foundry SMB/Products/boreas-website" && npx wrangler pages deploy public --project-name=boreasworkflow --branch=main --commit-dirty=true`
   - Then purge Cloudflare cache (boreasclinical.com AND boreasworkflow.com zones) and verify: https://boreasworkflow.com/templates/, api.boreasclinical.com/api/founder/remaining, founder counter on homepage.
2. Send the Sharp email (docs/gtm/OUTREACH_JEREMY_SHARP.md) after personalizing.
3. Advisor names/credentials (blocks whitepaper draft and webinar planning).
4. Decision: approve CONCEPT/PAU + CO Psychological Association as first two CE outreach targets (drafts ready next session on approval).

**Next Claude actions:** trial nurture email sequence (Resend now works), template page 2 (violence risk, forensic), whitepaper Sections 1 to 3 draft once advisor named, CE outreach drafts on Robert's approval, /testing redirect for Sharp attribution, LinkedIn post batch 1.

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
