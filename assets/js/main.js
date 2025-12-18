/* =====================================================
   main.js (routing + component loading + reveal init)
   ===================================================== */
document.documentElement.classList.remove("no-js");

async function fetchHTML(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return await res.text();
}

async function loadInto(targetId, path, fallback = "pages/404.html") {
  const el = document.getElementById(targetId);
  if (!el) return;

  try {
    el.innerHTML = await fetchHTML(path);
  } catch (err) {
    try {
      el.innerHTML = await fetchHTML(fallback);
      document.title = "Page Not Found";
    } catch {
      el.innerHTML = `<section><h1>Load error</h1><p>Missing: ${path}</p></section>`;
      document.title = "Load Error";
    }
  }
}

/* ---------- Shared layout ---------- */
loadInto("site-header", "components/header.html");
loadInto("site-sidebar", "components/sidebar.html");
loadInto("site-footer", "components/footer.html");

/* ---------- Routing ---------- */
function routeTo(pageName) {
  window.location.hash = pageName;
}

async function loadFromHash() {
  const page = (window.location.hash || "#home").replace("#", "");

  // Load main page content
  await loadInto("page-content", `pages/${page}.html`);

   // If we ended up showing 404 content, set the title accordingly
  const showing404 = document.querySelector("#page-content .page-404");
  document.title = showing404
    ? "I'M LEARNING | Not Found"
    : `I'M LEARNING | ${page.charAt(0).toUpperCase() + page.slice(1)}`;

  // Title
  const pretty = page.charAt(0).toUpperCase() + page.slice(1);
  document.title = `I'M LEARNING | ${pretty}`;

  // ----- OPTION B: page-specific sidebar -----
  const sidebar = document.getElementById("site-sidebar");
  const layout = document.querySelector(".layout");

  // Map route -> sidebar component (null = no sidebar)
  const sidebarMap = {
    home: "components/sidebar-home.html",
    about: "components/sidebar-about.html",
    contact: "components/sidebar-contact.html",
    // playground: "components/sidebar-playground.html",
  };

  const sidebarPath = (page in sidebarMap) ? sidebarMap[page] : null;

  if (sidebar) {
    if (!sidebarPath) {
      sidebar.innerHTML = "";
      sidebar.style.display = "none";
      if (layout) layout.classList.add("no-sidebar");
    } else {
      sidebar.style.display = "";
      if (layout) layout.classList.remove("no-sidebar");
      await loadInto("site-sidebar", sidebarPath);
  }

  // Init UI behaviors after injection
  initReveal();
  initModal();
  if (typeof window.initAccordions === "function") window.initAccordions();
  if (typeof window.initTabs === "function") window.initTabs();
  if (typeof window.initToasts === "function") window.initToasts();
}

}

/* =====================================================
   Modal init
   ===================================================== */
function initModal() {
  const backdrop = document.querySelector("[data-modal-backdrop]");
  if (!backdrop) return;

  // Prevent double-binding if page reloads via routing
  if (backdrop.dataset.bound === "1") return;
  backdrop.dataset.bound = "1";

  // Open buttons
  document.querySelectorAll("[data-open-modal]").forEach(btn => {
    btn.addEventListener("click", () => backdrop.classList.add("is-open"));
  });

  // Close buttons
  backdrop.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => backdrop.classList.remove("is-open"));
  });

  // Click outside modal to close
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.remove("is-open");
  });

  // Escape key closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") backdrop.classList.remove("is-open");
  });
}

window.addEventListener("hashchange", loadFromHash);
loadFromHash();
window.routeTo = routeTo;

/* =====================================================
   Reveal animation init
   ===================================================== */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  // If the browser doesn't support IntersectionObserver, just show everything
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add("is-in");
    }
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
}
