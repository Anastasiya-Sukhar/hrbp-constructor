/* HRBP-конструктор: загрузка кейсов из cases.json и маршрутизация по хэшу.
   Тексты редактируются только в cases.json — код менять не нужно. */

(function () {
  "use strict";

  var state = { data: null };

  var els = {
    homeView: document.getElementById("home-view"),
    caseView: document.getElementById("case-view"),
    tiles: document.getElementById("tiles"),
    caseArticle: document.getElementById("case-article"),
    caseHead: document.querySelector(".case-head"),
    caseIcon: document.getElementById("case-icon"),
    caseCrumb: document.getElementById("case-crumb"),
    caseTitle: document.getElementById("case-title"),
    caseSituation: document.getElementById("case-situation"),
    caseSees: document.getElementById("case-sees"),
    caseQuestions: document.getElementById("case-questions"),
    caseSteps: document.getElementById("case-steps"),
    caseEscalation: document.getElementById("case-escalation"),
    casePrinciple: document.getElementById("case-principle")
  };

  function hexToRgba(hex, alpha) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }

  function applyAccent(el, color) {
    el.style.removeProperty("--accent");
    el.style.removeProperty("--accent-soft");
    if (color) {
      el.style.setProperty("--accent", color);
      var soft = hexToRgba(color, 0.14);
      if (soft) el.style.setProperty("--accent-soft", soft);
    }
  }

  function renderHome() {
    els.homeView.hidden = false;
    els.caseView.hidden = true;

    els.tiles.innerHTML = "";
    state.data.cases.forEach(function (c, i) {
      var a = document.createElement("a");
      a.className = "tile";
      a.href = "#" + c.id;
      applyAccent(a, c.color);

      var top = document.createElement("span");
      top.className = "tile-top";

      var icon = document.createElement("span");
      icon.className = "tile-icon";
      icon.textContent = c.icon || "📌";

      var num = document.createElement("span");
      num.className = "tile-num";
      num.textContent = "0" + (i + 1);

      top.appendChild(icon);
      top.appendChild(num);

      var title = document.createElement("span");
      title.className = "tile-title";
      title.textContent = c.title;

      var short = document.createElement("span");
      short.className = "tile-short";
      short.textContent = c.short || "";

      var more = document.createElement("span");
      more.className = "tile-more";
      more.textContent = "Разобрать кейс";

      a.appendChild(top);
      a.appendChild(title);
      if (c.short) a.appendChild(short);
      a.appendChild(more);
      els.tiles.appendChild(a);
    });
  }

  function fillList(ul, items) {
    ul.innerHTML = "";
    (items || []).forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });
  }

  function findCase(id) {
    return state.data.cases.filter(function (c) { return c.id === id; })[0];
  }

  function renderCase(id, index) {
    var c = findCase(id);
    if (!c) {
      renderHome();
      return;
    }

    els.homeView.hidden = true;
    els.caseView.hidden = false;

    applyAccent(els.caseArticle, c.color);
    applyAccent(els.caseHead, c.color);

    els.caseIcon.textContent = c.icon || "📌";
    els.caseCrumb.textContent = "Кейс 0" + (index + 1) + " · разбор HRBP";
    els.caseTitle.textContent = c.title;
    els.caseSituation.textContent = c.situation;
    fillList(els.caseSees, c.sees);
    fillList(els.caseQuestions, c.questions);
    fillList(els.caseSteps, c.steps);
    fillList(els.caseEscalation, c.escalation);
    els.casePrinciple.textContent = c.principle;

    els.caseView.style.animation = "none";
    void els.caseView.offsetWidth; /* перезапуск анимации появления */
    els.caseView.style.animation = "";

    window.scrollTo(0, 0);
  }

  function route() {
    var id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (id && state.data && findCase(id)) {
      var index = state.data.cases.findIndex(function (c) { return c.id === id; });
      renderCase(id, index);
    } else {
      renderHome();
    }
  }

  function showLoadError(err) {
    els.homeView.hidden = true;
    els.caseView.hidden = true;

    var div = document.createElement("div");
    div.className = "load-error";
    div.innerHTML =
      "<h2>Не удалось загрузить cases.json</h2>" +
      "<p>Файл с текстами кейсов не прочитан" +
      (err ? " (" + err + ")" : "") +
      ". Если сайт открыт двойным кликом по index.html, запустите локальный сервер " +
      "в папке сайта, например:</p>" +
      "<p><code>python -m http.server 8000</code></p>" +
      "<p>и откройте <code>http://localhost:8000</code></p>";
    document.getElementById("app").appendChild(div);
  }

  fetch("cases.json")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      state.data = data;
      window.addEventListener("hashchange", route);
      route();
    })
    .catch(function (err) {
      showLoadError(err && err.message ? err.message : null);
    });
})();
