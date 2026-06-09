(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("form[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q'], input[type='search']");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.parentElement || document;
      var search = panel.querySelector("[data-page-search]");
      var region = panel.querySelector("[data-page-region]");
      var year = panel.querySelector("[data-page-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));
      var empty = scope.querySelector("[data-empty-state]");
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
      }

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      if (search && initialQuery) {
        search.value = initialQuery;
      }

      function apply() {
        var query = normalize(search ? search.value : "");
        var regionValue = normalize(region ? region.value : "");
        var yearValue = normalize(year ? year.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
            ok = false;
          }
          if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, region, year].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.initPlayer = function (streamUrl) {
    onReady(function () {
      var frame = document.querySelector("[data-player-frame]");
      var video = document.getElementById("movie-video");
      var layer = document.getElementById("play-layer");
      var loaded = false;
      var hlsInstance = null;

      if (!frame || !video || !layer || !streamUrl) {
        return;
      }

      function requestPlay() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      function start(event) {
        if (event) {
          event.preventDefault();
        }
        if (loaded) {
          requestPlay();
          return;
        }
        loaded = true;
        layer.classList.add("is-hidden");
        video.setAttribute("controls", "controls");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          requestPlay();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            requestPlay();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (name, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = streamUrl;
              requestPlay();
            }
          });
        } else {
          video.src = streamUrl;
          requestPlay();
        }
      }

      layer.addEventListener("click", start);
      frame.addEventListener("click", function (event) {
        if (!loaded) {
          start(event);
        }
      });
      video.addEventListener("click", function (event) {
        if (!loaded) {
          start(event);
        }
      });
    });
  };

  onReady(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
