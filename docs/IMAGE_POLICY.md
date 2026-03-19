Image generation policy for Selfmade

This repository supports optional image generation using a Cloudflare account. Secrets (API token/account id) MUST be stored in `secrets.txt` at the project root and must NOT be committed to the repo.

secrets.txt format (one per line):
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

Policy
- Selfmade now uses a simple daily **image-credit** budget instead of one flat neuron estimate.
- The app gets **100 image credits per day**.
- A **small image** costs **1 credit**, allowing up to **100 small images per day**.
- A **large image** such as a background costs **10 credits**, allowing up to **10 large images per day**.
- If you add more image profiles later, assign their costs relative to those two defaults.
- The batch runner builds a dynamic prompt that tells the LLM whether images are currently allowed. The LLM must not add image-generation code if images are disallowed.
- The `scripts/generate_image.js` script now calls Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`) to generate a local image file inside `assets/images/`, then increments the daily quota only after a successful response.

Operational notes
- `secrets.txt` is in `.gitignore` to prevent accidental commits.
- If you need to change the budget or per-profile cost, edit `IMAGE_DAILY_BUDGET`, `IMAGE_SMALL_REQUEST_COST`, and `IMAGE_LARGE_REQUEST_COST` in `selfmade.bat`, or pass a direct credit cost to `scripts/check_image_quota.js`.
- To reset the counter manually: `node scripts/check_image_quota.js reset 100 1`.
- To generate a small or large image: `node scripts/generate_image.js small "your prompt here"` or `node scripts/generate_image.js large "your prompt here"`.
- Each generated image also writes a sidecar JSON file with the prompt and profile details so later iterations can understand what was created.

Security
- Do not commit `secrets.txt`. Treat it like any secret.
- The validation script blocks network calls in shipped game code by default; the explicit exception is `scripts/generate_image.js`, which is the approved quota-guarded path for Cloudflare image generation.
