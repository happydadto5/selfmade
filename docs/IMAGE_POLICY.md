Image generation policy for Selfmade

This repository supports optional image generation using a Cloudflare account. Secrets (API token/account id) MUST be stored in `secrets.txt` at the project root and must NOT be committed to the repo.

secrets.txt format (one per line):
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

Policy
- Cloudflare Workers AI currently includes **10,000 Neurons/day** on the free tier. Selfmade caps itself at **5,000 Neurons/day**, which is 50% of that free allocation.
- Because Cloudflare bills image generation by model-dependent Neuron usage rather than a flat "images per day" count, Selfmade uses a conservative default estimate of **500 Neurons per generated image request** until a specific production model/size/step profile is locked in.
- With the current default estimate, Selfmade allows roughly **10 generated images per day** (`5000 / 500 = 10`). If you change the model or generation settings, adjust the per-request cost accordingly.
- The batch runner builds a dynamic prompt that tells the LLM whether images are currently allowed. The LLM must not add image-generation code if images are disallowed.
- The `scripts/generate_image.js` script will create a placeholder SVG and increment the daily quota. Replace or extend it to call the real Cloudflare Images API if you want real images.

Operational notes
- `secrets.txt` is in `.gitignore` to prevent accidental commits.
- If you need to change the budget or per-request estimate, edit `IMAGE_DAILY_BUDGET` and `IMAGE_REQUEST_COST` in `selfmade.bat`, or pass those values directly to `scripts/check_image_quota.js`.
- To reset the counter manually: `node scripts/check_image_quota.js reset 5000 500`.

Security
- Do not commit `secrets.txt`. Treat it like any secret.
- The validation script blocks network calls in code by default; any automated cloud uploads must be explicit and use `scripts/generate_image.js` guarded by quota checks.
