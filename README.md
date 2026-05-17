# web_flipclock

24-hour flip clock static site in `public/`.

## Deploy

- **Workers (recommended if your pipeline runs `wrangler deploy`):** from the repo root, run `npx wrangler deploy`. Configuration is in `wrangler.toml` (`[assets]` → `./public`).

- **Pages:** connect the repo and set the **build output directory** to `public` (no build step required for the static files). Do not point the Pages production command at `wrangler deploy` unless you mean to deploy a Worker; use **`wrangler pages deploy public`** if you deploy with Wrangler from CI.

<img width="959" height="575" alt="image" src="https://github.com/user-attachments/assets/cb4c1eb1-b664-429b-bc88-1b9f772c2d52" />
