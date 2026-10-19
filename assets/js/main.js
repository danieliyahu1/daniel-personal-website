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
  var dag = document.querySelector(".dag");
  var dagWrap = document.querySelector(".dag-wrap");
  var dagSvg = document.querySelector(".dag-edges");

  if (dag && dagWrap && dagSvg) {
    var drawDag = function () {
      var wrapRect = dagWrap.getBoundingClientRect();
      var items = Array.prototype.filter.call(dag.children, function (el) {
        return el.classList.contains("dag-stop");
      });
      var paths = [];
      var rtl = window.getComputedStyle(dag).direction === "rtl";

      // Group items into visual rows so the wrap line can be routed through
      // the free band between two rows instead of through a tall neighbour.
      var rects = items.map(function (el) {
        return el.getBoundingClientRect();
      });
      var rows = [];
      rects.forEach(function (rect) {
        var row = rows[rows.length - 1];
        if (!row || rect.top >= row.bottom - 2) {
          row = { top: rect.top, bottom: rect.bottom };
          rows.push(row);
        } else {
          row.top = Math.min(row.top, rect.top);
          row.bottom = Math.max(row.bottom, rect.bottom);
        }
        rect.row = row;
      });

      for (var i = 1; i < items.length; i++) {
        var from = rects[i - 1];
        var to = rects[i];
        var ax = (rtl ? from.left : from.right) - wrapRect.left;
        var ay = from.top - wrapRect.top + from.height / 2;
        var bx = (rtl ? to.right : to.left) - wrapRect.left;
        var by = to.top - wrapRect.top + to.height / 2;

        if (Math.abs(ay - by) < 2) {
          paths.push({ d: "M" + ax + " " + ay + "H" + bx, wrap: false, from: i - 1 });
        } else {
          var rowBottom = from.row.bottom - wrapRect.top;
          var rowTop = to.row.top - wrapRect.top;
          var gapMid = rowBottom + Math.max(0, rowTop - rowBottom) / 2;
          var r = 8;
          var d;

          if (rtl) {
            var xOutR = ax - 8;
            var xInR = bx + 14;

            d =
              "M" + ax + " " + ay +
              "H" + (xOutR + r) +
              "Q" + xOutR + " " + ay + " " + xOutR + " " + (ay + r) +
              "V" + (gapMid - r) +
              "Q" + xOutR + " " + gapMid + " " + (xOutR + r) + " " + gapMid +
              "H" + (xInR - r) +
              "Q" + xInR + " " + gapMid + " " + xInR + " " + (gapMid + r) +
              "V" + (by - r) +
              "Q" + xInR + " " + by + " " + (xInR - r) + " " + by +
              "H" + bx;
          } else {
            var xOut = ax + 8;
            var xIn = bx - 14;

            d =
              "M" + ax + " " + ay +
              "H" + (xOut - r) +
              "Q" + xOut + " " + ay + " " + xOut + " " + (ay + r) +
              "V" + (gapMid - r) +
              "Q" + xOut + " " + gapMid + " " + (xOut - r) + " " + gapMid +
              "H" + (xIn + r) +
              "Q" + xIn + " " + gapMid + " " + xIn + " " + (gapMid + r) +
              "V" + (by - r) +
              "Q" + xIn + " " + by + " " + (xIn + r) + " " + by +
              "H" + bx;
          }

          paths.push({ d: d, wrap: true, from: i - 1 });
        }
      }

      dagSvg.setAttribute("width", wrapRect.width);
      dagSvg.setAttribute("height", wrapRect.height);

      while (dagSvg.firstChild) {
        dagSvg.removeChild(dagSvg.firstChild);
      }

      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML =
        '<marker id="dag-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">' +
        '<path d="M0 0 L6 3 L0 6 Z" fill="currentColor"></path></marker>';
      dagSvg.appendChild(defs);

      paths.forEach(function (p) {
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", p.d);
        path.setAttribute("class", p.wrap ? "dag-edge dag-edge--wrap" : "dag-edge");
        path.setAttribute("data-from", String(p.from));
        if (p.wrap) path.setAttribute("marker-end", "url(#dag-arrow)");
        dagSvg.appendChild(path);
      });
    };

    var dagItems = Array.prototype.filter.call(dag.children, function (el) {
      return el.classList.contains("dag-stop");
    });

    var highlightEdge = function (index) {
      Array.prototype.forEach.call(dagSvg.querySelectorAll(".dag-edge"), function (path) {
        path.classList.toggle("is-hot", Number(path.getAttribute("data-from")) === index);
      });
    };

    dagItems.forEach(function (item, index) {
      item.addEventListener("mouseenter", function () {
        highlightEdge(index);
      });
      item.addEventListener("mouseleave", function () {
        highlightEdge(-1);
      });
    });

    drawDag();
    window.addEventListener("resize", drawDag);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(drawDag);
    }
  }

  var copyButton = document.querySelector("[data-copy-email]");

  if (copyButton) {
    var copyStatus = document.querySelector(".copy-status");
    var copyIdleLabel = copyButton.getAttribute("aria-label");
    var copyDoneLabel = copyButton.getAttribute("data-label-copied") || "Copied";
    var copyFailedLabel = copyButton.getAttribute("data-label-failed") || "Could not copy";
    var copyReset;

    var writeClipboard = function (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        var field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.top = "-1000px";
        document.body.appendChild(field);
        field.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (error) {
          ok = false;
        }
        document.body.removeChild(field);
        if (ok) {
          resolve();
        } else {
          reject(new Error("copy failed"));
        }
      });
    };

    var resetCopyButton = function () {
      copyButton.classList.remove("is-copied");
      copyButton.setAttribute("aria-label", copyIdleLabel);
      copyButton.setAttribute("title", copyIdleLabel);
      if (copyStatus) {
        copyStatus.textContent = "";
      }
    };

    copyButton.addEventListener("click", function () {
      writeClipboard(copyButton.getAttribute("data-copy-email"))
        .then(function () {
          copyButton.classList.add("is-copied");
          copyButton.setAttribute("aria-label", copyDoneLabel);
          copyButton.setAttribute("title", copyDoneLabel);
          if (copyStatus) {
            copyStatus.textContent = copyDoneLabel;
          }
          window.clearTimeout(copyReset);
          copyReset = window.setTimeout(resetCopyButton, 2000);
        })
        .catch(function () {
          if (copyStatus) {
            copyStatus.textContent = copyFailedLabel;
          }
        });
    });
  }
})();
