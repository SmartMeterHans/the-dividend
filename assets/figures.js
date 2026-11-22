// Herbruikbaar: vult elk element met data-fig="<id>" uit data/figures.json.
// Pagina's typen nooit zelf cijfers over. Optioneel:
//   data-show="value|period|source|locator|claim"   (standaard: value + unit)
//   data-scale="1000" (deel waarde)  data-suffix=" bn"
// Elk getoond cijfer linkt naar de vindplaats in de bron.
(function () {
  var base = (document.currentScript && document.currentScript.dataset.base) || '';
  function fmt(v) { return typeof v === 'number' ? v.toLocaleString('en-US') : String(v); }
  fetch(base + 'data/figures.json').then(function (r) { return r.json(); }).then(function (d) {
    var F = {}; d.figures.forEach(function (f) { F[f.id] = f; });
    document.querySelectorAll('[data-fig]').forEach(function (el) {
      var f = F[el.dataset.fig], show = el.dataset.show || 'value';
      if (!f) { el.textContent = '[missing: ' + el.dataset.fig + ']'; el.classList.add('fig-missing'); return; }
      var txt = show === 'value' ? fmt(el.dataset.scale ? f.value / +el.dataset.scale : f.value) + (el.dataset.suffix || ' ' + f.unit)
              : show === 'source' ? f.source : (f[show] || '');
      var a = document.createElement('a');
      a.href = f.deep_url || f.url; a.textContent = txt; a.className = 'fig';
      a.title = f.source + (f.locator ? ' — ' + f.locator : '') + (f.period ? ' (' + f.period + ')' : '');
      el.textContent = ''; el.appendChild(a);
    });
  }).catch(function () {
    document.querySelectorAll('[data-fig]').forEach(function (el) { el.innerHTML = '<a href="' + base + 'sources.html">see sources</a>'; });
  });
})();
