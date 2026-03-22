/* ============================================
   THEME TOGGLE
   ============================================ */

const THEME_KEY = 'portfolio-theme';
const F1 = 'theme-f1';
const OFFICE = 'theme-office';

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function setTheme(theme) {
  document.body.classList.remove(F1, OFFICE);
  document.body.classList.add(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage not available
  }
}

function syncFormValues() {
  const fields = ['name', 'email', 'message'];
  const f1 = document.getElementById('contact-form-f1');
  const office = document.getElementById('contact-form-office');
  if (!f1 || !office) return;
  const active = document.body.classList.contains(F1) ? f1 : office;
  const passive = active === f1 ? office : f1;
  fields.forEach(name => {
    const src = active.querySelector('[name="' + name + '"]');
    const dst = passive.querySelector('[name="' + name + '"]');
    if (src && dst) dst.value = src.value;
  });
}

function toggleTheme() {
  syncFormValues();
  const current = document.body.classList.contains(F1) ? F1 : OFFICE;
  const next = current === F1 ? OFFICE : F1;
  setTheme(next);
}

// Initialize theme
(function initTheme() {
  const stored = getStoredTheme();
  if (stored === F1 || stored === OFFICE) {
    setTheme(stored);
  } else {
    setTheme(F1); // default
  }
})();

// Bind toggle button
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
});


/* ============================================
   MOBILE MENU
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
});


/* ============================================
   SMOOTH SCROLL FOR NAV LINKS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
});


/* ============================================
   SCROLL-TRIGGERED FADE-IN ANIMATIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all elements
    fadeElements.forEach(el => el.classList.add('visible'));
  }
});


/* ============================================
   SKILL BAR ANIMATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            // Trigger the width transition by re-setting the inline width
            const width = entry.target.style.width;
            entry.target.style.width = '0';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                entry.target.style.width = width;
              });
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3
      }
    );

    skillBars.forEach(bar => observer.observe(bar));
  }
});


/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.style.boxShadow = document.body.classList.contains(OFFICE)
        ? '0 2px 20px rgba(0, 0, 0, 0.5)'
        : '0 2px 20px rgba(0, 0, 0, 0.08)';
    } else {
      navbar.style.boxShadow = document.body.classList.contains(OFFICE)
        ? '0 2px 20px rgba(0, 0, 0, 0.4)'
        : 'none';
    }

    lastScroll = currentScroll;
  }, { passive: true });
});


/* ============================================
   CONTACT FORM (Formspree)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> Sending...';
      btn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          showToast('Message sent successfully!', 'success');
          form.reset();
        } else {
          showToast('Something went wrong. Please try again.', 'error');
        }
      } catch {
        showToast('Network error. Please try again.', 'error');
      }

      btn.innerHTML = originalText;
      btn.disabled = false;
    });
  });

  function showToast(message, type) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-' + type;
    toast.innerHTML = '<span class="material-symbols-outlined text-lg" style="font-variation-settings: \'FILL\' 1;">' +
      (type === 'success' ? 'check_circle' : 'error') + '</span>' + message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast-visible'));
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});


/* ============================================
   TEAM RADIO GENERATOR (F1)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Generate waveform bars
  const waveform = document.getElementById('radio-waveform');
  if (waveform) {
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement('div');
      bar.className = 'radio-bar';
      waveform.appendChild(bar);
    }
  }

  const radioMessages = [
    { msg: "Box, box, box! We're switching to the machine learning compound.", driver: "KOTHA, S.", circuit: "NEURAL_GP", id: "RADIO_COMM_01" },
    { msg: "The data pipeline is clear. Push, push, push!", driver: "KOTHA, S.", circuit: "ETL_GRAND_PRIX", id: "RADIO_COMM_02" },
    { msg: "We're losing downforce on the legacy codebase. Initiating refactor DRS.", driver: "KOTHA, S.", circuit: "TECH_DEBT_500", id: "RADIO_COMM_03" },
    { msg: "Copy. The model's accuracy is phenomenal. Absolute rocket ship.", driver: "ENGINEER", circuit: "MODEL_EVAL", id: "RADIO_COMM_04" },
    { msg: "Negative, negative. That's not the right schema. Check sector two.", driver: "KOTHA, S.", circuit: "DB_MIGRATE_GP", id: "RADIO_COMM_05" },
    { msg: "Get in there, Sai! P1! What a drive! What a deployment!", driver: "TEAM_PRINCIPAL", circuit: "PROD_DEPLOY", id: "RADIO_COMM_06" },
    { msg: "The tires are gone! ...I mean the cloud credits. The cloud credits are gone.", driver: "KOTHA, S.", circuit: "AWS_BILLING", id: "RADIO_COMM_07" },
    { msg: "We need to pit for fresh dependencies. These packages are degrading fast.", driver: "KOTHA, S.", circuit: "NPM_AUDIT", id: "RADIO_COMM_08" },
    { msg: "Tell the strategist: we're going aggressive. Ship it before standup.", driver: "KOTHA, S.", circuit: "SPRINT_FINAL", id: "RADIO_COMM_09" },
    { msg: "Copy, Sai. You are fastest in sector three. The SQL optimization is brilliant.", driver: "ENGINEER", circuit: "QUERY_PERF", id: "RADIO_COMM_10" },
    { msg: "Multi-21, Seb. I mean... multi-threaded processing. My bad.", driver: "KOTHA, S.", circuit: "PARALLEL_OPS", id: "RADIO_COMM_11" },
    { msg: "Leave me alone, I know what I'm building.", driver: "KOTHA, S.", circuit: "DEEP_FOCUS", id: "RADIO_COMM_12" },
    { msg: "Grazie ragazzi! The CI/CD pipeline is green across the board!", driver: "KOTHA, S.", circuit: "CICD_MONZA", id: "RADIO_COMM_13" },
    { msg: "Is that Glock? No, it's a race condition. Still terrifying.", driver: "KOTHA, S.", circuit: "CONCURRENCY", id: "RADIO_COMM_14" },
    { msg: "No, no, no! That API response time is unacceptable. We need to go again.", driver: "KOTHA, S.", circuit: "LATENCY_TEST", id: "RADIO_COMM_15" },
  ];

  let radioIndex = 0;
  let radioPlaying = false;

  const console = document.getElementById('radio-console');
  const msgEl = document.getElementById('radio-message');
  const driverEl = document.getElementById('radio-driver');
  const circuitEl = document.getElementById('radio-circuit');
  const idEl = document.getElementById('radio-id');
  const lapEl = document.getElementById('radio-lap');
  const waveformEl = document.getElementById('radio-waveform');

  if (console && msgEl) {
    console.addEventListener('click', () => {
      if (radioPlaying) return;
      radioPlaying = true;

      const data = radioMessages[radioIndex % radioMessages.length];
      radioIndex++;

      // Fade out
      msgEl.style.opacity = '0';
      msgEl.style.transform = 'translateY(-8px)';

      // Activate waveform
      if (waveformEl) {
        waveformEl.classList.remove('radio-waveform-idle');
        waveformEl.classList.add('radio-waveform-active');
      }

      setTimeout(() => {
        msgEl.textContent = '\u201C' + data.msg + '\u201D';
        if (driverEl) driverEl.textContent = 'Driver: ' + data.driver;
        if (circuitEl) circuitEl.textContent = 'Circuit: ' + data.circuit;
        if (idEl) idEl.textContent = data.id;
        if (lapEl) lapEl.textContent = 'LAP ' + String(radioIndex).padStart(2, '0') + '/' + radioMessages.length;

        msgEl.style.opacity = '1';
        msgEl.style.transform = 'translateY(0)';

        setTimeout(() => {
          if (waveformEl) {
            waveformEl.classList.remove('radio-waveform-active');
            waveformEl.classList.add('radio-waveform-idle');
          }
          radioPlaying = false;
        }, 2000);
      }, 300);
    });
  }
});


/* ============================================
   SUGGESTION BOX (Office)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const suggestions = [
    { quote: "I tried MIRA for therapy. She told me my management style was 'concerning but entertaining.' Best performance review I've ever gotten.", author: "Michael Scott" },
    { quote: "Sai built a system that knows everything about everyone. Finally, someone who understands the importance of surveillance.", author: "Dwight K. Schrute" },
    { quote: "His OSINT dashboard is basically what I assumed Dwight was doing in the basement, but legal.", author: "Jim Halpert" },
    { quote: "I once tried to use Sai's SQL tool. It corrected my grammar. In a query. I wasn't even writing English.", author: "Kevin Malone" },
    { quote: "Sai asked me to test his chatbot. It asked me about my weekend. I cried for 45 minutes. 10/10 would recommend.", author: "Michael Scott" },
    { quote: "His code is cleaner than the break room has ever been. And that's saying something.", author: "Jim Halpert" },
    { quote: "I asked his AI if I should invest in a beet farm NFT. It said 'insufficient data.' WRONG. Beets are ALWAYS a good investment.", author: "Dwight K. Schrute" },
    { quote: "Sai automated the quarterly reports. Now what am I supposed to pretend to do all day?", author: "Stanley Hudson" },
    { quote: "I tried to hack into his system. It sent me a polite email asking me to stop. Even his security is more professional than me.", author: "Ryan Howard" },
    { quote: "His deployment process has fewer disasters than our office holiday parties. That's the highest compliment I can give.", author: "Toby Flenderson" },
    { quote: "That kid built more useful things in a month than our IT department has in a decade.", author: "Michael Scott" },
    { quote: "Fact: bears eat beets. Fact: Sai's algorithms eat data. Fact: both are apex predators.", author: "Dwight K. Schrute" },
  ];

  let suggestionIndex = 0;
  const paperEl = document.getElementById('suggestion-paper');
  const quoteEl = document.getElementById('suggestion-quote');
  const authorEl = document.getElementById('suggestion-author');
  const triggerBtn = document.getElementById('suggestion-trigger');

  if (triggerBtn && paperEl) {
    triggerBtn.addEventListener('click', () => {
      const data = suggestions[suggestionIndex % suggestions.length];
      suggestionIndex++;

      paperEl.classList.remove('note-open');

      setTimeout(() => {
        if (quoteEl) quoteEl.textContent = '\u201C' + data.quote + '\u201D';
        if (authorEl) authorEl.textContent = '-- ' + data.author;
        paperEl.classList.add('note-open');
      }, 400);
    });
  }
});


/* ============================================
   THEME TOGGLE EASTER EGG
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  let clickTimestamps = [];

  toggleBtn.addEventListener('click', () => {
    const now = Date.now();
    clickTimestamps.push(now);
    clickTimestamps = clickTimestamps.filter(t => now - t < 2000);

    if (clickTimestamps.length >= 5) {
      clickTimestamps = [];
      const isF1 = document.body.classList.contains('theme-f1');

      if (isF1) {
        const flag = document.createElement('div');
        flag.className = 'checkered-flag-burst';
        document.body.appendChild(flag);
        setTimeout(() => flag.remove(), 1000);
      } else {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-burst';
        confetti.textContent = 'DUNDIE AWARD!';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1200);
      }
    }
  });
});
