# Kevin Veigas Portfolio

Personal portfolio website presenting Kevin Veigas's experience, skills, education, and AI operations projects.

## Current architecture

This is a static website with no build step or server-side application.

- `index.html` contains the page markup and React components.
- `data.js` contains portfolio content and project links.
- `styles.css` contains the site styles.
- React 18, ReactDOM, Babel Standalone, Three.js, and Google Fonts load from public CDNs.
- JSX is compiled in the browser by Babel Standalone.

An internet connection is required for the CDN-hosted dependencies.

## Run locally

From the repository root, start any static file server. For example:

```powershell
npx serve .
```

Open the local URL printed by the command. You can also open `index.html` directly, but a static server provides a more reliable browser preview.

## Deployment

- Repository: <https://github.com/kveigas/kveigas.github.io>
- Live site: <https://kveigas.github.io>
- Hosting: GitHub Pages from the `main` branch

Updates are deployed by committing the portfolio changes and pushing the `main` branch to GitHub. GitHub Pages then publishes the repository's static files directly; no build command is required.

## Separate project deployments

DataQual is hosted separately at:

<https://subtle-kashata-db5525.netlify.app>

Ghost Oort is not deployed from this portfolio repository. It requires its own source repository and separate deployment. No Ghost Oort link should be added until its real deployment URL is available.

## Repository structure

```text
.
├── index.html       # Portfolio page and React components
├── data.js          # Portfolio content and project URLs
├── styles.css       # Site styling
├── favicon.svg      # Browser icon
├── icons.svg        # SVG icon asset
├── .gitignore       # Local-file exclusions
└── README.md        # Project and deployment documentation
```
