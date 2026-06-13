(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }

            current = (next + slides.length) % slides.length;

            slides.forEach(function (slide, index) {
                slide.classList.toggle('active', index === current);
            });

            dots.forEach(function (dot, index) {
                dot.classList.toggle('active', index === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-search-list]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var currentFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function queryFromUrl() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function activeQuery() {
        var found = inputs.find(function (input) {
            return input.value.trim();
        });
        return found ? found.value.trim() : '';
    }

    function applyFilters() {
        var q = normalize(activeQuery());

        cards.forEach(function (card) {
            var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-text') || ''));
            var category = card.getAttribute('data-category') || '';
            var type = card.getAttribute('data-text') || '';
            var matchesText = !q || text.indexOf(q) !== -1;
            var matchesFilter = currentFilter === 'all' || category === currentFilter || type.indexOf(currentFilter) !== -1;
            card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
        });
    }

    var initialQuery = queryFromUrl();

    if (initialQuery) {
        inputs.forEach(function (input) {
            input.value = initialQuery;
        });
    }

    inputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            currentFilter = button.getAttribute('data-filter') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            applyFilters();
        });
    });

    if (lists.length || initialQuery) {
        applyFilters();
    }
})();
