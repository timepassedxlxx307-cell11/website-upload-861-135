(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initializeMobileMenu() {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initializeHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
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
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  function initializeListFilters() {
    const bars = Array.from(document.querySelectorAll('[data-list-filter]'));
    bars.forEach(function (bar) {
      const root = bar.parentElement;
      const textInput = bar.querySelector('[data-filter-text]');
      const yearSelect = bar.querySelector('[data-filter-year]');
      const typeSelect = bar.querySelector('[data-filter-type]');
      if (!root) {
        return;
      }
      const items = Array.from(root.querySelectorAll('.movie-card, .ranking-row'));

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        const keyword = normalize(textInput ? textInput.value : '');
        const year = normalize(yearSelect ? yearSelect.value : '');
        const type = normalize(typeSelect ? typeSelect.value : '');
        items.forEach(function (item) {
          const haystack = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-year'),
            item.getAttribute('data-type'),
            item.getAttribute('data-genre')
          ].join(' '));
          const okKeyword = !keyword || haystack.includes(keyword);
          const okYear = !year || normalize(item.getAttribute('data-year')) === year;
          const okType = !type || normalize(item.getAttribute('data-type')) === type;
          item.classList.toggle('is-hidden', !(okKeyword && okYear && okType));
        });
      }

      [textInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  ready(function () {
    initializeMobileMenu();
    initializeHeroCarousel();
    initializeListFilters();
  });
})();
