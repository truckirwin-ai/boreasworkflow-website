# Email Enrichment Spec (for AudienceForge)

**Purpose:** the boreas outbound plan needs email addresses to run the solo email sequence and to fuel Meta retargeting custom audiences. The AudienceForge exports are phone-rich and email-poor (81.7% phone, 0.2% email across the 7,788; the first_500 subset is 100% phone, 0% email). This spec defines the enrichment job to hand back to AudienceForge (separate project). It is a request, not an implementation.

**Boundary:** enrichment runs in the AudienceForge project against its own data. Boreas receives only the enriched output file, appended to the same schema. No contact data moves into the public website repo (privacy guard: contact CSVs are gitignored and local-only).

---

## Input

- Source: `individuals/all_contacts_prioritized.csv` (7,788 rows) and the strict subset `individuals/first_500_priority_contacts.csv` (499 active-licensed).
- Anchor keys already present: name, license number, license status, state, phone, city. License number + state is the strongest join key; use it as the primary match.

## Requested output

Same row schema plus these appended columns:

| Column | Meaning |
|---|---|
| `email_enriched` | Best professional email found, or blank |
| `email_source` | Where it came from (board roster, practice website, PT profile, NPI, aggregator) |
| `email_confidence` | high / medium / low (definition below) |
| `email_verified` | Result of syntax + MX + deliverability check: valid / risky / invalid / unverified |
| `email_type` | practice-domain / personal / shared-practice / unknown |
| `enriched_at` | ISO date of enrichment |

## Match priority (highest-trust source first)

1. State licensing board public contact record matched on license number + state.
2. Practice website matched on name + city (staff or contact page), practice-domain address preferred over a personal one.
3. Psychology Today profile matched on name + city (note: only 22 of 498 in the PT scrape are Psychologists, so PT is a weak source here; use only as corroboration).
4. NPI/NPPES record matched on name + state.
5. Commercial aggregator, lowest trust, medium confidence at best, and only when the address is on the practice domain.

Never guess-pattern an address (e.g. first.last@domain) and mark it enriched. A pattern-only guess must be labeled `email_confidence=low` and `email_type=unknown`, and it must still pass deliverability before use.

## Confidence definition

- **high:** address found on a first-party source (board record or the practice's own website) AND passes deliverability (valid).
- **medium:** first-party source but only risky/unverified deliverability, or a corroborated aggregator hit on the practice domain.
- **low:** single low-trust source, personal-domain address, or any pattern-derived guess.

## Deliverability

Every enriched address gets syntax + MX + mailbox check before it ships. Record the verdict in `email_verified`. Invalid addresses stay in the file (labeled) but are excluded from any send list.

## Compliance and hygiene constraints

- Professional, publicly listed B2B addresses only. No scraping behind logins, no purchased consumer lists, no personal addresses that were not publicly published by the practitioner in a professional context.
- Preserve provenance: keep the original file untouched; enrichment is an appended output, never an overwrite.
- Carry the do-not-contact flag: any row already flagged do-not-call from the phone motion ships with `email_suppress=true` so it never enters an email sequence.
- Deduplicate on license number + state before output; the full list has 718 shared phone numbers, so do not let one practice or one shared line create duplicate email targets.

## Priority order for the run

1. `first_500` (499 rows) first: this is the active-licensed, call-first tranche; email closes the loop so a captured "send me something" has a verified address and the sequence can run.
2. Then the CO slice of the full list (4,950 rows, home state, densest).
3. Then KS (1,574) and NE (1,264).

## Acceptance

- Output matches the schema above, joined losslessly back to input on license number + state.
- Every shipped address has a deliverability verdict.
- No address in the send-eligible set is `invalid` or `email_suppress=true`.
- A one-page summary: rows enriched, coverage by state, confidence distribution, deliverability distribution, and count excluded and why.
