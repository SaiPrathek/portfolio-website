(() => {
  const app = window.PortfolioApp;
  if (!app) return;

  function syncFormValues() {
    const fields = ["name", "email", "message"];
    const f1Form = document.getElementById("contact-form-f1");
    const officeForm = document.getElementById("contact-form-office");

    if (!f1Form || !officeForm) return;

    const activeForm = app.getCurrentTheme() === app.F1 ? f1Form : officeForm;
    const passiveForm = activeForm === f1Form ? officeForm : f1Form;

    fields.forEach((name) => {
      const source = activeForm.querySelector(`[name="${name}"]`);
      const target = passiveForm.querySelector(`[name="${name}"]`);

      if (source && target) {
        target.value = source.value;
      }
    });
  }

  function toggleTheme() {
    syncFormValues();
    const nextTheme = app.getCurrentTheme() === app.F1 ? app.OFFICE : app.F1;
    app.setTheme(nextTheme);
  }

  function initTheme() {
    const storedTheme = app.getStoredTheme();
    app.setTheme(storedTheme === app.OFFICE ? app.OFFICE : app.F1);
  }

  function initToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;
    toggleBtn.addEventListener("click", toggleTheme);
  }

  function initThemeEasterEgg() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    let clickTimestamps = [];

    toggleBtn.addEventListener("click", () => {
      const now = Date.now();
      clickTimestamps.push(now);
      clickTimestamps = clickTimestamps.filter((timestamp) => now - timestamp < 2000);

      if (clickTimestamps.length < 5) return;
      clickTimestamps = [];

      if (app.getCurrentTheme() === app.F1) {
        const flag = document.createElement("div");
        flag.className = "checkered-flag-burst";
        document.body.appendChild(flag);
        setTimeout(() => flag.remove(), 1000);
        return;
      }

      const confetti = document.createElement("div");
      confetti.className = "confetti-burst";
      confetti.textContent = "DUNDIE AWARD!";
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 1200);
    });
  }

  initTheme();
  document.addEventListener("DOMContentLoaded", () => {
    initToggle();
    initThemeEasterEgg();
  });
})();
