# TODOs

Current TODO list. Rolled forward by the orchestrator each morning. Re-baselined 2026-07-14 on the D-0012 ruling: Psygil retired, Boreas Workflow is the product, this file now serves the Boreas GTM. Pre-ruling aging history is preserved in git and in the archived psygil-website repo.

Format:

```
## T-NNNN: [Title]
**Priority:** today-blocking | this-week-blocking | strategic | background
**Added:** [DATE]
**Estimated time:** S (< 30 min) | M (30-90 min) | L (> 90 min)
**Blocked by:** [decision or dependency, if any]
**Acceptance:** [What "done" looks like.]
```

---

## T-0016: Verify support@boreasworkflow.com email routing

**Priority:** today-blocking
**Added:** 2026-07-15
**Estimated time:** S (5 min, Cloudflare Email Routing dashboard)
**Blocked by:** founder (dashboard access)
**Acceptance:** The founder's 2026-07-14 12:11 MT test ("Support request #1") or a fresh test arrives at the routed destination inbox. Observed 2026-07-15: no forwarded copy, no reply, anywhere in Gmail 19+ hours after send. Send side of the domain is healthy (nurture day-3 delivered 5/5 Tuesday); the inbound route for support@ is the suspect.

## T-0008: Non-PHI positioning pass on the live checkout surfaces

**Priority:** today-blocking
**Added:** 2026-05-14 (re-baselined 2026-07-14)
**Estimated time:** M (45 min; pass staged, runs on founder go)
**Blocked by:** founder go
**Acceptance:** (1) `download.html` founder-rate/pricing-table context carries a "non-PHI workflow only" line plus the checkout checkbox requirement; (2) `policies.html#hipaa` reflects the locked stance; (3) any Solo references implying BAA scope corrected; build marker updated to confirm deploy. Highest-exposure open item: a Solo buyer can pay today without seeing the boundary.

## T-0009: Wire Stripe MCP into the finance pulse

**Priority:** this-week-blocking (raised from strategic 2026-07-14: checkout is live, revenue is invisible)
**Added:** 2026-05-14
**Estimated time:** M (30 min, founder auth required)
**Blocked by:** founder session to authorize the connection
**Acceptance:** The next briefing shows a real Yesterday's income value from Stripe, not the manual-ledger fallback.

## T-0010: Confirm Practice tier seat structure

**Priority:** strategic
**Added:** 2026-05-14
**Estimated time:** S (one word)
**Blocked by:** none
**Acceptance:** Founder confirms the shipped seat bands (up to 10 $2,500 / 11-15 $3,600 / 16-20 $4,500 per month) as the decision. Shipped Jul 9; one word closes it.

## T-0005: Customer discovery — re-scoped to Boreas funnel

**Priority:** this-week-blocking
**Added:** 2026-05-14 (re-scoped 2026-07-14; absorbs retired T-0011)
**Estimated time:** L (founder time, rolling)
**Blocked by:** none
**Acceptance:** Re-scoped from cold-list discovery to the live funnel: structured conversations with template-page leads, trial users, and webinar registrants (target 10; mix of forensic + clinical). Notes at `/ops/discovery/notes/`; first synthesis after 5.

## T-0013: Update outbound identity to Robert Irwin

**Priority:** strategic
**Added:** 2026-05-15
**Estimated time:** M (cumulative; Gmail display name = 2 min)
**Blocked by:** none
**Acceptance:** Outbound mail and customer-facing surfaces show "Robert Irwin". Sub-steps: (a) Gmail display name; (b) primary user on the boreasworkflow.com/boreasclinical.com mail domain per EMAIL_SETUP.md; (c) LinkedIn, CO SoS, Stripe display name, other public surfaces. Founder pace.

## T-0007: Council pass on the live marketing motion

**Priority:** background (re-pointed 2026-07-14)
**Added:** 2026-05-14
**Estimated time:** L
**Blocked by:** none
**Acceptance:** Re-pointed from Marketing Plan v2.1 to the live Boreas GTM (docs/gtm): a council review of the template-page + call-first + webinar motion once first conversion data exists. Optional.

---

## Done log (rolled here when items complete; archived to decision log)

- **T-0002:** Counsel intake email — CLOSED 2026-07-14 as superseded by the D-0012 ruling (37 business days in-flight; the unit of work belonged to the retired Psygil launch). Live legal piece = vault gate 0.5, prepped in the vault Outbox. See decision_log/2026-07-14.md.
- **T-0004:** Phase 0 launch checklist — CLOSED 2026-07-14, superseded by the Boreas GTM.
- **T-0011:** Book 10 cold discovery interviews — CLOSED 2026-07-14 as originally scoped; intent folded into re-scoped T-0005.
- **T-0012:** Shrink Wave 1 batch to 20 — CLOSED 2026-07-14; Wave 1 cold email retired with the Psygil plan.
- **T-0001:** Solo BAA stance — DONE 2026-05-14 (D-0001 Option B).
- **T-0006:** Scheduled orchestrator task verified — DONE 2026-05-14.
- **T-0003:** Council skill installed — DONE 2026-06-16.
- **T-0015:** Scheduler health verified — DONE 2026-06-16.
- **T-0014:** Cash events confirmed and logged — DONE 2026-06-16.
