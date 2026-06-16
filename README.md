# ⚡ Performance Engineering — Skill Tree

A fast, dependency-free knowledge-graph + checklist for the 12-month
performance / kernel engineering roadmap. Tick items as you go; nodes fill,
glow, and unlock down the spine. Everything is saved locally in your browser.

![phases: Method → Month 1 → Month 2 → Months 3–4 → 5–6 → 7–8 → 9–12 → Capstone](https://img.shields.io/badge/phases-8-blue) ![checklist items](https://img.shields.io/badge/checklist-115%20items-success)

## What it is

- **A knowledge graph as a skill tree.** A central spine runs *The Method →
  Month 1 → … → Capstone*. Each phase fans out into satellite skill nodes
  (Roofline, CUDA Kernels, MLIR Core, FlashAttention, Pallas/Mosaic, vLLM …).
- **A progress ring on every node.** It fills as you tick items; a node turns
  solid and glows at 100%. The next incomplete node pulses as "you are here,"
  and the edge feeding it animates.
- **A detail drawer.** Click any node for its checklist *and* its curated
  resource links (papers, docs, repos) pulled straight from the roadmap.
- **A weekly maintenance deck** (the closed-book §9 retrieval list) behind the
  *↻ Weekly deck* button.
- **Local persistence.** Progress lives in `localStorage` — no account, no
  backend, no tracking. A confetti burst fires when you complete a node.

## Why it's fast

No frameworks, no bundler, no web fonts, no external requests. ~4 static
files. The graph is hand-laid SVG; repaints touch only the attributes that
changed. It loads instantly and works offline.

## Run locally

Just open `index.html` in a browser. (Or serve it: `python3 -m http.server`
then visit `http://localhost:8000`.)

## Deploy to GitHub Pages (free)

**Option A — GitHub Actions (included).** Merge this to `main`; the workflow
at `.github/workflows/pages.yml` publishes the repo root. Then in the repo:
**Settings → Pages → Build and deployment → Source: GitHub Actions**. Your
site appears at `https://<user>.github.io/<repo>/`.

**Option B — Deploy from a branch.** **Settings → Pages → Source: Deploy from
a branch → `main` / `(root)`**. No workflow needed; same URL.

## Make it yours

All content lives in **`data.js`** — phases, skills, checklist items, and
links. Edit that one file to add a node, reword a task, or drop in a resource;
the graph, rings, progress meter, and drawers all rebuild from it. An item is
either a string, or `{ t: "text", done: true }` to start it pre-checked
(that's how *Making Deep Learning Go Brrrr* is already ticked 🎉).

## Files

| file | what |
|------|------|
| `index.html` | shell + top bar + drawer markup |
| `styles.css` | dark/neon theme, system fonts only |
| `data.js` | **the roadmap** — single source of truth |
| `app.js` | SVG graph builder, progress state, drawer, confetti |
