# GTM Status Log

Running log. Newest entries on top. Claude updates every GTM work session. Metric snapshot weekly (Mondays).

---

## 2026-07-11

**UNBLOCKED: email delivery works.** Resend domain boreasworkflow.com verified (DNS records confirmed correct), new domain-scoped API key created and set on the worker, live test email delivered (email_sent_at set in D1). Trial key emails now send. FROM = Boreas Workflow <no-reply@boreasworkflow.com>.

**Still blocked:**
1. Apex boreasworkflow.com dead (CNAME @ -> boreasworkflow.pages.dev, Cloudflare dashboard).
2. macOS app unsigned (Apple Developer account needed).

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
