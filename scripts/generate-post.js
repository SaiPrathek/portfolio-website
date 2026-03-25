/**
 * Daily Blog Post Generator
 * Fetches trending topics from HN + Reddit, generates a Tim Urban-style post via Claude API,
 * saves to blog/posts/ and updates blog/posts.json, then commits and pushes.
 *
 * Usage: node scripts/generate-post.js
 * Requires: ANTHROPIC_API_KEY env var
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

// Load .env file if present (fallback for scheduled task context)
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}
const POSTS_JSON = path.join(ROOT, 'blog', 'posts.json');
const POSTS_DIR = path.join(ROOT, 'blog', 'posts');

// ── Fetch helpers ──────────────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'saiprathek-blog-bot/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error(`JSON parse failed for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

async function getHNTopStories() {
  const ids = await fetchJSON('https://hacker-news.firebaseio.com/v0/topstories.json');
  const top10 = ids.slice(0, 10);
  const stories = await Promise.all(
    top10.map(id => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
  );
  return stories
    .filter(s => s && s.title && s.score > 50)
    .map(s => ({ title: s.title, url: s.url || '', score: s.score, source: 'HackerNews' }));
}

async function getRedditPosts(subreddit) {
  const data = await fetchJSON(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
  return data.data.children
    .map(c => c.data)
    .filter(p => !p.stickied && p.score > 100)
    .slice(0, 5)
    .map(p => ({ title: p.title, url: `https://reddit.com${p.permalink}`, score: p.score, source: `r/${subreddit}` }));
}

// ── Claude API call ────────────────────────────────────────────────────────────

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.content && parsed.content[0]) {
            resolve(parsed.content[0].text);
          } else {
            reject(new Error(`Unexpected Claude response: ${data}`));
          }
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── HTML post template ─────────────────────────────────────────────────────────

function buildPostHTML({ slug, title, date, readTime, excerpt, tags, content, id }) {
  const tagChips = tags.map(t =>
    `<span class="tag-chip" style="display:inline-block;padding:2px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;background:var(--surface-container-high);color:var(--secondary);font-family:var(--font-mono);">${t}</span>`
  ).join('\n      ');

  const contentHTML = content
    // Wrap bare paragraphs
    .split('\n\n')
    .map(para => {
      para = para.trim();
      if (!para) return '';
      if (para.startsWith('<')) return para; // already HTML
      return `<p>${para}</p>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | The Debrief</title>
  <meta name="description" content="${excerpt.substring(0, 160)}" />
  <link rel="canonical" href="https://www.saiprathek.com/blog/posts/${slug}.html" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${excerpt.substring(0, 160)}" />
  <meta property="og:url" content="https://www.saiprathek.com/blog/posts/${slug}.html" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <script src="https://cdn.tailwindcss.com"><\/script>
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
      <a href="/blog/" class="f1-only text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity" style="color:var(--secondary);font-family:var(--font-mono);">← All Posts</a>
      <a href="/blog/" class="office-only text-xs font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity" style="color:var(--secondary);">← All Memos</a>
      <button id="theme-toggle" aria-label="Toggle theme" class="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all" style="border-color:var(--primary);">
        <span class="material-symbols-outlined text-base" style="color:var(--primary);font-variation-settings:'FILL' 1;">directions_car</span>
        <span class="text-xs font-black uppercase tracking-widest" style="color:var(--primary);font-family:var(--font-headline);">F1</span>
        <span class="w-8 h-4 rounded-full relative" style="background:var(--primary);">
          <span class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all f1-only" style="left:2px;"></span>
          <span class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all office-only" style="right:2px;"></span>
        </span>
        <span class="text-xs font-black uppercase tracking-widest" style="color:var(--primary);font-family:var(--font-headline);">OFFICE</span>
        <span class="material-symbols-outlined text-base" style="color:var(--primary);font-variation-settings:'FILL' 1;">assignment</span>
      </button>
    </div>
  </nav>

  <header class="pt-28 pb-12 px-6 max-w-3xl mx-auto">
    <div class="f1-only">
      <span class="text-[10px] font-bold uppercase tracking-[0.3em] block mb-3" style="color:var(--primary);font-family:var(--font-mono);">LAP REPORT #${id} · ${date} · ${readTime} read</span>
      <h1 class="text-4xl md:text-5xl font-black italic tracking-tight leading-tight mb-4" style="font-family:var(--font-headline);">${title}</h1>
    </div>
    <div class="office-only">
      <span class="text-[10px] font-semibold uppercase tracking-widest block mb-3" style="color:var(--primary);">MEMO #${id} · ${date} · ${readTime} read</span>
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

  <script src="/js/main.js"><\/script>
  <script>
    const bar = document.getElementById('progress-bar');
    window.addEventListener('scroll', () => {
      bar.style.width = Math.min(100, (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) + '%';
    }, { passive: true });
  <\/script>
</body>
</html>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏁 Starting blog post generation...');

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY env var not set');
  }

  // 1. Fetch trending topics
  console.log('📡 Fetching trending topics...');
  const [hnStories, mlPosts, futurologyPosts, slatestarPosts] = await Promise.allSettled([
    getHNTopStories(),
    getRedditPosts('MachineLearning'),
    getRedditPosts('Futurology'),
    getRedditPosts('slatestarcodex'),
  ]);

  const topics = [
    ...(hnStories.value || []).slice(0, 5),
    ...(mlPosts.value || []).slice(0, 3),
    ...(futurologyPosts.value || []).slice(0, 3),
    ...(slatestarPosts.value || []).slice(0, 2),
  ];

  const topicList = topics.map(t => `- [${t.source}] ${t.title} (score: ${t.score})`).join('\n');
  console.log(`Found ${topics.length} trending topics`);

  // 2. Generate post with Claude
  console.log('🤖 Generating post with Claude...');

  const prompt = `You are a blog writer for Sai Prathek Kotha's personal portfolio at saiprathek.com.

Sai is a Data Scientist specialising in AI, ML, NLP, and cybersecurity. His blog "The Debrief" publishes long-form posts on AI, life, and productivity.

TRENDING TOPICS TODAY:
${topicList}

WRITING STYLE REQUIREMENTS:
- Tim Urban (waitbutwhy.com) meets xkcd — deep dives with unexpected humour, ASCII diagrams, footnotes
- Start with a mundane observation or unexpected angle, then go deep
- Use analogies that connect AI/tech concepts to everyday human experience
- Include at least one ASCII diagram or text visualisation
- Include 1-2 footnotes (marked with <sup>1</sup> etc, collected at bottom in <div class="footnote"> block)
- Minimum 900 words, maximum 1600 words
- Tone: smart but not academic, funny but not try-hard, British spelling preferred
- Use <h2> for section headers, <p> for paragraphs, <div class="callout"> for block quotes, <div class="ascii-diagram"> for ASCII art, <div class="pull-quote"> for pull quotes
- Connect the topic to life, self-improvement, or human behaviour in some way
- End with something memorable — a punchline, a reframe, or a surprising callback

Pick the MOST INTERESTING topic from the list (don't just pick the highest score — pick the one with the best story potential).

OUTPUT FORMAT (JSON only, no markdown, no explanation):
{
  "title": "Post title (Tim Urban style — punchy, curious, slightly absurd)",
  "excerpt": "2-3 sentence hook for the blog listing page",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "readTime": "X min",
  "content": "Full HTML post body (use the HTML tags described above, NO wrapping in backticks or code blocks — pure HTML string)"
}`;

  const response = await callClaude(prompt);

  let postData;
  try {
    // Extract JSON if wrapped in anything
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    postData = JSON.parse(jsonMatch[0]);
  } catch(e) {
    throw new Error(`Failed to parse Claude response as JSON: ${e.message}\n\nResponse: ${response.substring(0, 500)}`);
  }

  // 3. Load existing posts.json
  const existingPosts = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8'));
  const nextId = String(existingPosts.length + 1).padStart(3, '0');

  // 4. Build slug and date
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const slug = `${dateStr}-${postData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)}`;

  const postMeta = {
    slug,
    title: postData.title,
    date: dateStr,
    readTime: postData.readTime || '7 min',
    excerpt: postData.excerpt,
    tags: postData.tags || ['AI', 'Life'],
    id: nextId
  };

  // 5. Build and save HTML
  const html = buildPostHTML({ ...postMeta, content: postData.content });
  const htmlPath = path.join(POSTS_DIR, `${slug}.html`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`✅ Post saved: ${htmlPath}`);

  // 6. Update posts.json
  existingPosts.push(postMeta);
  fs.writeFileSync(POSTS_JSON, JSON.stringify(existingPosts, null, 2), 'utf8');
  console.log('✅ posts.json updated');

  // 7. Commit and push
  console.log('🚀 Committing and deploying...');
  try {
    execSync(`cd "${ROOT}" && git add blog/posts.json "blog/posts/${slug}.html"`, { stdio: 'inherit' });
    execSync(`cd "${ROOT}" && git commit -m "blog: ${postData.title.substring(0, 60)}"`, { stdio: 'inherit' });
    execSync(`cd "${ROOT}" && git push origin master`, { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub');
  } catch(e) {
    console.error('Git push failed (non-fatal):', e.message);
  }

  console.log(`\n🏁 Done! New post: "${postData.title}"`);
  console.log(`   URL: https://www.saiprathek.com/blog/posts/${slug}.html`);
}

main().catch(err => {
  console.error('❌ Generation failed:', err.message);
  process.exit(1);
});
