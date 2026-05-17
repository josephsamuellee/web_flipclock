# web_flipclock

24-hour flip clock static site in `public/`.

## Deploy

- **Workers (recommended if your pipeline runs `wrangler deploy`):** from the repo root, run `npx wrangler deploy`. Configuration is in `wrangler.toml` (`[assets]` → `./public`).

- **Pages:** connect the repo and set the **build output directory** to `public` (no build step required for the static files). Do not point the Pages production command at `wrangler deploy` unless you mean to deploy a Worker; use **`wrangler pages deploy public`** if you deploy with Wrangler from CI.

## Bugs

- [BUG-001: `wrangler deploy` vs Pages-only config](docs/bugs/BUG-001-wrangler-deploy-pages-only-config.md)
