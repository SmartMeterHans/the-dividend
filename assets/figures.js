// Herbruikbaar: alle cijfers op een pagina komen uit data/figures.json. Pagina's typen nooit zelf cijfers over.
//  data-fig="id"            -> waarde (+eenheid) als link naar de bron. Optioneel data-show="compact|period|source|locator|claim|note"
//  data-fig-tiles="key"     -> tegels voor de ids in meta[key] (bv. "homepage")
//  data-fig-count="ok|not_ok|sources" (berekend door register.py) -> aantallen uit het register
(function () {
  var base = (document.currentScript && document.currentScript.dataset.base) || '';
  function esc(t) { var e = document.createElement('span'); e.textContent = t == null ? '' : String(t); return e.innerHTML; }
  function fmt(v) { return typeof v === 'number' ? v.toLocaleString('en-US') : String(v); }
  function compact(f) {            // tegelnotatie: $195.1B, 9.1M
    var v = f.value, u = f.unit || '';
    if (/^USD bn/.test(u)) return '$' + fmt(v) + 'B';
    if (/^USD trillion/.test(u)) return '$' + fmt(v) + 'T';
    if (/^million/.test(u)) return fmt(v) + 'M';
    if (/^percent/.test(u)) return fmt(v) + '%';
    return fmt(v);
  }
  function withUnit(f) {           // "people (more than)" -> "more than 46,000 people"
    var m = /^(.*?)\s*\((more than|at least|approx\.)\)$/.exec(f.unit || '');
    return m ? m[2] + ' ' + fmt(f.value) + (m[1] ? ' ' + m[1] : '') : fmt(f.value) + (f.unit ? ' ' + f.unit : '');
  }
  function title(f) { return (f.source_short || f.source) + (f.locator ? ' — ' + f.locator : '') + (f.period ? ' (' + f.period + ')' : ''); }
  if (!document.getElementById('fig-style')) {   // cijferlinks erven de opmaak van de pagina
    var st = document.createElement('style'); st.id = 'fig-style';
    st.textContent = 'a.fig{color:inherit;text-decoration:none;border-bottom:1px dotted currentColor}a.fig:hover{border-bottom-style:solid}.fig-missing{color:#b52010}';
    document.head.appendChild(st);
  }
  fetch(base + 'data/figures.json').then(function (r) { return r.json(); }).then(function (d) {
    var F = {}; d.figures.forEach(function (f) { F[f.id] = f; });
    document.querySelectorAll('[data-fig]').forEach(function (el) {
      var f = F[el.dataset.fig], show = el.dataset.show || 'value';
      if (!f) { el.textContent = '[missing: ' + el.dataset.fig + ']'; el.classList.add('fig-missing'); return; }
      var txt = show === 'value' ? (el.dataset.suffix ? fmt(f.value) + el.dataset.suffix : withUnit(f)) : show === 'compact' ? compact(f) : show === 'source' ? f.source : (f[show] || '');
      el.innerHTML = '<a class="fig" href="' + esc(f.deep_url || f.url) + '" title="' + esc(title(f)) + '">' + esc(txt) + '</a>';
    });
    document.querySelectorAll('[data-fig-tiles]').forEach(function (el) {
      var labels = d.meta.labels || {};
      el.innerHTML = (d.meta[el.dataset.figTiles] || []).map(function (id) {
        var f = F[id]; if (!f) return '';
        return '<a href="' + esc(f.deep_url || f.url) + '" target="_blank" rel="noopener" class="num-tile src-tile" title="' + esc(title(f)) + '">' +
          '<span class="badge a">Official source</span><div class="nt-category war">' + esc(labels[id] || '') + '</div>' +
          '<div class="nt-num red">' + esc(compact(f)) + '</div><div class="nt-label">' + esc(f.claim) + ' (' + esc(f.period) + ').</div>' +
          '<div class="src-line">' + esc(f.source_short || f.source) + (f.locator ? ', ' + esc(f.locator) : '') + '</div></a>';
      }).join('');
    });
    var n = d.meta.counts || {};
    document.querySelectorAll('[data-fig-count]').forEach(function (el) { el.textContent = n[el.dataset.figCount]; });
  }).catch(function () {
    document.querySelectorAll('[data-fig],[data-fig-tiles]').forEach(function (el) { el.innerHTML = '<a href="' + base + 'sources.html">see sources</a>'; });
  });
})();
