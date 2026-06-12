# boreasclinical.com

Marketing site for Boreas, the forensic psychology IDE. Static HTML, CSS, and SVG. No build step. No framework. No tracker. Deploys to Cloudflare Pages via GitHub integration.

## Structure

```
boreasclinical-website/
  index.html         Landing page
  features.html      Feature detail pages
  pricing.html       Three license tiers and FAQ
  demo.html          Five-stage walkthrough narrative
  download.html      Purchase-to-email flow and supported platforms
  styles.css         All styling, CSS custom properties, responsive rules
  logo.svg           Brand mark matching the app left column
  favicon.svg        Same mark with a dark background rect
  _headers           Cloudflare Pages security headers
  robots.txt         Crawler hints
  .gitignore
  README.md
```

## Local preview

Any static server works. Easiest:

```
python3 -m http.server 8080
```

Serve the public directory (cd public, then python3 -m http.server 8080) and open http://localhost:8080/ in a browser.

## Deploy to Cloudflare Pages

1. Push this repository to GitHub (new repo, separate from the app repo).
2. In the Cloudflare dashboard, open Pages and connect the GitHub repository.
3. Build settings:
   - Framework preset: None
   - Build command: leave empty
   - Build output directory: public
4. Save and deploy. First build takes under a minute.
5. Add a custom domain: boreasworkflow.com and www.boreasworkflow.com, both pointing at the Pages project.
6. Enable Always Use HTTPS and HSTS in the Cloudflare SSL/TLS settings.

Every push to the main branch triggers a production deploy. Every push to another branch creates a preview URL.

## Design tokens

All tokens live in `:root` at the top of styles.css. Change them in one place and the whole site updates. The palette matches the Boreas app shell.

```
--bg: #0d1117
--panel: #161b22
--border: #30363d
--text: #e6edf3
--text-secondary: #8b949e
--accent: #0969da
--accent-hover: #ff7a1f
--accent-muted: #f5a623
```

Typography is Inter for UI and headings, JetBrains Mono for meta lines, code, and evidence maps. Both load from Google Fonts.

## Content rules

The brand voice is dry, plain, and evidentiary. A few rules that belong in the head of every writer:

- Never use em dashes. Use commas, periods, or parentheticals.
- Never use curly quotes or curly apostrophes. Straight quotes only.
- Never use the marketing vocabulary Boreas refuses to use inside the app: leverage, utilize, facilitate, empower, unlock, seamless.
- Never drift from the core message: Boreas is an evidence ledger, not a decision engine. The clinician renders every diagnosis. The AI never diagnoses and never signs.
- Never invent features. The content here matches the app as shipped.

## License

Proprietary. All rights reserved by Foundry SMB.
