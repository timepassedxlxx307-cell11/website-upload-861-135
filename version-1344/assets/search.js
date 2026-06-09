(function () {
  const root = document.querySelector('[data-search-page]');
  if (!root) {
    return;
  }

  const form = root.querySelector('[data-search-form]');
  const input = root.querySelector('[data-search-input]');
  const typeSelect = root.querySelector('[data-search-type]');
  const yearSelect = root.querySelector('[data-search-year]');
  const results = root.querySelector('[data-search-results]');
  const count = root.querySelector('[data-search-count]');
  let movies = [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return `
<article class="movie-card" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}" data-genre="${escapeHtml(movie.genre)}">
  <a class="poster-link" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}">
    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="play-badge">播放</span>
  </a>
  <div class="movie-card-body">
    <div class="card-meta-row">
      <a class="category-pill" href="categories/${escapeHtml(movie.categorySlug)}.html">${escapeHtml(movie.category)}</a>
      <span>${escapeHtml(movie.year)}</span>
    </div>
    <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.description)}</p>
    <div class="tag-row">${tags}</div>
    <div class="score-row">
      <span>评分 ${escapeHtml(movie.rating)}</span>
      <span>${movie.views >= 10000 ? (movie.views / 10000).toFixed(1) + '万' : escapeHtml(movie.views)}次观看</span>
    </div>
  </div>
</article>`;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function apply() {
    const keyword = normalize(input ? input.value : '');
    const type = normalize(typeSelect ? typeSelect.value : '');
    const year = normalize(yearSelect ? yearSelect.value : '');
    const matched = movies.filter(function (movie) {
      const haystack = normalize([
        movie.title,
        movie.year,
        movie.type,
        movie.region,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.description
      ].join(' '));
      const okKeyword = !keyword || haystack.includes(keyword);
      const okType = !type || normalize(movie.type) === type;
      const okYear = !year || normalize(movie.year) === year;
      return okKeyword && okType && okYear;
    }).slice(0, 120);

    if (results) {
      results.innerHTML = matched.map(card).join('');
    }
    if (count) {
      count.textContent = matched.length + ' 个结果';
    }
  }

  function setInitialQuery() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    if (input) {
      input.value = q;
    }
  }

  function bind() {
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const params = new URLSearchParams(window.location.search);
        params.set('q', input ? input.value : '');
        history.replaceState(null, '', window.location.pathname + '?' + params.toString());
        apply();
      });
    }
    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  fetch('assets/movies-index.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      movies = data;
      setInitialQuery();
      bind();
      apply();
    })
    .catch(function () {
      if (count) {
        count.textContent = '搜索加载失败';
      }
    });
})();
