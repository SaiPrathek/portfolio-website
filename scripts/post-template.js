function escapeHtmlAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrapParagraphs(content) {
  return content
    .split("\n\n")
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<")) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join("\n\n");
}

function buildPostHTML({ slug, title, date, readTime, excerpt, tags, content, id }) {
  const safeTitle = escapeHtmlAttribute(title);
  const safeExcerpt = escapeHtmlAttribute(excerpt.substring(0, 160));
  const contentHTML = wrapParagraphs(content);
  const tagChips = tags
    .map(
      (tag) =>
        `<span class="tag-chip" style="display:inline-block;padding:2px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;background:var(--surface-container-high);color:var(--secondary);font-family:var(--font-mono);">${tag}</span>`
    )
    .join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} | The Debrief</title>
  <meta name="description" content="${safeExcerpt}" />
  <link rel="canonical" href="https://www.saiprathek.com/blog/posts/${slug}.html" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeExcerpt}" />
  <meta property="og:url" content="https://www.saiprathek.com/blog/posts/${slug}.html" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/css/styles.css" />
  <style>
    .f1-only{display:none}.office-only{display:none}
    body.theme-f1 .f1-only{display:block}body.theme-office .office-only{display:block}
    #progress-bar{position:fixed;top:0;left:0;height:3px;width:0%;z-index:9999;transition:width .1s linear}
    body.theme-f1 #progress-bar{background:var(--primary)}body.theme-office #progress-bar{background:var(--primary)}
    .post-body{font-size:1.0625rem;line-height:1.85;max-width:680px;margin:0 auto}
    body.theme-f1 .post-body{font-family:var(--font-body);color:var(--on-surface)}
    body.theme-office .post-body{font-family:'Newsreader',serif;color:var(--on-surface);font-size:1.125rem}
    .post-body h2{font-size:1.6rem;font-weight:700;margin:2.5rem 0 1rem;line-height:1.3}
    body.theme-f1 .post-body h2{font-family:var(--font-headline);font-style:italic;text-transform:uppercase;letter-spacing:-.02em}
    body.theme-office .post-body h2{font-family:'Newsreader',serif;font-style:italic}
    .post-body p{margin-bottom:1.4rem}
    .post-body a{text-decoration:underline;text-underline-offset:3px}
    body.theme-f1 .post-body a{color:var(--primary)}body.theme-office .post-body a{color:var(--primary)}
    .callout{padding:1.25rem 1.5rem;margin:2rem 0;border-left:4px solid var(--primary);font-style:italic;font-size:.975rem}
    body.theme-f1 .callout{background:var(--surface-container-lowest)}
    body.theme-office .callout{background:var(--surface-container-low);font-family:'Newsreader',serif}
    .ascii-diagram{font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.6;padding:1.5rem 2rem;margin:2rem 0;overflow-x:auto;white-space:pre;background:#1a1c1c;color:#e2e2e2}
    .pull-quote{font-size:1.4rem;font-style:italic;font-weight:300;padding:1.5rem 0;margin:2rem 0;border-top:2px solid var(--primary);border-bottom:1px solid var(--outline-variant)}
    body.theme-office .pull-quote{font-family:'Newsreader',serif}
    .footnote{font-size:.8rem;opacity:.65;border-top:1px solid var(--outline-variant);margin-top:3rem;padding-top:1.5rem}
    sup{color:var(--primary);font-size:.65em;font-weight:700}
  </style>
</head>
<body class="theme-f1">
  <div id="progress-bar"></div>
  <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style="background:var(--surface);border-bottom:1px solid var(--outline-variant);">
    <a href="/blog/" class="f1-only font-black italic tracking-tighter text-xl" style="color:var(--on-surface);font-family:var(--font-headline);">THE DEBRIEF</a>
    <a href="/blog/" class="office-only font-semibold tracking-widest text-sm uppercase" style="color:var(--on-surface);font-family:var(--font-headline);">BULLETIN BOARD</a>
    <div class="flex items-center gap-6">
      <a href="/blog/" class="f1-only text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity" style="color:var(--secondary);font-family:var(--font-mono);">&larr; All Posts</a>
      <a href="/blog/" class="office-only text-xs font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity" style="color:var(--secondary);">&larr; All Memos</a>
      <button id="theme-toggle" aria-label="Toggle theme" class="theme-toggle-btn">
        <span class="material-symbols-outlined" style="font-size:18px;color:var(--primary);font-variation-settings:'FILL' 1;">light_mode</span>
        <span class="toggle-switch-track"><span class="toggle-switch-thumb"></span></span>
        <span class="material-symbols-outlined" style="font-size:18px;color:var(--primary);font-variation-settings:'FILL' 1;">dark_mode</span>
      </button>
    </div>
  </nav>

  <header class="pt-28 pb-12 px-6 max-w-3xl mx-auto">
    <div class="f1-only">
      <span class="text-[10px] font-bold uppercase tracking-[0.3em] block mb-3" style="color:var(--primary);font-family:var(--font-mono);">LAP REPORT #${id} &middot; ${date} &middot; ${readTime} read</span>
      <h1 class="text-4xl md:text-5xl font-black italic tracking-tight leading-tight mb-4" style="font-family:var(--font-headline);">${title}</h1>
    </div>
    <div class="office-only">
      <span class="text-[10px] font-semibold uppercase tracking-widest block mb-3" style="color:var(--primary);">MEMO #${id} &middot; ${date} &middot; ${readTime} read</span>
      <h1 class="text-4xl md:text-5xl font-semibold italic leading-tight mb-4" style="font-family:'Newsreader',serif;">${title}</h1>
    </div>
    <p class="text-base" style="color:var(--secondary);">${excerpt}</p>
    <div class="flex flex-wrap gap-2 mt-4">
      ${tagChips}
    </div>
    <div class="mt-6 h-px" style="background:var(--outline-variant);"></div>
  </header>

  <main class="px-6 pb-24 max-w-3xl mx-auto">
    <div class="post-body">
      ${contentHTML}
    </div>
  </main>

  <section class="px-6 pb-24 max-w-3xl mx-auto">
    <div class="flex justify-between items-center pt-8" style="border-top:1px solid var(--outline-variant);">
      <a href="/blog/" class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style="color:var(--primary);font-family:var(--font-mono);">
        <span class="material-symbols-outlined text-base">arrow_back</span>
        <span class="f1-only">All Lap Reports</span>
        <span class="office-only">All Memos</span>
      </a>
      <a href="/" class="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity" style="font-family:var(--font-mono);">saiprathek.com</a>
    </div>
  </section>

  <script src="/js/core.js"></script>
  <script src="/js/theme.js"></script>
  <script src="/js/nav.js"></script>
  <script src="/js/animations.js"></script>
  <script src="/js/contact.js"></script>
  <script src="/js/interactive.js"></script>
  <script src="/js/blog.js"></script>
  <script src="/js/main.js"></script>
  <script>
    const bar = document.getElementById("progress-bar");
    window.addEventListener("scroll", () => {
      bar.style.width = Math.min(100, (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) + "%";
    }, { passive: true });
  </script>
</body>
</html>`;
}

module.exports = {
  buildPostHTML,
};
