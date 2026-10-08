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
          window.requestAnimationFrame(() => {
            if (isMenuOpen()) navLinks[0]?.focus({ preventScroll: true });
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
            window.requestAnimationFrame(() => menuButton.focus());
          }
        });
      });

      brandLink?.addEventListener("click", closeMenu);

      // Past this width the toggle is hidden and the nav is inline, so an open
      // drawer would leave the page inert with no way to dismiss it.
      const inlineNav = window.matchMedia("(min-width: 901px)");
      const syncNavMode = () => {
        // Do not animate the desktop navigation into a closed mobile drawer.
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

    // Scroll-dependent UI is driven by IntersectionObserver rather than a
    // scroll listener: the browser reports when a boundary is crossed and
    // nothing runs while the reader simply scrolls inside one section. The
    // progress bar is a CSS scroll-driven animation (see styles.css).
    const hasObserver = "IntersectionObserver" in window;

    if (header && hasObserver) {
      const topMarker = document.createElement("div");
      topMarker.className = "scroll-sentinel";
      topMarker.setAttribute("aria-hidden", "true");
      document.body.prepend(topMarker);
      new IntersectionObserver(([entry]) => {
        header.classList.toggle("is-scrolled", !entry.isIntersecting);
      }).observe(topMarker);
    }

    const sections = Array.from(document.querySelectorAll("[data-section]"));
    let activeSectionId;

    const updateActiveSection = () => {
      if (!sections.length) return;

      // Read all section positions, rather than only the intersections that
      // changed. This also covers long sections, gaps, and upward scrolling.
      // The same one-pixel band the observer below watches: a section counts
      // as reached as soon as its top enters the band, not a pixel later.
      const activationLine = (header?.offsetHeight || 0) + 24;
      let activeSection = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top >= activationLine + 1) break;
        activeSection = section;
      }
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY >= maxScroll - 1) {
        activeSection = sections[sections.length - 1];
      }

      if (activeSection.id === activeSectionId) return;
      activeSectionId = activeSection.id;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeSectionId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    if (sections.length && hasObserver) {
      // A one-pixel band at the activation line: a section crossing it is the
      // only moment the answer can change. The end marker covers the last,
      // shorter sections that never reach the line before the page ends.
      const endMarker = document.createElement("div");
      endMarker.className = "scroll-sentinel-end";
      endMarker.setAttribute("aria-hidden", "true");
      document.body.append(endMarker);

      let sectionObserver;
      const observeSections = () => {
        sectionObserver?.disconnect();
        const line = (header?.offsetHeight || 0) + 24;
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
          updateActiveSection();
        });
      });
      window.addEventListener("pageshow", updateActiveSection);
      window.addEventListener("hashchange", updateActiveSection);
    }

    updateActiveSection();

    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    if (hasObserver && !reducedMotion.matches) {
      const settle = (item) => {
        item.classList.remove("will-reveal", "is-visible");
        item.style.removeProperty("--reveal-delay");
      };

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          // Blocks that arrive in the same frame cascade in document order.
          entries
            .filter((entry) => entry.isIntersecting)
            .forEach((entry, index) => {
              const item = entry.target;
              observer.unobserve(item);
              item.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 70}ms`);
              item.classList.add("is-visible");
              item.addEventListener(
                "transitionend",
                function onEnd(event) {
                  if (event.target !== item || event.propertyName !== "transform") return;
                  item.removeEventListener("transitionend", onEnd);
                  settle(item);
                },
              );
            });
        },
        { rootMargin: "0px 0px -8%", threshold: 0.08 },
      );

      // Anything already on screen stays put; only what starts below the fold
      // is held back, so the first paint never blinks.
      const fold = window.innerHeight;
      revealItems.forEach((item) => {
        if (item.getBoundingClientRect().top < fold) return;
        item.classList.add("will-reveal");
        revealObserver.observe(item);
      });
    }

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
        copied ? "Email copied" : "Could not copy. Select the email address.",
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
