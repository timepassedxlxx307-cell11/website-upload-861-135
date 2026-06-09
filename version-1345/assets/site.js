(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    var show = function (target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  var searchInput = document.querySelector('.js-card-search');
  var yearFilter = document.querySelector('.js-year-filter');
  var typeFilter = document.querySelector('.js-type-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var empty = document.querySelector('[data-empty-result]');

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      searchInput.value = query;
    }

    var filterCards = function () {
      var term = searchInput.value.trim().toLowerCase();
      var year = yearFilter ? yearFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var yearMatched = !year || card.getAttribute('data-year') === year;
        var typeMatched = !type || card.getAttribute('data-type') === type;
        var termMatched = !term || text.indexOf(term) !== -1;
        var matched = yearMatched && typeMatched && termMatched;

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    searchInput.addEventListener('input', filterCards);
    if (yearFilter) {
      yearFilter.addEventListener('change', filterCards);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', filterCards);
    }
    filterCards();
  }
})();
