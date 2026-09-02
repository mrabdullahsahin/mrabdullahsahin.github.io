/* minimal — i18n, theme, field reveal */
(function () {
  "use strict";

  /* ---------- language ---------- */
  function applyLang(l) {
    document.documentElement.setAttribute("lang", l);
    try { localStorage.setItem("as-lang", l); } catch (e) {}
    document.querySelectorAll("[data-en]").forEach(el => {
      const v = el.getAttribute(l === "tr" ? "data-tr" : "data-en");
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-set-lang]").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.setLang === l)));
    const t = document.body.getAttribute(l === "tr" ? "data-title-tr" : "data-title-en");
    if (t) document.title = t;
    refreshThemeLabel();
    document.dispatchEvent(new CustomEvent("as:lang", { detail: l }));
  }

  /* ---------- theme ---------- */
  function refreshThemeLabel() {
    const b = document.getElementById("theme-toggle");
    if (!b) return;
    const th = document.documentElement.getAttribute("data-theme");
    const tr = document.documentElement.getAttribute("lang") === "tr";
    const lbl = th === "dark"
      ? (tr ? "Aydınlık temaya geç" : "Switch to light theme")
      : (tr ? "Karanlık temaya geç" : "Switch to dark theme");
    b.setAttribute("aria-label", lbl);
    b.setAttribute("title", lbl);
    b.setAttribute("aria-pressed", String(th === "dark"));
  }

  function applyTheme(th) {
    document.documentElement.setAttribute("data-theme", th);
    try { localStorage.setItem("as-theme", th); } catch (e) {}
    const b = document.getElementById("theme-toggle");
    if (b) b.textContent = th === "dark" ? "☾" : "☀";
    refreshThemeLabel();
  }

  function init() {
    let l = null, th = null;
    try {
      l = localStorage.getItem("as-lang");
      th = localStorage.getItem("as-theme");
    } catch (e) {}
    if (!l) l = (navigator.language || "en").slice(0, 2).toLowerCase() === "tr" ? "tr" : "en";
    if (!th) th = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyLang(l); applyTheme(th);

    document.querySelectorAll("[data-set-lang]").forEach(b =>
      b.addEventListener("click", () => applyLang(b.dataset.setLang)));
    const tt = document.getElementById("theme-toggle");
    if (tt) tt.addEventListener("click", () =>
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));

    /* the formula in the footer reveals the field */
    const f = document.getElementById("formula");
    if (f) f.addEventListener("click", () => {
      document.body.classList.toggle("field-reveal");
      f.setAttribute("aria-pressed", String(document.body.classList.contains("field-reveal")));
    });

    /* year */
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
