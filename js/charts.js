// Evidence charts: plain SVG, sized to their container, themed through CSS custom properties.
// Every chart has a data-table twin; tooltips enhance but never gate a value.
import {
  ADAPTIVE_HIGH,
  ADAPTIVE_STANDARD,
  QA_SUMMARY,
  QA_WORLDS,
  RANKING,
  RANKING_METHODS,
  SCENARIOS,
} from './evidence.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(name, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value));
  }
  if (parent) parent.appendChild(node);
  return node;
}

function text(parent, x, y, content, cls, attrs = {}) {
  const node = svgEl('text', { x, y, class: cls, ...attrs }, parent);
  node.textContent = content;
  return node;
}

const linear = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
const pct = (v, digits = 0) => `${(v * 100).toFixed(digits)}%`;
const signed = (v, digits = 1) => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v).toFixed(digits)}`;
const median = (values) => {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Re-render a chart whenever its frame changes width (also covers hidden tab panels). */
function responsive(frame, render) {
  let lastWidth = 0;
  const run = () => {
    const width = Math.floor(frame.clientWidth);
    if (!width || width === lastWidth) return;
    lastWidth = width;
    render(width);
  };
  new ResizeObserver(run).observe(frame);
  return () => {
    lastWidth = 0;
    run();
  };
}

function tooltipFor(frame) {
  let tip = frame.querySelector('.chart-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'chart-tooltip';
    tip.hidden = true;
    tip.setAttribute('role', 'presentation');
    frame.appendChild(tip);
  }
  return {
    show(html, x, y) {
      tip.innerHTML = html;
      tip.hidden = false;
      const fw = frame.clientWidth;
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const left = Math.min(Math.max(4, x - w / 2), fw - w - 4);
      const top = y - h - 12 < 0 ? y + 16 : y - h - 12;
      tip.style.transform = `translate(${left}px, ${top}px)`;
    },
    hide() {
      tip.hidden = true;
    },
  };
}

function renderTable(container, columns, rows) {
  const table = document.createElement('table');
  const thead = table.createTHead().insertRow();
  columns.forEach((c) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = c.label;
    if (c.numeric) th.className = 'num';
    thead.appendChild(th);
  });
  const tbody = table.createTBody();
  rows.forEach((row) => {
    const tr = tbody.insertRow();
    columns.forEach((c, i) => {
      const cell = i === 0 ? document.createElement('th') : document.createElement('td');
      if (i === 0) cell.scope = 'row';
      cell.textContent = c.value(row);
      if (c.numeric) cell.className = 'num';
      tr.appendChild(cell);
    });
  });
  container.replaceChildren(table);
}

/**
 * Rows of dots on one shared horizontal scale: one row per scenario.
 * marks: [{ value, kind: 'a' | 'b' | 'muted', name }]; link: [from, to] draws a connector.
 */
function renderDotRows(frame, width, cfg) {
  const narrow = width < 560;
  const labelW = narrow ? 104 : 196;
  const endW = narrow ? 52 : 70;
  const rowH = narrow ? 38 : 32;
  const top = 6;
  const axisH = 28;
  const height = top + cfg.rows.length * rowH + axisH;
  const x0 = labelW + 8;
  const x1 = width - endW - 10;
  const x = linear(cfg.domain[0], cfg.domain[1], x0, x1);

  const svg = svgEl('svg', {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    role: 'group',
    'aria-label': cfg.ariaLabel,
    class: 'chart-svg',
  });
  const grid = svgEl('g', { class: 'chart-grid', 'aria-hidden': 'true' }, svg);
  const axisY = top + cfg.rows.length * rowH;
  cfg.ticks.forEach((t) => {
    svgEl('line', { x1: x(t), x2: x(t), y1: top, y2: axisY, class: 'gridline' }, grid);
    text(grid, x(t), axisY + 18, cfg.tickFormat(t), 'tick', { 'text-anchor': 'middle' });
  });
  svgEl('line', { x1: x0, x2: x1, y1: axisY, y2: axisY, class: 'baseline' }, grid);
  if (cfg.endHeading) text(grid, width - 4, axisY + 18, cfg.endHeading, 'tick', { 'text-anchor': 'end' });

  const tip = tooltipFor(frame);
  cfg.rows.forEach((row, i) => {
    const cy = top + i * rowH + rowH / 2;
    const g = svgEl('g', { class: 'chart-row', tabindex: 0, role: 'img', 'aria-label': row.aria }, svg);
    svgEl('rect', { x: 0, y: cy - rowH / 2, width, height: rowH, class: 'row-hit', rx: 6 }, g);
    if (narrow) {
      text(g, 4, cy - 3, row.code, 'row-code');
      text(g, 4, cy + 11, row.name, 'row-name row-name-sm');
    } else {
      text(g, 4, cy + 4, row.code, 'row-code');
      text(g, 40, cy + 4, row.name, 'row-name');
    }
    if (row.link) {
      const [a, b] = row.link;
      svgEl('line', { x1: x(a), x2: x(b), y1: cy, y2: cy, class: 'link' }, g);
    }
    const order = { muted: 0, b: 1, a: 2 };
    [...row.marks]
      .sort((m, n) => order[m.kind] - order[n.kind])
      .forEach((m) => {
        svgEl('circle', { cx: x(m.value), cy, r: m.kind === 'muted' ? 3.5 : 5.5, class: `dot dot-${m.kind}` }, g);
      });
    text(g, width - 4, cy + 4, row.end, `row-end${row.endClass ? ` ${row.endClass}` : ''}`, { 'text-anchor': 'end' });

    const show = () => {
      g.classList.add('is-active');
      const xs = row.marks.map((m) => x(m.value));
      tip.show(row.tip, (Math.min(...xs) + Math.max(...xs)) / 2, cy - 6);
    };
    const hide = () => {
      g.classList.remove('is-active');
      tip.hide();
    };
    g.addEventListener('pointerenter', show);
    g.addEventListener('pointerleave', hide);
    g.addEventListener('focus', show);
    g.addEventListener('blur', hide);
  });

  frame.querySelector('svg')?.remove();
  frame.prepend(svg);
}

// ---------------------------------------------------------------------------
// DataQual: adaptive label collection

function savingsRows(design, target) {
  const source = design === 'high' ? ADAPTIVE_HIGH : ADAPTIVE_STANDARD;
  return source
    .filter((r) => r[1] === target)
    .map(([code, , adaptive, full, accA, accFull, accMv]) => ({
      code,
      name: SCENARIOS[code],
      adaptive,
      full,
      saved: 1 - adaptive / full,
      accA,
      accFull,
      accMv,
    }));
}

export function mountSavings(panel) {
  const frame = panel.querySelector('[data-chart="savings"]');
  const tableBox = panel.querySelector('[data-table="savings"]');
  const summary = panel.querySelector('[data-summary="savings"]');
  const note = panel.querySelector('[data-note="savings"]');
  const targetGroup = panel.querySelector('[data-control="target"]');
  let design = 'standard';
  let target = 0.95;

  const draw = (width) => {
    const rows = savingsRows(design, target);
    renderDotRows(frame, width, {
      ariaLabel: `Labels per item, adaptive versus full redundancy, by scenario (${design === 'high' ? '7 to 9' : '3 to 5'} labels per item, target ${pct(target)})`,
      // A dot plot encodes position, not length, so the scale starts where the data does.
      domain: design === 'high' ? [2, 8.5] : [2, 4.1],
      ticks: design === 'high' ? [2, 4, 6, 8] : [2, 2.5, 3, 3.5, 4],
      tickFormat: (t) => String(t),
      endHeading: 'Saved',
      rows: rows.map((r) => ({
        code: r.code,
        name: r.name,
        link: [r.adaptive, r.full],
        marks: [
          { value: r.full, kind: 'b' },
          { value: r.adaptive, kind: 'a' },
        ],
        end: r.saved < 0.005 ? '0%' : `−${Math.round(r.saved * 100)}%`,
        aria: `${r.code} ${r.name}: ${r.adaptive.toFixed(2)} labels per item adaptive versus ${r.full.toFixed(2)} full, ${Math.round(r.saved * 100)}% saved; accuracy ${r.accA.toFixed(1)}% versus ${r.accFull.toFixed(1)}%`,
        tip: `<strong>${r.code} · ${r.name}</strong>
          <span><i class="key key-a"></i>Adaptive ${r.adaptive.toFixed(2)} labels/item · ${r.accA.toFixed(1)}% accurate</span>
          <span><i class="key key-b"></i>Every label ${r.full.toFixed(2)} labels/item · ${r.accFull.toFixed(1)}% accurate</span>`,
      })),
    });
    const saved = rows.map((r) => r.saved * 100);
    const accChange = rows.map((r) => r.accA - r.accFull);
    const worst = Math.min(...accChange);
    const range = `${Math.round(Math.min(...saved))}–${Math.round(Math.max(...saved))}% fewer labels (median ${Math.round(median(saved))}%)`;
    summary.textContent = worst > -0.05
      ? `${range}, with accuracy identical to using every label in all 12 scenarios.`
      : `${range}. Largest accuracy cost versus using every label: ${Math.abs(worst).toFixed(1)} points.`;
    note.hidden = design !== 'high';
    renderTable(tableBox, [
      { label: 'Scenario', value: (r) => `${r.code} ${r.name}` },
      { label: 'Adaptive labels/item', numeric: true, value: (r) => r.adaptive.toFixed(2) },
      { label: 'Full labels/item', numeric: true, value: (r) => r.full.toFixed(2) },
      { label: 'Saved', numeric: true, value: (r) => `${Math.round(r.saved * 100)}%` },
      { label: 'Accuracy adaptive', numeric: true, value: (r) => `${r.accA.toFixed(1)}%` },
      { label: 'Accuracy every label', numeric: true, value: (r) => `${r.accFull.toFixed(1)}%` },
    ], rows);
  };

  const refresh = responsive(frame, draw);
  panel.querySelectorAll('input[name="dq-design"]').forEach((input) => {
    input.addEventListener('change', () => {
      design = input.value;
      if (design === 'high') target = 0.95;
      targetGroup.querySelectorAll('input').forEach((t) => {
        t.disabled = design === 'high' && Number(t.value) !== 0.95;
        t.checked = Number(t.value) === target;
      });
      refresh();
    });
  });
  targetGroup.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', () => {
      target = Number(input.value);
      refresh();
    });
  });
}

export function mountWorkerModel(panel) {
  const frame = panel.querySelector('[data-chart="worker-model"]');
  const tableBox = panel.querySelector('[data-table="worker-model"]');
  const rows = savingsRows('standard', 0.95)
    .map((r) => ({ ...r, gap: r.accFull - r.accMv }))
    .sort((a, b) => b.gap - a.gap);
  responsive(frame, (width) =>
    renderDotRows(frame, width, {
      ariaLabel: 'Accuracy of majority vote versus the Dawid–Skene worker model, by scenario',
      domain: [60, 100],
      ticks: [60, 70, 80, 90, 100],
      tickFormat: (t) => `${t}%`,
      endHeading: 'Points',
      rows: rows.map((r) => ({
        code: r.code,
        name: r.name,
        link: [r.accMv, r.accFull],
        marks: [
          { value: r.accMv, kind: 'b' },
          { value: r.accFull, kind: 'a' },
        ],
        end: signed(r.gap),
        endClass: r.gap < 0 ? 'is-negative' : '',
        aria: `${r.code} ${r.name}: worker model ${r.accFull.toFixed(1)}%, majority vote ${r.accMv.toFixed(1)}%, difference ${signed(r.gap)} points`,
        tip: `<strong>${r.code} · ${r.name}</strong>
          <span><i class="key key-a"></i>Dawid–Skene ${r.accFull.toFixed(1)}%</span>
          <span><i class="key key-b"></i>Majority vote ${r.accMv.toFixed(1)}%</span>`,
      })),
    }),
  );
  renderTable(tableBox, [
    { label: 'Scenario', value: (r) => `${r.code} ${r.name}` },
    { label: 'Dawid–Skene', numeric: true, value: (r) => `${r.accFull.toFixed(1)}%` },
    { label: 'Majority vote', numeric: true, value: (r) => `${r.accMv.toFixed(1)}%` },
    { label: 'Difference (pts)', numeric: true, value: (r) => signed(r.gap) },
  ], rows);
}

export function mountRanking(panel) {
  const frame = panel.querySelector('[data-chart="ranking"]');
  const tableBox = panel.querySelector('[data-table="ranking"]');
  const rows = Object.entries(RANKING).map(([code, scores]) => {
    const baselines = Object.entries(scores).filter(([m]) => m !== 'erv');
    const [bestKey, bestValue] = baselines.reduce((best, cur) => (cur[1] > best[1] ? cur : best));
    return { code, name: SCENARIOS[code], scores, erv: scores.erv, bestKey, bestValue, diff: scores.erv - bestValue };
  });
  responsive(frame, (width) =>
    renderDotRows(frame, width, {
      ariaLabel: 'Review ranking: ERV versus the best simple baseline, mean normalized AUREC at 20 percent budget, by scenario',
      domain: [0, 0.6],
      ticks: [0, 0.2, 0.4, 0.6],
      tickFormat: (t) => t.toFixed(1),
      endHeading: 'ERV − best',
      rows: rows.map((r) => ({
        code: r.code,
        name: r.name,
        link: [r.erv, r.bestValue],
        marks: [
          ...Object.entries(r.scores)
            .filter(([m]) => m !== 'erv' && m !== r.bestKey)
            .map(([, v]) => ({ value: v, kind: 'muted' })),
          { value: r.bestValue, kind: 'b' },
          { value: r.erv, kind: 'a' },
        ],
        end: signed(r.diff, 3),
        endClass: 'is-negative',
        aria: `${r.code} ${r.name}: ERV ${r.erv.toFixed(3)}, best baseline ${RANKING_METHODS[r.bestKey]} ${r.bestValue.toFixed(3)}`,
        tip: `<strong>${r.code} · ${r.name}</strong>
          <span><i class="key key-a"></i>ERV ${r.erv.toFixed(3)}</span>
          <span><i class="key key-b"></i>${RANKING_METHODS[r.bestKey]} ${r.bestValue.toFixed(3)} (best baseline)</span>
          <span><i class="key key-muted"></i>Random ${r.scores.random.toFixed(3)}</span>`,
      })),
    }),
  );
  renderTable(tableBox, [
    { label: 'Scenario', value: (r) => `${r.code} ${r.name}` },
    ...Object.entries(RANKING_METHODS).map(([key, label]) => ({
      label,
      numeric: true,
      value: (r) => r.scores[key].toFixed(3),
    })),
  ], rows);
}

// ---------------------------------------------------------------------------
// OpsPilot: adaptive QA versus uniform review

export function mountQaFrontier(panel) {
  const frame = panel.querySelector('[data-chart="qa"]');
  const tableBox = panel.querySelector('[data-table="qa"]');
  const s = QA_SUMMARY;

  responsive(frame, (width) => {
    const narrow = width < 560;
    const m = { top: 18, right: narrow ? 10 : 18, bottom: 46, left: narrow ? 42 : 52 };
    const height = Math.round(Math.min(480, Math.max(320, width * 0.7)));
    const x = linear(0, 1, m.left, width - m.right);
    const y = linear(0, 0.065, height - m.bottom, m.top);
    const svg = svgEl('svg', {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      role: 'group',
      'aria-label': 'Undetected errors shipped versus share of tasks reviewed: adaptive QA in 40 synthetic worlds compared with uniform review',
      class: 'chart-svg',
    });
    const grid = svgEl('g', { class: 'chart-grid', 'aria-hidden': 'true' }, svg);
    [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06].forEach((t) => {
      svgEl('line', { x1: m.left, x2: width - m.right, y1: y(t), y2: y(t), class: t ? 'gridline' : 'baseline' }, grid);
      text(grid, m.left - 8, y(t) + 4, `${Math.round(t * 100)}%`, 'tick', { 'text-anchor': 'end' });
    });
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach((t) => {
      text(grid, x(t), height - m.bottom + 18, `${Math.round(t * 100)}%`, 'tick', { 'text-anchor': 'middle' });
    });
    text(grid, (m.left + width - m.right) / 2, height - 8, 'Share of tasks reviewed', 'axis-title', { 'text-anchor': 'middle' });
    text(grid, 12, m.top - 6, 'Errors shipped', 'axis-title', { 'text-anchor': 'start' });

    // Expected error under uniform review: each error is caught with probability r.
    svgEl('line', { x1: x(0), y1: y(s.noQaError), x2: x(1), y2: y(0), class: 'series-line-b' }, svg);

    const annotations = svgEl('g', { class: 'annotation', 'aria-hidden': 'true' }, svg);
    const ax = x(s.adaptive.share);
    svgEl('line', { x1: ax, x2: ax, y1: y(s.flatBudgetMatched.error) + 7, y2: y(s.adaptive.error) - 8, 'marker-end': 'url(#qa-arrow)' }, annotations);
    const ay = y(s.adaptive.error);
    svgEl('line', { x1: x(s.flatEqualQuality.share) - 8, x2: ax + 9, y1: ay, y2: ay, 'marker-end': 'url(#qa-arrow)' }, annotations);
    const defs = svgEl('defs', {}, svg);
    const marker = svgEl('marker', { id: 'qa-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    svgEl('path', { d: 'M1 1 L9 5 L1 9', class: 'arrowhead' }, marker);
    // Numbered badges mark the two comparisons; their explanations sit in the empty area above the line.
    const badge = (cx, cy, n) => {
      svgEl('circle', { cx, cy, r: 9, class: 'badge' }, annotations);
      text(annotations, cx, cy + 4, String(n), 'badge-text', { 'text-anchor': 'middle' });
    };
    badge(ax - 20, y(s.flatBudgetMatched.error), 1);
    badge(x(s.flatEqualQuality.share), ay + 18, 2);
    const noteX = x(0.32);
    const noteY = y(0.0605);
    const notes = narrow
      ? [['Same budget:', ' errors halved'], ['Same quality:', ' 43% fewer reviews']]
      : [['Same budget:', ' errors halved, 3.5% → 1.8%'], ['Same quality:', ' 43% fewer reviews, 71% → 40%']];
    notes.forEach(([lead, rest], i) => {
      const ny = noteY + i * 22;
      badge(noteX, ny - 4, i + 1);
      const line = text(annotations, noteX + 16, ny, '', 'annotation-text');
      const strong = svgEl('tspan', { class: 'strong' }, line);
      strong.textContent = lead;
      const tail = svgEl('tspan', {}, line);
      tail.textContent = rest;
    });
    if (!narrow) {
      text(annotations, x(0.78), y(s.noQaError * 0.22) - 9, 'Uniform review', 'annotation-text');
    }

    const points = [];
    const worlds = svgEl('g', {}, svg);
    QA_WORLDS.forEach(([share, err, , flatErr], i) => {
      svgEl('circle', { cx: x(share), cy: y(err), r: 3.5, class: 'dot dot-a dot-world' }, worlds);
      points.push({
        px: x(share),
        py: y(err),
        tip: `<strong>Synthetic world ${i + 1}</strong>
          <span><i class="key key-a"></i>Adaptive: ${pct(share, 1)} reviewed, ${pct(err, 2)} shipped</span>
          <span><i class="key key-b"></i>Uniform at same budget: ${pct(flatErr, 2)} shipped</span>`,
      });
    });
    const flatPoints = [
      [s.flatBaseRate, 'Uniform at the 20% base rate'],
      [s.flatBudgetMatched, 'Uniform, same budget as adaptive'],
      [s.flatEqualQuality, 'Uniform, same quality as adaptive'],
    ];
    flatPoints.forEach(([p, label]) => {
      svgEl('circle', { cx: x(p.share), cy: y(p.error), r: 6, class: 'dot dot-b' }, svg);
      points.push({
        px: x(p.share),
        py: y(p.error),
        tip: `<strong>${label}</strong><span><i class="key key-b"></i>Mean of 40 worlds: ${pct(p.share, 1)} reviewed, ${pct(p.error, 2)} shipped</span>`,
      });
    });
    svgEl('circle', { cx: x(s.adaptive.share), cy: y(s.adaptive.error), r: 7, class: 'dot dot-a dot-mean' }, svg);
    points.push({
      px: x(s.adaptive.share),
      py: y(s.adaptive.error),
      tip: `<strong>Adaptive QA, mean of 40 worlds</strong><span><i class="key key-a"></i>${pct(s.adaptive.share, 1)} reviewed, ${pct(s.adaptive.error, 2)} shipped</span><span>Better than uniform at equal budget in ${s.pairedDifference.wins}/${s.pairedDifference.worlds} worlds</span>`,
    });

    const focusRing = svgEl('circle', { r: 11, class: 'focus-ring', visibility: 'hidden' }, svg);
    const tip = tooltipFor(frame);
    const hit = svgEl('rect', { x: m.left, y: m.top, width: width - m.left - m.right, height: height - m.top - m.bottom, class: 'hit-layer' }, svg);
    const nearest = (px, py) => {
      let best = null;
      let bestD = 24 * 24;
      points.forEach((p) => {
        const d = (p.px - px) ** 2 + (p.py - py) ** 2;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      });
      return best;
    };
    hit.addEventListener('pointermove', (event) => {
      const rect = svg.getBoundingClientRect();
      const p = nearest(event.clientX - rect.left, event.clientY - rect.top);
      if (!p) {
        tip.hide();
        focusRing.setAttribute('visibility', 'hidden');
        return;
      }
      focusRing.setAttribute('cx', p.px);
      focusRing.setAttribute('cy', p.py);
      focusRing.setAttribute('visibility', 'visible');
      tip.show(p.tip, p.px, p.py);
    });
    hit.addEventListener('pointerleave', () => {
      tip.hide();
      focusRing.setAttribute('visibility', 'hidden');
    });

    frame.querySelector('svg')?.remove();
    frame.prepend(svg);
  });

  renderTable(tableBox, [
    { label: 'Policy', value: (r) => r.label },
    { label: 'Tasks reviewed', numeric: true, value: (r) => pct(r.share, 1) },
    { label: 'Undetected errors shipped', numeric: true, value: (r) => pct(r.error, 2) },
  ], [
    { label: 'Adaptive (trust tiers, 20% base rate)', ...s.adaptive },
    { label: 'Uniform, same budget as adaptive', ...s.flatBudgetMatched },
    { label: 'Uniform at the 20% base rate', ...s.flatBaseRate },
    { label: 'Uniform, same quality as adaptive', ...s.flatEqualQuality },
    { label: 'No QA', share: 0, error: s.noQaError },
  ]);
}
