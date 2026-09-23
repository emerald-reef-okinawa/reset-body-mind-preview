document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  const heroCopy = document.querySelector(".hero__copy");
  if (hero && heroCopy) {
    requestAnimationFrame(() => {
      hero.classList.add("is-visible");
      heroCopy.classList.add("is-visible");
    });
  }
});

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
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  reveals.forEach((el) => io.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
  // The growing bar sits at the bottom edge of each section (via ::after),
  // so it needs to trigger when that bottom edge scrolls into view — not
  // when the (often much taller) section first starts appearing at the
  // top. An IntersectionObserver on the whole section fires too early for
  // tall sections, so this tracks each section's own bottom edge instead.
  const pending = new Set(document.querySelectorAll(".section"));
  if (!pending.size) return;

  const check = () => {
    const vh = window.innerHeight;
    pending.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= vh && rect.bottom > 0) {
        el.classList.add("bar-in");
        pending.delete(el);
      }
    });
    if (!pending.size) {
      window.removeEventListener("scroll", check);
    }
  };

  window.addEventListener("scroll", check, { passive: true });
  check();
});

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll("[data-price-tab]");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-price-tab");

      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      document.querySelectorAll("[data-price-panel]").forEach((panel) => {
        const isTarget = panel.getAttribute("data-price-panel") === target;
        panel.classList.toggle("is-active", isTarget);
        if (isTarget) {
          panel.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
        }
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const shell = document.querySelector("[data-page-shell]");
  if (!shell) return;

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    const isInternalPage =
      href &&
      !href.startsWith("http") &&
      !href.startsWith("#") &&
      !href.startsWith("mailto:") &&
      !href.startsWith("tel:") &&
      link.target !== "_blank";

    if (!isInternalPage) return;

    e.preventDefault();
    shell.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = href;
    }, 280);
  });
});
