# AudienceForge GTM Import Plan

**Date:** July 12, 2026
**Data:** `data/audienceforge-imports/` (see its README for file-level inventory)
**Scope:** how AudienceForge exports become campaigns, segments, and CRM imports. AudienceForge stays the list-building engine; nothing here modifies its data.

---

## 1. Normalized segmentation

Five entity classes. They do not mix in campaigns or CRM objects.

### A. Individual clinicians (person-level, license-anchored)
Source: `individuals/all_contacts_prioritized.csv` (7,788), `individuals/first_500_priority_contacts.csv` (500 subset).
CRM object: Contact. Key: `contact_id`. Dedup key: license_number where present, else normalized phone + name.
Segments to cut:
- **Active-licensed callable** (license_status=active AND phone): backbone of solo outbound
- Tier 1 Core ICP (411) and Tier 2 (595): first email sequences once emails exist
- Tier 4 enrichment queue (4,198): back to AudienceForge for enrichment, not campaign material

### B. Practice accounts (account-level, mostly inferred)
Source: `practice-accounts/practice_accounts.csv` (5,654) + `practice_account_members.csv` (join table).
CRM object: Account, with member Contacts linked via `account_key`.
Only one slice is near-term actionable: **multi-practitioner AND source_confidence=high = 55 accounts.** That is the practice-pilot candidate pool (plan target: 2 practice pilots in 90 days). The 5,526 low-confidence rows stay out of the CRM until verified.

### C. Psychology Today profiles (directory universe)
Source: `psychology-today/colorado_springs_psychology_today_profiles.csv` (498).
CRM object: none yet. This is research material for the Colorado Springs local sweep, not a contact list. Actionable extraction: the 22 Psychologist rows, cross-referenced against class A for license verification before any touch.

### D. Practice leadership candidates (scrape-inferred)
Source: `practice-accounts/practice_leadership_candidates.csv` (26).
CRM object: none until hand-verified. Each row needs: is the person real, is the title right, do they still work there, is the org actually an assessment practice. Evidence text shows at least some rows are miscategorized (hospital program figures, not practice owners). After verification, survivors become the named decision-maker on their matching class B account.

### E. Priority outbound list (execution slice)
Source: `individuals/first_500_priority_contacts.csv`.
This is the working list for the solo call-first motion. 500 rows, 100% phone, 499 active-licensed, ranked. It is a strict subset of class A, so CRM import happens once (class A) and this list becomes a view/segment, not a second import.

## 2. First outbound list: recommendation

**Use `first_500_priority_contacts.csv`, filtered to license_status=active (499 rows), as the first outbound motion. Call-first.**

Why this list:
- Only list with 100% direct phone coverage and license verification
- Already ranked by fit (priority_score, icp_tier, fit_reasons per row)
- Email coverage is 0, so an email sequence is impossible anyway; the assets that exist today (phone + Robert + demo video + templates) match a call-first motion
- The 55 high-confidence multi-practitioner accounts (class B) run in parallel as the practice-pilot motion, but that is Robert-led demo calls, not volume outbound

Before dialing: dedupe the 14 shared phone numbers (36 rows, worst case 5 contacts on one number; these are practice front desks, call once and ask for the highest-ranked contact). Queue email enrichment for the same 500 in AudienceForge so a 4-touch sequence can follow the call motion.

## 3. Data quality risks (verified counts, must clear before campaign use)

| # | Risk | Measured | Handling |
|---|---|---|---|
| 1 | **Duplicate phones, full list** | 718 numbers shared by 2+ contacts, 2,692 rows affected, worst 45 contacts on one number | Shared number = group practice or agency main line, not a direct line. Never treat as direct dial. Collapse to one call per number via `practice_account_members.csv` |
| 2 | **Duplicate phones, first 500** | 14 numbers, 36 rows, worst 5 | Same handling; small enough to resolve by hand before the first call block |
| 3 | **PT rows that are not psychologists** | 476 of 498 (95.6%) are not Psychologist-credentialed: LPC 183, LCSW 90, LPC candidate 57, pre-licensed 34, MFT 33, other 79 | Only the 22 Psychologist rows enter any assessment-focused campaign; the rest are out of ICP for now (they do not run testing batteries) |
| 4 | **PT parsing artifacts** | 19 rows with credential bleed in profile_type ("Colorado Springs", "LLC") | Manual reclassification before the CO Springs sweep uses the file |
| 5 | **Unverified license status** | 3,171 of 7,788 individuals (40.7%) blank license_status | Excluded from outbound until verified; they sit in the Tier 4 enrichment queue |
| 6 | **Practice accounts unverified** | 5,526 of 5,654 (97.7%) low confidence; only 37 have websites | Not CRM-importable. Only the 55 high-confidence multi-practitioner accounts advance |
| 7 | **Public-search practices are candidates, not practices** | 75 rows, 39 high / 30 medium / 6 low confidence | Verify each website confirms an actual assessment/testing practice before outreach; retain `extraction_source_url` as evidence |
| 8 | **Leadership candidates 100% scrape-inferred** | 26 rows, 0 emails, evidence includes visibly wrong roles | Hand-verify every row; assume wrong until proven. Never cold-contact a person based only on this file |
| 9 | **Email coverage near zero** | 19 emails in 7,788 (0.2%); 0 in first 500 | Email campaigns are blocked on enrichment. Do not buy a generic list; enrich the ranked 500 first |

## 4. Provenance rule

Every derived file (call lists, CRM imports, verification sheets) carries the source columns forward: `source_summary`, `source_url`, `evidence_text`, `source_page`, `source_result_url`, `extraction_source_url`, `verification_note`, and the AudienceForge `contact_id`/`account_key` keys. Provenance is the audit trail for opt-out handling and for feeding corrections back to AudienceForge. Stripping it is a build error.

## 5. Sequence from here

1. **Now:** hand-resolve the 14 shared numbers in the first 500; produce the class E call list view (with call script, separate asset)
2. **Now, parallel:** verify the 55 high-confidence multi-practitioner accounts against their members; produce the practice-pilot target sheet for Robert
3. **AudienceForge (later, its own project):** email enrichment for the ranked 500; license verification for the 3,171 blanks; state-by-state expansion beyond CO/KS/NE
4. **After enrichment:** 4-touch solo email sequence (plan section 5) over the enriched 500
5. **CO Springs local sweep:** reclassify the 19 PT artifact rows, verify the 22 psychologists, fold into the class A motion
