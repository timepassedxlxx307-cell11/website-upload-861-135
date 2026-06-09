(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
                restart();
            });
        });

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

        show(0);
        restart();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        panels.forEach(function (panel) {
            var section = panel.parentElement || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            var search = panel.querySelector("[data-filter-search]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var empty = panel.querySelector("[data-filter-empty]");
            var query = new URLSearchParams(window.location.search).get("q");
            if (query && search) {
                search.value = query;
            }

            function apply() {
                var searchValue = search ? search.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;
                    if (searchValue && text.indexOf(searchValue) === -1) {
                        matched = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [search, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayer() {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("player-start");
        if (!video || typeof moviePlayer === "undefined" || !moviePlayer.src) {
            return;
        }
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = moviePlayer.src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(moviePlayer.src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = moviePlayer.src;
            }
        }

        function play() {
            prepare();
            if (button) {
                button.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
