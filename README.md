# Kevin Veigas — portfolio

Source for <https://kveigas.github.io>: experience, skills and two AI human-data projects (DataQual and OpsPilot), with interactive charts drawn from each project's published evidence.

## Architecture

A static site with no build step and no framework.

- `index.html` holds all content as semantic HTML, so the page is readable and indexable without JavaScript.
- `styles.css` defines light and dark themes as CSS custom properties (OS preference by default, with a toggle that is remembered per browser).
- `js/main.js` handles the theme, navigation, tabs, case-study dialogs (native `<dialog>`) and lazy mounting of visualizations.
- `js/hero-sim.js` is the hero canvas: a small simulation of DataQual's adaptive label-collection rule. It pauses off-screen, in background tabs and on request, and renders a static final frame for `prefers-reduced-motion`.
- `js/charts.js` draws the evidence charts as SVG sized to their container. Every chart has hover/focus tooltips and a data-table equivalent.
- `js/evidence.js` contains the chart data, copied from the project repositories (see below).
- Fonts load from Google Fonts. There are no other third-party requests and no analytics.

## Updating the evidence charts

Chart values come from files committed in the project repositories. Update them only by re-running those projects' evaluation scripts, then copying the new values into `js/evidence.js`:

| Chart | Source |
| --- | --- |
| Label savings, worker model vs. vote | `dataqual/docs/evidence/adaptive-collection*/summary.md` |
| Review ranking | `dataqual/docs/evidence/review-ranking-v2/S*.json` |
| Adaptive QA | `opspilot/docs/evidence/adaptive_qa_benchmark.json` |

Product screenshots in `assets/` were captured at 1440×900 from local builds of each project running on synthetic demo data.

## Run locally

Any static file server works, for example:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>. ES modules do not load from `file://`, so opening `index.html` directly will not run the scripts.

## Deployment

- Repository: <https://github.com/kveigas/kveigas.github.io>
- Hosting: GitHub Pages from the `main` branch. Pushing to `main` publishes the site.
- When changing `styles.css` or the scripts, bump the `?v=` query string in `index.html` so returning visitors get the new files.

## Separate project deployments

- DataQual: <https://kveigas.github.io/dataqual/>
- OpsPilot: <https://kveigas.github.io/opspilot/> (API <https://opspilot-c5y3.onrender.com>)

Ghost Oort is not deployed from this portfolio repository. It requires its own source repository and separate deployment. No Ghost Oort link should be added until its real deployment URL is available.

## Structure

```text
.
├── index.html          # All page content
├── styles.css          # Themes, layout and components
├── favicon.svg         # Monogram icon (adapts to dark mode)
├── js/
│   ├── main.js         # Page behaviour
│   ├── hero-sim.js     # Hero simulation (canvas)
│   ├── charts.js       # Evidence charts (SVG)
│   └── evidence.js     # Chart data with sources
└── assets/
    ├── social-card.png # Link-preview image (1200×630)
    ├── dataqual/       # Product screenshots
    └── opspilot/
```
