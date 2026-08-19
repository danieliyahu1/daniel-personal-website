(function () {
  var root = document.documentElement;
  var STORAGE_KEY = "dani-theme";

  function currentTheme() {
    try {
      var t = localStorage.getItem(STORAGE_KEY);
      if (t === "light" || t === "dark") return t;
    } catch (e) {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(t, persist) {
    root.dataset.theme = t;
    var label = document.querySelector("[data-theme-label]");
    if (label) label.textContent = t === "dark" ? "Light" : "Dark";
    var toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) toggle.setAttribute("aria-pressed", t === "dark");
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch (e) {}
    }
  }

  setTheme(currentTheme(), false);

  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }

  var navToggle = document.querySelector("[data-nav-toggle]");
  var navArea = document.getElementById("site-menu");
  if (navToggle && navArea) {
    navToggle.addEventListener("click", function () {
      var open = navArea.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  var yearEls = document.querySelectorAll("[data-year]");
  yearEls.forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();