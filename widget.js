(function () {
  "use strict";

  var ELEMENT_NAME = "lapathoniia-ecosystem-widget";
  var DEFAULT_API_URL = "https://lapathoniia.top/api/ecosystem/widgets/top-projects";
  var DEFAULT_REFRESH_SECONDS = 300;
  var cache = new Map();

  if (window.customElements && window.customElements.get(ELEMENT_NAME)) {
    return;
  }

  function clampLimit(value) {
    var parsed = parseInt(value || "3", 10);
    if (!Number.isFinite(parsed)) return 3;
    return Math.max(1, Math.min(parsed, 12));
  }

  function normalizeLang(value) {
    return value === "en" ? "en" : "uk";
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (attrs[key] === null || attrs[key] === undefined) return;
      node.setAttribute(key, attrs[key]);
    });
    if (text !== undefined && text !== null) {
      node.textContent = String(text);
    }
    return node;
  }

  function getProjectUrl(project) {
    return project.website_url || project.demo_url || project.github_url || "https://lapathoniia.top/";
  }

  function requestKey(apiUrl, limit, lang) {
    return apiUrl + "?limit=" + encodeURIComponent(limit) + "&lang=" + encodeURIComponent(lang);
  }

  function fetchProjects(apiUrl, limit, lang) {
    var key = requestKey(apiUrl, limit, lang);
    var entry = cache.get(key) || {};

    if (entry.promise) {
      return entry.promise;
    }

    var headers = { Accept: "application/json" };
    if (entry.etag) {
      headers["If-None-Match"] = entry.etag;
    }

    entry.promise = fetch(key, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "default",
      headers: headers,
    })
      .then(function (response) {
        if (response.status === 304 && entry.payload) {
          return entry.payload;
        }
        if (!response.ok) {
          throw new Error("Lapathoniia widget API returned " + response.status);
        }
        return response.json().then(function (payload) {
          entry.etag = response.headers.get("ETag") || "";
          entry.payload = payload;
          cache.set(key, entry);
          return payload;
        });
      })
      .finally(function () {
        entry.promise = null;
      });

    cache.set(key, entry);
    return entry.promise;
  }

  var styles =
    ":host{display:block;max-width:var(--lapathoniia-widget-max-width,100%);font-family:var(--lapathoniia-widget-font,Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif);color:var(--lapathoniia-widget-text,#f8f0da)}" +
    ".lapathoniia-widget{box-sizing:border-box;width:100%;border:1px solid var(--lapathoniia-widget-border,rgba(139,219,231,.24));border-radius:var(--lapathoniia-widget-radius,14px);background:var(--lapathoniia-widget-bg,#071316);box-shadow:var(--lapathoniia-widget-shadow,0 16px 48px rgba(0,0,0,.22));overflow:hidden}" +
    ".lapathoniia-widget__header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--lapathoniia-widget-border,rgba(139,219,231,.18))}" +
    ".lapathoniia-widget__title{margin:0;font-size:14px;line-height:1.3;font-weight:800;letter-spacing:.01em;color:var(--lapathoniia-widget-title,#fff8e8)}" +
    ".lapathoniia-widget__label{font-size:11px;line-height:1.3;font-weight:750;text-transform:uppercase;letter-spacing:.11em;color:var(--lapathoniia-widget-accent,#8bdbe7)}" +
    ".lapathoniia-widget__list{list-style:none;margin:0;padding:8px;display:grid;gap:8px}" +
    ".lapathoniia-widget__item{margin:0}" +
    ".lapathoniia-widget__card{box-sizing:border-box;display:grid;grid-template-columns:44px minmax(0,1fr);gap:12px;align-items:center;width:100%;min-height:72px;padding:10px;border:1px solid var(--lapathoniia-widget-card-border,rgba(139,219,231,.14));border-radius:var(--lapathoniia-widget-card-radius,10px);background:var(--lapathoniia-widget-card-bg,rgba(255,255,255,.045));color:inherit;text-decoration:none;transition:border-color .16s ease,background .16s ease,transform .16s ease}" +
    ".lapathoniia-widget__card:hover{border-color:var(--lapathoniia-widget-accent,#8bdbe7);background:var(--lapathoniia-widget-card-hover-bg,rgba(139,219,231,.09));transform:translateY(-1px)}" +
    ".lapathoniia-widget__logo{display:grid;place-items:center;width:44px;height:44px;border-radius:9px;background:var(--lapathoniia-widget-logo-bg,#f8f0da);overflow:hidden;color:#071316;font-size:17px;font-weight:850}" +
    ".lapathoniia-widget__logo img{display:block;max-width:100%;max-height:100%;object-fit:contain}" +
    ".lapathoniia-widget__name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:1.35;font-weight:800;color:var(--lapathoniia-widget-title,#fff8e8)}" +
    ".lapathoniia-widget__description{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:3px;font-size:12px;line-height:1.45;color:var(--lapathoniia-widget-muted,rgba(248,240,218,.72))}" +
    ".lapathoniia-widget__badges{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}" +
    ".lapathoniia-widget__badge{display:inline-flex;max-width:100%;border-radius:999px;padding:3px 7px;background:var(--lapathoniia-widget-badge-bg,rgba(244,197,66,.12));color:var(--lapathoniia-widget-badge-text,#f4c542);font-size:10px;line-height:1.2;font-weight:750}" +
    ".lapathoniia-widget__state{padding:18px 16px;color:var(--lapathoniia-widget-muted,rgba(248,240,218,.72));font-size:13px;line-height:1.5}" +
    ".lapathoniia-widget__footer{display:flex;justify-content:flex-end;padding:0 16px 14px}" +
    ".lapathoniia-widget__link{color:var(--lapathoniia-widget-accent,#8bdbe7);font-size:12px;font-weight:750;text-decoration:none}" +
    ".lapathoniia-widget__link:hover{text-decoration:underline}" +
    "@media (max-width:420px){.lapathoniia-widget__header{padding:12px 14px}.lapathoniia-widget__card{grid-template-columns:38px minmax(0,1fr);gap:10px}.lapathoniia-widget__logo{width:38px;height:38px}.lapathoniia-widget__description{-webkit-line-clamp:3}}" +
    "@media (prefers-reduced-motion:reduce){.lapathoniia-widget__card{transition:none}.lapathoniia-widget__card:hover{transform:none}}";

  function LapathoniiaEcosystemWidget() {
    return Reflect.construct(HTMLElement, [], LapathoniiaEcosystemWidget);
  }

  LapathoniiaEcosystemWidget.prototype = Object.create(HTMLElement.prototype);
  LapathoniiaEcosystemWidget.prototype.constructor = LapathoniiaEcosystemWidget;
  LapathoniiaEcosystemWidget.observedAttributes = ["api-url", "limit", "lang", "theme"];

  LapathoniiaEcosystemWidget.prototype.connectedCallback = function () {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      var style = document.createElement("style");
      style.textContent = styles;
      this._root = el("section", { class: "lapathoniia-widget", part: "container", role: "region" });
      this.shadowRoot.append(style, this._root);
    }
    this._connected = true;
    this._visible = false;
    this._setupVisibility();
    this._renderState(this._copy().loading);
  };

  LapathoniiaEcosystemWidget.prototype.disconnectedCallback = function () {
    this._connected = false;
    window.clearTimeout(this._refreshTimer);
    if (this._observer) this._observer.disconnect();
    document.removeEventListener("visibilitychange", this._onVisibilityChange);
  };

  LapathoniiaEcosystemWidget.prototype.attributeChangedCallback = function () {
    if (this._connected) {
      this._scheduleLoad(0);
    }
  };

  LapathoniiaEcosystemWidget.prototype._copy = function () {
    var lang = normalizeLang(this.getAttribute("lang"));
    return lang === "en"
      ? {
          title: "Built with Lapathoniia",
          label: "Ecosystem",
          loading: "Loading ecosystem projects…",
          empty: "No public projects yet.",
          error: "Could not update projects. Showing the latest available data.",
          all: "Open ecosystem",
        }
      : {
          title: "Створено з Lapathoniia",
          label: "Екосистема",
          loading: "Завантажуємо проєкти екосистеми…",
          empty: "Публічних проєктів ще немає.",
          error: "Не вдалося оновити проєкти. Показуємо останні доступні дані.",
          all: "Відкрити екосистему",
        };
  };

  LapathoniiaEcosystemWidget.prototype._setupVisibility = function () {
    var self = this;
    this._onVisibilityChange = function () {
      if (document.visibilityState === "visible" && self._visible) {
        self._scheduleLoad(0);
      }
    };
    document.addEventListener("visibilitychange", this._onVisibilityChange);

    if ("IntersectionObserver" in window) {
      this._observer = new IntersectionObserver(function (entries) {
        self._visible = entries.some(function (entry) {
          return entry.isIntersecting;
        });
        if (self._visible && document.visibilityState === "visible") {
          self._scheduleLoad(0);
        }
      });
      this._observer.observe(this);
      return;
    }

    this._visible = true;
    this._scheduleLoad(0);
  };

  LapathoniiaEcosystemWidget.prototype._scheduleLoad = function (delayMs) {
    var self = this;
    window.clearTimeout(this._refreshTimer);
    this._refreshTimer = window.setTimeout(function () {
      self._load();
    }, delayMs);
  };

  LapathoniiaEcosystemWidget.prototype._load = function () {
    var self = this;
    if (!this._connected || !this._visible || document.visibilityState !== "visible") {
      return;
    }

    var apiUrl = this.getAttribute("api-url") || DEFAULT_API_URL;
    var limit = clampLimit(this.getAttribute("limit"));
    var lang = normalizeLang(this.getAttribute("lang"));

    fetchProjects(apiUrl, limit, lang)
      .then(function (payload) {
        self._lastPayload = payload;
        self._renderPayload(payload);
        var seconds = Number(payload && payload.refresh_after_seconds) || DEFAULT_REFRESH_SECONDS;
        var jitter = Math.floor(Math.random() * 40000) - 20000;
        self._scheduleLoad(Math.max(60000, seconds * 1000 + jitter));
      })
      .catch(function () {
        if (self._lastPayload) {
          self._renderPayload(self._lastPayload, self._copy().error);
        } else {
          self._renderState(self._copy().error);
        }
        self._scheduleLoad(DEFAULT_REFRESH_SECONDS * 1000);
      });
  };

  LapathoniiaEcosystemWidget.prototype._renderState = function (message) {
    var copy = this._copy();
    this._root.replaceChildren(this._header(copy), el("div", { class: "lapathoniia-widget__state", part: "state" }, message));
  };

  LapathoniiaEcosystemWidget.prototype._header = function (copy) {
    var header = el("div", { class: "lapathoniia-widget__header", part: "header" });
    var text = el("div");
    text.append(el("div", { class: "lapathoniia-widget__label", part: "label" }, copy.label));
    text.append(el("h2", { class: "lapathoniia-widget__title", part: "title" }, copy.title));
    header.append(text);
    return header;
  };

  LapathoniiaEcosystemWidget.prototype._renderPayload = function (payload, notice) {
    var copy = this._copy();
    var projects = Array.isArray(payload && payload.projects) ? payload.projects : [];
    var children = [this._header(copy)];

    if (projects.length === 0) {
      children.push(el("div", { class: "lapathoniia-widget__state", part: "state" }, copy.empty));
    } else {
      var list = el("ol", { class: "lapathoniia-widget__list", part: "list" });
      projects.forEach(function (project) {
        list.append(this._projectItem(project));
      }, this);
      children.push(list);
      if (notice) {
        children.push(el("div", { class: "lapathoniia-widget__state", part: "state" }, notice));
      }
    }

    var footer = el("div", { class: "lapathoniia-widget__footer", part: "footer" });
    var link = el("a", {
      class: "lapathoniia-widget__link",
      part: "ecosystem-link",
      href: "https://lapathoniia.top/ecosystem/apply",
      target: "_blank",
      rel: "noopener noreferrer",
    }, copy.all);
    footer.append(link);
    children.push(footer);

    this._root.replaceChildren.apply(this._root, children);
  };

  LapathoniiaEcosystemWidget.prototype._projectItem = function (project) {
    var item = el("li", { class: "lapathoniia-widget__item", part: "item" });
    var card = el("a", {
      class: "lapathoniia-widget__card",
      part: "card",
      href: getProjectUrl(project),
      target: "_blank",
      rel: "noopener noreferrer",
    });

    var logo = el("span", { class: "lapathoniia-widget__logo", part: "logo" });
    if (project.logo_url) {
      var image = el("img", { src: project.logo_url, alt: "" });
      image.loading = "lazy";
      logo.append(image);
    } else {
      logo.textContent = (project.name || "L").slice(0, 1).toUpperCase();
    }

    var body = el("span", { class: "lapathoniia-widget__body", part: "body" });
    body.append(el("span", { class: "lapathoniia-widget__name", part: "name" }, project.name || "Project"));
    if (project.description) {
      body.append(el("span", { class: "lapathoniia-widget__description", part: "description" }, project.description));
    }
    if (Array.isArray(project.badges) && project.badges.length) {
      var badges = el("span", { class: "lapathoniia-widget__badges", part: "badges" });
      project.badges.slice(0, 3).forEach(function (badge) {
        badges.append(el("span", { class: "lapathoniia-widget__badge", part: "badge" }, badge));
      });
      body.append(badges);
    }

    card.append(logo, body);
    item.append(card);
    return item;
  };

  window.customElements.define(ELEMENT_NAME, LapathoniiaEcosystemWidget);
})();
