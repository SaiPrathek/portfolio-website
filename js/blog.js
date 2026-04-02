(() => {
  function initFootnoteTooltips() {
    const postBody = document.querySelector(".post-body");
    const footnoteSection = document.querySelector(".footnote");
    if (!postBody || !footnoteSection) return;

    const footnoteMap = new Map();
    footnoteSection.querySelectorAll("p").forEach((paragraph) => {
      const marker = paragraph.querySelector("sup");
      if (!marker) return;

      const index = (marker.textContent || "").trim();
      const noteText = paragraph.textContent.replace(marker.textContent, "").trim();
      if (index && noteText) {
        footnoteMap.set(index, noteText);
      }
    });

    postBody.querySelectorAll("sup").forEach((citation) => {
      if (citation.closest(".footnote")) return;

      const index = (citation.textContent || "").trim();
      const noteText = footnoteMap.get(index);
      if (!noteText) return;

      citation.classList.add("footnote-cite");
      citation.setAttribute("tabindex", "0");
      citation.setAttribute("aria-label", `Footnote ${index}: ${noteText}`);
      citation.setAttribute("data-footnote", noteText);
    });
  }

  function buildBlogPreviewCards(posts, theme) {
    return posts
      .map((post) => {
        const label = theme === "f1" ? `LAP REPORT #${String(post.id).padStart(3, "0")}` : `MEMO #${String(post.id).padStart(3, "0")}`;
        const tags = (post.tags || [])
          .slice(0, 3)
          .map((tag) => `<span class="blog-prev-tag">${tag}</span>`)
          .join("");

        return `
          <a href="/blog/posts/${post.slug}.html" class="blog-prev-card group">
            <div class="blog-prev-card-inner">
              <div class="blog-prev-meta">
                <span class="blog-prev-number">${label}</span>
                <span class="blog-prev-time">${post.readTime}</span>
              </div>
              <h3 class="blog-prev-title">${post.title}</h3>
              <p class="blog-prev-excerpt">${post.excerpt}</p>
              <div class="blog-prev-tags">${tags}</div>
            </div>
          </a>`;
      })
      .join("");
  }

  function buildBlogIndexCards(posts) {
    return posts
      .slice()
      .reverse()
      .map(
        (post, index, reversedPosts) => `
          <article class="post-card" onclick="window.location='/blog/posts/${post.slug}.html'">
            <div class="f1-only p-8 relative overflow-hidden" style="background: var(--surface-container-lowest); border-left: 4px solid var(--primary);">
              <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <span class="text-[10px] uppercase tracking-widest block mb-1" style="color: var(--primary); font-family: var(--font-mono);">LAP REPORT #${post.id || String(reversedPosts.length - index).padStart(3, "0")}</span>
                  <h2 class="text-2xl md:text-3xl font-extrabold italic tracking-tight leading-tight" style="font-family: var(--font-headline);">${post.title}</h2>
                </div>
                <div class="flex gap-4 shrink-0 text-right">
                  <div>
                    <span class="block text-[10px] uppercase" style="color: var(--secondary); font-family: var(--font-mono);">Filed</span>
                    <span class="block text-sm font-bold" style="font-family: var(--font-mono);">${post.date}</span>
                  </div>
                  <div>
                    <span class="block text-[10px] uppercase" style="color: var(--secondary); font-family: var(--font-mono);">Read</span>
                    <span class="block text-sm font-bold" style="color: var(--primary); font-family: var(--font-mono);">${post.readTime}</span>
                  </div>
                </div>
              </div>
              <p class="text-sm leading-relaxed mb-4" style="color: var(--secondary); font-family: var(--font-body);">${post.excerpt}</p>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap gap-2">${post.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}</div>
                <span class="text-xs font-bold uppercase tracking-widest flex items-center gap-1" style="color: var(--primary); font-family: var(--font-headline);">
                  Read Full Debrief <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
            <div class="office-only p-8 relative overflow-hidden" style="background: var(--surface-container-low); border-left: 4px solid var(--primary);">
              <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <span class="text-[10px] uppercase tracking-widest block mb-1" style="color: var(--primary);">MEMO #${post.id || String(reversedPosts.length - index).padStart(3, "0")}</span>
                  <h2 class="text-2xl md:text-3xl font-semibold italic leading-tight" style="font-family: var(--font-headline);">${post.title}</h2>
                </div>
                <div class="flex gap-4 shrink-0 text-right">
                  <div>
                    <span class="block text-[10px] uppercase" style="color: var(--secondary);">Filed</span>
                    <span class="block text-sm font-semibold">${post.date}</span>
                  </div>
                  <div>
                    <span class="block text-[10px] uppercase" style="color: var(--secondary);">Read</span>
                    <span class="block text-sm font-semibold" style="color: var(--primary);">${post.readTime}</span>
                  </div>
                </div>
              </div>
              <p class="text-sm leading-relaxed mb-4" style="color: var(--secondary);">${post.excerpt}</p>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap gap-2">${post.tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("")}</div>
                <span class="text-xs font-semibold uppercase tracking-widest flex items-center gap-1" style="color: var(--primary);">
                  Read Memo <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </article>`
      )
      .join("");
  }

  function initBlogPreview() {
    const f1El = document.getElementById("blog-preview-cards-f1");
    const officeEl = document.getElementById("blog-preview-cards-office");
    if (!f1El && !officeEl) return;

    fetch("/blog/posts.json")
      .then((response) => {
        if (!response.ok) throw new Error("preview_load_failed");
        return response.json();
      })
      .then((posts) => {
        const latest = posts.slice(-3).reverse();
        if (f1El) f1El.innerHTML = buildBlogPreviewCards(latest, "f1");
        if (officeEl) officeEl.innerHTML = buildBlogPreviewCards(latest, "office");
      })
      .catch(() => {
        if (f1El) f1El.innerHTML = "";
        if (officeEl) officeEl.innerHTML = "";
      });
  }

  function initBlogNav() {
    if (!window.location.pathname.includes("/blog/posts/")) return;

    const slug = window.location.pathname.split("/").pop()?.replace(".html", "");
    if (!slug) return;

    fetch("/blog/posts.json")
      .then((response) => response.json())
      .then((posts) => {
        const currentIndex = posts.findIndex((post) => post.slug === slug);
        if (currentIndex === -1) return;

        const currentPost = posts[currentIndex];
        const previousPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
        const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

        const relatedPosts = posts
          .filter((_, index) => index !== currentIndex)
          .map((post) => ({
            post,
            score: post.tags.filter((tag) => currentPost.tags.includes(tag)).length,
          }))
          .filter((entry) => entry.score > 0)
          .sort((left, right) => right.score - left.score || left.post.id.localeCompare(right.post.id))
          .slice(0, 3)
          .map((entry) => entry.post);

        function navCard(post, direction) {
          const f1Label = direction === "prev" ? "&larr; PREV" : "NEXT &rarr;";
          const officeLabel = direction === "prev" ? "&larr; Previous" : "Next &rarr;";
          const alignClass = direction === "prev" ? "text-left" : "text-right";

          return `
            <a href="/blog/posts/${post.slug}.html" class="blog-nav-card blog-nav-${direction} ${alignClass}">
              <span class="blog-nav-label f1-only">${f1Label}</span>
              <span class="blog-nav-label office-only">${officeLabel}</span>
              <span class="blog-nav-title">${post.title}</span>
            </a>`;
        }

        function relatedCard(post) {
          const tags = post.tags.map((tag) => `<span class="blog-rel-tag">${tag}</span>`).join("");

          return `
            <a href="/blog/posts/${post.slug}.html" class="blog-rel-card">
              <div class="blog-rel-id f1-only">LAP REPORT #${post.id}</div>
              <div class="blog-rel-id office-only">MEMO #${post.id}</div>
              <div class="blog-rel-title">${post.title}</div>
              <div class="blog-rel-excerpt">${post.excerpt}</div>
              <div class="blog-rel-meta">
                <span class="blog-rel-date">${post.date}</span>
                <span class="blog-rel-read">${post.readTime}</span>
              </div>
              <div class="blog-rel-tags">${tags}</div>
            </a>`;
        }

        const navMarkup = `
          <div class="blog-nav-row px-6 max-w-3xl mx-auto">
            ${previousPost ? navCard(previousPost, "prev") : "<div></div>"}
            ${nextPost ? navCard(nextPost, "next") : "<div></div>"}
          </div>`;

        const relatedMarkup = relatedPosts.length
          ? `
            <div class="blog-related px-6 max-w-3xl mx-auto">
              <div class="blog-related-header">
                <span class="f1-only">MORE FROM THE PITS</span>
                <span class="office-only">FROM THE FILING CABINET</span>
              </div>
              <div class="blog-rel-grid">
                ${relatedPosts.map(relatedCard).join("")}
              </div>
            </div>`
          : "";

        const mainEl = document.querySelector("main");
        if (mainEl) {
          mainEl.insertAdjacentHTML("afterend", navMarkup + relatedMarkup);
        }
      })
      .catch(() => {});
  }

  window.PortfolioApp = window.PortfolioApp || {};
  window.PortfolioApp.buildBlogIndexCards = buildBlogIndexCards;

  document.addEventListener("DOMContentLoaded", () => {
    initFootnoteTooltips();
    initBlogPreview();
    initBlogNav();
  });
})();
