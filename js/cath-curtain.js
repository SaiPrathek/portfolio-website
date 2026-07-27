(() => {
  const curtain = document.getElementById("cath-curtain");
  const pull = document.getElementById("cath-curtain-pull");
  if (!curtain || !pull) return;

  const PULL_THRESHOLD = 96;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activePointer = null;
  let startY = 0;
  let pullDistance = 0;
  let moved = false;
  let suppressClick = false;
  let opening = false;
  let navigationTimer = null;

  function setPull(distance) {
    pullDistance = Math.max(0, distance);
    curtain.style.setProperty("--cath-pull", `${pullDistance}px`);
  }

  function resetCurtain() {
    if (opening) return;
    activePointer = null;
    moved = false;
    pullDistance = 0;
    curtain.classList.remove("is-dragging");
    curtain.style.removeProperty("--cath-pull");
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
    window.location.assign(pull.href);
  }

  function openCurtain(event) {
    event?.preventDefault();
    if (opening) return;

    opening = true;
    activePointer = null;
    curtain.classList.remove("is-dragging");
    curtain.classList.add("is-opening");
    document.documentElement.classList.add("cath-transitioning");
    pull.setAttribute("aria-disabled", "true");
    storeEntrance();

    navigationTimer = window.setTimeout(
      navigateToGame,
      reducedMotion.matches ? 140 : 760,
    );
  }

  pull.addEventListener("pointerdown", (event) => {
    if (opening || (event.button !== undefined && event.button !== 0)) return;
    activePointer = event.pointerId;
    startY = event.clientY;
    moved = false;
    suppressClick = false;
    curtain.classList.add("is-dragging");
    pull.setPointerCapture?.(event.pointerId);
  });

  pull.addEventListener("pointermove", (event) => {
    if (opening || event.pointerId !== activePointer) return;

    const rawDistance = Math.max(0, event.clientY - startY);
    const maxDistance = Math.min(window.innerHeight * 0.34, 170);
    const distance =
      rawDistance <= maxDistance
        ? rawDistance
        : maxDistance + Math.sqrt(rawDistance - maxDistance) * 2;

    if (distance > 4) moved = true;
    setPull(distance);
    event.preventDefault();
  });

  function finishPointer(event) {
    if (event.pointerId !== activePointer || opening) return;

    pull.releasePointerCapture?.(event.pointerId);
    activePointer = null;
    suppressClick = moved;

    if (pullDistance >= PULL_THRESHOLD) {
      openCurtain(event);
      return;
    }

    curtain.classList.remove("is-dragging");
    requestAnimationFrame(resetCurtain);
  }

  pull.addEventListener("pointerup", finishPointer);
  pull.addEventListener("pointercancel", (event) => {
    if (event.pointerId !== activePointer || opening) return;
    pull.releasePointerCapture?.(event.pointerId);
    suppressClick = true;
    curtain.classList.remove("is-dragging");
    requestAnimationFrame(resetCurtain);
  });

  pull.addEventListener("click", (event) => {
    if (suppressClick) {
      event.preventDefault();
      suppressClick = false;
      return;
    }
    openCurtain(event);
  });

  pull.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      openCurtain(event);
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

  window.addEventListener("pageshow", () => {
    if (!opening) return;
    opening = false;
    curtain.classList.remove("is-opening");
    document.documentElement.classList.remove("cath-transitioning");
    pull.removeAttribute("aria-disabled");
    resetCurtain();
  });
})();
