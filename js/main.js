import { initHeroSim } from './hero-sim.js';
import { mountQaFrontier, mountSavings, mountWorkerModel } from './charts.js';

const root = document.documentElement;

// --- Theme: OS preference by default; an explicit choice is remembered per browser.
const themeToggle = document.querySelector('[data-theme-toggle]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
function paintThemeToggle() {
  const dark = currentTheme() === 'dark';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeToggle.dataset.mode = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0c0f0e' : '#f6f6f2');
}
themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  paintThemeToggle();
});
systemDark.addEventListener('change', paintThemeToggle);
paintThemeToggle();

// --- Header: compact border once scrolled; mobile menu.
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.getElementById('site-menu');
const setMenu = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
};
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});

// --- Current section in the navigation.
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        const active = a.getAttribute('href') === `#${entry.target.id}`;
        if (active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
sections.forEach((s) => sectionObserver.observe(s));

// --- Reveal on scroll (content is fully visible without JavaScript or with reduced motion).
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  root.classList.add('can-reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  document.querySelectorAll('[data-reveal]').forEach((node) => revealObserver.observe(node));
}

// --- Tabs (WAI-ARIA tabs pattern with automatic activation).
document.querySelectorAll('[role="tablist"]').forEach((list) => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab, false));
    tab.addEventListener('keydown', (event) => {
      const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in moves)) return;
      event.preventDefault();
      select(tabs[(moves[event.key] + tabs.length) % tabs.length], true);
    });
  });
});

// --- Case-study dialogs (native <dialog>: focus containment and Escape come built in).
document.querySelectorAll('[data-open-dialog]').forEach((button) => {
  const dialog = document.getElementById(button.dataset.openDialog);
  button.addEventListener('click', () => {
    dialog.showModal();
    dialog.querySelector('.dialog-body').scrollTop = 0;
  });
});
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelectorAll('[data-close-dialog]').forEach((b) => b.addEventListener('click', () => dialog.close()));
});

// --- Wake the live demos' APIs in the background. They run on a free tier that sleeps when idle
// and takes about half a minute to start, so they are ready by the time a visitor opens a demo.
const DEMO_API_HEALTH = [
  'https://dataqual-api.onrender.com/api/v1/health',
  'https://opspilot-c5y3.onrender.com/api/v1/health',
];
const wakeDemoApis = () => {
  if (navigator.connection?.saveData) return;
  DEMO_API_HEALTH.forEach((url) => fetch(url, { mode: 'no-cors', cache: 'no-store' }).catch(() => undefined));
};
if ('requestIdleCallback' in window) requestIdleCallback(wakeDemoApis, { timeout: 3000 });
else setTimeout(wakeDemoApis, 1500);

// --- Visualizations mount when they approach the viewport.
// Each mount is isolated: a visual that fails leaves the static page and every other visual working.
const safeMount = (node) => {
  try {
    node.__mount(node);
  } catch (error) {
    console.error('Visualization failed to load:', error);
  }
};
const mounts = [
  ['[data-hero-sim]', initHeroSim],
  ['[data-panel="savings"]', mountSavings],
  ['[data-panel="worker-model"]', mountWorkerModel],
  ['[data-panel="qa"]', mountQaFrontier],
];
const lazy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      lazy.unobserve(entry.target);
      safeMount(entry.target);
    });
  },
  { rootMargin: '400px 0px' },
);
mounts.forEach(([selector, mount]) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.__mount = mount;
    // Hidden tab panels have no box to intersect; mount them immediately (they render on first show).
    if (node.hidden) safeMount(node);
    else lazy.observe(node);
  });
});
