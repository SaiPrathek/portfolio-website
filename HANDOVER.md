# Handover Context — Sai Prathek Portfolio

## Project

Static personal portfolio and blog for Sai Prathek Kotha. It uses static HTML,
Tailwind via CDN, custom CSS, and focused vanilla-JavaScript modules.

## Start here

1. Read `README.md`.
2. Run `npm install` then `npm run dev`; there is no production build step.
3. For any blog change, update both the post HTML and `blog/posts.json`, then
   run `npm run validate:blog`.
4. Run `npm run format` before committing formatting changes.

## Key locations

- `index.html`: portfolio homepage.
- `css/styles.css`: site styling.
- `js/`: shared interactive behavior.
- `blog/posts/` and `blog/posts.json`: blog content and metadata.
- `scripts/`: blog generation and validation.

## Security and deployment

Do not commit `.env` or API keys. The repository includes Vercel and Netlify
configuration for static deployment.
