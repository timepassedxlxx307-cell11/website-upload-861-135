(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('form[action="./search.html"]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

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
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.parentElement;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));
        var input = panel.querySelector('[data-filter-input]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var empty = scope.querySelector('[data-no-result]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function filter() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var r = region ? region.value : '';
            var t = type ? type.value : '';
            var y = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var ok = true;

                if (q && search.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && cardRegion.indexOf(r) === -1) {
                    ok = false;
                }
                if (t && cardType !== t) {
                    ok = false;
                }
                if (y && cardYear !== y) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, region, type, year].forEach(function (field) {
            if (field) {
                field.addEventListener('input', filter);
                field.addEventListener('change', filter);
            }
        });

        filter();
    });

    document.querySelectorAll('[data-player]').forEach(function (block) {
        var video = block.querySelector('video');
        var cover = block.querySelector('.player-poster');
        var status = block.querySelector('.player-status');
        var ready = null;
        var instance = null;

        if (!video || !cover) {
            return;
        }

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function prepare() {
            if (ready) {
                return ready;
            }

            ready = new Promise(function (resolve, reject) {
                var videoUrl = video.getAttribute('data-video');

                if (!videoUrl) {
                    reject(new Error('empty'));
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoUrl;
                    resolve();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    instance.loadSource(videoUrl);
                    instance.attachMedia(video);
                    instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    instance.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            setStatus('视频加载失败');
                            reject(new Error('fatal'));
                        }
                    });
                    return;
                }

                reject(new Error('unsupported'));
            });

            return ready;
        }

        function play() {
            setStatus('正在加载');
            prepare().then(function () {
                return video.play();
            }).then(function () {
                block.classList.add('is-playing');
                setStatus('');
            }).catch(function () {
                setStatus('点击视频区域继续播放');
            });
        }

        cover.addEventListener('click', play);
        video.addEventListener('play', function () {
            block.classList.add('is-playing');
        });
        video.addEventListener('ended', function () {
            block.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (instance) {
                instance.destroy();
            }
        });
    });

    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            var player = document.querySelector('[data-player]');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var poster = player.querySelector('.player-poster');
                if (poster) {
                    poster.click();
                }
            }
        });
    });
})();
