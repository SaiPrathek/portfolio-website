(() => {
  const THEME_KEY = "portfolio-theme";
  const F1 = "theme-f1";
  const OFFICE = "theme-office";

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage may be unavailable in some browsing modes.
    }
  }

  function getCurrentTheme() {
    return document.body.classList.contains(OFFICE) ? OFFICE : F1;
  }

  function setTheme(theme) {
    document.body.classList.remove(F1, OFFICE);
    document.body.classList.add(theme);
    setStoredTheme(theme);
  }

  function showToast(message, type) {
    const existing = document.querySelector(".toast-notification");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    const icon = type === "success" ? "check_circle" : "error";
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML =
      `<span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">${icon}</span>` +
      message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("toast-visible"));
    setTimeout(() => {
      toast.classList.remove("toast-visible");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  window.PortfolioApp = {
    THEME_KEY,
    F1,
    OFFICE,
    getStoredTheme,
    getCurrentTheme,
    setTheme,
    showToast,
  };
})();
