(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "dani-theme";

  function preferredTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;

    var label = document.querySelector("[data-theme-label]");
    if (label) label.textContent = theme === "dark" ? "Light" : "Dark";

    var toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {}
    }
  }

  applyTheme(preferredTheme(), false);

  var themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }

  var navToggle = document.querySelector("[data-nav-toggle]");
  var navArea = document.getElementById("site-menu");
  if (navToggle && navArea) {
    function closeNav(returnFocus) {
      navArea.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
      root.dataset.navOpen = "false";
      document.body.style.overflow = "";
      if (returnFocus) navToggle.focus();
    }

    navToggle.addEventListener("click", function () {
      var open = navArea.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      root.dataset.navOpen = open ? "true" : "false";
      document.body.style.overflow = open ? "hidden" : "";
    });

    navArea.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeNav(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navArea.classList.contains("open")) {
        closeNav(true);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && navArea.classList.contains("open")) {
        closeNav(false);
      }
    });
  }

  var year = document.querySelectorAll("[data-year]");
  year.forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  var revealItems = document.querySelectorAll("[data-reveal]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && "IntersectionObserver" in window && revealItems.length) {
    revealItems.forEach(function (el) {
      el.classList.add("reveal");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  }
})();
