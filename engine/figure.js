/* North Mirror figure: a simple articulated person who demonstrates movements.
   A pose is a set of joint angles in degrees. The figure is posed in 3D and projected, so it can
   turn (yaw) between front, three-quarter and side views while it moves.
     yaw   0 = facing you, 90 = side view facing right
     sp    spine [lumbar tilt, lumbar flex, thoracic tilt, thoracic flex, neck tilt, neck flex]
           tilt leans toward screen-right, flex leans forward
     la ra arms, screen-left and screen-right [upper abduction, upper flexion, fore abduction, fore flexion]
     ll rl legs, same order [thigh abduction, thigh flexion, shin abduction, shin flexion]
   Limb angles are absolute: 0 hangs straight down, abduction swings outward (90 = sideways,
   180 = overhead), flexion swings forward (90 = straight ahead).
   "name@yaw" shows a named pose from another angle, e.g. "reach-up@40". */
function makeFigure(POSES, opts) {
  opts = opts || {};
  const TS = opts.timescale || 1, NS = "http://www.w3.org/2000/svg", R = Math.PI / 180, G0 = 300;
  const L = { lum: 34, tho: 40, neck: 12, head: 14, sh: 17, hip: 10, up: 30, fore: 29, thigh: 47, shin: 45, foot: 11 };
  const BASE = { yaw: 0, sp: [0, 0, 0, 0, 0, 0], la: [8, 0, 6, 8], ra: [8, 0, 6, 8], ll: [4, 0, 2, 0], rl: [4, 0, 2, 0] };
  const KEYS = ["sp", "la", "ra", "ll", "rl"];
  function pose(p) {
    const at = typeof p === "string" ? p.split("@") : null;
    const src = (at ? POSES[at[0]] : p) || {};
    const out = { yaw: at && at[1] ? Number(at[1]) : src.yaw != null ? src.yaw : BASE.yaw };
    for (const k of KEYS) out[k] = (src[k] || BASE[k]).slice();
    return out;
  }
  const mix = (a, b, t) => { const o = { yaw: a.yaw + (b.yaw - a.yaw) * t }; for (const k of KEYS) o[k] = a[k].map((v, i) => v + (b[k][i] - v) * t); return o; };
  const limb = (a, f, s) => { a *= R; f *= R; return [s * Math.sin(a) * Math.cos(f), -Math.cos(a) * Math.cos(f), Math.sin(f)]; };
  const trunk = (t, f) => { t *= R; f *= R; return [Math.sin(t) * Math.cos(f), Math.cos(t) * Math.cos(f), Math.sin(f)]; };
  const go = (o, d, l) => [o[0] + d[0] * l, o[1] + d[1] * l, o[2] + d[2] * l];

  function skeleton(P) {
    const hip = [0, 0, 0], lum = go(hip, trunk(P.sp[0], P.sp[1]), L.lum), tho = go(lum, trunk(P.sp[2], P.sp[3]), L.tho);
    const nd = trunk(P.sp[4], P.sp[5]), neck = go(tho, nd, L.neck), head = go(neck, nd, L.head);
    const latT = [Math.cos(P.sp[2] * R), -Math.sin(P.sp[2] * R), 0], latH = [Math.cos(P.sp[0] * R), -Math.sin(P.sp[0] * R), 0];
    const side = {};
    for (const [k, s] of [["l", -1], ["r", 1]]) {
      const A = P[k + "a"], G = P[k + "l"];
      const sh = go(tho, latT, L.sh * s), el = go(sh, limb(A[0], A[1], s), L.up), hand = go(el, limb(A[2], A[3], s), L.fore);
      const hp = go(hip, latH, L.hip * s), knee = go(hp, limb(G[0], G[1], s), L.thigh), ankle = go(knee, limb(G[2], G[3], s), L.shin), toe = go(ankle, [0, 0, 1], L.foot);
      side[k] = { sh, el, hand, hp, knee, ankle, toe };
    }
    // stand on the ground: lowest point at y = 0, feet centered front to back
    const pts = [hip, lum, tho, neck, head].concat(Object.values(side.l), Object.values(side.r));
    const minY = Math.min.apply(null, pts.map(p => p[1])), midZ = (side.l.ankle[2] + side.r.ankle[2]) / 2;
    for (const p of pts) { p[1] -= minY; p[2] -= midZ; }
    return { hip, lum, tho, neck, head, side };
  }

  const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const svg = mk("svg", { viewBox: "-10 56 220 256", class: "figure", "aria-hidden": "true" });
  const groups = { l: mk("g", {}), r: mk("g", {}) }, body = mk("g", {}), parts = {};
  for (const k of ["l", "r"]) {
    parts[k] = { leg: mk("polyline", { class: "fg-limb" }), arm: mk("polyline", { class: "fg-limb" }), hand: mk("circle", { class: "fg-hand", r: 4.5 }) };
    groups[k].append(parts[k].leg, parts[k].arm, parts[k].hand);
  }
  const torso = mk("polyline", { class: "fg-torso" }), shoulders = mk("polyline", { class: "fg-limb" }), pelvis = mk("polyline", { class: "fg-limb" });
  const neckL = mk("polyline", { class: "fg-limb" }), headC = mk("circle", { class: "fg-head", r: L.head });
  body.append(pelvis, torso, shoulders, neckL, headC);
  svg.append(mk("line", { x1: 40, x2: 160, y1: G0 + 3, y2: G0 + 3, class: "fg-ground" }), groups.l, body, groups.r);
  let order = "r";

  function draw(P) {
    const S = skeleton(P), c = Math.cos(P.yaw * R), s = Math.sin(P.yaw * R);
    const pr = p => [100 + p[0] * c + p[2] * s, G0 - p[1], p[2] * c - p[0] * s];
    const pts = list => list.map(p => { const q = pr(p); return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ");
    for (const k of ["l", "r"]) {
      const d = S.side[k], h = pr(d.hand);
      parts[k].leg.setAttribute("points", pts([d.hp, d.knee, d.ankle, d.toe]));
      parts[k].arm.setAttribute("points", pts([d.sh, d.el, d.hand]));
      parts[k].hand.setAttribute("cx", h[0].toFixed(1)); parts[k].hand.setAttribute("cy", h[1].toFixed(1));
    }
    torso.setAttribute("points", pts([S.hip, S.lum, S.tho]));
    shoulders.setAttribute("points", pts([S.side.l.sh, S.tho, S.side.r.sh]));
    pelvis.setAttribute("points", pts([S.side.l.hp, S.hip, S.side.r.hp]));
    neckL.setAttribute("points", pts([S.tho, S.neck]));
    const hc = pr(S.head); headC.setAttribute("cx", hc[0].toFixed(1)); headC.setAttribute("cy", hc[1].toFixed(1));
    const near = pr(S.side.l.sh)[2] >= pr(S.side.r.sh)[2] ? "l" : "r", far = near === "l" ? "r" : "l";
    if (order !== near) { svg.append(groups[far], body, groups[near]); order = near; }
    groups[far].setAttribute("opacity", (1 - .55 * Math.abs(s)).toFixed(2)); groups[near].setAttribute("opacity", "1");
  }

  let cur = pose(opts.start || "stand"), from = cur, to = cur, t0 = 0, dur = 1, raf = 0, seq = null, seqI = 0, beat = 2;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function frame(now) {
    raf = 0;
    const k = Math.max(0, Math.min(1, (now - t0) / dur));
    cur = mix(from, to, ease(k)); draw(cur);
    if (k < 1) raf = requestAnimationFrame(frame);
    else if (seq) { seqI = (seqI + 1) % seq.length; toward(seq[seqI], beat, beat * .35); }
  }
  function toward(p, sec, hold) {
    from = cur; to = pose(p); t0 = performance.now() + (hold || 0) * 1000 * TS; dur = Math.max(16, sec * 1000 * TS);
    if (!raf) raf = requestAnimationFrame(frame);
  }
  draw(cur);
  return {
    el: svg,
    go(p, sec) { seq = null; toward(p, sec == null ? 1.6 : sec); },
    loop(list, sec) {
      list = [].concat(list);
      if (list.length < 2) return this.go(list[0], sec);
      seq = list; beat = sec || 2.4; seqI = 0; toward(seq[0], beat);
    },
    set(p) { seq = null; cur = from = to = pose(p); draw(cur); },
    blend(a, b, t) { seq = null; cur = from = to = mix(pose(a), pose(b), t); draw(cur); }, // for checking transitions
    stop() { seq = null; if (raf) cancelAnimationFrame(raf); raf = 0; }
  };
}
