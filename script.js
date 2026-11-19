(function () {
  "use strict";

  const initializeEnhancements = () => {
    // Switch to the scripted layout first (the mobile nav leaves the header
    // for its drawer), so every measurement below sees the final geometry.
    document.documentElement.classList.add("js");

    const header = document.querySelector("[data-header]");
    const menuButton = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-nav]");
    const navigationPanel = navigation?.querySelector("[data-nav-panel]");
    const brandLink = header?.querySelector(".brand");
    const allNavLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
    const hashNavLinks = allNavLinks.filter((link) => link.getAttribute("href")?.startsWith("#"));
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
      if (restoreFocus) window.requestAnimationFrame(() => menuButton?.focus({ preventScroll: true }));
    };

    // Reveal management (defined early so anchor jumps can settle targets immediately)
    const settleReveal = (item) => {
      item.classList.remove("will-reveal", "is-visible");
      item.style.removeProperty("--reveal-delay");
    };

    const revealImmediately = (root) => {
      if (!root) return;
      if (root.classList?.contains("will-reveal")) settleReveal(root);
      root.querySelectorAll?.(".will-reveal").forEach(settleReveal);
    };

    const revealByHash = (hash) => {
      if (!hash?.startsWith("#") || hash.length === 1) return null;
      let targetId = hash.slice(1);
      try {
        targetId = decodeURIComponent(targetId);
      } catch (_error) {
        // Keep the raw fragment if it contains malformed escape sequences.
      }
      const target = document.getElementById(targetId);
      if (target) {
        revealImmediately(target);
        const parentSection = target.closest("[data-section], section");
        if (parentSection) revealImmediately(parentSection);
      }
      return target;
    };

    const focusSection = (link) => {
      const target = revealByHash(link.getAttribute("href"));
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
          window.requestAnimationFrame(() => {
            if (isMenuOpen()) navigation.querySelector("a[href]")?.focus({ preventScroll: true });
          });
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
            window.requestAnimationFrame(() => menuButton.focus({ preventScroll: true }));
          }
        });
      });

      brandLink?.addEventListener("click", closeMenu);

      const inlineNav = window.matchMedia("(min-width: 901px)");
      const syncNavMode = () => {
        document.documentElement.classList.remove("js-ready");
        if (inlineNav.matches && isMenuOpen()) closeMenu();
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            document.documentElement.classList.add("js-ready");
          });
        });
      };
      if (inlineNav.addEventListener) {
        inlineNav.addEventListener("change", syncNavMode);
      } else {
        inlineNav.addListener(syncNavMode);
      }

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
          lastItem.focus({ preventScroll: true });
        } else if (!event.shiftKey && document.activeElement === lastItem) {
          event.preventDefault();
          firstItem.focus({ preventScroll: true });
        } else if (!focusableItems.includes(document.activeElement)) {
          event.preventDefault();
          navigation.querySelector("a[href]")?.focus({ preventScroll: true });
        }
      });
    }

    // Scroll-dependent UI uses IntersectionObserver rather than a continuous
    // scroll listener. The progress bar uses CSS animation-timeline: scroll().
    const hasObserver = "IntersectionObserver" in window;

    let syncHeaderScrolled = () => {};
    if (header && hasObserver) {
      const headerShell = header.querySelector(".nav-shell");
      const syncHeaderGeometry = () => {
        if (!headerShell) return;
        header.style.setProperty("--header-content-width", `${headerShell.getBoundingClientRect().width}px`);
        header.style.setProperty("--header-viewport-width", `${header.getBoundingClientRect().width}px`);
        header.style.setProperty("--header-base-height", `${header.offsetHeight}px`);
      };
      syncHeaderGeometry();
      if ("ResizeObserver" in window) {
        const headerGeometryObserver = new ResizeObserver(syncHeaderGeometry);
        headerGeometryObserver.observe(header);
        if (headerShell) headerGeometryObserver.observe(headerShell);
      } else {
        window.addEventListener("resize", syncHeaderGeometry, { passive: true });
      }

      const topMarker = document.createElement("div");
      topMarker.className = "scroll-sentinel";
      topMarker.setAttribute("aria-hidden", "true");
      document.body.prepend(topMarker);

      syncHeaderScrolled = () => {
        const scrolled = window.scrollY >= (topMarker.offsetHeight || 80);
        header.classList.toggle("is-scrolled", scrolled);
      };

      new IntersectionObserver((entries) => {
        const latest = entries[entries.length - 1];
        if (!latest) return;
        header.classList.toggle("is-scrolled", !latest.isIntersecting && latest.boundingClientRect.top < 0);
      }).observe(topMarker);

      syncHeaderScrolled();
    }

    // Active section scrollspy (in-page hash links only — preserves cross-page active nav items)
    const sections = Array.from(document.querySelectorAll("[data-section]"));
    let activeSectionId;

    const getActivationLine = () =>
      Math.max((header?.offsetHeight || 80) + 40, Math.round(window.innerHeight * 0.32));

    const updateActiveSection = () => {
      if (!sections.length || !hashNavLinks.length) return;

      const activationLine = getActivationLine();
      let activeSection = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top > activationLine + 1) break;
        activeSection = section;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY >= maxScroll - 2) {
        activeSection = sections[sections.length - 1];
      }

      if (activeSection.id === activeSectionId) return;
      activeSectionId = activeSection.id;
      hashNavLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeSectionId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    if (sections.length && hashNavLinks.length && hasObserver) {
      const endMarker = document.createElement("div");
      endMarker.className = "scroll-sentinel-end";
      endMarker.setAttribute("aria-hidden", "true");
      document.body.append(endMarker);

      let sectionObserver;
      const observeSections = () => {
        sectionObserver?.disconnect();
        const line = getActivationLine();
        const below = Math.max(0, window.innerHeight - line - 1);
        sectionObserver = new IntersectionObserver(updateActiveSection, {
          rootMargin: `-${line}px 0px -${below}px 0px`,
        });
        sections.forEach((section) => sectionObserver.observe(section));
      };

      observeSections();
      new IntersectionObserver(updateActiveSection).observe(endMarker);

      let resizePending = false;
      window.addEventListener("resize", () => {
        if (resizePending) return;
        resizePending = true;
        window.requestAnimationFrame(() => {
          resizePending = false;
          observeSections();
          syncHeaderScrolled();
          updateActiveSection();
        });
      });
    }

    // Also handle in-page hash links outside the mobile nav (e.g. "View work ↓" & case TOC)
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.closest("[data-nav]")) return;
      link.addEventListener("click", () => {
        revealByHash(link.getAttribute("href"));
      });
    });

    window.addEventListener("pageshow", () => {
      syncHeaderScrolled();
      updateActiveSection();
    });

    window.addEventListener("hashchange", () => {
      revealByHash(window.location.hash);
      syncHeaderScrolled();
      updateActiveSection();
    });

    updateActiveSection();

    // Snappy, never-stuck scroll reveals
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    let revealObserver;
    const triggerReveal = (item, delayMs = 0) => {
      revealObserver?.unobserve(item);
      if (!item.classList.contains("will-reveal")) return;
      item.style.setProperty("--reveal-delay", `${delayMs}ms`);
      item.classList.add("is-visible");
      const fallbackTimer = window.setTimeout(() => settleReveal(item), 680 + delayMs);
      item.addEventListener(
        "transitionend",
        function onEnd(event) {
          if (event.target !== item || event.propertyName !== "transform") return;
          item.removeEventListener("transitionend", onEnd);
          window.clearTimeout(fallbackTimer);
          settleReveal(item);
        },
      );
    };

    const sweepVisibleReveals = () => {
      const limit = window.innerHeight + 60;
      document.querySelectorAll(".will-reveal").forEach((item) => {
        if (item.getBoundingClientRect().top <= limit) {
          triggerReveal(item, 0);
        }
      });
    };

    if (hasObserver && !reducedMotion.matches && revealItems.length) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries
            .filter((entry) => entry.isIntersecting)
            .forEach((entry, index) => {
              triggerReveal(entry.target, Math.min(index, 3) * 50);
            });
        },
        { rootMargin: "0px 0px 48px 0px", threshold: 0.01 },
      );

      const fold = window.innerHeight;
      revealItems.forEach((item) => {
        if (item.getBoundingClientRect().top < fold) return;
        item.classList.add("will-reveal");
        revealObserver.observe(item);
      });

      if (window.location.hash) {
        revealByHash(window.location.hash);
      }

      if ("onscrollend" in window) {
        window.addEventListener("scrollend", () => {
          syncHeaderScrolled();
          updateActiveSection();
          sweepVisibleReveals();
        }, { passive: true });
      }
    }

    // Project image lightbox with optional gallery navigation on multi-project pages
    const projectMediaLinks = Array.from(document.querySelectorAll("[data-project-zoom]"));
    const lightbox = document.querySelector("[data-project-lightbox]");
    const lightboxShell = lightbox?.querySelector(".project-lightbox-shell");
    const lightboxImage = lightbox?.querySelector("[data-project-lightbox-image]");
    const lightboxCaption = lightbox?.querySelector("[data-project-lightbox-caption]");
    const lightboxClose = lightbox?.querySelector("[data-project-lightbox-close]");
    let lightboxTrigger;
    let lightboxIndex = -1;
    let lightboxCounter;

    const closeLightbox = () => {
      if (lightbox?.open) lightbox.close();
    };

    if (lightbox && lightboxShell && lightboxImage && lightboxCaption && lightboxClose && projectMediaLinks.length) {
      const hasGallery = projectMediaLinks.length > 1;
      let prevButton;
      let nextButton;

      if (hasGallery) {
        lightbox.classList.add("has-gallery");
        const bar = document.createElement("div");
        bar.className = "project-lightbox-bar";

        const nav = document.createElement("div");
        nav.className = "project-lightbox-nav";

        prevButton = document.createElement("button");
        prevButton.type = "button";
        prevButton.className = "project-lightbox-btn";
        prevButton.setAttribute("aria-label", "Previous screenshot");
        prevButton.innerHTML = '<span aria-hidden="true">←</span>';

        lightboxCounter = document.createElement("span");
        lightboxCounter.className = "project-lightbox-counter";
        lightboxCounter.setAttribute("aria-live", "polite");

        nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "project-lightbox-btn";
        nextButton.setAttribute("aria-label", "Next screenshot");
        nextButton.innerHTML = '<span aria-hidden="true">→</span>';

        nav.append(prevButton, lightboxCounter, nextButton);
        bar.append(nav, lightboxClose);
        lightboxShell.prepend(bar);
      }

      const showLightboxAt = (index) => {
        const normalized = ((index % projectMediaLinks.length) + projectMediaLinks.length) % projectMediaLinks.length;
        const link = projectMediaLinks[normalized];
        const figure = link?.closest("figure");
        const preview = figure?.querySelector("img");
        if (!link || !preview) return false;

        lightboxIndex = normalized;
        lightboxTrigger = link;

        if (lightboxCounter) {
          lightboxCounter.textContent = `${normalized + 1} / ${projectMediaLinks.length}`;
        }

        lightboxImage.classList.add("is-switching");
        lightboxImage.src = preview.currentSrc || preview.src;
        lightboxImage.alt = preview.alt;
        window.requestAnimationFrame(() => lightboxImage.classList.remove("is-switching"));

        const fullImage = new Image();
        fullImage.addEventListener("load", () => {
          if (lightbox.open && lightboxIndex === normalized) {
            lightboxImage.src = link.href;
          }
        });
        fullImage.src = link.href;

        const caption = figure.querySelector("figcaption");
        const previewCaption = (caption?.firstElementChild || caption)?.textContent.trim();
        lightboxCaption.textContent = previewCaption || preview.alt;
        return true;
      };

      projectMediaLinks.forEach((link, index) => {
        link.addEventListener("click", (event) => {
          if (
            typeof lightbox.showModal !== "function" ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          event.preventDefault();
          if (!showLightboxAt(index)) return;
          document.documentElement.classList.add("lightbox-open");
          document.body.classList.add("lightbox-open");
          lightbox.showModal();
          lightboxClose.focus();
        });
      });

      prevButton?.addEventListener("click", () => showLightboxAt(lightboxIndex - 1));
      nextButton?.addEventListener("click", () => showLightboxAt(lightboxIndex + 1));

      lightbox.addEventListener("keydown", (event) => {
        if (!hasGallery || !lightbox.open) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showLightboxAt(lightboxIndex - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          showLightboxAt(lightboxIndex + 1);
        }
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
        lightboxIndex = -1;
      });
    }

    // Intro video modal
    const introLinks = Array.from(document.querySelectorAll("[data-intro-open]"));
    const introBox = document.querySelector("[data-intro-lightbox]");
    const introVideo = introBox?.querySelector("[data-intro-video]");
    const introClose = introBox?.querySelector("[data-intro-close]");
    const prefersStill = window.matchMedia("(prefers-reduced-motion: reduce)");
    let introTrigger;

    if (introLinks.length && introBox && introVideo && introClose && typeof introBox.showModal === "function") {
      introLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          introTrigger = link;
          document.documentElement.classList.add("lightbox-open");
          document.body.classList.add("lightbox-open");
          introBox.showModal();
          introVideo.focus({ preventScroll: true });
          if (!prefersStill.matches) {
            introVideo.play().catch(() => {});
          }
        });
      });

      introClose.addEventListener("click", () => introBox.close());
      introBox.addEventListener("click", (event) => {
        if (event.target instanceof Element && !event.target.closest("video, button")) {
          introBox.close();
        }
      });
      introBox.addEventListener("close", () => {
        introVideo.pause();
        introVideo.currentTime = 0;
        document.documentElement.classList.remove("lightbox-open");
        document.body.classList.remove("lightbox-open");
        introTrigger?.focus({ preventScroll: true });
        introTrigger = undefined;
      });
    }

    // One-click email copy (supports both contact block and mobile menu utility)
    const copyButtons = Array.from(document.querySelectorAll("[data-copy-email]"));
    const copyToast = document.querySelector("[data-copy-toast]");
    const primaryEmailLink = document.querySelector('.contact-email-row a[href^="mailto:"], a[href^="mailto:"]');
    let toastTimer;
    const buttonResetTimers = new WeakMap();

    const showCopyStatus = (message, duration = 2400) => {
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

    const getEmailAddress = (button) => {
      const explicit = button?.getAttribute("data-copy-email");
      if (explicit) return explicit;
      const nearbyLink = button?.closest(".contact-email-row")?.querySelector('a[href^="mailto:"]') || primaryEmailLink;
      const mailto = nearbyLink?.getAttribute("href") || "";
      const encodedAddress = mailto.replace(/^mailto:/i, "").split("?", 1)[0];
      try {
        return decodeURIComponent(encodedAddress);
      } catch (_error) {
        return encodedAddress;
      }
    };

    const copyEmail = async (button) => {
      const email = getEmailAddress(button);
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
        copied ? "Email copied to clipboard" : "Could not copy. Select the email address.",
        copied ? 2400 : 3200,
      );

      if (button) {
        const defaultLabel = button.dataset.defaultLabel || button.textContent.trim() || "Copy";
        button.dataset.defaultLabel = defaultLabel;
        window.clearTimeout(buttonResetTimers.get(button));
        if (copied) {
          button.classList.add("is-copied");
          button.textContent = "Copied";
          button.setAttribute("aria-label", "Email address copied");
          const timer = window.setTimeout(() => {
            button.classList.remove("is-copied");
            button.textContent = defaultLabel;
            button.setAttribute("aria-label", "Copy email address");
          }, 2400);
          buttonResetTimers.set(button, timer);
        } else {
          button.classList.remove("is-copied");
          button.textContent = defaultLabel;
          button.setAttribute("aria-label", "Copy email address");
        }
      }
    };

    copyButtons.forEach((button) => {
      button.addEventListener("click", () => copyEmail(button));
    });

    const year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());

    window.requestAnimationFrame(() => {
      document.documentElement.classList.add("js-ready");
    });
  };

  try {
    initializeEnhancements();
  } catch (error) {
    document.documentElement.classList.remove("js", "js-ready");
    console.error("Progressive enhancements could not be initialized.", error);
  }
})();
