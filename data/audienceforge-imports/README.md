# AudienceForge Imports

Read-only copies of AudienceForge export artifacts, ingested July 12, 2026. AudienceForge (separate product, `Products/AudienceForge`) is the list-building engine; this GTM project consumes its exports. Never edit these files in place; derived campaign lists get built as new files elsewhere. Originals remain untouched in AudienceForge.

Source root: `AudienceForge/exports/psygil/sales/`

## Folder layout

The four folders enforce a hard separation that must survive into every downstream asset:

| Folder | Level | Trust level |
|---|---|---|
| `individuals/` | Person (clinician) | License-verified where `license_status` says active |
| `practice-accounts/` | Account (practice) | Mostly inferred rollups, mostly low confidence |
| `psychology-today/` | Directory profile | Source universe only, NOT sales-ready |
| `public-search/` | Practice candidate | Web-search candidates, needs verification |

## File inventory

### individuals/

**`first_500_priority_contacts.csv`** (500 rows). Prioritized outbound slice. 100% phone coverage, 499/500 active license, strict subset of the full list. Columns include priority rank/score, ICP tier, fit reasons, recommended action, license number/status/type, phone, profile URLs, `source_summary` (provenance). **This is the first outbound list.** Weakness: 0 emails; call-first only until email enrichment.

**`all_contacts_prioritized.csv`** (7,788 rows). Full prioritized individual universe. CO 4,950 / KS 1,574 / NE 1,264. Phone 81.7% (6,361), email 0.2% (19). License status: 4,617 active, 3,171 blank (unverified). ICP tiers: Tier 1 Core 411, Tier 2 595, Tier 3 call-first 2,584, Tier 4 enrichment queue 4,198. Master reference and segmentation source, not a send list.

### practice-accounts/

**`practice_accounts.csv`** (5,654 rows). Account-level rollup inferred from individual data. 4,795 single practitioner, 843 multi practitioner, 16 enterprise office. Confidence: 5,526 low / 95 high / 33 medium. Only 37 have websites, 19 have emails. Do not import to CRM wholesale; use the high-confidence multi-practitioner slice (55 accounts) as practice-pilot candidates.

**`practice_account_members.csv`** (7,788 rows). Join table: contact_id to account_key. Use to avoid emailing five clinicians of one practice on the same day and to roll individual replies up to accounts.

**`practice_leadership_candidates.csv`** (26 rows). Names with leadership-sounding titles scraped from practice websites and news pages. ALL are scrape-inferred; `evidence_text` is raw scraped text and some rows are visibly wrong roles (e.g. hospital program figures, not practice owners). 0 emails. Verify every row by hand before any outreach. Keep `source_url` and `evidence_text` intact; they are the audit trail.

### psychology-today/

**`colorado_springs_psychology_today_profiles.csv`** (498 rows). Psychology Today directory scrape, Colorado Springs. **Source universe, not a sales list.** Only 22 rows are Psychologists; the rest are LPCs (183), social workers (90), LPC candidates (57), pre-licensed (34), MFTs (33), and others. 19 rows have parsing artifacts in `profile_type` ("Colorado Springs", "LLC" = credential field bled during scrape). `verification_note` and `source_page` are provenance; keep them.

### public-search/

**`colorado_psychology_practices_public_search.csv`** (75 rows). Practice candidates from public web search. Confidence: 39 high / 30 medium / 6 low. 100% website, 77% phone. These are candidates, not verified practices; confirm each is a real assessment/testing practice before outreach. `source_query`, `source_result_url`, `extraction_source_url` are provenance.

**`psychology_practices_public_search.xlsx`**. Workbook combining the two CSVs above plus a summary sheet (CO Practices Public, CO Springs PT Profiles, Summary). Convenience view for Robert; the CSVs are canonical for processing.

## Rules

1. Individuals and accounts stay separate lists; join only through `practice_account_members.csv`.
2. Psychology Today rows are never assumed to be licensed psychologists or practices.
3. Anything marked low confidence or scrape-inferred gets verified before it touches a campaign.
4. Provenance columns (`source_summary`, `source_url`, `evidence_text`, `source_page`, `source_result_url`, `extraction_source_url`, `verification_note`) are never stripped from derived files.

Full segmentation and campaign sequencing: `docs/gtm/AUDIENCEFORGE_IMPORT_PLAN.md`.
