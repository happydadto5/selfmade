Image generation policy for Selfmade

This repository supports optional image generation using a Cloudflare account. Secrets (API token/account id) MUST be stored in `secrets.txt` at the project root and must NOT be committed to the repo.

secrets.txt format (one per line):
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

Policy
- Image generation is limited to 3-4 images per day by default. The pipeline enforces this via `scripts/check_image_quota.js`.
- The batch runner builds a dynamic prompt that tells the LLM whether images are currently allowed. The LLM must not add image-generation code if images are disallowed.
- The `scripts/generate_image.js` script will create a placeholder SVG and increment the daily quota. Replace or extend it to call the real Cloudflare Images API if you want real images.

Operational notes
- `secrets.txt` is in `.gitignore` to prevent accidental commits.
- If you need to change the daily limit, edit the calls to `check_image_quota.js` in `selfmade.bat` (default 4).
- To reset the counter manually: `node scripts/check_image_quota.js reset 4`.

Security
- Do not commit `secrets.txt`. Treat it like any secret.
- The validation script blocks network calls in code by default; any automated cloud uploads must be explicit and use `scripts/generate_image.js` guarded by quota checks.
