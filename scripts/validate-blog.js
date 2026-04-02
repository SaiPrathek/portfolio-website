const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const POSTS_JSON = path.join(ROOT, "blog", "posts.json");
const POSTS_DIR = path.join(ROOT, "blog", "posts");

function fail(message) {
  console.error(`Blog validation failed: ${message}`);
  process.exitCode = 1;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateMetadata(posts) {
  const seenIds = new Set();
  const seenSlugs = new Set();

  posts.forEach((post, index) => {
    const label = `posts[${index}]`;
    const requiredKeys = ["slug", "title", "date", "readTime", "excerpt", "tags", "id"];

    requiredKeys.forEach((key) => {
      if (!(key in post)) {
        fail(`${label} is missing "${key}"`);
      }
    });

    if (!isNonEmptyString(post.slug)) fail(`${label}.slug must be a non-empty string`);
    if (!isNonEmptyString(post.title)) fail(`${label}.title must be a non-empty string`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date || "")) fail(`${label}.date must use YYYY-MM-DD`);
    if (!isNonEmptyString(post.readTime)) fail(`${label}.readTime must be a non-empty string`);
    if (!isNonEmptyString(post.excerpt)) fail(`${label}.excerpt must be a non-empty string`);
    if (!Array.isArray(post.tags) || post.tags.length === 0) fail(`${label}.tags must be a non-empty array`);
    if (!/^\d{3}$/.test(post.id || "")) fail(`${label}.id must be zero-padded like 001`);

    if (seenIds.has(post.id)) fail(`${label}.id duplicates ${post.id}`);
    if (seenSlugs.has(post.slug)) fail(`${label}.slug duplicates ${post.slug}`);
    seenIds.add(post.id);
    seenSlugs.add(post.slug);

    const htmlPath = path.join(POSTS_DIR, `${post.slug}.html`);
    if (!fs.existsSync(htmlPath)) {
      fail(`${label} is missing matching file ${path.relative(ROOT, htmlPath)}`);
    }
  });
}

function main() {
  const posts = JSON.parse(fs.readFileSync(POSTS_JSON, "utf8"));
  if (!Array.isArray(posts)) {
    fail("blog/posts.json must be an array");
    return;
  }

  validateMetadata(posts);

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  console.log(`Validated ${posts.length} blog posts.`);
}

main();
