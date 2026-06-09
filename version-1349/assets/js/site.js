(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var input = filterPanel.querySelector('[data-filter-input]');
    var region = filterPanel.querySelector('[data-filter-region]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var year = filterPanel.querySelector('[data-filter-year]');

    function fillSelect(select, values) {
      values.forEach(function (value) {
        if (!value) {
          return;
        }
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function uniqueValues(name) {
      var map = {};
      cards.forEach(function (card) {
        var value = card.getAttribute(name) || '';
        if (value) {
          map[value] = true;
        }
      });
      return Object.keys(map).sort(function (a, b) {
        return b.localeCompare(a, 'zh-CN');
      });
    }

    fillSelect(region, uniqueValues('data-region'));
    fillSelect(type, uniqueValues('data-type'));
    fillSelect(year, uniqueValues('data-year'));

    function apply() {
      var query = (input.value || '').trim().toLowerCase();
      var selectedRegion = region.value;
      var selectedType = type.value;
      var selectedYear = year.value;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        card.classList.toggle('is-hidden', !(matchQuery && matchRegion && matchType && matchYear));
      });
    }

    [input, region, type, year].forEach(function (element) {
      element.addEventListener('input', apply);
      element.addEventListener('change', apply);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
      apply();
    }
  }
})();
