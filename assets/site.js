(function () {
  var root = document.body.getAttribute("data-root") || "";

  // Mobile menu
  var btn = document.getElementById("menuBtn"), scrim = document.getElementById("scrim");
  if (btn) btn.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
  if (scrim) scrim.addEventListener("click", function () { document.body.classList.remove("nav-open"); });

  // Keep the active sidebar link in view
  var active = document.querySelector(".sidebar a.active");
  if (active && active.scrollIntoView) active.scrollIntoView({ block: "center" });

  // Copy buttons
  document.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var code = b.closest(".code").querySelector("code").innerText;
      navigator.clipboard.writeText(code).then(function () {
        b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1400);
      });
    });
  });

  // Search
  var input = document.getElementById("searchInput"), box = document.getElementById("searchResults");
  var index = window.VRPF_INDEX || [], sel = -1, shown = [];
  function score(item, q) {
    var t = item.t.toLowerCase(), d = (item.d || "").toLowerCase(), k = (item.k || "").toLowerCase();
    var words = q.split(/\s+/).filter(Boolean), s = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i], ws = 0;
      if (t === w) ws = 100; else if (t.indexOf(w) === 0) ws = 60; else if (t.indexOf(w) >= 0) ws = 40;
      else if (k.indexOf(w) >= 0) ws = 15; else if (d.indexOf(w) >= 0) ws = 10;
      if (!ws) return 0;
      s += ws;
    }
    return s;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function render() {
    var q = input.value.trim().toLowerCase();
    if (!q) { box.classList.remove("open"); return; }
    shown = index.map(function (it) { return { it: it, s: score(it, q) }; }).filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, 10).map(function (x) { return x.it; });
    sel = shown.length ? 0 : -1;
    box.innerHTML = shown.length ? shown.map(function (it, i) {
      return '<a href="' + root + it.u + '"' + (i === sel ? ' class="sel"' : "") + '><span class="r-t">' + esc(it.t) + '</span><span class="r-c">' + esc(it.c) + '</span><span class="r-d">' + esc(it.d || "") + "</span></a>";
    }).join("") : '<div class="empty">No results for "' + esc(q) + '"</div>';
    box.classList.add("open");
  }
  if (input) {
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("keydown", function (e) {
      var links = box.querySelectorAll("a");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (!links.length) return;
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
        links.forEach(function (l, i) { l.classList.toggle("sel", i === sel); });
      } else if (e.key === "Enter" && sel >= 0 && links[sel]) { window.location.href = links[sel].getAttribute("href"); }
      else if (e.key === "Escape") { box.classList.remove("open"); input.blur(); }
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".search")) box.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
  }

  // Components index filter
  var filter = document.getElementById("compFilter"), chips = document.querySelectorAll(".chip"), cat = "all";
  function applyFilter() {
    var q = filter ? filter.value.trim().toLowerCase() : "";
    document.querySelectorAll(".cat-section").forEach(function (sec) {
      var any = false, catOk = cat === "all" || sec.getAttribute("data-cat") === cat;
      sec.querySelectorAll(".comp-card").forEach(function (c) {
        var ok = catOk && (!q || c.getAttribute("data-name").indexOf(q) >= 0 || c.getAttribute("data-text").indexOf(q) >= 0);
        c.classList.toggle("hide", !ok); if (ok) any = true;
      });
      sec.classList.toggle("hide", !any);
    });
  }
  if (filter) filter.addEventListener("input", applyFilter);
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (o) { o.classList.remove("on"); }); c.classList.add("on");
      cat = c.getAttribute("data-cat"); applyFilter();
    });
  });

  // Table of contents highlight
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove("on"); });
          var a = map[en.target.id]; if (a) a.classList.add("on");
        }
      });
    }, { rootMargin: "-70px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
  }
})();
