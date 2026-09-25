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

document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".count-up");
  if (!counters.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const render = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0);
    el.textContent = value.toFixed(decimals);
  };

  const run = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      render(el, target * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        run(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => {
    render(el, 0);
    io.observe(el);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const items = [...document.querySelectorAll("[data-parallax]")];
  if (!items.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Each image is scaled up in CSS, so it can drift by up to ±(scale - 1) / 2
  // of its height without exposing the edges of its clipping parent.
  const RANGE = 0.07;
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    items.forEach((img) => {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      // -1 when the box is entering at the bottom, +1 when it leaves at the top.
      const progress = (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2);
      img.style.setProperty("--py", `${(-progress * RANGE * box.height).toFixed(1)}px`);
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
});
