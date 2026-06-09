(function () {
    function bindSource(video, source) {
        if (!video || !source) {
            return null;
        }
        if (video.getAttribute('data-ready') === '1') {
            return null;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return hls;
        }
        video.src = source;
        return null;
    }

    window.initPagePlayer = function (source) {
        var video = document.querySelector('.movie-video');
        var layer = document.querySelector('.player-layer');
        var start = document.querySelector('.player-start');
        var errorBox = document.querySelector('.player-error');
        var hls = null;

        function setError() {
            if (errorBox) {
                errorBox.textContent = '播放加载失败，请稍后重试。';
                errorBox.classList.add('is-visible');
            }
        }

        function play() {
            if (!video) {
                return;
            }
            hls = hls || bindSource(video, source);
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (start) {
            start.addEventListener('click', function (event) {
                event.stopPropagation();
                play();
            });
        }
        if (layer) {
            layer.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('error', setError);
        }
        window.addEventListener('pagehide', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };
})();
