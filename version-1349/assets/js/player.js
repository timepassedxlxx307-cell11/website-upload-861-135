(function () {
  var holder = document.querySelector('[data-player]');

  if (!holder) {
    return;
  }

  var video = holder.querySelector('video');
  var overlay = holder.querySelector('.player-overlay');
  var playButton = holder.querySelector('[data-play]');
  var stream = holder.getAttribute('data-stream');
  var hls = null;

  function attachStream() {
    if (!video || !stream || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
  }

  function startPlay() {
    attachStream();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playing = video.play();

    if (playing && typeof playing.catch === 'function') {
      playing.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.preventDefault();
      startPlay();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      startPlay();
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
