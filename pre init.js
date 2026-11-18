/* =====================================================================
   prefs-init.js — roda ANTES do CSS ser pintado (fica no <head>).
   Lê as preferências salvas e aplica no <html>, evitando o "flash" de
   tema errado ao carregar a página.
   ===================================================================== */
(function () {
  var root = document.documentElement;
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem("mi-prefs") || "{}"); } catch (e) {}

  var theme = prefs.theme || "auto";
  if (theme === "auto") {
    theme = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-size", String(prefs.size || 0));
  if (prefs.legible) root.setAttribute("data-legible", "true");
  if (prefs.spacing) root.setAttribute("data-spacing", "true");
  if (prefs.links)   root.setAttribute("data-links", "true");
  if (prefs.motion)  root.setAttribute("data-motion", "reduce");
})();