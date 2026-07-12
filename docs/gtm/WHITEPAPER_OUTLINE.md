# Whitepaper Outline: Defensible AI in Psychological Assessment

**Track:** both (single paper, forensic-weighted; clinical pull-quotes marked)
**Status:** outline for advisor review. Claude drafts full text after Robert assigns an advisor reviewer and byline scope.
**Length target:** 4,500 to 6,000 words, 12 to 16 pages designed, plus a 1-page executive summary.
**Byline:** Robert Irwin (Foundry SMB) + [CLINICAL ADVISOR, PhD/PsyD, pending Open Item 1]. Advisor byline is required for credibility; do not publish without it.
**Uses:** trust cluster SEO anchor, listserv and FB group citation asset, CE webinar backbone, The Trust (liability insurer) door-opener per plan partnership item 4.

## Working thesis

AI in psychological assessment is defensible only when the clinician demonstrably makes every clinical decision, the data trail proves it, and PHI never leaves the clinician's control. Defensibility is an architecture question, not a policy question.

## Outline

### Executive summary (1 page)
The three questions every evaluator will face about AI use: Who diagnosed? Where did the data go? Can you reproduce the record? One-paragraph answers, pointing into the paper.

### 1. The moment: AI adoption is outrunning guidance
- Survey data on clinician AI use; the guidance vacuum between APA generic AI statements and daily practice. [ADVISOR: confirm current state of APA/state board guidance as of mid 2026]
- The asymmetry: efficiency gains are private, discipline and cross-examination risks are public and career-level.
- Two audiences, one problem: the forensic evaluator facing cross-examination; the clinical assessor facing payer audit and board complaint. (Clinical pull-quote block.)

### 2. The cross-examination test (forensic core)
- How opposing counsel attacks AI-assisted reports: authorship, hallucinated or unsourced facts, PHI exposure to third-party models, inability to reproduce the process.
- Admissibility context: Daubert/Frye implications of AI-assisted work product; expert's duty to explain methodology. [ADVISOR REVIEW: legal accuracy; consider attorney co-reviewer]
- Transcript-style hypothetical: an evaluator who cannot answer "which sentences did the machine write?" versus one who produces a decision log.

### 3. The four failure modes of casual AI use
1. Cloud PHI exposure: consumer chatbots, BAA-less tools, prompt retention policies.
2. Ghost authorship: reports the clinician cannot fully attest to.
3. Unsourced findings: model-introduced claims with no chart anchor.
4. Irreproducibility: no record of what was asked, what came back, what was accepted or rejected.
- Each with: realistic vignette, the rule or standard implicated (HIPAA, EPPCC 9.01 bases for assessment opinions, 2.01 competence, record-keeping guidelines), and the remediation principle. [ADVISOR: verify ethics code citations]

### 4. Principles of defensible architecture
- Local-first PHI: case data stays on the clinician's machine; encryption at rest (AES-256 SQLCipher class); no vendor cloud case storage.
- De-identification before any model call: UNID redaction pattern; what leaves the machine and what never does.
- Human decision gates: the clinician renders, defers, or rejects every diagnosis with signed reasoning before drafting begins. THE DOCTOR ALWAYS DIAGNOSES as an enforceable workflow property, not a disclaimer.
- Audit-logged provenance: every fact in the report traceable to intake, instrument, or interview; the log exportable for discovery.
- Voice preservation: drafting in the clinician's own language corpus; why style transfer matters for authorship attestation.
- Framed as vendor-neutral evaluation criteria (a checklist the reader can apply to any tool, including ours).

### 5. Informed consent and disclosure language
- When and how to disclose AI assistance: court orders, retaining counsel, examinees, payers.
- Model consent paragraph and model methodology paragraph for reports (copy-paste blocks; high shareability, this section drives listserv citation).
- [ADVISOR REVIEW: consent language]

### 6. Documentation standards for AI-assisted evaluations
- What the file must contain: decision log, redaction record, model/version notes, prompt and output retention policy.
- Payer documentation angle (clinical pull-quote block): medical necessity language quality, audit response readiness.
- A one-page "AI use file checklist" (designed as a tear-out; also a standalone lead magnet later).

### 7. Applying the checklist (brief, disclosed product section)
- Walk the Section 4 criteria against Boreas Workflow, disclosed as the authors' product, per CE commercial-support norms so the paper remains usable in CE contexts.
- Honest limits section: what the tool does not do (no diagnosis, no cloud convenience features, requires clinician API key).

### Appendices
- A: Evaluation criteria checklist (reproduced).
- B: Model consent and methodology language (reproduced).
- C: Glossary for non-technical readers (local-first, BAA, redaction, audit log, LLM).
- References: ethics codes, record-keeping guidelines, HIPAA provisions, key admissibility cases. [ADVISOR + attorney check]

## Production plan

1. Claude drafts Sections 1 to 6 from this outline (2 sessions).
2. Advisor review pass (Robert routes; byline and edit credit).
3. Attorney sanity read of Sections 2 and 5 if available at low or no cost; otherwise soften to "not legal advice" framing.
4. Design pass: HTML + PDF, email-gated at /whitepaper, same lead pipeline as templates.
5. Derivatives: 6 LinkedIn posts, 2 listserv-safe discussion posts, webinar deck skeleton, The Trust outreach letter.

## Open dependencies

- Advisor name/credentials (Open Item 1, Robert).
- Decision: single combined paper (recommended, forensic-weighted) versus separate track versions. Recommendation: one paper, because the trust content travels between communities and dual versions double the review burden.
