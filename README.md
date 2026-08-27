<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c3ea94f6-eb51-4148-85c3-d167017af605

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env`, then set `GEMINI_API_KEY` and `TAVILY_API_KEY`. Gemini structures the result and uses Google Maps for branches; Tavily finds official sites, social profiles, menus, and image sources. You can optionally change `GEMINI_MODEL` (default: `gemini-3.1-flash-lite`).
3. Run the app:
   `npm run dev`

## Why an API is required

The browser sends only the restaurant name and optional device coordinates to this server. The server keeps the secret key private and calls three capabilities:

1. Google Maps grounding identifies the location-matched branch, address, phone, hours, and Maps source.
2. Tavily Search finds official sites, social profiles, menus, and media sources.
3. Gemini converts those grounded results into the structured restaurant configuration used by the page.

If `GEMINI_API_KEY` is missing or research fails, the app deliberately returns an unverified empty preview instead of inventing merchant data.
