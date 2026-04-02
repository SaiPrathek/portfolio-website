/**
 * Blog Post Generator
 * Fetches trending topics, generates a post via Anthropic, saves it to blog/posts/,
 * updates blog/posts.json, and optionally commits the result.
 *
 * Usage:
 *   node scripts/generate-post.js
 *   node scripts/generate-post.js --commit
 *
 * Requires:
 *   ANTHROPIC_API_KEY env var
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { buildPostHTML } = require("./post-template");

const ROOT = path.join(__dirname, "..");
const POSTS_JSON = path.join(ROOT, "blog", "posts.json");
const POSTS_DIR = path.join(ROOT, "blog", "posts");
const SHOULD_COMMIT = process.argv.includes("--commit");

function loadEnvFile() {
  const envFile = path.join(ROOT, ".env");
  if (!fs.existsSync(envFile)) return;

  fs.readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;

      const [key, ...rest] = trimmed.split("=");
      if (!key || rest.length === 0 || process.env[key.trim()]) return;
      process.env[key.trim()] = rest.join("=").trim();
    });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "saiprathek-blog-bot/2.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`JSON parse failed for ${url}: ${error.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

async function getHNTopStories() {
  const ids = await fetchJSON("https://hacker-news.firebaseio.com/v0/topstories.json");
  const topTen = ids.slice(0, 10);
  const stories = await Promise.all(
    topTen.map((id) => fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
  );

  return stories
    .filter((story) => story && story.title && story.score > 50)
    .map((story) => ({
      title: story.title,
      url: story.url || "",
      score: story.score,
      source: "HackerNews",
    }));
}

async function getRedditPosts(subreddit) {
  const data = await fetchJSON(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
  return data.data.children
    .map((child) => child.data)
    .filter((post) => !post.stickied && post.score > 100)
    .slice(0, 5)
    .map((post) => ({
      title: post.title,
      url: `https://reddit.com${post.permalink}`,
      score: post.score,
      source: `r/${subreddit}`,
    }));
}

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const req = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.content || !parsed.content[0]?.text) {
              reject(new Error(`Unexpected Claude response: ${data}`));
              return;
            }
            resolve(parsed.content[0].text);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

function ensureUniqueSlug(baseSlug, existingPosts) {
  const existingSlugs = new Set(existingPosts.map((post) => post.slug));
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;
  while (existingSlugs.has(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
  return candidate;
}

function parseModelResponse(responseText) {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in model response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const requiredFields = ["title", "excerpt", "tags", "readTime", "content"];
  requiredFields.forEach((field) => {
    if (!(field in parsed)) {
      throw new Error(`Missing required field "${field}" in model response`);
    }
  });

  if (!Array.isArray(parsed.tags) || parsed.tags.length === 0) {
    throw new Error("Model response must include at least one tag");
  }

  return parsed;
}

function commitGeneratedPost(postMeta) {
  const relativePostPath = path.join("blog", "posts", `${postMeta.slug}.html`);
  execFileSync("git", ["add", "blog/posts.json", relativePostPath], { cwd: ROOT, stdio: "inherit" });
  execFileSync("git", ["commit", "-m", `blog: ${postMeta.title.substring(0, 60)}`], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

async function main() {
  loadEnvFile();
  console.log("Starting blog post generation...");

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY env var not set");
  }

  console.log("Fetching trending topics...");
  const [hnStories, mlPosts, futurologyPosts, slatestarPosts] = await Promise.allSettled([
    getHNTopStories(),
    getRedditPosts("MachineLearning"),
    getRedditPosts("Futurology"),
    getRedditPosts("slatestarcodex"),
  ]);

  const topics = [
    ...(hnStories.value || []).slice(0, 5),
    ...(mlPosts.value || []).slice(0, 3),
    ...(futurologyPosts.value || []).slice(0, 3),
    ...(slatestarPosts.value || []).slice(0, 2),
  ];

  if (!topics.length) {
    throw new Error("No candidate topics were found");
  }

  const topicList = topics
    .map((topic) => `- [${topic.source}] ${topic.title} (score: ${topic.score})`)
    .join("\n");

  console.log(`Found ${topics.length} trending topics`);
  console.log("Generating post with Claude...");

  const prompt = `You are a blog writer for Sai Prathek Kotha's personal portfolio at saiprathek.com.

Sai is a Data Scientist specialising in AI, ML, NLP, and cybersecurity. His blog "The Debrief" publishes long-form posts on AI, life, and productivity.

TRENDING TOPICS TODAY:
${topicList}

WRITING STYLE REQUIREMENTS:
- Tim Urban (waitbutwhy.com) meets xkcd - deep dives with unexpected humour, ASCII diagrams, footnotes
- Start with a mundane observation or unexpected angle, then go deep
- Use analogies that connect AI/tech concepts to everyday human experience
- Include at least one ASCII diagram or text visualisation
- Include 1-2 footnotes (marked with <sup>1</sup> etc, collected at bottom in <div class="footnote"> block)
- Minimum 900 words, maximum 1600 words
- Tone: smart but not academic, funny but not try-hard, British spelling preferred
- Use <h2> for section headers, <p> for paragraphs, <div class="callout"> for block quotes, <div class="ascii-diagram"> for ASCII art, <div class="pull-quote"> for pull quotes
- Connect the topic to life, self-improvement, or human behaviour in some way
- End with something memorable - a punchline, a reframe, or a surprising callback

Pick the most interesting topic from the list, not just the highest-scoring one.

OUTPUT FORMAT (JSON only, no markdown, no explanation):
{
  "title": "Post title",
  "excerpt": "2-3 sentence hook for the blog listing page",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "readTime": "X min",
  "content": "Full HTML post body using the approved tags"
}`;

  const response = await callClaude(prompt);
  const postData = parseModelResponse(response);

  const existingPosts = JSON.parse(fs.readFileSync(POSTS_JSON, "utf8"));
  const nextId = String(existingPosts.length + 1).padStart(3, "0");
  const dateStr = new Date().toISOString().split("T")[0];
  const baseSlug = `${dateStr}-${slugify(postData.title)}`;
  const slug = ensureUniqueSlug(baseSlug, existingPosts);

  const postMeta = {
    slug,
    title: postData.title.trim(),
    date: dateStr,
    readTime: String(postData.readTime || "7 min").trim(),
    excerpt: postData.excerpt.trim(),
    tags: postData.tags.map((tag) => String(tag).trim()).filter(Boolean),
    id: nextId,
  };

  const html = buildPostHTML({
    ...postMeta,
    content: String(postData.content || "").trim(),
  });

  const htmlPath = path.join(POSTS_DIR, `${slug}.html`);
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log(`Saved post: ${path.relative(ROOT, htmlPath)}`);

  existingPosts.push(postMeta);
  fs.writeFileSync(POSTS_JSON, `${JSON.stringify(existingPosts, null, 2)}\n`, "utf8");
  console.log("Updated blog/posts.json");

  if (SHOULD_COMMIT) {
    console.log("Creating git commit...");
    commitGeneratedPost(postMeta);
    console.log("Commit created. Push manually when ready.");
  } else {
    console.log("Skipping git commit. Re-run with --commit to create one automatically.");
  }

  console.log(`Done. New post URL: https://www.saiprathek.com/blog/posts/${slug}.html`);
}

main().catch((error) => {
  console.error(`Generation failed: ${error.message}`);
  process.exit(1);
});
