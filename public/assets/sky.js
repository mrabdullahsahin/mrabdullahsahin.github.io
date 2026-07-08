/* ============================================================
   sky.js — selectable mathematical skies
   scenes after the astronomers & geometers of the golden age:
   · tusi      — Ṭūsī couple, Marāgha 1247 (two circles, one line)
   · astrolabe — al-Zarqālī's universal plate, Toledo c. 1062
   · girih     — decagonal strapwork, Iṣfahān c. 1200
   · flow      — a harmonic vector field (the original sky)
   Visitor picks via #sky-cycle in the footer; persisted.
   API: window.SKY {list, current, set} · window.FIELD {setDensity,setSpeed}
   ============================================================ */
(function () {
  "use strict";

  const canvas = document.getElementById("field");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const CFG = { density: 1, speed: 0.5 };

  let W = 0, H = 0, DPR = 1, raf = null;

  const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#1a1812";
  const paper = () => getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() || "#faf9f5";
  const mn = () => Math.min(W, H);

  function circle(x, y, r, alpha, dash) {
    ctx.globalAlpha = alpha;
    ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  function label(txt, x, y, alpha) {
    ctx.globalAlpha = alpha;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = ink();
    ctx.fillText(txt, x, y);
  }
  function seedStars(per) {
    const n = Math.round((W * H) / per * CFG.density);
    return new Array(n).fill(0).map(() => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() < 0.85 ? (0.5 + Math.random() * 0.9) : 0,
      a: 0.04 + Math.random() * 0.10,
      tw: Math.random() * Math.PI * 2
    }));
  }
  function drawStars(stars, t) {
    ctx.fillStyle = ink(); ctx.strokeStyle = ink(); ctx.lineWidth = 0.6;
    for (const s of stars) {
      ctx.globalAlpha = reduced.matches ? s.a : s.a * (0.7 + 0.3 * Math.sin(t * 2 + s.tw));
      if (s.r > 0) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
      else {
        ctx.beginPath();
        ctx.moveTo(s.x - 3, s.y); ctx.lineTo(s.x + 3, s.y);
        ctx.moveTo(s.x, s.y - 3); ctx.lineTo(s.x, s.y + 3);
        ctx.stroke();
      }
    }
  }

  /* ============================================================
     SCENE: tusi
     ============================================================ */
  const tusi = {
    name: "tusi", label: "ṭūsī couple · marāgha 1247",
    th: Math.random() * 6, ph: Math.random() * 6, stars: [], trail: [], epi: [],
    g() {
      const R = mn() * 0.30;
      return { tx: W * 0.80, ty: H * 0.30, R, ex: W * 0.16, ey: H * 0.82, eR: mn() * 0.22, er: mn() * 0.066, ek: 5.2 };
    },
    pt(th, g) {
      const cx = g.tx + (g.R / 2) * Math.cos(th), cy = g.ty + (g.R / 2) * Math.sin(th);
      return { cx, cy, px: cx + (g.R / 2) * Math.cos(-th), py: cy + (g.R / 2) * Math.sin(-th) };
    },
    ep(ph, g) {
      return { x: g.ex + g.eR * Math.cos(ph) + g.er * Math.cos(ph * g.ek), y: g.ey + g.eR * Math.sin(ph) + g.er * Math.sin(ph * g.ek) };
    },
    setup() { this.stars = seedStars(26000); this.trail = []; this.epi = []; },
    prefill() {
      const g = this.g(); this.trail = []; this.epi = [];
      for (let th = 0; th < Math.PI * 2; th += 0.02) { const t = this.pt(th, g); this.trail.push([t.px, t.py]); }
      for (let ph = 0; ph < Math.PI * 2; ph += 0.004) { const e = this.ep(ph, g); this.epi.push([e.x, e.y]); }
    },
    frame() {
      const g = this.g();
      this.th += 0.012 * CFG.speed; this.ph += 0.007 * CFG.speed;
      const t = this.pt(this.th, g);
      this.trail.push([t.px, t.py]); if (this.trail.length > 400) this.trail.shift();
      const e = this.ep(this.ph, g);
      this.epi.push([e.x, e.y]); if (this.epi.length > Math.round(1400 * CFG.density)) this.epi.shift();
      this.draw();
    },
    draw() {
      ctx.clearRect(0, 0, W, H);
      const g = this.g();
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.th);
      const t = this.pt(this.th, g);
      circle(g.tx, g.ty, g.R, 0.10);
      circle(g.tx, g.ty, 1.4, 0.18);
      circle(t.cx, t.cy, g.R / 2, 0.13, [3, 4]);
      ctx.globalAlpha = 0.10;
      ctx.beginPath(); ctx.moveTo(g.tx, g.ty); ctx.lineTo(t.cx, t.cy); ctx.lineTo(t.px, t.py); ctx.stroke();
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      this.trail.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(t.px, t.py, 2, 0, Math.PI * 2); ctx.fill();
      label("dā'irat al-ṭūsī · 1247", g.tx - g.R * 0.42, g.ty + g.R + 18, 0.22);
      circle(g.ex, g.ey, g.eR, 0.07, [2, 5]);
      const e = this.ep(this.ph, g);
      ctx.globalAlpha = 0.14;
      ctx.beginPath();
      this.epi.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(e.x, e.y, 1.8, 0, Math.PI * 2); ctx.fill();
      label("falak al-tadwīr", g.ex + g.eR * 0.5, g.ey - g.eR - 10, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: astrolabe — al-Zarqālī
     ============================================================ */
  const astrolabe = {
    name: "astrolabe", label: "asṭurlāb · al-zarqālī · c. 1062",
    ph: Math.random() * 6, stars: [], pointers: [],
    g() { return { cx: W * 0.74, cy: H * 0.44, R: mn() * 0.34 }; },
    setup() {
      this.stars = seedStars(30000);
      this.pointers = new Array(14).fill(0).map(() => ({
        ang: Math.random() * Math.PI * 2,
        r: 0.28 + Math.random() * 0.62
      }));
    },
    prefill() {},
    frame() { this.ph += 0.0024 * CFG.speed; this.draw(); },
    draw() {
      ctx.clearRect(0, 0, W, H);
      const { cx, cy, R } = this.g();
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.ph * 6);
      /* mater */
      circle(cx, cy, R, 0.12);
      circle(cx, cy, R * 0.965, 0.06);
      /* degree ticks on the limb */
      ctx.globalAlpha = 0.10;
      ctx.beginPath();
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const r1 = i % 6 === 0 ? R * 0.93 : R * 0.95;
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * R * 0.965, cy + Math.sin(a) * R * 0.965);
      }
      ctx.stroke();
      /* plate: almucantars + tropics, clipped */
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.93, 0, Math.PI * 2); ctx.clip();
      for (let i = 1; i <= 6; i++) circle(cx, cy + R * 0.105 * i, R * (1 - 0.135 * i), 0.05);
      circle(cx, cy, R * 0.66, 0.06);
      circle(cx, cy, R * 0.40, 0.05);
      ctx.restore();
      /* ecliptic ring, off-center, with zodiac ticks */
      const ex = cx, ey = cy - R * 0.16, eR = R * 0.50;
      circle(ex, ey, eR, 0.10);
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + this.ph * 0.5;
        ctx.moveTo(ex + Math.cos(a) * eR * 0.93, ey + Math.sin(a) * eR * 0.93);
        ctx.lineTo(ex + Math.cos(a) * eR, ey + Math.sin(a) * eR);
      }
      ctx.stroke();
      /* rete star pointers (rotating) */
      for (const p of this.pointers) {
        const a = p.ang + this.ph;
        const r = p.r * R * 0.9;
        const x1 = cx + Math.cos(a) * r * 0.82, y1 = cy + Math.sin(a) * r * 0.82;
        const x2 = cx + Math.cos(a) * r, y2 = cy + Math.sin(a) * r;
        ctx.globalAlpha = 0.15;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.globalAlpha = 0.32;
        ctx.beginPath(); ctx.arc(x2, y2, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      /* alidade */
      const aa = -this.ph * 0.37;
      ctx.globalAlpha = 0.13;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(aa) * R * 0.9, cy - Math.sin(aa) * R * 0.9);
      ctx.lineTo(cx + Math.cos(aa) * R * 0.9, cy + Math.sin(aa) * R * 0.9);
      ctx.stroke();
      circle(cx + Math.cos(aa) * R * 0.62, cy + Math.sin(aa) * R * 0.62, 3, 0.18);
      /* pin */
      ctx.globalAlpha = 0.30;
      ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
      label("ṣafīḥa zarqāliyya · ṭulayṭila", cx - R * 0.5, cy + R + 18, 0.22);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: girih — decagonal strapwork
     ============================================================ */
  const girih = {
    name: "girih", label: "girih · iṣfahān c. 1200",
    segs: [], prog: 0, stars: [],
    star(cx, cy, R, n, skip, rot) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
      }
      const out = [];
      for (let i = 0; i < n; i++) out.push([pts[i], pts[(i + skip) % n]]);
      return out;
    },
    setup() {
      this.stars = seedStars(34000);
      const m = mn();
      this.segs = [
        ...this.star(W * 0.78, H * 0.32, m * 0.28, 10, 3, Math.PI / 10),
        ...this.star(W * 0.78, H * 0.32, m * 0.155, 10, 1, 0),
        ...this.star(W * 0.78, H * 0.32, m * 0.34, 10, 1, Math.PI / 10),
        ...this.star(W * 0.16, H * 0.80, m * 0.17, 10, 3, 0),
        ...this.star(W * 0.16, H * 0.80, m * 0.095, 10, 1, Math.PI / 10),
        ...this.star(W * 0.42, H * 0.10, m * 0.10, 5, 2, -Math.PI / 2),
      ];
      this.prog = 0;
    },
    prefill() {},
    frame() { this.prog += 0.05 * CFG.speed; this.draw(); },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.prog * 0.15);
      /* full pattern, faint */
      ctx.globalAlpha = 0.075;
      ctx.beginPath();
      for (const s of this.segs) { ctx.moveTo(s[0][0], s[0][1]); ctx.lineTo(s[1][0], s[1][1]); }
      ctx.stroke();
      if (!reduced.matches) {
        /* the geometer's pen: recent segments glow, current one draws */
        const L = this.segs.length;
        const idx = Math.floor(this.prog) % L;
        const frac = this.prog - Math.floor(this.prog);
        for (let k = 1; k <= 6; k++) {
          const s = this.segs[(idx - k + L) % L];
          ctx.globalAlpha = 0.20 * (1 - k / 7);
          ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]); ctx.lineTo(s[1][0], s[1][1]); ctx.stroke();
        }
        const c = this.segs[idx];
        const mx = c[0][0] + (c[1][0] - c[0][0]) * frac;
        const my = c[0][1] + (c[1][1] - c[0][1]) * frac;
        ctx.globalAlpha = 0.30;
        ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); ctx.lineTo(mx, my); ctx.stroke();
        ctx.globalAlpha = 0.55;
        ctx.beginPath(); ctx.arc(mx, my, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      label("ʿaqd · handasa", W * 0.78 - mn() * 0.18, H * 0.32 + mn() * 0.34 + 18, 0.22);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: flow — the original harmonic field (accumulating)
     ============================================================ */
  const flow = {
    name: "flow", label: "∂x = sin(ky+t) · ∂y = cos(kx−t)",
    accumulate: true,
    parts: [], t: Math.random() * 1000,
    setup() {
      const n = Math.round((W * H) / 6500 * CFG.density);
      this.parts = new Array(n).fill(0).map(() => ({
        x: Math.random() * W, y: Math.random() * H, life: 80 + Math.random() * 240
      }));
      ctx.globalAlpha = 1; ctx.fillStyle = paper(); ctx.fillRect(0, 0, W, H);
    },
    vel(x, y) {
      const k = 0.0022 * 2 * Math.PI;
      return [Math.sin(y * k + this.t), Math.cos(x * k - this.t)];
    },
    prefill() {},
    frame() {
      this.t += 0.002;
      ctx.globalAlpha = 0.045; ctx.fillStyle = paper(); ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.16; ctx.strokeStyle = ink(); ctx.lineWidth = 0.55;
      ctx.beginPath();
      const sp = CFG.speed;
      for (const p of this.parts) {
        const [vx, vy] = this.vel(p.x, p.y);
        const nx = p.x + vx * sp, ny = p.y + vy * sp;
        ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny);
        p.x = nx; p.y = ny;
        if (--p.life < 0 || nx < -20 || nx > W + 20 || ny < -20 || ny > H + 20) {
          p.x = Math.random() * W; p.y = Math.random() * H; p.life = 80 + Math.random() * 240;
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
    draw() { /* static fallback */
      ctx.globalAlpha = 1; ctx.fillStyle = paper(); ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.lineWidth = 0.55; ctx.globalAlpha = 0.10;
      for (let i = 0; i < this.parts.length * 2; i++) {
        let x = Math.random() * W, y = Math.random() * H;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 0; s < 26; s++) {
          const [vx, vy] = this.vel(x, y);
          x += vx * 2.2; y += vy * 2.2;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: hayyam — cubic equation via conic intersection, Nīshāpūr c. 1070
     ============================================================ */
  const hayyam = {
    name: "hayyam", label: "khayyām · cubic via conics · nīshāpūr c. 1070",
    t: 0, stars: [],
    setup() { this.stars = seedStars(32000); this.t = 0; },
    prefill() { this.draw(); },
    frame() { this.t += 0.006 * CFG.speed; this.draw(); },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.t);
      const cx = W * 0.55, cy = H * 0.50, s = mn() * 0.19;
      ctx.globalAlpha = 0.08; ctx.beginPath();
      ctx.moveTo(cx - s*2, cy); ctx.lineTo(cx + s*2, cy);
      ctx.moveTo(cx, cy - s*2); ctx.lineTo(cx, cy + s*2); ctx.stroke();
      ctx.globalAlpha = 0.17; ctx.beginPath();
      let f = true;
      for (let x = -1.5; x <= 1.5; x += 0.02) {
        const px = cx + x*s, py = cy - x*x*s;
        f ? ctx.moveTo(px, py) : ctx.lineTo(px, py); f = false;
      }
      ctx.stroke();
      ctx.globalAlpha = 0.12;
      ctx.beginPath(); ctx.arc(cx + s*0.5, cy, s*0.95, Math.PI, 0); ctx.stroke();
      const ix = 0.76, iy = -ix*ix;
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 2.2);
      ctx.globalAlpha = 0.25 + 0.30 * pulse;
      ctx.beginPath(); ctx.arc(cx + ix*s, cy + iy*s, 3, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 0.10; ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cx + ix*s, cy + iy*s); ctx.lineTo(cx + ix*s, cy);
      ctx.moveTo(cx + ix*s, cy + iy*s); ctx.lineTo(cx, cy + iy*s);
      ctx.stroke(); ctx.setLineDash([]);
      label("khayyām · al-muʿādalāt · nīshāpūr", cx - s*0.9, cy + s*1.7, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: battani — sine wave construction, al-Raqqa c. 880
     ============================================================ */
  const battani = {
    name: "battani", label: "al-battānī · jīb · al-raqqa c. 880",
    t: 0, stars: [], trail: [],
    setup() { this.stars = seedStars(30000); this.t = Math.random() * 6; this.trail = []; },
    prefill() {
      this.trail = [];
      for (let i = 0; i < Math.PI * 4; i += 0.04) this.trail.push(i);
      this.draw();
    },
    frame() {
      this.t += 0.018 * CFG.speed;
      this.trail.push(this.t);
      if (this.trail.length > 380) this.trail.shift();
      this.draw();
    },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.t * 0.15);
      const R = mn() * 0.185, ocx = W * 0.28, ocy = H * 0.44;
      const wx = W * 0.56;
      circle(ocx, ocy, R, 0.12);
      ctx.globalAlpha = 0.08; ctx.beginPath();
      ctx.moveTo(ocx - R*1.3, ocy); ctx.lineTo(ocx + R*1.3, ocy);
      ctx.moveTo(ocx, ocy - R*1.3); ctx.lineTo(ocx, ocy + R*1.3); ctx.stroke();
      const th = this.t;
      const px = ocx + R*Math.cos(th), py = ocy - R*Math.sin(th);
      ctx.globalAlpha = 0.20; ctx.beginPath(); ctx.moveTo(ocx, ocy); ctx.lineTo(px, py); ctx.stroke();
      ctx.globalAlpha = 0.18; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, ocy); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.52; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2); ctx.fill();
      if (this.trail.length > 1) {
        const ww = (W - wx - 40) / (Math.PI * 4);
        ctx.globalAlpha = 0.14; ctx.beginPath();
        this.trail.forEach((tv, i) => {
          const x = wx + (tv - this.trail[0]) * ww, y = ocy - R*Math.sin(tv);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();
        const cwx = wx + (th - this.trail[0]) * ww;
        ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.arc(cwx, ocy - R*Math.sin(th), 2.5, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 0.08; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cwx, ocy - R*Math.sin(th)); ctx.stroke();
        ctx.setLineDash([]);
      }
      label("al-battānī · jīb al-tamām · al-raqqa c. 880", ocx - R*0.5, ocy + R*1.5, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: biruni — Earth radius from mountain dip angle, Ghazna c. 1020
     ============================================================ */
  const biruni = {
    name: "biruni", label: "al-bīrūnī · nisf quṭr al-arḍ · ghazna c. 1020",
    t: 0, stars: [],
    setup() { this.stars = seedStars(28000); this.t = 0; },
    prefill() { this.draw(); },
    frame() { this.t += 0.005 * CFG.speed; this.draw(); },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.t);
      const R = mn() * 0.50, ecx = W * 0.50, ecy = H * 1.22;
      ctx.globalAlpha = 0.12;
      ctx.beginPath(); ctx.arc(ecx, ecy, R, -Math.PI*0.72, -Math.PI*0.28); ctx.stroke();
      const ma = -Math.PI * 0.5;
      const mpx = ecx + R*Math.cos(ma), mpy = ecy + R*Math.sin(ma);
      const mh = mn() * 0.085, topx = mpx, topy = mpy - mh;
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.moveTo(mpx - mn()*0.05, mpy); ctx.lineTo(topx, topy); ctx.lineTo(mpx + mn()*0.05, mpy);
      ctx.stroke();
      const ha = ma - 0.20;
      const hpx = ecx + R*Math.cos(ha), hpy = ecy + R*Math.sin(ha);
      ctx.globalAlpha = 0.16; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(topx, topy); ctx.lineTo(hpx, hpy); ctx.stroke(); ctx.setLineDash([]);
      const lineAng = Math.atan2(hpy - topy, hpx - topx);
      ctx.globalAlpha = 0.14;
      ctx.beginPath(); ctx.arc(topx, topy, 24, lineAng, Math.PI); ctx.stroke();
      label("θ", topx - 38, topy + 14, 0.26);
      ctx.globalAlpha = 0.10; ctx.setLineDash([1, 4]);
      ctx.beginPath(); ctx.moveTo(ecx, ecy); ctx.lineTo(mpx, mpy); ctx.stroke(); ctx.setLineDash([]);
      label("R", (ecx+mpx)*0.5 + 9, (ecy+mpy)*0.5, 0.18);
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 1.8);
      ctx.globalAlpha = 0.30 + 0.28 * pulse;
      ctx.beginPath(); ctx.arc(hpx, hpy, 2.5, 0, Math.PI*2); ctx.fill();
      label("al-bīrūnī · nisf quṭr al-arḍ · ghazna", ecx - mn()*0.27, mpy - mh - 22, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: harezmi — al-jabr: geometric square completion, Baghdād c. 830
     ============================================================ */
  const harezmi = {
    name: "harezmi", label: "al-khwārizmī · al-jabr · baghdād c. 830",
    t: 0, stars: [],
    setup() { this.stars = seedStars(32000); this.t = 0; },
    prefill() { this.draw(); },
    frame() { this.t += 0.007 * CFG.speed; this.draw(); },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.t);
      const cx = W*0.52, cy = H*0.46, s = mn()*0.13, b = s*0.55;
      const phase = 0.5 + 0.5 * Math.sin(this.t * 0.5);
      ctx.globalAlpha = 0.16; ctx.strokeRect(cx - s/2, cy - s/2, s, s);
      label("x²", cx - 7, cy + 5, 0.20);
      ctx.globalAlpha = 0.10;
      ctx.strokeRect(cx + s/2, cy - s/2, b, s);
      ctx.strokeRect(cx - s/2 - b, cy - s/2, b, s);
      ctx.strokeRect(cx - s/2, cy + s/2, s, b);
      ctx.strokeRect(cx - s/2, cy - s/2 - b, s, b);
      label("b/2·x", cx + s/2 + 3, cy + 5, 0.15);
      ctx.globalAlpha = 0.07 + 0.10 * phase;
      ctx.strokeRect(cx + s/2, cy - s/2 - b, b, b);
      ctx.strokeRect(cx - s/2 - b, cy - s/2 - b, b, b);
      ctx.strokeRect(cx + s/2, cy + s/2, b, b);
      ctx.strokeRect(cx - s/2 - b, cy + s/2, b, b);
      ctx.globalAlpha = (0.08 + 0.12 * phase);
      ctx.setLineDash([3, 4]);
      ctx.strokeRect(cx - s/2 - b, cy - s/2 - b, s + 2*b, s + 2*b);
      ctx.setLineDash([]);
      label("(x + b/2)²", cx + s/2 + b + 4, cy - s/2 - b + 14, 0.14 + 0.10*phase);
      label("al-khwārizmī · kitāb al-mukhtaṣar · baghdād", cx - mn()*0.24, cy + s/2 + b + 28, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: buzcan — six trig functions on unit circle, Baghdād c. 980
     ============================================================ */
  const buzcan = {
    name: "buzcan", label: "abū'l-wafā al-būzjānī · six functions · baghdād c. 980",
    t: Math.random() * 6, stars: [],
    setup() { this.stars = seedStars(30000); this.t = Math.random() * 6; },
    prefill() { this.draw(); },
    frame() { this.t += 0.014 * CFG.speed; this.draw(); },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.t * 0.12);
      const cx = W*0.50, cy = H*0.46, R = mn()*0.22;
      circle(cx, cy, R, 0.12);
      ctx.globalAlpha = 0.08; ctx.beginPath();
      ctx.moveTo(cx - R*1.7, cy); ctx.lineTo(cx + R*1.7, cy);
      ctx.moveTo(cx, cy - R*1.7); ctx.lineTo(cx, cy + R*1.7); ctx.stroke();
      ctx.globalAlpha = 0.07; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(cx+R, cy-R*1.6); ctx.lineTo(cx+R, cy+R*1.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-R*1.6, cy-R); ctx.lineTo(cx+R*1.6, cy-R); ctx.stroke();
      ctx.setLineDash([]);
      const th = this.t, cosT = Math.cos(th), sinT = Math.sin(th);
      const px = cx + R*cosT, py = cy - R*sinT;
      ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.globalAlpha = 0.20; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke();
      ctx.globalAlpha = 0.20; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, py); ctx.stroke();
      if (Math.abs(cosT) > 0.10) {
        const tanY = cy - R*sinT/cosT;
        ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.moveTo(cx+R, cy); ctx.lineTo(cx+R, tanY); ctx.stroke();
        ctx.globalAlpha = 0.09; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx+R, tanY); ctx.stroke();
      }
      if (Math.abs(sinT) > 0.10) {
        const cotX = cx + R*cosT/sinT;
        ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.moveTo(cx, cy-R); ctx.lineTo(cotX, cy-R); ctx.stroke();
        ctx.globalAlpha = 0.09; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cotX, cy-R); ctx.stroke();
      }
      ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2); ctx.fill();
      label("abū'l-wafā · al-būzjānī · baghdād c. 980", cx - R*1.05, cy + R*1.5, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: sabit — trepidation of the equinoxes, Baghdād c. 870
     ============================================================ */
  const sabit = {
    name: "sabit", label: "thābit ibn qurra · trepidation · baghdād c. 870",
    t: 0, trail: [], stars: [],
    setup() { this.stars = seedStars(32000); this.t = 0; this.trail = []; },
    prefill() {
      this.trail = [];
      for (let i = 0; i < 500; i++) this.trail.push(i * 0.04);
      this.draw();
    },
    frame() {
      this.t += 0.010 * CFG.speed;
      this.trail.push(this.t);
      if (this.trail.length > 500) this.trail.shift();
      this.draw();
    },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.t * 0.05);
      const cx = W*0.50, cy = H*0.46, Rp = mn()*0.30;
      circle(cx, cy, Rp, 0.10);
      const eqA = -Math.PI * 0.5;
      const treA = eqA + Math.sin(this.t * 0.7) * 0.20;
      const eqx = cx + Rp*Math.cos(treA), eqy = cy + Rp*Math.sin(treA);
      if (this.trail.length > 1) {
        ctx.globalAlpha = 0.14; ctx.beginPath();
        this.trail.forEach((tv, i) => {
          const a = eqA + Math.sin(tv * 0.7) * 0.20;
          const x = cx + Rp*Math.cos(a), y = cy + Rp*Math.sin(a);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }); ctx.stroke();
      }
      circle(eqx, eqy, mn()*0.055, 0.11, [2, 4]);
      ctx.globalAlpha = 0.10;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(eqx, eqy); ctx.stroke();
      const refx = cx + Rp*Math.cos(eqA), refy = cy + Rp*Math.sin(eqA);
      ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.arc(refx, refy, 1.8, 0, Math.PI*2); ctx.fill();
      ctx.setLineDash([1, 4]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(refx, refy); ctx.stroke();
      ctx.setLineDash([]);
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 2.0);
      ctx.globalAlpha = 0.38 + 0.28 * pulse;
      ctx.beginPath(); ctx.arc(eqx, eqy, 3, 0, Math.PI*2); ctx.fill();
      label("thābit ibn qurra · iqbāl wa-idbār · baghdād", cx - mn()*0.27, cy + Rp + 18, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: kuscu — pure epicyclic curve, Istanbul c. 1474
     ============================================================ */
  const kuscu = {
    name: "kuscu", label: "ʿalī qūshjī · epicycle · istanbul c. 1474",
    t: 0, trail: [], stars: [],
    setup() {
      this.stars = seedStars(34000); this.t = 0; this.trail = [];
      this.R = mn()*0.25; this.r = mn()*0.095; this.k = 3.7;
    },
    prefill() {
      this.trail = [];
      const steps = 620, full = (Math.PI * 2 * this.k);
      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * full;
        this.trail.push([W*0.50 + this.R*Math.cos(t) + this.r*Math.cos(this.k*t),
                          H*0.46 + this.R*Math.sin(t) + this.r*Math.sin(this.k*t)]);
      }
      this.draw();
    },
    frame() {
      this.t += 0.012 * CFG.speed;
      this.trail.push([W*0.50 + this.R*Math.cos(this.t) + this.r*Math.cos(this.k*this.t),
                        H*0.46 + this.R*Math.sin(this.t) + this.r*Math.sin(this.k*this.t)]);
      if (this.trail.length > Math.round(1200 * CFG.density)) this.trail.shift();
      this.draw();
    },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.t * 0.08);
      const cx = W*0.50, cy = H*0.46;
      circle(cx, cy, this.R, 0.07);
      const ex = cx + this.R*Math.cos(this.t), ey = cy + this.R*Math.sin(this.t);
      circle(ex, ey, this.r, 0.08, [2, 4]);
      ctx.globalAlpha = 0.09; ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
      const px = ex + this.r*Math.cos(this.k*this.t), py = ey + this.r*Math.sin(this.k*this.t);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(px, py); ctx.stroke();
      if (this.trail.length > 1) {
        ctx.globalAlpha = 0.16; ctx.beginPath();
        this.trail.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.stroke();
      }
      ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2); ctx.fill();
      label("ʿalī qūshjī · falak · istanbul c. 1474", cx - mn()*0.22, cy + this.R + this.r + 22, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     SCENE: macriti — stereographic projection, Qurṭuba c. 1000
     ============================================================ */
  const macriti = {
    name: "macriti", label: "al-majrīṭī · ṣafīḥa · qurṭuba c. 1000",
    t: 0, stars: [],
    setup() { this.stars = seedStars(30000); this.t = 0; },
    prefill() { this.draw(); },
    frame() { this.t += 0.006 * CFG.speed; this.draw(); },
    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = ink(); ctx.fillStyle = ink(); ctx.lineWidth = 0.6;
      drawStars(this.stars, this.t);
      const cx = W*0.50, cy = H*0.40, R = mn()*0.26;
      circle(cx, cy, R, 0.12);
      ctx.globalAlpha = 0.08;
      ctx.beginPath(); ctx.ellipse(cx, cy, R, R*0.28, 0, 0, Math.PI*2); ctx.stroke();
      const projY = cy + R*1.60;
      ctx.globalAlpha = 0.10; ctx.beginPath();
      ctx.moveTo(cx - R*2.2, projY); ctx.lineTo(cx + R*2.2, projY); ctx.stroke();
      const poleY = cy + R;
      ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.arc(cx, poleY, 2, 0, Math.PI*2); ctx.fill();
      const numC = 4;
      for (let k = 0; k < numC; k++) {
        const lat = -0.48 + k * 0.34 + Math.sin(this.t * 0.4) * 0.05;
        const scy = cy + R*Math.sin(lat), sr = R * Math.abs(Math.cos(lat));
        ctx.globalAlpha = 0.07 + 0.03*k;
        ctx.beginPath(); ctx.ellipse(cx, scy, sr, sr*0.28, 0, 0, Math.PI*2); ctx.stroke();
        const projR = Math.abs(R * Math.cos(lat) / (1 - Math.sin(lat))) * 0.65;
        circle(cx, projY, projR, 0.06 + 0.03*k);
        if (k === 1) {
          ctx.globalAlpha = 0.07; ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, poleY); ctx.lineTo(cx - sr, scy); ctx.lineTo(cx - projR, projY); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, poleY); ctx.lineTo(cx + sr, scy); ctx.lineTo(cx + projR, projY); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      label("al-majrīṭī · ṣafīḥa · qurṭuba c. 1000", cx - mn()*0.24, projY + 18, 0.20);
      ctx.globalAlpha = 1;
    }
  };

  /* ============================================================
     MANAGER
     ============================================================ */
  const SCENES = [tusi, astrolabe, girih, flow, hayyam, battani, biruni, harezmi, buzcan, sabit, kuscu, macriti];
  let cur = tusi;
  try {
    const saved = localStorage.getItem("as-sky");
    cur = SCENES.find(s => s.name === saved) || tusi;
  } catch (e) {}

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cur.setup();
    if (reduced.matches) { cur.prefill(); cur.draw(); }
  }

  function loop() { cur.frame(); raf = requestAnimationFrame(loop); }
  function start() {
    stop();
    if (reduced.matches) { cur.prefill(); cur.draw(); return; }
    raf = requestAnimationFrame(loop);
  }
  function stop() { if (raf) cancelAnimationFrame(raf), raf = null; }

  function paintFooter() {
    const lab = document.getElementById("sky-label");
    if (lab) lab.textContent = cur.label;
    document.querySelectorAll(".sky-opt").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.sky === cur.name));
    });
  }

  function setScene(name) {
    const s = SCENES.find(x => x.name === name);
    if (!s) return;
    cur = s;
    try { localStorage.setItem("as-sky", name); } catch (e) {}
    cur.setup();
    paintFooter();
    start();
  }

  /* footer sky-opt buttons */
  document.querySelectorAll(".sky-opt").forEach(b => {
    b.addEventListener("click", () => setScene(b.dataset.sky));
  });
  paintFooter();

  new MutationObserver(() => {
    if (cur.accumulate) { ctx.globalAlpha = 1; ctx.fillStyle = paper(); ctx.fillRect(0, 0, W, H); }
    else cur.draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  reduced.addEventListener?.("change", start);
  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

  window.SKY = {
    list: SCENES.map(s => ({ name: s.name, label: s.label })),
    get current() { return cur.name; },
    set: setScene
  };
  window.FIELD = {
    setDensity(d) { CFG.density = d; cur.setup(); if (reduced.matches) { cur.prefill(); cur.draw(); } },
    setSpeed(s) { CFG.speed = s; },
    restart: start
  };

  resize();
  start();
})();
