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
      document.querySelectorAll("body > .skip-link, main, body > .page-finale, body > footer, .header-resume"),
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
            link.hasAttribute("download") ||
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
      const topMarker = document.createElement("div");
      topMarker.className = "scroll-sentinel";
      topMarker.setAttribute("aria-hidden", "true");
      document.body.prepend(topMarker);

      syncHeaderScrolled = () => {
        const scrolled = window.scrollY >= (topMarker.offsetHeight || header.offsetHeight || 80);
        header.classList.toggle("is-scrolled", scrolled);
      };

      const syncHeaderGeometry = () => {
        if (!headerShell) return;
        const headerHeight = header.offsetHeight || 80;
        header.style.setProperty("--header-content-width", `${headerShell.getBoundingClientRect().width}px`);
        header.style.setProperty("--header-viewport-width", `${header.getBoundingClientRect().width}px`);
        header.style.setProperty("--header-base-height", `${headerHeight}px`);
        topMarker.style.height = `${headerHeight}px`;
        syncHeaderScrolled();
      };
      syncHeaderGeometry();
      if ("ResizeObserver" in window) {
        const headerGeometryObserver = new ResizeObserver(syncHeaderGeometry);
        headerGeometryObserver.observe(header);
        if (headerShell) headerGeometryObserver.observe(headerShell);
      } else {
        window.addEventListener("resize", syncHeaderGeometry, { passive: true });
      }

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
    let observeSections = () => {};

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
      if (maxScroll > 0 && window.scrollY >= maxScroll - 24) {
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
      observeSections = () => {
        sectionObserver?.disconnect();
        const line = getActivationLine();
        const below = Math.max(0, window.innerHeight - line - 1);
        sectionObserver = new IntersectionObserver(updateActiveSection, {
          rootMargin: `-${line}px 0px -${below}px 0px`,
        });
        sections.forEach((section) => sectionObserver.observe(section));
      };

      observeSections();
      new IntersectionObserver(updateActiveSection, {
        rootMargin: "0px 0px 48px 0px",
      }).observe(endMarker);
    }

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
    }

    const handleReducedMotionChange = () => {
      if (!reducedMotion.matches) return;
      revealObserver?.disconnect();
      document.querySelectorAll(".will-reveal").forEach(settleReveal);
    };
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener("change", handleReducedMotionChange);
    } else if (reducedMotion.addListener) {
      reducedMotion.addListener(handleReducedMotionChange);
    }

    // Also handle in-page hash links outside the mobile nav (e.g. "View work ↓" & case TOC)
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.closest("[data-nav]")) return;
      link.addEventListener("click", () => {
        revealByHash(link.getAttribute("href"));
      });
    });

    const onScrollSettle = () => {
      syncHeaderScrolled();
      updateActiveSection();
      sweepVisibleReveals();
    };

    if (header || (sections.length && hashNavLinks.length) || revealItems.length) {
      let resizePending = false;
      window.addEventListener(
        "resize",
        () => {
          if (resizePending) return;
          resizePending = true;
          window.requestAnimationFrame(() => {
            resizePending = false;
            observeSections();
            onScrollSettle();
          });
        },
        { passive: true },
      );

      if ("onscrollend" in window) {
        window.addEventListener("scrollend", onScrollSettle, { passive: true });
      } else {
        let scrollSettleTimer;
        window.addEventListener(
          "scroll",
          () => {
            window.clearTimeout(scrollSettleTimer);
            scrollSettleTimer = window.setTimeout(onScrollSettle, 120);
          },
          { passive: true },
        );
      }

      window.addEventListener("pageshow", onScrollSettle);

      window.addEventListener("hashchange", () => {
        revealByHash(window.location.hash);
        onScrollSettle();
      });

      updateActiveSection();
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
      let loadToken = 0;

      const bar = document.createElement("div");
      bar.className = "project-lightbox-bar";

      if (hasGallery) {
        lightbox.classList.add("has-gallery");
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
        bar.append(nav);
      }

      const zoomButton = document.createElement("button");
      zoomButton.type = "button";
      zoomButton.className = "project-lightbox-zoom";
      zoomButton.setAttribute("aria-pressed", "false");
      zoomButton.setAttribute("aria-label", "Zoom screenshot to 100%");
      zoomButton.textContent = "100%";

      bar.append(zoomButton, lightboxClose);
      lightboxShell.prepend(bar);

      const lightboxFooter = document.createElement("div");
      lightboxFooter.className = "project-lightbox-footer";
      const lightboxCaseLink = document.createElement("a");
      lightboxCaseLink.className = "project-lightbox-case-link";
      lightboxCaseLink.hidden = true;
      lightboxCaption.replaceWith(lightboxFooter);
      lightboxFooter.append(lightboxCaption, lightboxCaseLink);

      const setLightboxZoomed = (nextZoomed) => {
        lightbox.classList.toggle("is-zoomed", nextZoomed);
        zoomButton.setAttribute("aria-pressed", String(nextZoomed));
        zoomButton.setAttribute("aria-label", nextZoomed ? "Fit screenshot to screen" : "Zoom screenshot to 100%");
        zoomButton.textContent = nextZoomed ? "Fit" : "100%";
        lightbox.scrollTo(0, 0);
      };

      const getLightboxCaption = (link, figure, preview) => {
        const explicitCaption = link.getAttribute("data-lightbox-caption")?.trim();
        if (explicitCaption) return explicitCaption;

        const caption = figure.querySelector("figcaption");
        if (caption && !caption.classList.contains("project-figure-meta")) {
          const previewCaption = (caption.firstElementChild || caption).textContent.trim();
          if (previewCaption) return previewCaption;
        }

        return preview.alt?.trim() || "";
      };

      const showLightboxAt = (index) => {
        const normalized = ((index % projectMediaLinks.length) + projectMediaLinks.length) % projectMediaLinks.length;
        const link = projectMediaLinks[normalized];
        const figure = link?.closest("figure");
        const preview = figure?.querySelector("img");
        if (!link || !preview) return false;

        lightboxIndex = normalized;
        lightboxTrigger = link;
        setLightboxZoomed(false);

        if (lightboxCounter) {
          lightboxCounter.textContent = `${normalized + 1} / ${projectMediaLinks.length}`;
        }

        const token = ++loadToken;
        const previewSrc = preview.currentSrc || preview.src;
        const fullSrc = link.href;

        lightboxImage.classList.add("is-switching");
        lightboxImage.classList.remove("is-loading");
        lightboxImage.src = previewSrc;
        lightboxImage.alt = preview.alt;
        window.requestAnimationFrame(() => {
          if (loadToken === token) lightboxImage.classList.remove("is-switching");
        });

        if (fullSrc && fullSrc !== previewSrc) {
          lightboxImage.classList.add("is-loading");
          lightbox.setAttribute("aria-busy", "true");
          const fullImage = new Image();
          const finishLoad = () => {
            if (loadToken !== token) return;
            lightboxImage.classList.remove("is-loading");
            lightbox.removeAttribute("aria-busy");
          };
          fullImage.addEventListener("load", () => {
            if (loadToken === token) {
              lightboxImage.src = fullSrc;
            }
            finishLoad();
          });
          fullImage.addEventListener("error", finishLoad);
          fullImage.src = fullSrc;
          if (fullImage.complete && fullImage.naturalWidth > 0) {
            if (loadToken === token) {
              lightboxImage.src = fullSrc;
            }
            finishLoad();
          }
        } else {
          lightbox.removeAttribute("aria-busy");
        }

        lightboxCaption.textContent = getLightboxCaption(link, figure, preview);

        const caseHref = link.getAttribute("data-lightbox-href")?.trim();
        if (caseHref) {
          const caseLabel = link.getAttribute("data-lightbox-link-label")?.trim() || "Read case study";
          const arrow = document.createElement("span");
          arrow.setAttribute("aria-hidden", "true");
          arrow.textContent = "→";
          lightboxCaseLink.href = caseHref;
          lightboxCaseLink.textContent = "";
          lightboxCaseLink.append(document.createTextNode(`${caseLabel} `), arrow);
          lightboxCaseLink.hidden = false;
        } else {
          lightboxCaseLink.hidden = true;
          lightboxCaseLink.removeAttribute("href");
        }

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
          lightbox.scrollTo(0, 0);
          lightboxClose.focus();
        });
      });

      zoomButton.addEventListener("click", () => {
        setLightboxZoomed(!lightbox.classList.contains("is-zoomed"));
      });

      const mobileLightboxMedia = window.matchMedia("(max-width: 760px)");
      const syncLightboxZoomMode = () => {
        if (!mobileLightboxMedia.matches && lightbox.classList.contains("is-zoomed")) {
          setLightboxZoomed(false);
        }
      };
      if (mobileLightboxMedia.addEventListener) {
        mobileLightboxMedia.addEventListener("change", syncLightboxZoomMode);
      } else if (mobileLightboxMedia.addListener) {
        mobileLightboxMedia.addListener(syncLightboxZoomMode);
      }

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
        } else if (event.key === "Home") {
          event.preventDefault();
          showLightboxAt(0);
        } else if (event.key === "End") {
          event.preventDefault();
          showLightboxAt(projectMediaLinks.length - 1);
        }
      });

      if (hasGallery) {
        let touchStartX = 0;
        let touchStartY = 0;
        let trackingSwipe = false;

        lightbox.addEventListener(
          "touchstart",
          (event) => {
            if (!lightbox.open || lightbox.classList.contains("is-zoomed") || event.touches.length !== 1) {
              trackingSwipe = false;
              return;
            }
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            trackingSwipe = true;
          },
          { passive: true },
        );

        lightbox.addEventListener(
          "touchcancel",
          () => {
            trackingSwipe = false;
          },
          { passive: true },
        );

        lightbox.addEventListener(
          "touchend",
          (event) => {
            if (!trackingSwipe || !lightbox.open || lightbox.classList.contains("is-zoomed")) {
              trackingSwipe = false;
              return;
            }
            trackingSwipe = false;
            const touch = event.changedTouches[0];
            if (!touch) return;
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
              showLightboxAt(lightboxIndex + (deltaX < 0 ? 1 : -1));
            }
          },
          { passive: true },
        );
      }

      lightboxClose.addEventListener("click", closeLightbox);
      lightbox.addEventListener("click", (event) => {
        if (event.target instanceof Element && !event.target.closest("img, button, a")) {
          closeLightbox();
        }
      });
      lightbox.addEventListener("close", () => {
        loadToken += 1;
        setLightboxZoomed(false);
        lightboxImage.classList.remove("is-loading", "is-switching");
        lightbox.removeAttribute("aria-busy");
        document.documentElement.classList.remove("lightbox-open");
        document.body.classList.remove("lightbox-open");
        lightboxImage.removeAttribute("src");
        lightboxImage.alt = "";
        lightboxCaption.textContent = "";
        lightboxCaseLink.hidden = true;
        lightboxCaseLink.removeAttribute("href");
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
          if (!reducedMotion.matches) {
            introVideo.play().catch(() => {});
          }
        });
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden && introBox.open && !introVideo.paused) {
          introVideo.pause();
        }
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

    // One-click email copy (supports contact block, mobile menu utility, and web résumé)
    const copyButtons = Array.from(document.querySelectorAll("[data-copy-email]"));
    let copyToast = document.querySelector("[data-copy-toast]");
    const primaryEmailLink = document.querySelector('.contact-email-row a[href^="mailto:"], a[href^="mailto:"]');
    let toastTimer;
    const buttonResetTimers = new WeakMap();

    const ensureCopyToast = () => {
      if (copyToast && copyToast.isConnected) return copyToast;
      const toast = document.createElement("div");
      toast.className = "copy-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      toast.setAttribute("data-copy-toast", "");
      document.body.append(toast);
      copyToast = toast;
      return toast;
    };

    if (copyButtons.length) {
      ensureCopyToast();
    }

    const showCopyStatus = (message, duration = 2400) => {
      const toast = ensureCopyToast();
      if (!toast) return;
      window.clearTimeout(toastTimer);
      toast.textContent = "";
      toast.classList.remove("is-visible");
      window.requestAnimationFrame(() => {
        toast.textContent = message;
        toast.classList.add("is-visible");
        toastTimer = window.setTimeout(
          () => toast.classList.remove("is-visible"),
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
        const labelTarget = button.querySelector("[data-copy-label]") || button;
        const defaultLabel = button.dataset.defaultLabel || labelTarget.textContent.trim() || "Copy";
        button.dataset.defaultLabel = defaultLabel;
        if (!("defaultAriaLabel" in button.dataset)) {
          button.dataset.defaultAriaLabel = button.getAttribute("aria-label") || "";
        }
        const defaultAriaLabel = button.dataset.defaultAriaLabel;
        const restoreAriaLabel = () => {
          if (defaultAriaLabel) button.setAttribute("aria-label", defaultAriaLabel);
          else button.removeAttribute("aria-label");
        };

        window.clearTimeout(buttonResetTimers.get(button));
        if (copied) {
          button.classList.add("is-copied");
          labelTarget.textContent = "Copied";
          button.setAttribute("aria-label", "Email address copied");
          const timer = window.setTimeout(() => {
            button.classList.remove("is-copied");
            labelTarget.textContent = defaultLabel;
            restoreAriaLabel();
          }, 2400);
          buttonResetTimers.set(button, timer);
        } else {
          button.classList.remove("is-copied");
          labelTarget.textContent = defaultLabel;
          restoreAriaLabel();
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
