(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    initHeroCarousel();
    initLocalFilters();
    initSearchPage();
  });

  function initHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));

    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function setActive(index) {
      current = index % slides.length;
      if (current < 0) {
        current = slides.length - 1;
      }

      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });

      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });

      thumbs.forEach(function (thumb, idx) {
        thumb.classList.toggle("is-active", idx === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        setActive(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setActive(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        setActive(Number(thumb.getAttribute("data-hero-thumb")) || 0);
      });
    });

    play();
  }

  function initLocalFilters() {
    var grid = document.querySelector("[data-local-filter-grid]");
    var input = document.querySelector("[data-page-filter-input]");
    var clear = document.querySelector("[data-clear-filter]");
    var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-page-filter-year]"));

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var selectedYear = "";

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-category"),
          card.textContent
        ].join(" "));
        var year = card.getAttribute("data-year") || "";
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || year === selectedYear;
        var visible = matchKeyword && matchYear;

        card.classList.toggle("is-filtered-out", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        selectedYear = "";
        yearButtons.forEach(function (button) {
          button.classList.toggle("is-active", button.getAttribute("data-page-filter-year") === "");
        });
        applyFilter();
      });
    }

    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedYear = button.getAttribute("data-page-filter-year") || "";
        yearButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-search-year]");
    var categorySelect = document.querySelector("[data-search-category]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");

    if (!form || !results) {
      return;
    }

    var url = new URL(window.location.href);
    var startKeyword = url.searchParams.get("q") || "";
    var startYear = url.searchParams.get("year") || "";
    var startCategory = url.searchParams.get("category") || "";
    var movies = [];

    if (input) {
      input.value = startKeyword;
    }
    if (yearSelect) {
      yearSelect.value = startYear;
    }
    if (categorySelect) {
      categorySelect.value = startCategory;
    }

    fetch("assets/movies.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        movies = Array.isArray(data) ? data : [];
        render();
      })
      .catch(function () {
        if (summary) {
          summary.textContent = "搜索索引加载失败，仍可通过分类页浏览全部影片。";
        }
      });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    [input, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function render() {
      if (!movies.length) {
        return;
      }

      var keyword = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";

      var matched = movies.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.categoryName,
          movie.genreText,
          movie.tagText,
          movie.oneLine
        ].join(" "));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || movie.year === year;
        var matchCategory = !category || movie.categoryName === category;
        return matchKeyword && matchYear && matchCategory;
      }).slice(0, 120);

      if (summary) {
        summary.textContent = matched.length
          ? "已找到 " + matched.length + " 条相关影片，点击卡片进入详情页。"
          : "没有找到完全匹配的影片，可以尝试减少关键词或切换分类。";
      }

      results.innerHTML = matched.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="movie-poster" href="movie/' + movie.id + '.html" aria-label="观看' + escapeHtml(movie.title) + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
          '    <span class="poster-shade"></span>',
          '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <div class="movie-meta-line"><a href="category/' + movie.categorySlug + '.html">' + escapeHtml(movie.categoryName) + '</a><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '    <h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '    <div class="card-actions"><span>' + escapeHtml(movie.viewsText) + '播放</span><a href="movie/' + movie.id + '.html">立即观看</a></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }
  }
})();
