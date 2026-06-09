(function () {
    var forms = document.querySelectorAll('[data-site-search]');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = 'search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });

    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === active);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });
    showSlide(0);
    startHero();

    var libraryInput = document.querySelector('[data-library-search]');
    var filterSelect = document.querySelector('[data-library-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function runFilter() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(libraryInput ? libraryInput.value.trim() : '');
        var filter = normalize(filterSelect ? filterSelect.value : '');
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year'));
            var type = normalize(card.getAttribute('data-type'));
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedFilter = !filter || type.indexOf(filter) !== -1 || text.indexOf(filter) !== -1;
            var show = matchedKeyword && matchedFilter;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (libraryInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            libraryInput.value = query;
        }
        libraryInput.addEventListener('input', runFilter);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', runFilter);
    }
    runFilter();
})();
