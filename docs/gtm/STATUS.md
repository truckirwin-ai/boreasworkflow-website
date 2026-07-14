# GTM Status Log

Running log. Newest entries on top. Claude updates every GTM work session. Metric snapshot weekly (Mondays).

---

## 2026-07-14 (session 7, morning brief, Tuesday, SHIPPED AND DEPLOYED)

Wrangler auth present this session. Everything below is LIVE and production-verified.

**Shipped and verified live:**
- **Template page 5 LIVE: PTSD / Trauma Evaluation (clinical track, second clinical template).** /templates/ptsd-trauma-evaluation.html + boreas-ptsd-report-template.docx (104 paragraphs: identifying info with IME add-ons, referral as posed, numbered sources separating self-report/collateral/records/instruments, trauma history and index event documented apart from symptoms, pre-event and post-event functional baseline, instrument-agnostic measures table, a Response Style / Symptom Validity / Performance Validity section placed BEFORE interpretation, DSM-5-TR Criteria A through H walked one at a time with required symptom counts, dissociative and delayed-expression specifiers, a separate child path mapping to the PTSD for Children 6 and Younger criteria set, diagnostic impression with code, a functional impact and causation section for IME use, recommendations tied to findings, basis and limitations, attestation). Adult and child paths in one file. Worker TEMPLATES map gained the `ptsd` clinical entry, templates hub card flipped from coming-soon to live (one coming-soon card remaining: the forensic Response Style / Malingering Addendum), sitemap updated. Production smoke test: page 200, docx 200 (41861 bytes) on both apex and www, POST /api/templates/request with template=ptsd returns ok + correct docx URL, hub card link live, sitemap entry live. Worker redeployed first so the email gate resolves. Note: the www docx briefly served a stale edge-cache object during propagation, then revalidated to the correct 41861-byte file; both hosts confirmed correct on recheck.
- Template inventory now 5 live: CST, violence risk, child custody (forensic); ADHD, PTSD/trauma (clinical). Both tracks now have real clinical-track depth, not just forensic.
- Zero em/en dashes verified across every artifact. No PII committed. A few smoke-test lead rows (qa+ptsd@, smoketest+ptsd@, smoketest+adhd@boreasworkflow.com) are in the prod template_leads table from endpoint verification; harmless, filter them out of any lead pull. Commit 8cb54d1 pushed to main.

**NEW THIS SESSION, needs Robert (competitive intel changes a queued action):**
- **Jeremy Sharp owns a direct competitor.** The July 13 competitive read (docs/gtm/COMPETITIVE_TESTINGPSYCH_RESOURCES.md) found that Sharp founded ReverbReports, a cloud AI report generator for testing psychologists, the closest product to our clinical track. Queued Robert Action #1 (send Sharp the interview + sponsorship email) is now HELD pending Robert's call. Sending the current draft hands a competitor a product briefing on the exact axis where Reverb is weak (cloud PHI). Recommendation: treat Sharp/Reverb as a competitor to study, redirect the $800/mo podcast-sponsorship budget and the borrowed-trust play toward non-competing voices (assessment CE instructors, practice consultants, the Testing Psychologist Facebook community via soft participation). If Robert still wants Sharp contact, make it founder-to-founder and honest, not a disguised sponsorship pitch. Reverb is also a clean foil for our local-first story; compare.html already handles the category without naming it.

**ROBERT ACTIONS QUEUED (updated):**
1. **CHANGED, decision needed:** the Sharp email is HELD. Decide the reframe: (a) drop Sharp as a channel and redirect podcast budget to non-competing voices, or (b) send a founder-to-founder honest note (not the sponsorship draft). Everything else in the checklist stands.
2. Post LinkedIn batch 1 (docs/gtm/LINKEDIN_BATCH_1.md), starts the cadence.
3. Advisor names + credentials + permission scope (gates whitepaper draft and webinar scheduling).
4. Approve CONCEPT/PAU + CO Psychological Association as first two CE targets (drafts follow on approval).
5. Pick a webinar date window (needs your + an advisor availability); registrations already accruing at /webinar/.
6. Decide backup location for the contact data (private repo, encrypted drive, or leave local); it is NOT in git by design.

**Next Claude actions:** template page 6 (Response Style / Malingering Addendum, forensic, clears the last coming-soon card) + docx, instrument pages batch 1 (start the programmatic cluster), whitepaper Sections 1 to 3 once an advisor is named, non-competing borrowed-trust outreach list (assessment CE instructors + practice consultants) to replace the Sharp play, CE outreach drafts on approval, webinar invite email once a date lands.

---

## 2026-07-13 (session 6, morning brief, Monday, SHIPPED AND DEPLOYED)

Wrangler auth present this session, so everything below is LIVE and production-verified.

**METRIC SNAPSHOT (Monday):**
- Founder seats sold: 0 of 100 (api/founder/remaining returns 100 remaining)
- Real trials: 0 (unchanged; no paid channels live yet, outbound not started)
- Live template pages: 4 (CST, violence risk, child custody, ADHD)
- Template downloads / leads: not yet reported here; pull `SELECT template, count(*) FROM template_leads GROUP BY template` when reviewing
- Webinar registrations: accruing at /webinar/, date still TBA (blocked on advisor availability)
- Deployed funnel: analytics + founder counter + trial nurture cron (daily 10am MDT) all live from prior sessions
- Honest read: infrastructure and content are ahead of demand. Nothing converts until Robert opens the Robert-only gates (Sharp, LinkedIn, advisor names, CE approval) and the outbound motion starts. Content SEO is compounding quietly in the background.

**Shipped and verified live:**
- **Template page 4 LIVE: ADHD Evaluation (clinical track, FIRST clinical template).** /templates/adhd-evaluation.html + boreas-adhd-report-template.docx (82 paragraphs: identifying info, referral as a medical question, numbered sources across informants, developmental and age-of-onset history, cross-setting documentation, medical/psychiatric differential, behavioral observations, instrument-agnostic rating scale table, response style and validity before interpretation, DSM-5-TR Criteria A to E walked one at a time, diagnostic impression with code, functional impact and medical necessity section, recommendations tied to findings, basis and limitations, attestation). Adult and child variants in one file. Worker TEMPLATES map gained the `adhd` clinical entry, templates hub card flipped from coming-soon to live, sitemap updated. Production smoke test: page 200, docx 200 (40406 bytes), POST /api/templates/request with template=adhd returns ok + correct docx URL, hub card link live. Worker redeployed first so the email gate resolves.
- **Outbound call script drafted: docs/gtm/CALL_SCRIPT_FIRST500.md.** Call-first script for the 499 active-licensed first_500 tranche (phone-only segment, 0% email). Opening, track branch (clinical default / forensic switch), discovery, differentiator, tiered ask (demo > email capture > callback), voicemail, objection handling, compliance posture (identify first, honor do-not-call on the spot, 9-5 local, one voicemail/week), and per-call logging that feeds do-not-call and captured-email flags back to the list.
- **Email enrichment spec drafted: docs/gtm/EMAIL_ENRICHMENT_SPEC.md.** Request spec for the AudienceForge project (separate repo) to enrich the phone-rich/email-poor list: input keys, output schema, match priority (board > practice site > PT > NPI > aggregator), confidence and deliverability definitions, compliance constraints, run priority (first_500, then CO, then KS/NE), acceptance criteria. Enrichment runs in AudienceForge; only the enriched output returns to boreas; no contact data enters this public repo.
- Zero em/en dashes verified across every artifact. No PII committed (contact CSVs remain gitignored, verified before commit). Commit 7bfca43 pushed to main.

**ROBERT ACTIONS QUEUED (unchanged, all Robert-only, all gating demand):**
1. Send the Sharp email (docs/gtm/OUTREACH_JEREMY_SHARP.md), personalized.
2. Post LinkedIn batch 1 (docs/gtm/LINKEDIN_BATCH_1.md), starts the cadence.
3. Advisor names + credentials + permission scope (gates whitepaper draft and webinar scheduling).
4. Approve CONCEPT/PAU + CO Psychological Association as first two CE targets (drafts follow on approval).
5. Pick a webinar date window (needs your + an advisor availability); registrations already accruing.
6. Decide backup location for the contact data (private repo, encrypted drive, or leave local); it is NOT in git by design.

**Next Claude actions:** template page 5 (PTSD/trauma, clinical) + docx, instrument pages batch 1 (start the programmatic cluster), whitepaper Sections 1 to 3 once an advisor is named, CE outreach drafts on approval, webinar invite email once a date lands. Local-only (not committed): call-list view resolving the 14 shared numbers in the first_500, and the 55-account practice-pilot target sheet.

---

## 2026-07-12 (session 5, AudienceForge ingest)

**Shipped:**
- **AudienceForge exports ingested for real this time.** Session 2's note referenced a worktree that never merged; nothing was on disk. All 8 artifacts now copied (read-only, originals untouched) into data/audienceforge-imports/ with hard separation: individuals/ (first_500 + all_contacts, person-level, license-anchored), practice-accounts/ (accounts + members join + leadership candidates), psychology-today/ (CO Springs profile scrape), public-search/ (CO practice candidates + combined xlsx).
- **README** (data/audienceforge-imports/README.md): file inventory, trust levels, handling rules, provenance preservation rule.
- **GTM import plan** (docs/gtm/AUDIENCEFORGE_IMPORT_PLAN.md): 5-class segmentation (individuals, practice accounts, PT profiles, leadership candidates, priority outbound), first-outbound recommendation, 9 measured data quality risks, sequencing.
- **Headline numbers:** 7,788 individuals (CO 4,950/KS 1,574/NE 1,264; 81.7% phone, 0.2% email, 40.7% blank license status). First 500: 100% phone, 499 active-licensed, strict subset, 0 emails. Practice accounts 5,654 but 97.7% low confidence; actionable slice = 55 high-confidence multi-practitioner accounts (practice-pilot pool). PT scrape: only 22 of 498 are Psychologists, 19 rows have credential parsing artifacts. Leadership candidates: all 26 scrape-inferred, some visibly wrong roles, hand-verify before any use. Dup phones: 718 shared numbers across full list (2,692 rows, worst 45 on one number), 14 in the first 500.
- **First outbound rec:** first_500 filtered to active license (499 rows), call-first (email coverage is zero, phone coverage is total). 55-account practice-pilot motion runs parallel, Robert-led.
- **PRIVACY GUARD:** website repo is PUBLIC on GitHub. Contact CSVs (names, phones, license numbers) are gitignored and stay local-only; only the README (aggregate stats) and the import plan are committed. If the data needs backup, it needs a private location, not this repo.

**ROBERT ACTIONS QUEUED:**
1. Decide backup location for the contact data (private repo, encrypted drive, or leave local). It is NOT in git by design.
2. Unchanged from session 4: Sharp email, LinkedIn batch 1, advisor names, CE target approval, webinar date window.

**Next Claude actions:** resolve the 14 shared numbers in the first 500 and produce the call-list view + call script, build the 55-account practice-pilot target sheet, queue email enrichment spec back to AudienceForge (separate project, spec only).

---

## 2026-07-12 (session 4, Phase 1 continuation, SHIPPED AND DEPLOYED)

Agent sandbox had Cloudflare auth this session, so everything below is LIVE, including the session 2 and 3 backlog that was waiting on Robert.

**Deployed and verified live:**
- **Sessions 2-3 backlog cleared.** D1 migration applied, worker deployed. Founder counter API live (100 of 100 remaining), violence-risk template email gate live. Pages for /templates/violence-risk-assessment and /testing/ were already deployed and confirmed 200.
- **Trial nurture sequence LIVE (both tracks, neutral copy).** Worker cron daily 16:00 UTC (10am MDT): day 3 activation nudge, day 7 founder-rate close, day 10 expiry email. New tables nurture_sends (per-step idempotency) and email_suppressions. Signed one-click unsubscribe at GET/POST /api/email/unsubscribe (HMAC, List-Unsubscribe headers, RFC 8058). Guards: stops on conversion, suppression, non-active status; stale steps (3+ days past due) are recorded, not sent, so pre-existing test trials get nothing. Day 0 still rides the key-delivery email. Copy from docs/gtm/TRIAL_NURTURE_SEQUENCE.md; track column does not exist on subscriptions so neutral variants ship (track-aware subjects can come later via funnel join).
- **Template page 3 LIVE: Child Custody Evaluation (forensic track).** /templates/child-custody-evaluation + boreas-child-custody-report-template.docx (15 sections: referral, statutory standard, notification, numbered sources, background, parallel Parent A/B sections with response style before testing, per-child sections, observations, collateral, allegations assessed separately, best-interests factor walk, recommendations, basis and limitations, attestation; jurisdiction-neutral). Worker TEMPLATES map + hub card flipped + sitemap. Email gate verified live.
- **Webinar registration page LIVE (both tracks): /webinar/.** "Defensible Use of AI in Psychological Assessment", date TBA interest capture (blocked on advisor availability, so the page collects registrations now and the invite goes out when scheduling lands). Practice-area selector feeds track tagging. New endpoint POST /api/webinar/register + webinar_leads table + confirmation email. Page uses the allowlisted webinar_register funnel event. Honest CE disclosure (non-CE session, CE version in the works) and demo-after-session separation per the CE engine rules.
- Zero em/en dashes verified across every artifact. All endpoints smoke-tested in production.

**ROBERT ACTIONS QUEUED:**
1. Still open from sessions 2-3: send the Sharp email (docs/gtm/OUTREACH_JEREMY_SHARP.md), post LinkedIn batch 1 (docs/gtm/LINKEDIN_BATCH_1.md), advisor names/credentials, approve CONCEPT/PAU + CO Psychological Association as first CE targets.
2. New: pick a webinar date window (needs your and an advisor's availability); registrations are already accruing at /webinar/.
3. FYI, no action: worker cron sends nurture emails daily at 10am MDT. To suppress an address manually: INSERT INTO email_suppressions (email, reason, created_at) VALUES ('addr', 'manual', unixepoch());

**Next Claude actions:** template page 4 (ADHD evaluation, clinical track, first clinical template), instrument pages batch 1, whitepaper Sections 1 to 3 once advisor named, CE outreach drafts on approval, webinar invite email once date set.

---

## 2026-07-11 (session 3, morning brief, Phase 1 content)

**Shipped (code complete, DEPLOY PENDING, see Robert actions):**
- **Template page 2, Violence Risk Assessment (forensic track).** /templates/violence-risk-assessment.html, email-gated via the existing POST /api/templates/request flow. Sanitized structured-professional-judgment .docx built and shipped at /templates/boreas-violence-risk-report-template.docx (11 sections: identifying, notification, sources, history, history of violence, MSE, testing/structured risk, risk formulation with static/dynamic/protective + scenario planning, communication of risk, risk management, attestation; instrument-agnostic). Worker TEMPLATES map gained the violence-risk entry. Templates hub card flipped from coming-soon to live. Sitemap updated. Built with python-docx; verified zero em/en dashes.
- **Podcast attribution live: /testing/ dedicated landing (clinical track).** Purpose-built page for The Testing Psychologist audience (throughput/backlog message, local-first, founder counter, trial + demo CTAs). noindex,follow so it does not compete in search. Carries meta boreas-campaign=testing-psychologist. This is the dedicated URL Robert reads on air; podcast-attributed trials now traceable.
- **Analytics: session-persisted campaign attribution.** analytics.js now captures a campaign from meta[name=boreas-campaign] or ?ref= query param, persists it in sessionStorage (no cookies, dies with the tab), and stamps it into meta.campaign on every event for the whole session. So a visitor landing on /testing then converting on /download stays attributed. No D1 migration needed (rides existing meta JSON column). Cache-busted analytics.js?v=20260711b across all 19 pages.
- **Trial nurture email sequence drafted (both tracks).** docs/gtm/TRIAL_NURTURE_SEQUENCE.md: day 0/3/7/10 copy, track-aware subject lines, plus wiring notes for the cron sender (idempotency, suppression, merge fields). Ready to implement now that Resend sends.
- **LinkedIn post batch 1 drafted (Robert-fronted).** docs/gtm/LINKEDIN_BATCH_1.md: 7 posts (~3 weeks at 2/wk), mixed build-in-public / forensic / clinical, founder voice, never claims clinical authority. Robert posts under his name.

**ROBERT ACTIONS QUEUED:**
1. Deploy (agent sandbox has no Cloudflare auth):
   - `cd "/Users/truckirwin/Desktop/Foundry SMB/Products/boreas-website/license-server" && npm run deploy` (worker: adds violence-risk template endpoint; no migration this time)
   - `cd "/Users/truckirwin/Desktop/Foundry SMB/Products/boreas-website" && npx wrangler pages deploy public --project-name=boreasworkflow --branch=main --commit-dirty=true`
   - Purge Cloudflare cache, then verify: /templates/violence-risk-assessment.html loads, its email-gate returns the .docx (worker must be deployed first or it 400s unknown_template), and /testing/ loads with the founder counter.
2. Read the LinkedIn batch (docs/gtm/LINKEDIN_BATCH_1.md); post 1 to start the cadence, or edit to taste.
3. Still open from session 2: send the Sharp email, advisor names/credentials, approve CONCEPT/PAU + CO Psychological Association as first CE targets.

**Next Claude actions:** wire the trial nurture cron sender (copy is ready), template page 3 (child custody, forensic) + docx, whitepaper Sections 1 to 3 once an advisor is named, CE outreach drafts on Robert's approval, first non-CE webinar registration page.

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
