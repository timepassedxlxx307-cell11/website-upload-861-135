import { H as Hls } from './hls.js';

function initializePlayer(root) {
  const video = root.querySelector('video');
  const overlay = root.querySelector('.play-overlay');
  const status = root.querySelector('.player-status');
  const source = root.getAttribute('data-hls-url');
  let hls = null;
  let loaded = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function loadSource() {
    if (loaded || !video || !source) {
      return;
    }
    loaded = true;
    setStatus('正在加载');

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setStatus('视频加载失败');
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setStatus('');
      }, { once: true });
      return;
    }

    setStatus('视频暂时无法播放');
  }

  async function playVideo() {
    if (!video) {
      return;
    }
    loadSource();
    try {
      await video.play();
      root.classList.add('is-playing');
    } catch (error) {
      setStatus('请再次点击播放');
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      root.classList.remove('is-playing');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

Array.from(document.querySelectorAll('.player-box')).forEach(initializePlayer);
