/* ============================================================
   reader.js — everything that makes reading easier
   · reading time + word/char counts (per language)
   · scroll progress hairline + live "% read / time left"
   · ToC: desktop rail (appears as you scroll, shows position)
     + mobile reading dock with current section & percent
   · font size A−/A+ · serif/sans toggle · heading anchors
   · code copy buttons · back-to-top
   ============================================================ */
(function () {
  "use strict";

  const article = document.querySelector(".article-body");
  if (!article) return;

  const lang = () => document.documentElement.getAttribute("lang") === "tr" ? "tr" : "en";
  const fmt = n => n.toLocaleString(lang() === "tr" ? "tr-TR" : "en-US");

  /* ---------- stats ---------- */
  const stats = { words: 0, chars: 0, mins: 1 };
  function computeStats() {
    const block = article.querySelector(`[data-lang="${lang()}"]`) || article;
    const text = (block.textContent || "").trim();
    stats.words = text ? text.split(/\s+/).length : 0;
    stats.chars = text.replace(/\s+/g, "").length;
    stats.mins = Math.max(1, Math.round(stats.words / 200));
    document.querySelectorAll(".read-time").forEach(el => {
      el.textContent = lang() === "tr" ? `${stats.mins} dk okuma` : `${stats.mins} min read`;
    });
  }

  /* ---------- progress + live position ---------- */
  const bar = document.getElementById("progress");
  let currentSection = "";

  function pct() {
    const h = document.documentElement;
    const max = h.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
  }

  function updateLive() {
    const p = pct();
    if (bar) bar.style.width = (p * 100) + "%";
    const left = Math.max(0, Math.ceil(stats.mins * (1 - p)));
    const tr = lang() === "tr";
    const pctTxt = Math.round(p * 100) + "%";
    const leftTxt = p >= 0.98 ? (tr ? "bitti ∎" : "done ∎")
      : (tr ? `~${left} dk kaldı` : `~${left} min left`);

    const tsP = document.getElementById("ts-pct");
    const tsL = document.getElementById("ts-left");
    const tsF = document.getElementById("ts-fill");
    if (tsP) tsP.textContent = pctTxt;
    if (tsL) tsL.textContent = leftTxt;
    if (tsF) tsF.style.width = (p * 100) + "%";

    const dSec = document.getElementById("dock-sec");
    const dPct = document.getElementById("dock-pct");
    if (dPct) dPct.textContent = pctTxt;
    if (dSec) dSec.textContent = currentSection || (tr ? "Giriş" : "Intro");

    /* rail + dock appear once the article begins */
    const hero = document.querySelector(".art-hero");
    const begun = hero ? scrollY > hero.offsetTop + hero.offsetHeight - 120 : scrollY > 300;
    document.getElementById("toc")?.classList.toggle("on", begun);
    document.getElementById("dock")?.classList.toggle("on", begun && p < 0.99);
    if (totop) totop.classList.toggle("show", scrollY > innerHeight * 0.8);
  }

  /* ---------- ToC ---------- */
  const headings = [];
  function slug(s) {
    return s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-").slice(0, 60);
  }
  function statsHtml() {
    const tr = lang() === "tr";
    return `<div class="toc-stats">
      <div class="ts-row"><span id="ts-pct">0%</span><span id="ts-left"></span></div>
      <div class="ts-bar"><i id="ts-fill"></i></div>
      <div class="ts-row dim"><span>${fmt(stats.words)} ${tr ? "kelime" : "words"}</span><span>${fmt(stats.chars)} ${tr ? "harf" : "chars"}</span></div>
    </div>`;
  }
  function buildToc() {
    const block = article.querySelector(`[data-lang="${lang()}"]`) || article;
    headings.length = 0;
    const used = new Set();
    block.querySelectorAll("h2, h3").forEach(h => {
      if (!h.id) {
        let id = slug(h.textContent);
        while (used.has(id)) id += "-x";
        used.add(id);
        h.id = id;
      }
      if (!h.querySelector(".anchor")) {
        const a = document.createElement("a");
        a.className = "anchor"; a.href = "#" + h.id;
        a.textContent = "#"; a.setAttribute("aria-label", "Link");
        h.prepend(a);
      }
      headings.push(h);
    });
    const items = headings.map(h =>
      `<li class="${h.tagName === "H3" ? "h3" : "h2"}" data-for="${h.id}"><a href="#${h.id}">${h.textContent.replace(/^#/, "")}</a></li>`
    ).join("");
    const tr = lang() === "tr";
    const labelTxt = tr ? "İçindekiler" : "Contents";
    const rail = document.getElementById("toc");
    if (rail) rail.innerHTML = `<div class="toc-label">${labelTxt}</div><ol>${items}</ol>` + statsHtml();
    const mob = document.querySelector(".toc-mobile");
    if (mob) {
      mob.querySelector("summary").textContent = labelTxt;
      mob.querySelector("ol").innerHTML = items;
    }
    const pop = document.getElementById("dock-pop");
    if (pop) pop.innerHTML = `<ol>${items}</ol>` + statsHtml();
    observeHeadings();
    updateLive();
  }

  document.addEventListener("click", e => {
    const a = e.target.closest('#toc a, .toc-mobile a, #dock-pop a, .anchor');
    if (a) {
      const id = decodeURIComponent((a.getAttribute("href") || "").slice(1));
      const h = document.getElementById(id);
      if (h) {
        e.preventDefault();
        const y = h.getBoundingClientRect().top + scrollY - 84;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
        history.replaceState(null, "", "#" + id);
        e.target.closest(".toc-mobile")?.removeAttribute("open");
        closeDock();
      }
      return;
    }
    /* dock open/close */
    if (e.target.closest("#dock-btn")) { toggleDock(); return; }
    if (!e.target.closest("#dock")) closeDock();
  });

  let io = null;
  function observeHeadings() {
    if (io) io.disconnect();
    io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          currentSection = en.target.textContent.replace(/^#/, "");
          document.querySelectorAll("#toc li, #dock-pop li").forEach(li =>
            li.classList.toggle("active", li.dataset.for === en.target.id));
          updateLive();
        }
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    headings.forEach(h => io.observe(h));
  }

  /* ---------- mobile reading dock ---------- */
  const dock = document.createElement("div");
  dock.id = "dock";
  dock.innerHTML = `
    <div id="dock-pop" hidden></div>
    <button id="dock-btn" aria-expanded="false" aria-controls="dock-pop">
      <span id="dock-pct">0%</span><span class="d-sep"></span><span id="dock-sec"></span><span class="d-car">▴</span>
    </button>`;
  document.body.appendChild(dock);
  function toggleDock() {
    const pop = document.getElementById("dock-pop");
    const btn = document.getElementById("dock-btn");
    const open = pop.hidden;
    pop.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    dock.classList.toggle("open", open);
  }
  function closeDock() {
    const pop = document.getElementById("dock-pop");
    if (pop && !pop.hidden) {
      pop.hidden = true;
      document.getElementById("dock-btn").setAttribute("aria-expanded", "false");
      dock.classList.remove("open");
    }
  }

  /* ---------- font size ---------- */
  let scale = 1;
  try { scale = parseFloat(localStorage.getItem("as-readscale") || "1") || 1; } catch (e) {}
  function applyScale() {
    scale = Math.min(1.35, Math.max(0.85, scale));
    document.documentElement.style.setProperty("--read-scale", String(scale));
    try { localStorage.setItem("as-readscale", String(scale)); } catch (e) {}
    const minus = document.getElementById("fs-minus"), plus = document.getElementById("fs-plus");
    if (minus) minus.disabled = scale <= 0.85;
    if (plus) plus.disabled = scale >= 1.35;
  }
  document.getElementById("fs-minus")?.addEventListener("click", () => { scale -= 0.1; applyScale(); });
  document.getElementById("fs-plus")?.addEventListener("click", () => { scale += 0.1; applyScale(); });

  /* ---------- body font ---------- */
  let rfont = "sans";
  try { rfont = localStorage.getItem("as-readfont") || "sans"; } catch (e) {}
  function applyFont() {
    document.documentElement.setAttribute("data-readfont", rfont);
    try { localStorage.setItem("as-readfont", rfont); } catch (e) {}
    document.getElementById("font-toggle")?.setAttribute("aria-pressed", String(rfont === "serif"));
  }
  document.getElementById("font-toggle")?.addEventListener("click", () => {
    rfont = rfont === "serif" ? "sans" : "serif";
    applyFont();
  });

  /* ---------- code copy ---------- */
  document.querySelectorAll(".codeblock").forEach(cb => {
    const btn = document.createElement("button");
    btn.className = "copy"; btn.textContent = "copy";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(cb.querySelector("pre").innerText);
        btn.textContent = "copied ✓";
      } catch (e) { btn.textContent = ":("; }
      setTimeout(() => btn.textContent = "copy", 1600);
    });
    cb.appendChild(btn);
  });

  /* ---------- back to top ---------- */
  const totop = document.getElementById("totop");
  totop?.addEventListener("click", () => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  /* ---------- wire up ---------- */
  addEventListener("scroll", updateLive, { passive: true });
  addEventListener("resize", updateLive);
  document.addEventListener("as:lang", () => { computeStats(); buildToc(); });

  computeStats();
  buildToc();
  applyScale();
  applyFont();
  updateLive();
})();
