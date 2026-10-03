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
  const pending = new Set(document.querySelectorAll(".hero, .section"));
  if (!pending.size) return;

  const check = () => {
    const vh = window.innerHeight;
    pending.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // The hero bar hangs below the hero, so wait until it fits on screen.
      const reach = el.classList.contains("hero") ? 40 : 0;
      if (rect.bottom + reach <= vh && rect.bottom > 0) {
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

document.addEventListener("DOMContentLoaded", () => {
  // Scroll progress line, back-to-top button, and a header that tucks away
  // while scrolling down and returns when scrolling up.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  const toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "back-to-top";
  toTop.setAttribute("aria-label", "ページの先頭へ戻る");
  toTop.innerHTML = '<span aria-hidden="true">&uarr;</span>';
  document.body.appendChild(toTop);
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  const header = document.querySelector(".site-header");
  const drawer = document.querySelector("[data-nav-drawer]");
  const floating = document.querySelector(".floating-cta");
  const footer = document.querySelector(".site-footer");
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    // Both floating buttons step aside once the footer (which has its own
    // PAGE TOP link) scrolls into view.
    const atFooter = footer && footer.getBoundingClientRect().top < window.innerHeight - 80;
    toTop.classList.toggle("is-shown", y > 600 && !atFooter);
    // On desktop the pill joins once the visitor starts scrolling; the hero
    // already carries its own reserve button in the first view.
    if (floating) floating.classList.toggle("is-shown", y > 160 && !atFooter);

    if (header) {
      header.classList.toggle("is-scrolled", y > 10);
      const drawerOpen = drawer && drawer.classList.contains("is-open");
      if (!drawerOpen && y > 240 && y > lastY + 4) {
        header.classList.add("is-hidden");
      } else if (y < lastY - 4 || y <= 240 || drawerOpen) {
        header.classList.remove("is-hidden");
      }
    }
    lastY = y;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
});

document.addEventListener("DOMContentLoaded", () => {
  // Section titles slide up from behind a mask, and the eyebrow label draws
  // a short line on either side, as each heading scrolls into view.
  const titles = document.querySelectorAll(".section__title");
  const eyebrows = document.querySelectorAll(".section__eyebrow");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    eyebrows.forEach((el) => el.classList.add("is-in"));
    return;
  }

  titles.forEach((title) => {
    title.innerHTML = `<span class="title-mask"><span class="title-mask__inner">${title.innerHTML}</span></span>`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.3, rootMargin: "0px 0px -8% 0px" }
  );

  [...titles, ...eyebrows].forEach((el) => io.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
  // Hero: both photos fill the frame; the split between them follows the
  // cursor (or a finger on touch screens), eased so it glides rather than jumps.
  const hero = document.querySelector(".hero");
  if (!hero || !hero.querySelector(".hero__split")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let target = 50;
  let current = 50;
  let frame = null;

  const apply = () => hero.style.setProperty("--split", `${current.toFixed(2)}%`);

  const tick = () => {
    current += (target - current) * 0.14;
    if (Math.abs(target - current) < 0.05) current = target;
    apply();
    frame = current === target ? null : requestAnimationFrame(tick);
  };

  const moveTo = (clientX) => {
    const rect = hero.getBoundingClientRect();
    target = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    if (reduceMotion) {
      current = target;
      apply();
      return;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  };

  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") moveTo(e.clientX);
  });
  hero.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    const rect = hero.getBoundingClientRect();
    moveTo(rect.left + rect.width / 2);
  });
  hero.addEventListener("touchstart", (e) => moveTo(e.touches[0].clientX), { passive: true });
  hero.addEventListener("touchmove", (e) => moveTo(e.touches[0].clientX), { passive: true });

  apply();
});

