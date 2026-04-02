(() => {
  function initMobileMenu() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId) return;

        event.preventDefault();

        if (targetId === "#") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        const target = document.querySelector(targetId);
        if (!target) return;

        const navHeight = document.getElementById("navbar")?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }

  function initNavbarShadow() {
    const navbar = document.getElementById("navbar");
    if (!navbar || !window.PortfolioApp) return;

    const updateShadow = () => {
      const scrolled = window.pageYOffset > 100;
      const officeTheme = window.PortfolioApp.getCurrentTheme() === window.PortfolioApp.OFFICE;

      if (!scrolled) {
        navbar.style.boxShadow = officeTheme ? "0 2px 20px rgba(0, 0, 0, 0.4)" : "none";
        return;
      }

      navbar.style.boxShadow = officeTheme
        ? "0 2px 20px rgba(0, 0, 0, 0.5)"
        : "0 2px 20px rgba(0, 0, 0, 0.08)";
    };

    updateShadow();
    window.addEventListener("scroll", updateShadow, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initSmoothScroll();
    initNavbarShadow();
  });
})();
