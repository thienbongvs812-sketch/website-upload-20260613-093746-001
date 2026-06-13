(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
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

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .poster-card"));
    var pageSearch = document.querySelector("[data-page-search]");
    var mainSearch = document.querySelector("[data-main-search]");
    var emptyState = document.querySelector("[data-empty-state]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var activeFilter = "all";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-keywords"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-category"),
            card.textContent
        ].join(" "));
    }

    function applyFilters() {
        var keyword = normalize(pageSearch ? pageSearch.value : query);
        var shown = 0;

        cards.forEach(function (card) {
            var text = cardText(card);
            var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchesFilter = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
            var visible = matchesKeyword && matchesFilter;

            card.style.display = visible ? "" : "none";

            if (visible) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", cards.length > 0 && shown === 0);
        }
    }

    if (query) {
        if (pageSearch) {
            pageSearch.value = query;
        }

        if (mainSearch) {
            mainSearch.value = query;
        }
    }

    if (pageSearch) {
        pageSearch.addEventListener("input", applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter-value") || "all";

            filterButtons.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });

            applyFilters();
        });
    });

    applyFilters();
})();
