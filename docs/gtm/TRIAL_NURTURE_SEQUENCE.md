# Trial Nurture Email Sequence

**Status:** DRAFT copy, ready to wire into Resend. Email delivery is live (domain verified, worker sends). This sequence is the day 0 / 3 / 7 / 10 nurture from the 90-day plan, Track section 5.
**Sender:** Boreas Workflow <no-reply@boreasworkflow.com>
**Reply-to:** support@boreasworkflow.com
**Trigger:** trial key issued (trial_submit success). Day 0 fires with the key delivery.
**Track handling:** one sequence, track-neutral body. Where a trial record carries a track tag (forensic or clinical from the landing page), use the bracketed track-specific subject and the one track line noted in each email. Default to the neutral variant when track is unknown.
**Unsubscribe:** every email carries a one-click unsubscribe. Nurture stops on unsubscribe, on conversion to paid, and after day 10.

Hard rules honored: no em dashes, no en dashes, no AI watermarks. Plain, direct, founder voice.

---

## Day 0: key delivery + first win

**Subject (neutral):** Your Boreas Workflow trial key is inside
**Subject (forensic):** Your Boreas trial key, and the fastest way to a court-ready draft
**Subject (clinical):** Your Boreas trial key, and the fastest way to clear one report

**Body:**

Your 10-day trial is live. Here is your key and the download:

- License key: [KEY]
- Download: [DOWNLOAD_URL]

Install takes about two minutes. The app is signed and notarized, so it opens clean, no security warnings.

The fastest way to see what Boreas does: open one of the built-in demo cases, walk it to the report stage, and watch it draft in a structured, source-cited format. No real patient data required to see the workflow.

Two things worth knowing up front:
- Your case data stays on your machine, encrypted. Nothing about a case goes to our servers.
- You are the author of record. Every diagnostic decision is yours to render and sign before the assistant drafts a line.

[Forensic track line: Start with the CST or violence risk demo case if you want to see the discovery-ready audit trail.]
[Clinical track line: Start with an assessment demo case if you want to see payer-ready documentation come together.]

Reply to this email if anything sticks. A person reads it.

Foundry SMB

---

## Day 3: activation nudge

**Subject (neutral):** Have you run a case through yet?
**Subject (forensic):** The audit trail is the part evaluators tell us they did not expect
**Subject (clinical):** The report draft is where the hours come back

**Body:**

Quick check: have you taken a case to the report stage yet? That is where the trial earns its keep.

If you have not, here is the shortest path:
1. Open a demo case from the case list.
2. Move it through to the diagnostics stage and render your decisions.
3. Generate the report draft and read it in your own structure.

Most people are surprised by two things: how much of the first draft is usable, and how completely the case file stays local.

[Forensic track line: The decision trail behind that draft exports for discovery, so nothing in the report stands as a bare assertion.]
[Clinical track line: The draft comes out criterion-mapped and source-cited, the way payer reviewers want to see it.]

Stuck on anything? Reply here or reach support@boreasworkflow.com.

Foundry SMB

---

## Day 7: founder-rate close

**Subject (neutral):** Founder pricing is capped at 100 seats
**Subject (forensic):** Your founder seat, before the rate moves
**Subject (clinical):** Your founder seat, before the rate moves

**Body:**

You are three days from the end of your trial, so here is the honest pitch.

The first 100 seats lock in founder pricing at $199 per seat per month, for the life of the account. After 100, the rate is $299. This is not a fake countdown. When the seats are gone, the founder rate is gone.

If Boreas has saved you real time on even one report during the trial, the math is straightforward: one recovered afternoon a week pays for the seat several times over.

Claim your founder seat: [PRICING_URL]

Want a walkthrough before you decide, or have a practice with several evaluators? Reply and we will set up 15 minutes.

Foundry SMB

---

## Day 10: expiry + standing offer

**Subject (neutral):** Your trial ends today
**Subject (forensic):** Trial ending: keep your cases, keep the audit trail
**Subject (clinical):** Trial ending: keep clearing the backlog

**Body:**

Your trial ends today. Two things to know:

- Your data is yours. It never left your machine, and nothing is deleted from anywhere on our side, because it was never on our side.
- The founder rate is still open while seats remain: $199 per seat per month for life, first 100 seats. Activate here: [PRICING_URL]

If now is not the time, that is fine. Reply and tell me what was missing or what got in the way. That feedback shapes what we build next, and I read every one.

If you want to come back later, your key can be reactivated. Just email support@boreasworkflow.com.

Thanks for giving it an honest look.

Foundry SMB

---

## Wiring notes (for the implementing session)

- Store trial issue timestamp and track on the trial record (trial table already has the key issue time; confirm a track column or derive from the referring page / campaign in funnel_events by sid).
- Scheduler: a Cloudflare Worker cron (daily) selects trials at day offsets 3, 7, 10 that are still on trial (not converted, not unsubscribed) and sends the matching email via the existing sendEmail lib. Day 0 rides the existing key-delivery send.
- Suppression: maintain an email_suppressions table; check before every send. One-click unsubscribe writes to it.
- Idempotency: record nurture_sent (trial_id, step) so a re-run of the cron never double-sends a step.
- Merge fields: KEY, DOWNLOAD_URL, PRICING_URL (download.html#trial and the founder pricing anchor), unsubscribe link.
