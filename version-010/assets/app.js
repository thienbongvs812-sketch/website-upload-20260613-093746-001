(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(panel, term) {
    var query = normalize(term);
    var container = document.querySelector('[data-card-container]');
    if (!container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card, .ranking-item'));
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      var matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-live-search]');
    var clear = panel.querySelector('[data-clear-search]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-term]'));
    var initial = readQuery();
    if (input && initial) {
      input.value = initial;
      applyFilter(panel, initial);
    }
    if (input) {
      input.addEventListener('input', function () {
        buttons.forEach(function (button) {
          button.classList.remove('active');
        });
        applyFilter(panel, input.value);
      });
    }
    if (clear && input) {
      clear.addEventListener('click', function () {
        input.value = '';
        applyFilter(panel, '');
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var term = button.getAttribute('data-filter-term') || '';
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        if (input) {
          input.value = term;
        }
        applyFilter(panel, term);
      });
    });
  });

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"], input[type="search"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });
})();
