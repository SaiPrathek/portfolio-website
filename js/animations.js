(() => {
  function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll(".fade-in");
    if (!fadeElements.length) return;

    if (!("IntersectionObserver" in window)) {
      fadeElements.forEach((element) => element.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    fadeElements.forEach((element) => observer.observe(element));
  }

  function initSkillBars() {
    const skillBars = document.querySelectorAll(".skill-bar-fill");
    if (!skillBars.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const targetWidth = entry.target.style.width;
          entry.target.classList.add("animated");
          entry.target.style.width = "0";

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              entry.target.style.width = targetWidth;
            });
          });

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    skillBars.forEach((bar) => observer.observe(bar));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFadeInAnimations();
    initSkillBars();
  });
})();
