(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      var open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupImages() {
    qsa('img').forEach(function (image) {
      if (image.complete && image.naturalWidth === 0) {
        image.classList.add('image-missing');
      }

      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      });
    });
  }

  function setupHero() {
    var hero = qs('[data-hero-carousel]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-category'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function setupLocalSearch() {
    qsa('[data-local-search]').forEach(function (toolbar) {
      var scope = toolbar.parentElement || document;
      var input = qs('[data-search-input]', toolbar);
      var chips = qsa('[data-filter]', toolbar);
      var sort = qs('[data-sort]', toolbar);
      var container = qs('[data-card-container]', scope) || qs('[data-card-container]');
      var empty = qs('[data-empty-state]', scope) || qs('[data-empty-state]');

      if (!container) {
        return;
      }

      var cards = qsa('[data-card]', container);
      var activeFilter = '全部';

      function apply() {
        var query = normalize(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var matchesText = !query || text.indexOf(query) !== -1;
          var matchesFilter = activeFilter === '全部' || text.indexOf(normalize(activeFilter)) !== -1;
          var show = matchesText && matchesFilter;
          card.hidden = !show;

          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      function sortCards() {
        if (!sort) {
          return;
        }

        var mode = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === 'year-desc') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }

          if (mode === 'year-asc') {
            return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
          }

          if (mode === 'title') {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
          }

          return 0;
        });

        sorted.forEach(function (card) {
          container.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('active');
          });

          chip.classList.add('active');
          activeFilter = chip.getAttribute('data-filter') || '全部';
          apply();
        });
      });

      if (sort) {
        sort.addEventListener('change', function () {
          sortCards();
          apply();
        });
      }

      apply();
    });
  }

  function createResultCard(movie) {
    var href = 'movie/movie-' + movie.id + '.html';
    var image = './' + movie.cover + '.jpg';
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card default" href="' + href + '" data-card data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + movie.year + '" data-category="' + escapeHtml(movie.category) + '" data-tags="' + escapeHtml(movie.tags.join(' ')) + '">',
      '<figure class="poster-frame">',
      '<img src="' + image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<figcaption class="poster-overlay"><span class="play-dot" aria-hidden="true">▶</span></figcaption>',
      '</figure>',
      '<div class="movie-card-body">',
      '<div class="movie-card-topline"><span>' + escapeHtml(movie.type) + '</span><span>' + movie.year + '</span></div>',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '<div class="mini-tags">' + tags + '</div>',
      '</div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupGlobalSearch() {
    var root = qs('[data-global-search]');

    if (!root || !window.MOVIE_CATALOG) {
      return;
    }

    var input = qs('[data-global-search-input]', root);
    var results = qs('[data-global-results]', root);
    var empty = qs('[data-global-empty]', root);
    var chips = qsa('[data-global-filter]', root);
    var active = '全部';

    function render() {
      var query = normalize(input ? input.value : '');
      var filter = normalize(active);
      var matches = window.MOVIE_CATALOG.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.category,
          movie.tags.join(' ')
        ].join(' '));

        var okQuery = !query || text.indexOf(query) !== -1;
        var okFilter = active === '全部' || text.indexOf(filter) !== -1;
        return okQuery && okFilter;
      }).slice(0, 160);

      results.innerHTML = matches.map(createResultCard).join('');
      if (empty) {
        empty.hidden = matches.length !== 0;
      }

      setupImages();
    }

    if (input) {
      input.addEventListener('input', render);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });

        chip.classList.add('active');
        active = chip.getAttribute('data-global-filter') || '全部';
        render();
      });
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupImages();
    setupHero();
    setupLocalSearch();
    setupGlobalSearch();
  });
})();
