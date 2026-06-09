(function () {
    var body = document.body;
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            body.classList.toggle('is-menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('is-active', itemIndex === activeSlide);
        });

        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('is-active', itemIndex === activeSlide);
        });
    }

    function startSlides() {
        if (slides.length < 2) {
            return;
        }

        slideTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5600);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (slideTimer) {
                window.clearInterval(slideTimer);
            }

            showSlide(index);
            startSlides();
        });
    });

    showSlide(0);
    startSlides();

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var currentFilter = '';

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function currentQuery() {
        var activeInput = searchInputs.find(function (input) {
            return input.value.trim().length > 0;
        });

        return activeInput ? normalize(activeInput.value) : '';
    }

    function applyCards() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        if (!cards.length) {
            return;
        }

        var query = currentQuery();
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchFilter = !currentFilter || haystack.indexOf(normalize(currentFilter)) !== -1;
            var visible = matchQuery && matchFilter;

            card.hidden = !visible;

            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            currentFilter = button.getAttribute('data-filter-value') || '';

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            applyCards();
        });
    });

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            searchInputs.forEach(function (otherInput) {
                if (otherInput !== input) {
                    otherInput.value = input.value;
                }
            });

            applyCards();
        });

        if (input.form) {
            input.form.addEventListener('submit', function (event) {
                var hasCards = document.querySelector('[data-card]');

                if (hasCards) {
                    event.preventDefault();
                    applyCards();
                    return;
                }

                var target = input.getAttribute('data-search-target') || 'index.html';
                var query = input.value.trim();

                if (query) {
                    event.preventDefault();
                    window.location.href = target + '?keyword=' + encodeURIComponent(query);
                }
            });
        }
    });

    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('keyword');

    if (initialKeyword) {
        searchInputs.forEach(function (input) {
            input.value = initialKeyword;
        });
        applyCards();
    }

    var playerRoot = document.querySelector('[data-player]');

    if (playerRoot) {
        var video = playerRoot.querySelector('video');
        var cover = playerRoot.querySelector('[data-player-cover]');
        var playUrl = window.__PLAY_URL__ || '';
        var hlsInstance = null;

        function bindVideo() {
            if (!video || video.getAttribute('data-ready') === 'true') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playUrl;
            }

            video.setAttribute('data-ready', 'true');
        }

        function startVideo() {
            if (!video || !playUrl) {
                return;
            }

            bindVideo();
            video.controls = true;

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', startVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
