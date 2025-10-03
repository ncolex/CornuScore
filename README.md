<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hqBdggefKsCPpLgiE5MQS4rOk-BZwU_u

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app (Vite only):
   `npm run start:vite`

### With Netlify Functions (recommended for uploads)

- Install Netlify CLI (one-time): `npm i -g netlify-cli`
- Link your site (one-time): `netlify login && netlify link`
- Start dev with functions: `npm run start:netlify`

This serves the Vite app and exposes `/.netlify/functions/upload-image` for image uploads.

### Deploy to Netlify

- Build: `npm run build`
- Deploy (prod): `npm run deploy:netlify`
