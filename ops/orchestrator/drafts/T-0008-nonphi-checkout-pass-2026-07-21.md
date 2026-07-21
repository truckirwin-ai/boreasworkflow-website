# T-0008 — non-PHI positioning pass on the live checkout surfaces (STAGED, apply as written)
*GO 2026-07-21 (founder). Per the 2026-07-18 recommendations-only directive, this is staged for you to apply in the boreas code repo + deploy — the agent does not edit the live site. ~30 min. Bump the build marker after.*

## Why
A Solo buyer can currently reach Stripe checkout without ever seeing that Boreas is a non-PHI workflow tool, not a HIPAA business-associate service. This pass makes the boundary visible before payment and corrects any copy that implies BAA scope.

## 1. `download.html` — pricing / founder-rate context + checkout gate
**Add a boundary line** in the pricing-table / founder-rate context block (near the tiers, above the buy button):

> Boreas is a non-PHI workflow tool. It runs locally and is designed for de-identified and workflow use — it is not a HIPAA business associate and no BAA is offered. Do not enter protected health information (PHI).

**Add a required checkout checkbox** (must be checked before the Stripe button enables):

> ☐ I understand Boreas is for non-PHI, workflow use only and that no BAA is provided.

Wire the Stripe/checkout button to stay disabled until the box is checked.

## 2. `policies.html#hipaa` — reflect the locked stance
Ensure the HIPAA section states plainly:
- Boreas is a local-first workflow tool; it is not a HIPAA covered entity or business associate.
- No BAA is offered or implied.
- Users are responsible for keeping PHI out of the workflow; the product is built for de-identified / non-PHI use.

Remove or reword any sentence that could read as offering HIPAA/BAA coverage.

## 3. Solo references
Scan `download.html`, pricing copy, and any Solo-tier description for language implying BAA or PHI-handling scope. Correct to match §1/§2. The Solo tier is non-PHI workflow like the others.

## 4. Finish
- Bump the build marker / version string so the deploy is verifiable.
- Deploy.
- Reply "T-0008 deployed" and the next brief will confirm the boundary is live on the checkout surface.

## Acceptance (from todos.md)
(1) download.html carries the non-PHI line + checkout checkbox; (2) policies.html#hipaa reflects the locked stance; (3) Solo BAA implications corrected; (4) build marker updated.
