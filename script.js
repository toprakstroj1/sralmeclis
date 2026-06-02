const DELEGATE_FORM_URL = "https://forms.gle/REPLACE_WITH_DELEGE_FORM";
const ORGANIZATION_FORM_URL = "https://forms.gle/REPLACE_WITH_ORGA_FORM";

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

document.documentElement.classList.add("js");

function updateHeader() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 12);
}

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.classList.toggle("open");
    mobileNav.classList.toggle("open", isOpen);
    header?.classList.toggle("nav-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Menüyü kapat" : "Menüyü aç");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.classList.remove("open");
      mobileNav.classList.remove("open");
      header?.classList.remove("nav-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Menüyü aç");
    });
  });
}

document.querySelectorAll(".js-delegate-apply-link").forEach((link) => {
  link.href = DELEGATE_FORM_URL;
});

document.querySelectorAll(".js-organization-apply-link").forEach((link) => {
  link.href = ORGANIZATION_FORM_URL;
});

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
