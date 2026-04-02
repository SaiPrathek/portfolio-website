# Portfolio Website

Static personal portfolio and blog for Sai Prathek Kotha.

## Stack

- Static HTML pages
- Tailwind via CDN
- Custom CSS in `css/styles.css`
- Vanilla JavaScript in focused files under `js/`
- Blog metadata in `blog/posts.json`

## Local Development

```bash
npm install
npm run dev
```

The site is served directly from the repository root. There is no build step.

## Project Structure

- `index.html`: main portfolio page
- `blog/index.html`: blog landing page
- `blog/posts/*.html`: individual blog posts
- `css/styles.css`: all site styling
- `js/`: shared frontend behavior split by concern
- `scripts/generate-post.js`: AI-assisted blog generation
- `scripts/post-template.js`: shared HTML template for generated posts
- `scripts/validate-blog.js`: metadata and file integrity checks for the blog

## Frontend Scripts

- `js/core.js`: shared constants and helpers
- `js/theme.js`: theme persistence and theme toggle behavior
- `js/nav.js`: mobile menu, smooth scroll, navbar shadow
- `js/animations.js`: fade-in and skill bar animations
- `js/contact.js`: Formspree handling and toast notifications
- `js/interactive.js`: F1 radio and Office suggestion interactions
- `js/blog.js`: footnotes, preview cards, related posts, post navigation

## Blog Workflow

Manual post updates:

1. Add or edit a file in `blog/posts/`
2. Add matching metadata in `blog/posts.json`
3. Run `npm run validate:blog`

Generated post workflow:

1. Set `ANTHROPIC_API_KEY` in `.env`
2. Run `npm run generate:post`
3. Review the generated HTML and metadata
4. Run `npm run validate:blog`
5. Commit manually, or run `node scripts/generate-post.js --commit`

## Formatting

```bash
npm run format
```

## Deployment

The repository contains config for static hosting platforms including Vercel and Netlify.
