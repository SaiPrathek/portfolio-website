(() => {
  const curtain = document.getElementById("cath-curtain");
  const pull = document.getElementById("cath-curtain-pull");
  if (!curtain || !pull) return;

  const GAME_URL = pull.dataset.gameUrl || "/cath/";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let opening = false;
  let pullTimer = null;
  let navigationTimer = null;

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
    curtain.classList.add("is-click-pulling");
    document.documentElement.classList.add("cath-transitioning");
    pull.setAttribute("aria-disabled", "true");
    storeEntrance();

    pullTimer = window.setTimeout(() => {
      pullTimer = null;
      curtain.classList.remove("is-click-pulling");
      curtain.classList.add("is-opening");
    }, reducedMotion.matches ? 80 : 240);

    navigationTimer = window.setTimeout(
      navigateToGame,
      reducedMotion.matches ? 220 : 1000,
    );
  }

  pull.addEventListener("dragstart", (event) => event.preventDefault());
  pull.addEventListener("click", openCurtain);

  pull.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCurtain(event);
    }
  });

  window.addEventListener("pageshow", () => {
    if (pullTimer !== null) {
      window.clearTimeout(pullTimer);
      pullTimer = null;
    }

    if (navigationTimer !== null) {
      window.clearTimeout(navigationTimer);
      navigationTimer = null;
    }

    opening = false;
    curtain.classList.remove("is-opening", "is-click-pulling");
    document.documentElement.classList.remove("cath-transitioning");
    pull.removeAttribute("aria-disabled");
  });
})();
