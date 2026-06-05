const GOOGLE_FORM_CONFIG = {
  delegate: {
    action: "https://docs.google.com/forms/u/0/d/e/1FAIpQLSebhDsQZEjijmU_XJUd3JmatUfvLahXArNdkZqIrbPTHT5zyA/formResponse",
    fields: {
      fullName: "entry.1195773260",
      school: "entry.1634678355",
      grade: "entry.672345504",
      city: "entry.349572039",
      phone: "entry.609958197",
      email: "entry.1132695763",
      committee: "entry.408007731",
      committee2: "entry.20479171",
      pastEvents: "entry.870462628",
      motivation: "entry.884955708",
      kvkk: "entry.1083711685",
      rules: "entry.1380587051",
    },
  },
  organization: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSe0M-gvhr4PktAOCei-6RGIF8CVqFQwRgrqTU1_zpqzQVAOZw/formResponse",
    fields: {
      fullName: "entry.1552026436",
      school: "entry.744654958",
      grade: "entry.1047678088",
      phone: "entry.1690729962",
      email: "entry.1328916332",
      pastDuties: "entry.2009642363",
      team: "entry.727950834",
    },
  },
};

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

const applicationPanels = document.querySelectorAll("[data-application-panel]");
const applicationSection = document.querySelector("[data-application-section]");
const successOverlay = document.querySelector("[data-success-overlay]");
let confettiTimer;

function showApplicationPanel(type) {
  const targetPanel = document.querySelector(`[data-application-panel="${type}"]`);
  if (!targetPanel) return;

  if (applicationSection) applicationSection.hidden = false;

  applicationPanels.forEach((panel) => {
    const isTarget = panel === targetPanel;
    panel.hidden = !isTarget;
    panel.classList.toggle("is-opening", isTarget);
  });

  window.setTimeout(() => targetPanel.classList.remove("is-opening"), 520);
  targetPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  targetPanel.querySelector("input, select, textarea")?.focus({ preventScroll: true });
}

document.querySelectorAll(".js-delegate-apply-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showApplicationPanel("delegate");
  });
});

document.querySelectorAll(".js-organization-apply-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showApplicationPanel("organization");
  });
});

document.querySelectorAll("[data-close-application]").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest("[data-application-panel]").hidden = true;
    if (applicationSection) applicationSection.hidden = true;
  });
});

function isGoogleFormConfigured(config) {
  if (!config?.action || config.action.includes("REPLACE_WITH")) return false;
  return Object.values(config.fields).every((fieldName) => fieldName && !fieldName.includes("REPLACE"));
}

function createHiddenField(name, value) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  return input;
}

function getFieldValue(field) {
  if (field.type === "checkbox") {
    return field.checked ? field.value : "";
  }

  return field.value.trim();
}

function postToGoogleForm(form, config) {
  return new Promise((resolve) => {
    const frameName = `google-form-target-${Date.now()}`;
    const iframe = document.createElement("iframe");
    const proxyForm = document.createElement("form");

    iframe.name = frameName;
    iframe.hidden = true;
    proxyForm.hidden = true;
    proxyForm.method = "POST";
    proxyForm.action = config.action;
    proxyForm.target = frameName;

    Object.entries(config.fields).forEach(([fieldName, googleEntryName]) => {
      const field = form.elements[fieldName];
      if (!field) return;
      proxyForm.appendChild(createHiddenField(googleEntryName, getFieldValue(field)));
    });

    document.body.append(iframe, proxyForm);

    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      proxyForm.remove();
      iframe.remove();
      resolve();
    };

    iframe.addEventListener("load", finish, { once: true });
    window.setTimeout(finish, 1600);
    proxyForm.submit();
  });
}

function launchConfetti() {
  const colors = ["#a98fff", "#6f42c1", "#f8f8ff", "#7dd3fc", "#f0abfc"];
  window.clearTimeout(confettiTimer);

  for (let index = 0; index < 70; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${Math.random() * 100}vw`);
    piece.style.setProperty("--c", colors[index % colors.length]);
    piece.style.setProperty("--d", `${1.9 + Math.random() * 1.5}s`);
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    document.body.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

function showSuccess() {
  if (!successOverlay) return;
  successOverlay.hidden = false;
  launchConfetti();

  confettiTimer = window.setTimeout(() => {
    successOverlay.hidden = true;
  }, 2800);
}

document.querySelectorAll(".application-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const formType = form.dataset.googleForm;
    const config = GOOGLE_FORM_CONFIG[formType];
    const status = form.querySelector(".form-status");

    if (!isGoogleFormConfigured(config)) {
      if (status) status.textContent = "Google Form bağlantısı henüz yapılandırılmadı.";
      return;
    }

    form.classList.add("is-sending");
    if (status) status.textContent = "Başvurunuz gönderiliyor...";

    await postToGoogleForm(form, config);

    form.classList.remove("is-sending");
    if (status) status.textContent = "";
    form.reset();
    form.closest("[data-application-panel]").hidden = true;
    if (applicationSection) applicationSection.hidden = true;
    showSuccess();
  });
});

if (window.location.hash === "#delege-basvuru-formu") {
  showApplicationPanel("delegate");
}

if (window.location.hash === "#organizasyon-basvuru-formu") {
  showApplicationPanel("organization");
}

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

// Prevent selecting the same committee for both first and second preferences
function wireCommitteePreferenceControls(root = document) {
  const first = root.querySelector('#committee-first');
  const second = root.querySelector('#committee-second');
  if (!first || !second) return;

  const updateSecondOptions = () => {
    const val = first.value;
    Array.from(second.options).forEach((opt) => {
      if (!opt.value) return; // skip placeholder
      opt.disabled = val && opt.value === val;
    });
    // If currently selected second is now disabled, reset it
    if (second.value && second.querySelector(`option[value="${second.value}"]`).disabled) {
      second.value = "";
    }
  };

  first.addEventListener('change', updateSecondOptions);
  // Also update on reset of the containing form
  const form = first.closest('form');
  if (form) {
    form.addEventListener('reset', () => {
      // small timeout to allow native reset to complete
      setTimeout(() => {
        Array.from(second.options).forEach((opt) => opt.disabled = false);
      }, 0);
    });
  }
}

// Wire controls on initial load and when dynamic panels open
document.addEventListener('DOMContentLoaded', () => wireCommitteePreferenceControls(document));
// When application panel is shown, re-wire within that panel
const origShow = showApplicationPanel;
window.showApplicationPanel = function (type) {
  origShow(type);
  const target = document.querySelector(`[data-application-panel="${type}"]`);
  if (target) wireCommitteePreferenceControls(target);
};

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
