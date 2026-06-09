(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var filterPanel = document.querySelector('.filter-panel');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var regionSelect = filterPanel.querySelector('[data-region-filter]');
    var yearSelect = filterPanel.querySelector('[data-year-filter]');
    var typeSelect = filterPanel.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function fillSelect(select, attr) {
      if (!select) {
        return;
      }

      var values = cards.map(function (card) {
        return card.getAttribute(attr) || '';
      }).filter(Boolean);

      Array.from(new Set(values)).sort(function (a, b) {
        return String(b).localeCompare(String(a), 'zh-Hans-CN');
      }).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(regionSelect, 'data-region');
    fillSelect(yearSelect, 'data-year');
    fillSelect(typeSelect, 'data-type');

    function filterCards() {
      var word = input ? input.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchWord = !word || haystack.indexOf(word) !== -1;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var ok = matchWord && matchRegion && matchYear && matchType;

        card.classList.toggle('hidden-by-filter', !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      [input, regionSelect, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener(eventName, filterCards);
        }
      });
    });

    filterPanel.addEventListener('submit', function (event) {
      if (cards.length) {
        event.preventDefault();
        filterCards();
      }
    });

    filterCards();
  }

  document.querySelectorAll('.video-player').forEach(function (video) {
    var shell = video.closest('.player-shell');
    var cover = shell ? shell.querySelector('.player-cover') : null;
    var stream = video.getAttribute('data-stream');
    var ready = false;
    var hlsObject = null;

    function prepare() {
      if (ready || !stream) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsObject = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsObject.loadSource(stream);
        hlsObject.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function play() {
      prepare();
      video.controls = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('error', function () {
      if (hlsObject) {
        hlsObject.destroy();
        hlsObject = null;
      }
      ready = false;
    });
  });
})();
