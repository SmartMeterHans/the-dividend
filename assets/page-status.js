// Toont op elke conceptpagina een vaste, inklapbare melding dat de modelcijfers nog niet geverifieerd zijn.
(function () {
  var s = document.currentScript;
  var mode = (s && s.dataset.status) || "model";
  var MSG = {
    model: "<strong>Working draft.</strong> Model figures on this page are not yet verified against primary sources, Checked figures: <a href=\"index.html#verified\">home page</a> · <a href=\"sources.html\">sources</a> · <a href=\"data/figures.json\">figures register</a>."
  };
  var box = document.createElement("div");
  box.setAttribute("role", "note");
  box.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:1000;max-width:360px;background:#fff4e0;border:2px solid #e0b050;border-radius:14px;box-shadow:0 6px 24px rgba(15,31,21,.18);font:14px/1.5 Jost,system-ui,sans-serif;color:#4a3300;padding:12px 40px 12px 14px;";
  box.innerHTML = MSG[mode] || MSG.model;
  var btn = document.createElement("button");
  btn.type = "button"; btn.setAttribute("aria-label", "Collapse note"); btn.textContent = "×";
  btn.style.cssText = "position:absolute;top:6px;right:8px;border:0;background:transparent;font-size:22px;line-height:1;cursor:pointer;color:#4a3300;";
  var tag = document.createElement("button");
  tag.type = "button"; tag.textContent = "Draft";
  tag.style.cssText = "display:none;position:fixed;right:16px;bottom:16px;z-index:1000;border:2px solid #e0b050;background:#fff4e0;color:#4a3300;border-radius:50px;padding:6px 14px;font:600 12px 'JetBrains Mono',monospace;letter-spacing:1px;text-transform:uppercase;cursor:pointer;";
  btn.onclick = function () { box.style.display = "none"; tag.style.display = "block"; };
  tag.onclick = function () { box.style.display = "block"; tag.style.display = "none"; };
  box.appendChild(btn);
  document.body.appendChild(box); document.body.appendChild(tag);
})();
