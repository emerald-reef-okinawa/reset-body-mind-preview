document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const drawer = document.querySelector("[data-nav-drawer]");
  const close = document.querySelector("[data-menu-close]");
  const backdrop = document.querySelector("[data-nav-backdrop]");

  if (!toggle || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", openDrawer);
  close?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
});

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll("[data-price-tab]");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-price-tab");

      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      document.querySelectorAll("[data-price-panel]").forEach((panel) => {
        panel.classList.toggle("is-active", panel.getAttribute("data-price-panel") === target);
      });
    });
  });
});
