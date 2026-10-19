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

    var toggle = document.querySelector("[data-theme-toggle]");
    var label = document.querySelector("[data-theme-label]");

    if (label) {
      var darkLabel = (toggle && toggle.dataset.labelDark) || "Dark";
      var lightLabel = (toggle && toggle.dataset.labelLight) || "Light";
      label.textContent = theme === "dark" ? lightLabel : darkLabel;
    }

    if (toggle) {
      var darkAria = toggle.dataset.darkAria || "Switch to dark theme";
      var lightAria = toggle.dataset.lightAria || "Switch to light theme";
      toggle.setAttribute("aria-label", theme === "dark" ? lightAria : darkAria);
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
    var openLabel = navToggle.dataset.openLabel || "Open menu";
    var closeLabel = navToggle.dataset.closeLabel || "Close menu";

    function closeNav(returnFocus) {
      navArea.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", openLabel);
      root.dataset.navOpen = "false";
      document.body.style.overflow = "";
      if (returnFocus) navToggle.focus();
    }

    navToggle.addEventListener("click", function () {
      var open = navArea.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? closeLabel : openLabel);
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

  document.querySelectorAll(".lang-toggle").forEach(function (link) {
    link.addEventListener("click", function () {
      var hash = window.location.hash;
      if (hash) {
        link.href = link.getAttribute("href").split("#")[0] + hash;
      }
    });
  });

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
