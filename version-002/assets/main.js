(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim().toLowerCase();
    }

    function setupLocalSearch() {
        var grid = document.querySelector("[data-search-grid]");
        if (!grid) {
            return;
        }
        var form = document.querySelector("[data-local-search-form]");
        var input = form ? form.querySelector("input[name='q']") : null;
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-result]");
        var region = "all";
        var type = "all";

        if (input) {
            input.value = getQuery();
        }

        function matches(card, query) {
            var text = (card.getAttribute("data-search") || "").toLowerCase();
            var cardRegion = card.getAttribute("data-region") || "";
            var cardType = card.getAttribute("data-type") || "";
            var queryOk = !query || text.indexOf(query) !== -1;
            var regionOk = region === "all" || cardRegion === region;
            var typeOk = type === "all" || cardType === type;
            return queryOk && regionOk && typeOk;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : getQuery();
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card, query);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
                var value = input ? input.value.trim() : "";
                var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
                window.history.replaceState({}, "", url);
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        document.querySelectorAll("[data-filter-region]").forEach(function (button) {
            button.addEventListener("click", function () {
                region = button.getAttribute("data-filter-region") || "all";
                document.querySelectorAll("[data-filter-region]").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        document.querySelectorAll("[data-filter-type]").forEach(function (button) {
            button.addEventListener("click", function () {
                type = button.getAttribute("data-filter-type") || "all";
                document.querySelectorAll("[data-filter-type]").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupLocalSearch();
    });
})();
