(() => {
  function initContactForms() {
    if (!window.PortfolioApp) return;

    document.querySelectorAll(".contact-form").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = form.querySelector('button[type="submit"]');
        if (!button) return;

        const originalText = button.innerHTML;
        button.innerHTML =
          '<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> Sending...';
        button.disabled = true;

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" },
          });

          if (!response.ok) {
            throw new Error("request_failed");
          }

          window.PortfolioApp.showToast("Message sent successfully!", "success");
          form.reset();
        } catch {
          window.PortfolioApp.showToast("Something went wrong. Please try again.", "error");
        } finally {
          button.innerHTML = originalText;
          button.disabled = false;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initContactForms);
})();
