const currentYear = document.querySelector("[data-current-year]");
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

if (menuButton && siteNav) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });
}

const revealElements = document.querySelectorAll("[data-reveal]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (revealElements.length && !prefersReducedMotion && "IntersectionObserver" in window) {
  let observerResponded = false;
  const revealObserver = new IntersectionObserver((entries, observer) => {
    observerResponded = true;
    window.clearTimeout(observerFallback);
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  const observerFallback = window.setTimeout(() => {
    if (!observerResponded) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      document.documentElement.classList.remove("has-scroll-reveal");
    }
  }, 2000);

  document.documentElement.classList.add("has-scroll-reveal");
  revealElements.forEach((element) => revealObserver.observe(element));
}

const expandableCards = document.querySelectorAll(".project-card, .certification-card");
let expandedCard = null;
let pageScrollPosition = 0;
const cardBackdrop = document.createElement("div");
cardBackdrop.className = "card-focus-backdrop";
cardBackdrop.setAttribute("aria-hidden", "true");
document.body.append(cardBackdrop);

const closeExpandedCard = (restoreFocus = true) => {
  if (!expandedCard) {
    return;
  }

  const card = expandedCard;
  card.querySelector(".card-close")?.remove();
  card.classList.remove("is-expanded");
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-pressed", "false");
  card.removeAttribute("aria-modal");
  card.removeAttribute("aria-label");
  expandedCard = null;
  document.body.classList.remove("has-focused-card");
  window.scrollTo(0, pageScrollPosition);

  if (restoreFocus) {
    card.focus({ preventScroll: true });
  }
};

const expandCard = (card) => {
  if (expandedCard && expandedCard !== card) {
    closeExpandedCard(false);
  }

  pageScrollPosition = window.scrollY;
  expandedCard = card;
  card.classList.add("is-visible", "is-expanded");
  card.setAttribute("role", "dialog");
  card.setAttribute("tabindex", "-1");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-label", card.querySelector("h3")?.textContent?.trim() || "Portfolio item");
  card.removeAttribute("aria-pressed");

  const closeButton = document.createElement("button");
  closeButton.className = "card-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close expanded item");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeExpandedCard();
  });
  card.prepend(closeButton);

  document.body.classList.add("has-focused-card");
  card.focus({ preventScroll: true });
};

cardBackdrop.addEventListener("click", () => closeExpandedCard());
document.addEventListener("keydown", (event) => {
  if (!expandedCard) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeExpandedCard();
  } else if (event.key === "Tab") {
    event.preventDefault();
    const closeButton = expandedCard.querySelector(".card-close");
    if (event.shiftKey && document.activeElement === closeButton) {
      expandedCard.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === expandedCard) {
      closeButton?.focus({ preventScroll: true });
    } else {
      expandedCard.focus({ preventScroll: true });
    }
  }
});

expandableCards.forEach((card) => {
  card.setAttribute("data-expandable-card", "");
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-pressed", "false");

  card.addEventListener("click", () => {
    if (expandedCard === card) {
      closeExpandedCard();
    } else {
      expandCard(card);
    }
  });
  card.addEventListener("keydown", (event) => {
    if (event.target === card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      if (expandedCard === card) {
        closeExpandedCard();
      } else {
        expandCard(card);
      }
    }
  });
  card.addEventListener("focus", () => card.classList.add("is-visible"));
});

const emailCopyButton = document.querySelector("[data-copy-email]");
if (emailCopyButton) {
  const emailAddress = emailCopyButton.querySelector(".social-address")?.textContent?.trim();
  const copyStatus = emailCopyButton.querySelector(".email-copy-status");
  let statusTimeout;

  const copyWithFallback = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.select();

    const copied = document.execCommand("copy");
    textArea.remove();
    if (!copied) {
      throw new Error("The browser could not copy the email address.");
    }
  };

  emailCopyButton.addEventListener("click", async () => {
    if (!emailAddress || !copyStatus) {
      throw new Error("The email copy button is missing its address or status message.");
    }

    window.clearTimeout(statusTimeout);
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(emailAddress);
      } else {
        copyWithFallback(emailAddress);
      }
      copyStatus.textContent = "Copied to clipboard";
    } catch (error) {
      console.error("Unable to copy the email address.", error);
      copyStatus.textContent = "Copy failed — select the address above";
    }

    statusTimeout = window.setTimeout(() => {
      copyStatus.textContent = "";
    }, 2500);
  });
}
