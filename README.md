<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run NutriGuide locally

This app uses a Cloudflare Worker for Gemini requests so the API key stays off the client bundle.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy [.dev.vars.example](.dev.vars.example) to `.dev.vars`
3. Copy [.env.example](.env.example) to `.env.local`
4. Set `GEMINI_API_KEY` in `.dev.vars`
5. If you want the frontend to call a remote Worker in production, set `VITE_API_BASE_URL` in `.env.local`
6. Run the app:
   `npm run dev`

The frontend runs at `http://localhost:3000` and proxies AI requests to the local Worker at `http://127.0.0.1:3001`.

## Deploy the Worker

1. Authenticate Wrangler:
   `npx wrangler login`
2. Add the Gemini key as a secret:
   `npx wrangler secret put GEMINI_API_KEY`
3. Deploy:
   `npm run deploy:worker`

After deploy, set `VITE_API_BASE_URL` in your frontend build environment to your Worker URL, for example `https://nutri-care-api.<subdomain>.workers.dev`.
If you deploy the frontend on a custom domain root, leave `VITE_BASE_PATH` unset or set it to `/`.
If you deploy the frontend under a project subpath, set `VITE_BASE_PATH` to that subpath, for example `/nutri-care/`.

This repo includes [.env.production](.env.production) so production builds target the live Worker URL by default.

## Security note

This repo no longer reads a Gemini key from the frontend bundle. If your key was flagged as leaked, rotate it in Google AI Studio and store the replacement only in Cloudflare Worker secrets or local `.dev.vars`.
