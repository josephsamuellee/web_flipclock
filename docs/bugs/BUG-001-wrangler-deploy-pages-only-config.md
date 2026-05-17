# BUG-001: `wrangler deploy` fails when only Pages fields exist in `wrangler.toml`

**Status:** Resolved (see `wrangler.toml` on `main`).

## Summary

CI or local runs of `npx wrangler deploy` failed with:

```text
Missing entry-point to Worker script or to assets directory
```

Wrangler also warned:

```text
It seems that you have run `wrangler deploy` on a Pages project,
`wrangler pages deploy` should be used instead.
```

## Root cause

The repository used **`pages_build_output_dir`** in `wrangler.toml`, which targets **Cloudflare Pages** workflows. That field does **not** configure a **Workers** deployment.

When the build pipeline (or a developer) runs **`wrangler deploy`**, Wrangler expects either:

- a Worker **`main`** entry point, or  
- a Workers **`[assets]`** directory for static assets,

neither of which was present, so deploy failed.

## Resolution

1. **Workers + static assets (matches `wrangler deploy`):** set `[assets]` with `directory = "./public"` and remove `pages_build_output_dir` from `wrangler.toml` so the project is a normal assets-backed Worker.

2. **Cloudflare Pages (Git-connected project):** in the Pages project settings, use **build output directory** `public` and do **not** use `wrangler deploy` as the production deploy step unless you intend to deploy a Worker. Prefer an empty deploy command (Pages publishes the output dir) or explicitly run `npx wrangler pages deploy public` if you deploy from CI with Wrangler.

## Reference log (Wrangler 4.92.0)

Captured 2026-05-17: warning about Pages vs `wrangler deploy`, then `Missing entry-point…` as above.
