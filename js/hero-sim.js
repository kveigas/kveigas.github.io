// Hero visual: a small, honest simulation of DataQual's adaptive label-collection rule.
// Annotators of differing reliability send labels to items. Each item keeps collecting
// labels until its posterior confidence reaches the target (minimum two labels); items still
// contested after the maximum go to expert review. Illustrative only, not measured results.

const CLASSES = 3;
const TARGET = 0.95;
const MIN_LABELS = 2;
const MAX_LABELS = 5;
const ANNOTATOR_ACCURACY = [0.96, 0.92, 0.88, 0.82, 0.74, 0.62];
const AMBIGUOUS_SHARE = 0.12;
const AMBIGUOUS_ACCURACY = 0.45;
const FLIGHT_MS = 950;
const HOLD_MS = 4200;
const FADE_MS = 700;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function posterior(votes) {
  // Symmetric confusion with each annotator's estimated accuracy (the planner's worker model).
  const logp = new Array(CLASSES).fill(0);
  for (const { annotator, label } of votes) {
    const acc = ANNOTATOR_ACCURACY[annotator];
    for (let k = 0; k < CLASSES; k++) {
      logp[k] += Math.log(k === label ? acc : (1 - acc) / (CLASSES - 1));
    }
  }
  const max = Math.max(...logp);
  const p = logp.map((v) => Math.exp(v - max));
  const sum = p.reduce((s, v) => s + v, 0);
  return p.map((v) => v / sum);
}

const ease = (t) => 1 - Math.pow(1 - t, 3);

export function initHeroSim(root) {
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // No 2D canvas (locked-down or very old browser): keep the caption, drop the empty stage.
    root.querySelector('.sim-stage').hidden = true;
    root.querySelector('[data-sim-toggle]').hidden = true;
    return;
  }
  const tooltip = root.querySelector('[data-sim-tooltip]');
  const toggle = root.querySelector('[data-sim-toggle]');
  const out = {
    used: root.querySelector('[data-sim="used"]'),
    fixed: root.querySelector('[data-sim="fixed"]'),
    saved: root.querySelector('[data-sim="saved"]'),
    settled: root.querySelector('[data-sim="settled"]'),
    expert: root.querySelector('[data-sim="expert"]'),
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let colors = {};
  let layout = null;
  let state = null;
  let seed = 20261001;
  let running = false;
  let userPaused = false;
  let visible = true;
  let rafId = null;
  let lastTime = 0;
  let hoverIndex = -1;

  function readColors() {
    const cs = getComputedStyle(root);
    const v = (name) => cs.getPropertyValue(name).trim();
    colors = {
      ink: v('--ink'),
      ink2: v('--ink-2'),
      ink3: v('--ink-3'),
      line: v('--line'),
      lineStrong: v('--line-strong'),
      accent: v('--series-a'),
      surface: v('--bg-elev'),
      warn: v('--warn'),
      font: v('--font-mono') || 'monospace',
    };
  }

  function computeLayout() {
    const narrow = width < 460;
    const cols = narrow ? 6 : 8;
    const rows = 5;
    const left = narrow ? 44 : 64;
    const gridLeft = left + (narrow ? 40 : 66);
    const gridRight = width - (narrow ? 14 : 22);
    const top = 34;
    const bottom = height - 16;
    const cellW = (gridRight - gridLeft) / cols;
    const cellH = (bottom - top) / rows;
    const radius = Math.max(7, Math.min(cellW, cellH) * 0.25);
    const items = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({ x: gridLeft + cellW * (c + 0.5), y: top + cellH * (r + 0.5) });
      }
    }
    const annotators = ANNOTATOR_ACCURACY.map((acc, i) => ({
      x: left,
      y: top + ((bottom - top) / ANNOTATOR_ACCURACY.length) * (i + 0.5),
      acc,
    }));
    return { cols, rows, items, annotators, radius, narrow, gridLeft, top };
  }

  function newRound() {
    const rand = mulberry32(seed++);
    const items = layout.items.map((pos, index) => ({
      ...pos,
      index,
      truth: Math.floor(rand() * CLASSES),
      ambiguous: rand() < AMBIGUOUS_SHARE,
      votes: [],
      pending: 0,
      post: new Array(CLASSES).fill(1 / CLASSES),
      status: 'open',
      changedAt: -1e9,
    }));
    const annotators = layout.annotators.map((a, i) => ({
      ...a,
      id: i,
      nextAt: 120 + rand() * 500,
      pulseAt: -1e9,
    }));
    state = { rand, items, annotators, flights: [], clock: 0, doneAt: null, used: 0 };
    renderStats();
  }

  function leading(item) {
    let best = 0;
    for (let k = 1; k < CLASSES; k++) if (item.post[k] > item.post[best]) best = k;
    return best;
  }

  function pickItem(annotator) {
    let best = null;
    let bestScore = Infinity;
    for (const item of state.items) {
      if (item.status !== 'open') continue;
      if (item.votes.some((v) => v.annotator === annotator.id)) continue;
      const committed = item.votes.length + item.pending;
      if (committed >= MAX_LABELS) continue;
      // Do not over-request: once the minimum is covered, wait for in-flight labels to land.
      if (committed >= MIN_LABELS && item.pending > 0) continue;
      const confidence = Math.max(...item.post);
      const score = committed * 10 + confidence + state.rand() * 0.5;
      if (score < bestScore) {
        bestScore = score;
        best = item;
      }
    }
    return best;
  }

  function vote(annotator, item) {
    const acc = item.ambiguous ? AMBIGUOUS_ACCURACY : annotator.acc;
    if (state.rand() < acc) return item.truth;
    const others = [...Array(CLASSES).keys()].filter((k) => k !== item.truth);
    return others[Math.floor(state.rand() * others.length)];
  }

  function land(flight) {
    const item = state.items[flight.item];
    item.pending -= 1;
    item.votes.push({ annotator: flight.annotator, label: flight.label });
    item.post = posterior(item.votes);
    state.used += 1;
    const confident = Math.max(...item.post) >= TARGET;
    if (item.votes.length >= MIN_LABELS && confident) {
      item.status = 'settled';
      item.changedAt = state.clock;
    } else if (item.votes.length >= MAX_LABELS) {
      item.status = 'expert';
      item.changedAt = state.clock;
    }
    renderStats();
  }

  function step(dt) {
    state.clock += dt;
    for (const a of state.annotators) {
      if (state.clock < a.nextAt) continue;
      const item = pickItem(a);
      if (item) {
        item.pending += 1;
        state.flights.push({
          annotator: a.id,
          item: item.index,
          label: vote(a, item),
          start: state.clock,
        });
        a.pulseAt = state.clock;
        a.nextAt = state.clock + 520 + state.rand() * 520;
      } else {
        a.nextAt = state.clock + 200;
      }
    }
    const arrived = state.flights.filter((f) => state.clock - f.start >= FLIGHT_MS);
    if (arrived.length) {
      state.flights = state.flights.filter((f) => state.clock - f.start < FLIGHT_MS);
      arrived.forEach(land);
    }
    const resolved = state.items.every((i) => i.status !== 'open');
    if (resolved && state.flights.length === 0 && state.doneAt === null) state.doneAt = state.clock;
    if (state.doneAt !== null && state.clock - state.doneAt > HOLD_MS + FADE_MS) newRound();
  }

  function runToEnd() {
    let guard = 0;
    while (guard++ < 20000) {
      step(50);
      if (state.doneAt !== null) break;
    }
    state.clock = state.doneAt ?? state.clock;
  }

  function renderStats() {
    const n = state.items.length;
    const fixed = n * MAX_LABELS;
    const settled = state.items.filter((i) => i.status === 'settled').length;
    const expert = state.items.filter((i) => i.status === 'expert').length;
    const committed = state.items.reduce((s, i) => s + i.votes.length, 0);
    out.used.textContent = committed.toLocaleString();
    out.fixed.textContent = fixed.toLocaleString();
    const allDone = settled + expert === n;
    out.saved.textContent = allDone ? `${Math.round((1 - committed / fixed) * 100)}%` : '—';
    out.settled.textContent = `${settled}/${n}`;
    out.expert.textContent = String(expert);
  }

  function arc(x, y, r, from, to) {
    ctx.beginPath();
    ctx.arc(x, y, r, from, to);
    ctx.stroke();
  }

  function drawCheck(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y + s * 0.02);
    ctx.lineTo(x - s * 0.12, y + s * 0.34);
    ctx.lineTo(x + s * 0.48, y - s * 0.3);
    ctx.stroke();
  }

  function draw() {
    const { radius } = layout;
    const fade = state.doneAt !== null && state.clock - state.doneAt > HOLD_MS
      ? 1 - Math.min(1, (state.clock - state.doneAt - HOLD_MS) / FADE_MS)
      : 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fade;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Column headings
    ctx.font = `500 10px ${colors.font}`;
    ctx.fillStyle = colors.ink3;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = layout.narrow ? 'left' : 'center';
    ctx.fillText(layout.narrow ? 'RATERS' : 'ANNOTATORS', layout.narrow ? layout.annotators[0].x - 20 : layout.annotators[0].x, 16);
    ctx.textAlign = 'left';
    ctx.fillText(
      layout.narrow ? `ITEMS · STOP AT ${Math.round(TARGET * 100)}%` : `ITEMS · STOP AT ${Math.round(TARGET * 100)}% CONFIDENCE`,
      layout.gridLeft - 4,
      16,
    );

    // Annotators: node with a reliability arc
    for (const a of state.annotators) {
      const pulse = Math.max(0, 1 - (state.clock - a.pulseAt) / 400);
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.line;
      arc(a.x, a.y, 11, 0, Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = colors.ink2;
      arc(a.x, a.y, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a.acc);
      ctx.fillStyle = colors.ink2;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 3 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      if (!layout.narrow) {
        ctx.font = `500 10px ${colors.font}`;
        ctx.fillStyle = colors.ink3;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(a.acc * 100)}%`, a.x - 18, a.y);
      }
    }

    // Labels in flight
    for (const f of state.flights) {
      const a = state.annotators[f.annotator];
      const item = state.items[f.item];
      const t = ease(Math.min(1, (state.clock - f.start) / FLIGHT_MS));
      const cx = (a.x + item.x) / 2;
      const cy = Math.min(a.y, item.y) - 30;
      const pt = (u) => ({
        x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * item.x,
        y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cy + u * u * item.y,
      });
      for (let i = 4; i >= 0; i--) {
        const p = pt(Math.max(0, t - i * 0.035));
        ctx.globalAlpha = fade * (i === 0 ? 0.9 : 0.16 * (5 - i) / 5);
        ctx.fillStyle = colors.ink2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, i === 0 ? 2.6 : 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = fade;
    }

    // Items
    for (const item of state.items) {
      const conf = Math.max(...item.post);
      const progress = Math.max(0, (conf - 1 / CLASSES) / (1 - 1 / CLASSES));
      const age = state.clock - item.changedAt;
      const pop = item.status !== 'open' && age < 360 ? 1 + 0.18 * Math.sin((age / 360) * Math.PI) : 1;
      const r = radius * pop;

      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.line;
      arc(item.x, item.y, r, 0, Math.PI * 2);

      if (item.status === 'settled') {
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(item.x, item.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.surface;
        ctx.lineWidth = 2;
        drawCheck(item.x, item.y, r * 0.9);
      } else if (item.status === 'expert') {
        ctx.strokeStyle = colors.warn;
        ctx.lineWidth = 2;
        arc(item.x, item.y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors.warn;
        ctx.font = `700 ${Math.round(r * 1.1)}px ${colors.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', item.x, item.y + 1);
      } else if (item.votes.length) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        arc(item.x, item.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      }

      // One dot per label: filled when it agrees with the current leading label.
      const lead = leading(item);
      const slots = MAX_LABELS;
      item.votes.forEach((v, i) => {
        const angle = -Math.PI / 2 + (i - (slots - 1) / 2) * 0.42;
        const vx = item.x + Math.cos(angle) * (r + 6);
        const vy = item.y + Math.sin(angle) * (r + 6);
        ctx.beginPath();
        ctx.arc(vx, vy, 2.2, 0, Math.PI * 2);
        if (v.label === lead) {
          ctx.fillStyle = colors.accent;
          ctx.fill();
        } else {
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = colors.ink3;
          ctx.stroke();
        }
      });

      if (item.index === hoverIndex) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = colors.ink;
        arc(item.x, item.y, r + 11, 0, Math.PI * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame(time) {
    rafId = null;
    const dt = lastTime ? Math.min(64, time - lastTime) : 16;
    lastTime = time;
    step(dt);
    draw();
    if (hoverIndex >= 0) updateTooltip();
    if (running) rafId = requestAnimationFrame(frame);
  }

  function shouldRun() {
    return !userPaused && visible && !document.hidden && !reduceMotion.matches;
  }

  function sync() {
    const next = shouldRun();
    if (next && !running) {
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    } else if (!next && running) {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }
    toggle.hidden = reduceMotion.matches;
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.querySelector('[data-label]').textContent = userPaused ? 'Play' : 'Pause';
    root.dataset.paused = String(!running);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const previousCount = layout ? layout.items.length : 0;
    layout = computeLayout();
    if (!state || previousCount !== layout.items.length) {
      newRound();
      if (reduceMotion.matches) runToEnd();
    } else {
      state.items.forEach((item, i) => Object.assign(item, layout.items[i]));
      state.annotators.forEach((a, i) => Object.assign(a, { x: layout.annotators[i].x, y: layout.annotators[i].y }));
    }
    draw();
  }

  function itemAt(x, y) {
    if (!state) return -1;
    let best = -1;
    let bestD = (layout.radius + 12) ** 2;
    for (const item of state.items) {
      const d = (item.x - x) ** 2 + (item.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = item.index;
      }
    }
    return best;
  }

  function updateTooltip() {
    const item = state.items[hoverIndex];
    if (!item) return;
    const conf = Math.round(Math.max(...item.post) * 100);
    const status = { open: 'Collecting labels', settled: 'Settled — stop paying for labels', expert: 'Still contested — send to an expert' }[item.status];
    const lead = leading(item);
    const agree = item.votes.filter((v) => v.label === lead).length;
    tooltip.innerHTML = `<strong>Item ${item.index + 1}</strong><span>${status}</span><span>${item.votes.length} label${item.votes.length === 1 ? '' : 's'} · ${agree} agree · ${item.votes.length ? conf : '—'}${item.votes.length ? '%' : ''} confident</span>`;
    const tipW = tooltip.offsetWidth;
    const left = Math.min(Math.max(8, item.x - tipW / 2), width - tipW - 8);
    const top = item.y - layout.radius - 18 - tooltip.offsetHeight;
    tooltip.style.transform = `translate(${left}px, ${Math.max(4, top)}px)`;
  }

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const next = itemAt(event.clientX - rect.left, event.clientY - rect.top);
    if (next !== hoverIndex) {
      hoverIndex = next;
      tooltip.hidden = next < 0;
      if (!running) draw();
    }
    if (next >= 0) updateTooltip();
  });
  canvas.addEventListener('pointerleave', () => {
    hoverIndex = -1;
    tooltip.hidden = true;
    if (!running) draw();
  });

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches && state) runToEnd();
    sync();
    draw();
  });
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(() => {
    readColors();
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    readColors();
    if (state) draw();
  });

  readColors();
  resize();
  sync();
}
