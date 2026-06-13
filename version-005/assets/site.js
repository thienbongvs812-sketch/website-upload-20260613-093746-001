(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().replace(/\s+/g, "");
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var select = scope.querySelector("[data-sort-select]");
      var grid = scope.querySelector("[data-card-grid]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      cards.forEach(function (card, index) {
        card.dataset.defaultOrder = index.toString();
      });

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.tags
          ].join(" "));
          card.hidden = query.length > 0 && haystack.indexOf(query) === -1;
        });
      }

      function applySort() {
        var value = select ? select.value : "default";
        var sorted = cards.slice();
        sorted.sort(function (a, b) {
          if (value === "year-desc") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (value === "year-asc") {
            return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
          }
          if (value === "title-asc") {
            return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
          }
          return Number(a.dataset.defaultOrder || 0) - Number(b.dataset.defaultOrder || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      if (select) {
        select.addEventListener("change", function () {
          applySort();
          applyFilter();
        });
      }
    });
  });
})();
