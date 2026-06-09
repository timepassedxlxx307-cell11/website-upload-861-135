var Hls = window.Hls;
var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (player) {
  var video = player.querySelector('video');
  var layer = player.querySelector('[data-play-layer]');
  var stream = player.getAttribute('data-stream');
  var hls = null;

  var playVideo = function () {
    if (!video || !stream) {
      return;
    }

    if (!player.dataset.ready) {
      player.dataset.ready = '1';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    if (layer) {
      layer.classList.add('is-hidden');
    }

    video.controls = true;
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        window.setTimeout(function () {
          video.play().catch(function () {});
        }, 500);
      });
    }
  };

  if (layer) {
    layer.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('loadedmetadata', function () {
      if (player.dataset.ready) {
        video.play().catch(function () {});
      }
    });
  }

  player.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      playVideo();
    }
  });
});
