(function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupLocalFilter() {
    var input = document.querySelector(".movie-filter-input");
    var yearSelect = document.querySelector(".movie-year-select");
    var scope = document.querySelector("[data-filter-scope]");

    if (!scope || (!input && !yearSelect)) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var source = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || source.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        card.style.display = matchKeyword && matchYear ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");

    if (!form || !input || !results || !window.siteMovies) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function createResultCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + movie.link + '" title="' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
        '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h2><a href="' + movie.link + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.description) + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.genre) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function render() {
      var keyword = normalize(input.value);
      var list = window.siteMovies;

      if (keyword) {
        list = list.filter(function (movie) {
          return [movie.title, movie.region, movie.genre, movie.type, movie.year, movie.description]
            .join(" ")
            .toLowerCase()
            .indexOf(keyword) !== -1;
        });
      } else {
        list = list.slice(0, 80);
      }

      if (!list.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
        return;
      }

      results.innerHTML = list.slice(0, 160).map(createResultCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nextUrl = "./search.html?q=" + encodeURIComponent(input.value.trim());
      window.history.replaceState(null, "", nextUrl);
      render();
    });

    input.addEventListener("input", render);
    render();
  }

  function initPlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.querySelector('[data-player-button="' + options.videoId + '"]');
    var hlsInstance = null;
    var attached = false;

    if (!video || !options.source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(options.source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          }
        });
        return;
      }

      video.src = options.source;
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function playVideo() {
      attachSource();
      hideButton();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    video.addEventListener("play", hideButton);
    video.addEventListener("loadedmetadata", hideButton);
    attachSource();
  }

  setupLocalFilter();
  setupSearchPage();

  window.MovieSite = window.MovieSite || {};
  window.MovieSite.initPlayer = initPlayer;
})();
