(() => {
  const curtain = document.getElementById("cath-curtain");
  const pull = document.getElementById("cath-curtain-pull");
  if (!curtain || !pull) return;

  const PULL_THRESHOLD = 80;
  const GAME_URL = pull.dataset.gameUrl || "/cath/";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activePointer = null;
  let startY = 0;
  let pullDistance = 0;
  let opening = false;
  let tracking = false;
  let navigationTimer = null;

  function setPull(distance) {
    pullDistance = Math.max(0, distance);
    curtain.style.setProperty("--cath-pull", `${pullDistance}px`);
  }

  function addTrackingListeners() {
    if (tracking) return;
    tracking = true;
    window.addEventListener("pointermove", handlePointerMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener("pointerup", handlePointerUp, true);
    window.addEventListener("pointercancel", handlePointerCancel, true);
  }

  function removeTrackingListeners() {
    if (!tracking) return;
    tracking = false;
    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("pointerup", handlePointerUp, true);
    window.removeEventListener("pointercancel", handlePointerCancel, true);
  }

  function releasePointer(pointerId) {
    if (pointerId === null) return;
    try {
      if (pull.hasPointerCapture?.(pointerId)) {
        pull.releasePointerCapture(pointerId);
      }
    } catch {
      // Window-level listeners still guarantee cleanup.
    }
  }

  function clearPointerTracking() {
    const pointerId = activePointer;
    activePointer = null;
    removeTrackingListeners();
    releasePointer(pointerId);
  }

  function resetCurtain({ animate = true } = {}) {
    if (opening) return;
    clearPointerTracking();
    pullDistance = 0;
    curtain.classList.remove("is-dragging");

    const clearPullStyle = () => curtain.style.removeProperty("--cath-pull");
    if (animate) {
      requestAnimationFrame(clearPullStyle);
    } else {
      clearPullStyle();
    }
  }

  function storeEntrance() {
    try {
      sessionStorage.setItem("cath-curtain-entry", "1");
    } catch {
      // Navigation remains functional when storage is blocked.
    }
  }

  function navigateToGame() {
    if (navigationTimer !== null) {
      window.clearTimeout(navigationTimer);
      navigationTimer = null;
    }
    window.location.assign(GAME_URL);
  }

  function openCurtain(event) {
    event?.preventDefault();
    if (opening) return;

    opening = true;
    clearPointerTracking();
    curtain.classList.remove("is-dragging");
    curtain.classList.add("is-opening");
    curtain.style.removeProperty("--cath-pull");
    document.documentElement.classList.add("cath-transitioning");
    pull.setAttribute("aria-disabled", "true");
    storeEntrance();

    navigationTimer = window.setTimeout(
      navigateToGame,
      reducedMotion.matches ? 140 : 760,
    );
  }

  function handlePointerMove(event) {
    if (opening || event.pointerId !== activePointer) return;
    event.preventDefault();

    const rawDistance = Math.max(0, event.clientY - startY);
    const maxDistance = Math.min(window.innerHeight * 0.34, 170);
    const distance =
      rawDistance <= maxDistance
        ? rawDistance
        : maxDistance + Math.sqrt(rawDistance - maxDistance) * 2;

    setPull(distance);
    if (pullDistance >= PULL_THRESHOLD) {
      openCurtain(event);
    }
  }

  function handlePointerUp(event) {
    if (event.pointerId !== activePointer || opening) return;
    event.preventDefault();
    resetCurtain();
  }

  function handlePointerCancel(event) {
    if (event.pointerId !== activePointer || opening) return;
    resetCurtain();
  }

  pull.addEventListener("pointerdown", (event) => {
    if (
      opening ||
      activePointer !== null ||
      event.isPrimary === false ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    event.preventDefault();
    activePointer = event.pointerId;
    startY = event.clientY;
    pullDistance = 0;
    curtain.classList.add("is-dragging");
    addTrackingListeners();

    try {
      pull.setPointerCapture?.(event.pointerId);
    } catch {
      // Window-level listeners still track the pull.
    }
  });

  pull.addEventListener("lostpointercapture", (event) => {
    if (event.pointerId !== activePointer || opening) return;
    resetCurtain();
  });

  pull.addEventListener("dragstart", (event) => event.preventDefault());
  pull.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  pull.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      resetCurtain();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || opening) return;
    resetCurtain();
  });

  window.addEventListener("blur", () => {
    if (!opening) resetCurtain();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !opening) resetCurtain({ animate: false });
  });

  window.addEventListener("pagehide", () => {
    if (!opening) resetCurtain({ animate: false });
  });

  window.addEventListener("pageshow", () => {
    if (navigationTimer !== null) {
      window.clearTimeout(navigationTimer);
      navigationTimer = null;
    }

    opening = false;
    removeTrackingListeners();
    activePointer = null;
    pullDistance = 0;
    curtain.classList.remove("is-opening", "is-dragging");
    curtain.style.removeProperty("--cath-pull");
    document.documentElement.classList.remove("cath-transitioning");
    pull.removeAttribute("aria-disabled");
  });
})();
