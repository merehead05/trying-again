(() => {
  const app = document.getElementById("app");
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Routes map: route -> file inside /pages
  const routes = {
    home: "/pages/home.html",
    about: "/pages/about.html",
    contact: "/pages/contact.html",
    "404": "/pages/404.html", // optional (create if you want)
  };

  function getRouteFromHash() {
    // supports: "#/home", "#home", or empty -> home
    const hash = window.location.hash || "#/home";
    const cleaned = hash.replace(/^#\/?/, "").trim();
    return cleaned || "home";
  }

  async function loadPage(route) {
    const url = routes[route] || routes["404"] || routes.home;

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const html = await res.text();
      app.innerHTML = html;
      setActiveNav(route);
      // hook for page-specific JS if needed later:
      // window.dispatchEvent(new CustomEvent("page:loaded", { detail: { route } }));
    } catch (err) {
      app.innerHTML = `
        <section style="padding: 24px;">
          <h1>Oops.</h1>
          <p>Could not load <code>${escapeHtml(url)}</code>.</p>
          <p style="opacity:.8;">${escapeHtml(String(err.message || err))}</p>
        </section>
      `;
      setActiveNav(null);
      console.error(err);
    }
  }

  function setActiveNav(route) {
    document.querySelectorAll('nav a[href^="#/"]').forEach(a => {
      const aRoute = a.getAttribute("href").replace("#/", "");
      a.toggleAttribute("aria-current", route && aRoute === route);
    });
  }

  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function onRouteChange() {
    loadPage(getRouteFromHash());
  }

  window.addEventListener("hashchange", onRouteChange);

  // Initial load
  if (!window.location.hash) window.location.hash = "#/home";
  onRouteChange();
})();
