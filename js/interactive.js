(() => {
  function initRadioConsole() {
    const waveform = document.getElementById("radio-waveform");
    if (waveform && !waveform.children.length) {
      for (let index = 0; index < 20; index += 1) {
        const bar = document.createElement("div");
        bar.className = "radio-bar";
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

    const consoleEl = document.getElementById("radio-console");
    const messageEl = document.getElementById("radio-message");
    const driverEl = document.getElementById("radio-driver");
    const circuitEl = document.getElementById("radio-circuit");
    const idEl = document.getElementById("radio-id");
    const lapEl = document.getElementById("radio-lap");

    if (!consoleEl || !messageEl) return;

    consoleEl.addEventListener("click", () => {
      if (radioPlaying) return;
      radioPlaying = true;

      const data = radioMessages[radioIndex % radioMessages.length];
      radioIndex += 1;

      messageEl.style.opacity = "0";
      messageEl.style.transform = "translateY(-8px)";

      if (waveform) {
        waveform.classList.remove("radio-waveform-idle");
        waveform.classList.add("radio-waveform-active");
      }

      setTimeout(() => {
        messageEl.textContent = `"${data.msg}"`;
        if (driverEl) driverEl.textContent = `Driver: ${data.driver}`;
        if (circuitEl) circuitEl.textContent = `Circuit: ${data.circuit}`;
        if (idEl) idEl.textContent = data.id;
        if (lapEl) lapEl.textContent = `LAP ${String(radioIndex).padStart(2, "0")}/${radioMessages.length}`;

        messageEl.style.opacity = "1";
        messageEl.style.transform = "translateY(0)";

        setTimeout(() => {
          if (waveform) {
            waveform.classList.remove("radio-waveform-active");
            waveform.classList.add("radio-waveform-idle");
          }
          radioPlaying = false;
        }, 2000);
      }, 300);
    });
  }

  function initSuggestionBox() {
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
    const paperEl = document.getElementById("suggestion-paper");
    const quoteEl = document.getElementById("suggestion-quote");
    const authorEl = document.getElementById("suggestion-author");
    const triggerBtn = document.getElementById("suggestion-trigger");

    if (!triggerBtn || !paperEl) return;

    triggerBtn.addEventListener("click", () => {
      const data = suggestions[suggestionIndex % suggestions.length];
      suggestionIndex += 1;

      paperEl.classList.remove("note-open");

      setTimeout(() => {
        if (quoteEl) quoteEl.textContent = `"${data.quote}"`;
        if (authorEl) authorEl.textContent = `-- ${data.author}`;
        paperEl.classList.add("note-open");
      }, 400);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initRadioConsole();
    initSuggestionBox();
  });
})();
