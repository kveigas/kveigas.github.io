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

The portfolio is prepared for GitHub-connected Netlify deployment:

- Build command: leave empty
- Publish directory: `.`
- Production branch: `main`

The root `netlify.toml` records the portable publish directory. Netlify automatically deploys the current static files after changes are pushed to the connected GitHub production branch.

Do not commit the local `.netlify/` directory. It contains machine-specific Netlify CLI state and is excluded by `.gitignore`.

## Netlify setup

1. Push this folder to a GitHub repository.
2. In Netlify, choose **Add new project** and import the GitHub repository.
3. Select the production branch, normally `main`.
4. Leave the build command empty.
5. Use `.` as the publish directory.
6. Deploy the site.

## Separate project deployments

DataQual is deployed separately at:

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
├── netlify.toml     # Portable Netlify publish configuration
├── .gitignore       # Local-file exclusions
└── README.md        # Project and deployment documentation
```
