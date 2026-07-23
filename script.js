(function () {
  "use strict";

  const loadDeferredImages = (container) => {
    container.querySelectorAll("img[data-src]").forEach((image) => {
      if (image.dataset.srcset) image.srcset = image.dataset.srcset;
      image.src = image.dataset.src;
      image.removeAttribute("data-src");
      image.removeAttribute("data-srcset");
    });
  };

  const initializeEnhancements = () => {
    const header = document.querySelector("[data-header]");
    const progress = document.querySelector(".scroll-progress span");
    const menuButton = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-nav]");
    const navigationPanel = navigation?.querySelector("[data-nav-panel]");
    const brandLink = header?.querySelector(".brand");
    const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const menuBackground = Array.from(
      document.querySelectorAll("body > .skip-link, main, body > .page-finale, body > footer, .nav-actions"),
    );

    const isMenuOpen = () => menuButton?.getAttribute("aria-expanded") === "true";

    const setMenuOpen = (nextOpen) => {
      if (!menuButton || !navigation) return;
      menuButton.setAttribute("aria-expanded", String(nextOpen));
      menuButton.setAttribute("aria-label", nextOpen ? "Close navigation" : "Open navigation");
      navigation.classList.toggle("is-open", nextOpen);
      document.documentElement.classList.toggle("menu-open", nextOpen);
      document.body.classList.toggle("menu-open", nextOpen);
      menuBackground.forEach((element) => element.toggleAttribute("inert", nextOpen));
    };

    const closeMenu = ({ restoreFocus = false } = {}) => {
      setMenuOpen(false);
      if (restoreFocus) window.requestAnimationFrame(() => menuButton?.focus());
    };

    const focusSection = (link) => {
      const hash = link.getAttribute("href");
      if (!hash?.startsWith("#") || hash.length === 1) return;

      let targetId = hash.slice(1);
      try {
        targetId = decodeURIComponent(targetId);
      } catch (_error) {
        // Keep the raw fragment if it contains malformed escape sequences.
      }

      const target = document.getElementById(targetId);
      if (!target) return;

      window.requestAnimationFrame(() => {
        const hadTabIndex = target.hasAttribute("tabindex");
        if (!hadTabIndex) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });

        if (!hadTabIndex) {
          target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
            once: true,
          });
        }
      });
    };

    if (menuButton && navigation) {
      menuButton.addEventListener("click", () => {
        const nextOpen = !isMenuOpen();
        setMenuOpen(nextOpen);

        if (nextOpen) {
          window.requestAnimationFrame(() => navLinks[0]?.focus());
        }
      });

      navigation.querySelectorAll("a[href]").forEach((link) => {
        link.addEventListener("click", () => {
          closeMenu();
          if (link.matches("[data-nav-link]")) {
            focusSection(link);
          } else if (
            link.target === "_blank" ||
            link.getAttribute("href")?.startsWith("mailto:")
          ) {
            window.requestAnimationFrame(() => menuButton.focus());
          }
        });
      });

      brandLink?.addEventListener("click", closeMenu);

      navigation.addEventListener("click", (event) => {
        if (event.target !== navigation || !navigationPanel) return;
        closeMenu({ restoreFocus: true });
      });

      document.addEventListener("keydown", (event) => {
        if (!isMenuOpen()) return;

        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu({ restoreFocus: true });
          return;
        }

        if (event.key !== "Tab") return;

        const focusableItems = [
          brandLink,
          menuButton,
          ...navigation.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ].filter(Boolean);
        const firstItem = focusableItems[0];
        const lastItem = focusableItems[focusableItems.length - 1];

        if (event.shiftKey && document.activeElement === firstItem) {
          event.preventDefault();
          lastItem.focus();
        } else if (!event.shiftKey && document.activeElement === lastItem) {
          event.preventDefault();
          firstItem.focus();
        } else if (!focusableItems.includes(document.activeElement)) {
          event.preventDefault();
          navLinks[0]?.focus();
        }
      });

    }

    const updateScrollUI = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (header) header.classList.toggle("is-scrolled", scrollTop > 12);
      if (progress) {
        const ratio = maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0;
        progress.style.transform = `scaleX(${ratio})`;
      }
    };

    updateScrollUI();
    window.addEventListener("scroll", updateScrollUI, { passive: true });

    const revealItems = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reducedMotion.matches) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8%", threshold: 0.08 },
      );
      revealItems.forEach((item) => {
        item.classList.add("will-reveal");
        revealObserver.observe(item);
      });
    } else {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const sections = Array.from(document.querySelectorAll("[data-section]"));
    if ("IntersectionObserver" in window && sections.length) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible) return;

          navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${visible.target.id}`;
            link.classList.toggle("is-active", isActive);
            if (isActive) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        },
        { rootMargin: "-30% 0px -55%", threshold: [0, 0.1, 0.4] },
      );
      sections.forEach((section) => sectionObserver.observe(section));
    }

    const projectTabs = Array.from(document.querySelectorAll("[data-project-tab]"));
    const projectPanels = Array.from(document.querySelectorAll("[data-project-panel]"));
    const preciseHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    const selectProject = (projectId, { moveFocus = false } = {}) => {
      const nextTab = projectTabs.find((tab) => tab.dataset.projectTab === projectId);
      const nextPanel = projectPanels.find((panel) => panel.dataset.projectPanel === projectId);
      if (!nextTab || !nextPanel) return;

      loadDeferredImages(nextPanel);

      projectTabs.forEach((tab) => {
        const isActive = tab === nextTab;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      projectPanels.forEach((panel) => {
        const isActive = panel === nextPanel;
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
      });

      window.requestAnimationFrame(updateScrollUI);

      if (moveFocus) nextTab.focus();
    };

    const initialProject =
      projectTabs.find((tab) => tab.getAttribute("aria-selected") === "true")
        ?.dataset.projectTab || projectTabs[0]?.dataset.projectTab;
    if (initialProject) selectProject(initialProject);

    projectTabs.forEach((tab, index) => {
      const projectId = tab.dataset.projectTab;

      tab.addEventListener("click", () => selectProject(projectId));
      tab.addEventListener("focus", () => selectProject(projectId));
      tab.addEventListener("pointerenter", () => {
        if (preciseHover.matches) selectProject(projectId);
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          nextIndex = (index + 1) % projectTabs.length;
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          nextIndex = (index - 1 + projectTabs.length) % projectTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = projectTabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        selectProject(projectTabs[nextIndex].dataset.projectTab, { moveFocus: true });
      });
    });

    const projectMediaLinks = Array.from(document.querySelectorAll(".project-media-link"));
    const lightbox = document.querySelector("[data-project-lightbox]");
    const lightboxImage = lightbox?.querySelector("[data-project-lightbox-image]");
    const lightboxCaption = lightbox?.querySelector("[data-project-lightbox-caption]");
    const lightboxClose = lightbox?.querySelector("[data-project-lightbox-close]");
    let lightboxTrigger;

    const closeLightbox = () => {
      if (lightbox?.open) lightbox.close();
    };

    if (lightbox && lightboxImage && lightboxCaption && lightboxClose) {
      projectMediaLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          if (typeof lightbox.showModal !== "function") return;

          const preview = link.querySelector("img");
          if (!preview) return;

          event.preventDefault();
          lightboxTrigger = link;
          lightboxImage.src = link.href;
          lightboxImage.alt = preview.alt;
          const previewCaption = link
            .closest("figure")
            ?.querySelector("figcaption")
            ?.firstElementChild?.textContent?.trim();
          lightboxCaption.textContent = previewCaption || preview.alt;
          document.documentElement.classList.add("lightbox-open");
          document.body.classList.add("lightbox-open");
          lightbox.showModal();
          lightboxClose.focus();
        });
      });

      lightboxClose.addEventListener("click", closeLightbox);
      lightbox.addEventListener("click", (event) => {
        if (event.target instanceof Element && !event.target.closest("img, button")) {
          closeLightbox();
        }
      });
      lightbox.addEventListener("close", () => {
        document.documentElement.classList.remove("lightbox-open");
        document.body.classList.remove("lightbox-open");
        lightboxImage.removeAttribute("src");
        lightboxImage.alt = "";
        lightboxCaption.textContent = "";
        lightboxTrigger?.focus({ preventScroll: true });
        lightboxTrigger = undefined;
      });
    }

    const copyButton = document.querySelector("[data-copy-email]");
    const copyToast = document.querySelector("[data-copy-toast]");
    const emailLink = copyButton
      ?.closest(".contact-email-row")
      ?.querySelector('a[href^="mailto:"]');
    let toastTimer;
    let copyButtonResetTimer;

    const showCopyStatus = (message, duration = 2200) => {
      if (!copyToast) return;
      window.clearTimeout(toastTimer);
      copyToast.textContent = "";
      copyToast.classList.remove("is-visible");
      window.requestAnimationFrame(() => {
        copyToast.textContent = message;
        copyToast.classList.add("is-visible");
        toastTimer = window.setTimeout(
          () => copyToast.classList.remove("is-visible"),
          duration,
        );
      });
    };

    const getEmailAddress = () => {
      const mailto = emailLink?.getAttribute("href") || "";
      const encodedAddress = mailto.replace(/^mailto:/i, "").split("?", 1)[0];
      try {
        return decodeURIComponent(encodedAddress);
      } catch (_error) {
        return encodedAddress;
      }
    };

    const copyEmail = async () => {
      const email = getEmailAddress();
      if (!email) {
        showCopyStatus("Could not find the email address", 3200);
        return;
      }

      let copied = false;
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch (_error) {
        const previousFocus = document.activeElement;
        const input = document.createElement("textarea");
        input.value = email;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.focus();
        input.select();

        try {
          copied = document.execCommand("copy");
        } catch (_fallbackError) {
          copied = false;
        } finally {
          input.remove();
          if (previousFocus instanceof HTMLElement) {
            previousFocus.focus({ preventScroll: true });
          }
        }
      }

      showCopyStatus(
        copied ? "Email copied" : "Could not copy — select the email address",
        copied ? 2200 : 3200,
      );

      if (copyButton) {
        window.clearTimeout(copyButtonResetTimer);
        if (copied) {
          copyButton.textContent = "Copied";
          copyButton.setAttribute("aria-label", "Email address copied");
          copyButtonResetTimer = window.setTimeout(() => {
            copyButton.textContent = "Copy";
            copyButton.setAttribute("aria-label", "Copy email address");
          }, 2200);
        } else {
          copyButton.textContent = "Copy";
          copyButton.setAttribute("aria-label", "Copy email address");
        }
      }
    };

    if (copyButton) copyButton.addEventListener("click", copyEmail);

    const year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());

    // Keep the drawer closed from the first render, then enable user-triggered motion.
    document.documentElement.classList.add("js");
    window.requestAnimationFrame(() => {
      document.documentElement.classList.add("js-ready");
    });
  };

  try {
    initializeEnhancements();
  } catch (error) {
    document.documentElement.classList.remove("js", "js-ready");
    loadDeferredImages(document);
    document.querySelectorAll("[data-project-panel]").forEach((panel) => {
      panel.hidden = false;
    });
    console.error("Progressive enhancements could not be initialized.", error);
  }
})();
