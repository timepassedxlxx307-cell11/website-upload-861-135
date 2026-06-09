(function () {
  function setupPlayer(root) {
    var video = root.querySelector('.player-video');
    var start = root.querySelector('[data-player-start]');
    var toggle = root.querySelector('[data-player-toggle]');
    var mute = root.querySelector('[data-player-mute]');
    var fullscreen = root.querySelector('[data-player-fullscreen]');
    var status = root.querySelector('[data-player-status]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var loaded = false;

    if (!video || !stream) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;
      setStatus('正在载入');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(stream);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('准备播放');
        });

        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络异常，正在重试');
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体异常，正在恢复');
            hls.recoverMediaError();
            return;
          }

          setStatus('播放暂时不可用');
        });
      } else {
        video.src = stream;
        setStatus('准备播放');
      }
    }

    function playVideo() {
      loadStream();
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('点击视频继续播放');
        });
      }
    }

    function togglePlay() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    start.addEventListener('click', playVideo);
    video.addEventListener('click', togglePlay);

    if (toggle) {
      toggle.addEventListener('click', togglePlay);
    }

    if (mute) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreen) {
      fullscreen.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }

    video.addEventListener('play', function () {
      root.classList.add('is-playing');
      if (toggle) {
        toggle.textContent = '暂停';
      }
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      root.classList.remove('is-playing');
      if (toggle) {
        toggle.textContent = '▶';
      }
      setStatus('已暂停');
    });

    video.addEventListener('ended', function () {
      root.classList.remove('is-playing');
      setStatus('播放结束');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-video-player]')).forEach(setupPlayer);
  });
})();
