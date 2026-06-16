/* ---------------------------------------------------------------------------
 * Perf Engineering Skill Tree — app
 * Vanilla JS, no deps. Builds an SVG knowledge graph from window.ROADMAP,
 * tracks per-item completion in localStorage, lights nodes as you progress.
 * ------------------------------------------------------------------------- */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var STORE_KEY = "perfRoadmap.v1";
  var DATA = window.ROADMAP;

  /* ---- geometry ---------------------------------------------------------- */
  var W = 1200;            // viewBox width
  var CX = 600;            // central spine x
  var TOP = 110;           // first hub y
  var SKILL_DX = 330;      // horizontal offset of skill nodes from spine
  var SKILL_GAP = 84;      // vertical gap between stacked skills on one side
  var MIN_HALF = 96;       // minimum half-height of a phase band
  var BAND_PAD = 56;       // extra space between bands
  var HUB_R = 33;
  var SKILL_R = 23;

  /* ---- state ------------------------------------------------------------- */
  var done = loadState();        // { itemId: true }
  var nodes = [];                // flat list, render order = learning order
  var nodeById = {};
  var els = {};                  // cached DOM refs per node id
  var firstPaint = true;

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(done)); } catch (e) {}
  }

  /* ---- model: flatten phases + skills into positioned nodes -------------- */
  function normItems(raw) {
    return (raw || []).map(function (it) {
      if (typeof it === "string") return { text: it, def: false };
      return { text: it.t, def: !!it.done };
    });
  }

  function buildNodes() {
    var y = TOP;
    DATA.phases.forEach(function (phase, pi) {
      var skills = phase.skills || [];
      // split alternating left / right
      var left = [], right = [];
      skills.forEach(function (s, i) { (i % 2 === 0 ? left : right).push(s); });
      var leftHalf = ((left.length - 1) * SKILL_GAP) / 2;
      var rightHalf = ((right.length - 1) * SKILL_GAP) / 2;
      var half = Math.max(MIN_HALF, leftHalf + SKILL_R, rightHalf + SKILL_R);

      if (pi > 0) y += half + BAND_PAD;     // advance from previous band edge

      // hub
      var hub = {
        id: phase.id, kind: "hub", x: CX, y: y, r: HUB_R,
        color: phase.color, tag: phase.tag, title: phase.title,
        goal: phase.goal, items: normItems(phase.items), links: phase.links || [],
        phaseId: phase.id,
      };
      nodes.push(hub);

      // skills — collected here, but pushed AFTER hub so order = skills→? :
      // learning order should be skills first, then hub (deliverable). We add
      // skills before the hub in the order array via a small reorder below.
      var phaseSkillNodes = [];
      placeSide(left, CX - SKILL_DX, y, leftHalf, phase, phaseSkillNodes);
      placeSide(right, CX + SKILL_DX, y, rightHalf, phase, phaseSkillNodes);

      // reorder: drop hub we just pushed, re-add skills then hub
      nodes.pop();
      phaseSkillNodes.forEach(function (n) { nodes.push(n); });
      nodes.push(hub);

      y += half;  // advance to bottom of this band
    });

    nodes.forEach(function (n) { nodeById[n.id] = n; });
    GRAPH_H = y + 90;
  }

  function placeSide(list, x, cy, halfH, phase, out) {
    list.forEach(function (s, j) {
      out.push({
        id: s.id, kind: "skill",
        x: x, y: cy - halfH + j * SKILL_GAP, r: SKILL_R,
        color: phase.color, title: s.title, goal: "",
        items: normItems(s.items), links: s.links || [],
        side: x < CX ? "left" : "right", phaseId: phase.id,
      });
    });
  }

  var GRAPH_H = 1400;

  /* ---- progress helpers -------------------------------------------------- */
  function itemId(nodeId, idx) { return nodeId + "::" + idx; }

  function isDone(nodeId, idx, def) {
    var id = itemId(nodeId, idx);
    if (Object.prototype.hasOwnProperty.call(done, id)) return done[id];
    return def; // honor data-level default (e.g. Brrrr pre-checked)
  }

  function nodeProgress(n) {
    if (!n.items.length) return { done: 0, total: 0, frac: 1 };
    var d = 0;
    n.items.forEach(function (it, i) { if (isDone(n.id, i, it.def)) d++; });
    return { done: d, total: n.items.length, frac: d / n.items.length };
  }

  function overall() {
    var d = 0, t = 0;
    nodes.forEach(function (n) {
      n.items.forEach(function (it, i) { t++; if (isDone(n.id, i, it.def)) d++; });
    });
    return { done: d, total: t, pct: t ? Math.round((d / t) * 100) : 0 };
  }

  // first node (in learning order) that isn't complete
  function currentNodeId() {
    for (var i = 0; i < nodes.length; i++) {
      if (nodeProgress(nodes[i]).frac < 1) return nodes[i].id;
    }
    return null;
  }

  /* ---- SVG build --------------------------------------------------------- */
  function el(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    return e;
  }

  function curve(x1, y1, x2, y2) {
    // smooth cubic; control points biased vertically for the spine, else mixed
    var my = (y1 + y2) / 2;
    return "M" + x1 + "," + y1 + " C" + x1 + "," + my + " " + x2 + "," + my + " " + x2 + "," + y2;
  }

  function render() {
    var svg = document.getElementById("graph");
    svg.setAttribute("viewBox", "0 0 " + W + " " + GRAPH_H);
    svg.style.maxHeight = "none";

    var defs = el("defs");
    // soft glow filter
    var f = el("filter", { id: "glow", x: "-60%", y: "-60%", width: "220%", height: "220%" });
    var b = el("feGaussianBlur", { stdDeviation: "3.2", result: "b" });
    var m = el("feMerge");
    m.appendChild(el("feMergeNode", { in: "b" }));
    m.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
    f.appendChild(b); f.appendChild(m); defs.appendChild(f);
    svg.appendChild(defs);

    var edgeLayer = el("g", { class: "edges" });
    var nodeLayer = el("g", { class: "nodes" });
    svg.appendChild(edgeLayer);
    svg.appendChild(nodeLayer);

    // spine edges (hub -> next hub) + hub -> skill edges
    var hubs = nodes.filter(function (n) { return n.kind === "hub"; });
    hubs.forEach(function (h, i) {
      if (i < hubs.length - 1) {
        var nx = hubs[i + 1];
        edgeLayer.appendChild(el("path", {
          d: curve(h.x, h.y + h.r, nx.x, nx.y - nx.r),
          class: "edge spine", "data-from": h.id, "data-to": nx.id,
          stroke: h.color, "stroke-width": 3,
        }));
      }
    });
    nodes.filter(function (n) { return n.kind === "skill"; }).forEach(function (s) {
      var hub = nodeById[s.phaseId];
      var hx = hub.x + (s.side === "left" ? -hub.r : hub.r);
      var sx = s.x + (s.side === "left" ? s.r : -s.r);
      edgeLayer.appendChild(el("path", {
        d: curve(hx, hub.y, sx, s.y),
        class: "edge branch", "data-from": hub.id, "data-to": s.id,
        stroke: s.color, "stroke-width": 2,
      }));
    });

    // nodes
    nodes.forEach(function (n) { nodeLayer.appendChild(buildNode(n)); });

    paintAll();
    firstPaint = false;
  }

  function buildNode(n) {
    var g = el("g", { class: "node", "data-id": n.id, tabindex: "0", role: "button" });
    g.setAttribute("aria-label", n.title);
    g.style.color = n.color;

    var C = 2 * Math.PI * n.r;
    // disc
    var disc = el("circle", { class: "node-disc", cx: n.x, cy: n.y, r: n.r });
    // progress ring
    var ringBg = el("circle", { class: "node-ring-bg", cx: n.x, cy: n.y, r: n.r + 5, stroke: "rgba(255,255,255,0.10)", "stroke-width": 3 });
    var ringFg = el("circle", {
      class: "node-ring-fg", cx: n.x, cy: n.y, r: n.r + 5,
      stroke: n.color, "stroke-width": 3.5,
      "stroke-dasharray": C, "stroke-dashoffset": C,
      transform: "rotate(-90 " + n.x + " " + n.y + ")",
    });
    ringFg.setAttribute("data-circ", 2 * Math.PI * (n.r + 5));
    // recompute dasharray with correct radius
    var Cr = 2 * Math.PI * (n.r + 5);
    ringFg.setAttribute("stroke-dasharray", Cr);
    ringFg.setAttribute("stroke-dashoffset", Cr);

    // check / count glyph inside disc
    var glyph = el("text", {
      class: "node-check", x: n.x, y: n.y, "text-anchor": "middle",
      "dominant-baseline": "central", "font-family": "var(--mono)",
      "font-size": n.kind === "hub" ? 15 : 12, "font-weight": 700, fill: "#0a0d14",
    });

    // labels
    var labelFontTitle = n.kind === "hub" ? 15 : 12.5;
    var ty, anchor, tx;
    var titleEl, tagEl, subEl;
    if (n.kind === "hub") {
      anchor = "middle"; tx = n.x;
      tagEl = el("text", { class: "node-tag", x: tx, y: n.y - n.r - 24, "text-anchor": anchor, "font-size": 10, fill: n.color });
      tagEl.textContent = n.tag || "";
      titleEl = el("text", { class: "node-label", x: tx, y: n.y - n.r - 9, "text-anchor": anchor, "font-size": labelFontTitle, "font-weight": 700, fill: "#dfe6f1" });
      titleEl.textContent = n.title;
    } else {
      var pad = 13;
      anchor = n.side === "left" ? "end" : "start";
      tx = n.x + (n.side === "left" ? -(n.r + pad) : (n.r + pad));
      titleEl = el("text", { class: "node-label", x: tx, y: n.y, "text-anchor": anchor, "dominant-baseline": "central", "font-size": labelFontTitle, "font-weight": 600 });
      titleEl.textContent = n.title;
    }

    g.appendChild(ringBg);
    g.appendChild(ringFg);
    g.appendChild(disc);
    g.appendChild(glyph);
    if (tagEl) g.appendChild(tagEl);
    g.appendChild(titleEl);
    if (subEl) g.appendChild(subEl);

    els[n.id] = { g: g, disc: disc, ringFg: ringFg, glyph: glyph, circ: Cr };

    g.addEventListener("click", function () { openDrawer(n.id); });
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(n.id); }
    });
    return g;
  }

  /* ---- painting (cheap, runs on every toggle) ---------------------------- */
  function paintNode(n) {
    var ref = els[n.id];
    var p = nodeProgress(n);
    var complete = p.frac >= 1 && p.total > 0;
    var started = p.done > 0;

    // ring
    ref.ringFg.setAttribute("stroke-dashoffset", ref.circ * (1 - p.frac));

    // disc fill
    if (complete) {
      ref.disc.setAttribute("fill", n.color);
      ref.disc.setAttribute("stroke", n.color);
      ref.disc.setAttribute("stroke-width", 0);
      ref.disc.setAttribute("filter", "url(#glow)");
    } else {
      ref.disc.setAttribute("fill", started ? mix(n.color, 0.16) : "rgba(255,255,255,0.04)");
      ref.disc.setAttribute("stroke", started ? n.color : "rgba(255,255,255,0.18)");
      ref.disc.setAttribute("stroke-width", 2);
      ref.disc.removeAttribute("filter");
    }

    // glyph: ✓ when complete, else done/total count
    if (complete) {
      ref.glyph.textContent = "✓";
      ref.glyph.setAttribute("fill", "#06121d");
    } else if (p.total === 0) {
      ref.glyph.textContent = "";
    } else {
      ref.glyph.textContent = p.done + "/" + p.total;
      ref.glyph.setAttribute("fill", started ? "#dfe6f1" : "var(--muted)");
    }
  }

  function paintEdges() {
    var cur = currentNodeId();
    document.querySelectorAll(".edge").forEach(function (e) {
      var from = nodeById[e.getAttribute("data-from")];
      var to = nodeById[e.getAttribute("data-to")];
      var tp = nodeProgress(to).frac;
      var fp = nodeProgress(from).frac;
      var active = (to.id === cur) || (from.id === cur && tp < 1);
      e.classList.toggle("flow", fp >= 1 && tp < 1);
      e.setAttribute("stroke-opacity", tp >= 1 ? 0.85 : (fp >= 1 ? 0.55 : 0.18));
    });
  }

  function paintAll() {
    var cur = currentNodeId();
    nodes.forEach(function (n) {
      paintNode(n);
      els[n.id].g.classList.toggle("is-current", n.id === cur);
    });
    paintEdges();
    paintMeter();
  }

  function paintMeter() {
    var o = overall();
    document.getElementById("progress-fill").style.width = o.pct + "%";
    document.getElementById("progress-pct").textContent = o.pct + "%";
    document.getElementById("progress-count").textContent = o.done + " / " + o.total + " done";
  }

  // lighten a hex color toward transparency-on-dark feel
  function mix(hex, a) {
    var c = hex.replace("#", "");
    var r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), bl = parseInt(c.substr(4, 2), 16);
    return "rgba(" + r + "," + g + "," + bl + "," + a + ")";
  }

  /* ---- drawer ------------------------------------------------------------ */
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  var activeNodeId = null;

  function openDrawer(nodeId) {
    var n = nodeById[nodeId];
    if (!n) return;
    activeNodeId = nodeId;
    document.getElementById("drawer-tag").textContent = n.tag || (n.kind === "skill" ? nodeById[n.phaseId].tag : "");
    document.getElementById("drawer-tag").style.color = n.color;
    document.getElementById("drawer-title").textContent = n.title;
    document.getElementById("drawer-goal").textContent = n.goal || "";

    var body = document.getElementById("drawer-body");
    body.innerHTML = "";

    if (n.items.length) {
      var h = document.createElement("p"); h.className = "section-h"; h.textContent = "Checklist";
      body.appendChild(h);
      n.items.forEach(function (it, i) { body.appendChild(checkRow(n, i, it)); });
    }
    if (n.links && n.links.length) {
      var h2 = document.createElement("p"); h2.className = "section-h"; h2.textContent = "Resources";
      body.appendChild(h2);
      var wrap = document.createElement("div"); wrap.className = "links";
      n.links.forEach(function (l) {
        var a = document.createElement("a");
        a.href = l[1]; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = l[0];
        wrap.appendChild(a);
      });
      body.appendChild(wrap);
    }

    updateDrawerBar(n);
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    document.getElementById("drawer-close").focus();
  }

  function checkRow(n, idx, it) {
    var label = document.createElement("label");
    label.className = "check";
    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = isDone(n.id, idx, it.def);
    var box = document.createElement("span"); box.className = "box";
    var span = document.createElement("span"); span.className = "label"; span.textContent = it.text;
    label.appendChild(input); label.appendChild(box); label.appendChild(span);

    input.addEventListener("change", function () {
      var before = nodeProgress(n).frac >= 1;
      done[itemId(n.id, idx)] = input.checked;
      saveState();
      updateDrawerBar(n);
      // The maintenance deck is a synthetic node with no graph element.
      if (els[n.id]) {
        paintNode(n);
        paintEdges();
        paintMeter();
        var cur = currentNodeId();
        nodes.forEach(function (nn) { els[nn.id].g.classList.toggle("is-current", nn.id === cur); });
        var after = nodeProgress(n).frac >= 1;
        if (!before && after) celebrate(n);
      }
    });
    return label;
  }

  function updateDrawerBar(n) {
    var p = nodeProgress(n);
    var bar = document.getElementById("drawer-bar");
    bar.style.width = (p.total ? p.frac * 100 : 100) + "%";
    bar.style.background = n.color;
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    activeNodeId = null;
  }

  document.getElementById("drawer-close").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  /* ---- maintenance deck (reuses the drawer) ------------------------------ */
  document.getElementById("maint-btn").addEventListener("click", function () {
    var m = DATA.maintenance;
    // synthesize a transient node so the drawer machinery just works
    var id = "__maint";
    nodeById[id] = {
      id: id, kind: "deck", color: "#a78bfa", tag: "§9", title: m.title,
      goal: m.note, items: normItems(m.items), links: [], phaseId: id,
    };
    openDrawer(id);
  });

  /* ---- reset ------------------------------------------------------------- */
  document.getElementById("reset-btn").addEventListener("click", function () {
    if (!confirm("Clear all ticked progress? This cannot be undone.")) return;
    done = {};
    saveState();
    paintAll();
    if (activeNodeId && nodeById[activeNodeId]) openDrawer(activeNodeId);
  });

  /* ---- confetti (tiny, self-terminating) --------------------------------- */
  function celebrate(n) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var canvas = document.getElementById("confetti");
    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    ctx.scale(DPR, DPR);

    var palette = [n.color, "#ffffff", "#7c9cff", "#34d399"];
    var cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.42;
    var parts = [];
    for (var i = 0; i < 90; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 3 + Math.random() * 7;
      parts.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 3,
        s: 3 + Math.random() * 4, r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: palette[(Math.random() * palette.length) | 0], life: 1,
      });
    }
    var t0 = performance.now();
    function frame(t) {
      var dt = Math.min((t - t0) / 16.7, 3); t0 = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.vy += 0.22 * dt; p.vx *= 0.99;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        p.life -= 0.012 * dt;
        if (p.life > 0 && p.y < window.innerHeight + 20) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6);
          ctx.restore();
        }
      }
      if (alive) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(frame);
  }

  /* ---- boot -------------------------------------------------------------- */
  document.getElementById("title").textContent = DATA.title || "Performance Engineering";
  if (DATA.subtitle) document.getElementById("subtitle").textContent = DATA.subtitle;

  buildNodes();
  render();
})();
