# Draft Room — deploy to Vercel

## What's in here
A standard Vite + React project wrapping your `DraftAssistant.jsx` component.
`storage-shim.js` replaces Claude.ai's artifact-only `window.storage` API with
real browser `localStorage`, so the app saves your draft state without any
changes to the component code.

**Heads up on the shim:** localStorage is per-browser, per-device. Your data
won't sync between your phone and laptop, and clearing browser data wipes it.
That's fine for solo use during a live draft on one device. If you want real
cross-device sync (e.g. so multiple people in your league could each pull up
the same live board), you'd need a real backend — happy to help wire up
something like Vercel KV or Supabase if you want that later.

## 1. Test it locally (optional but recommended)
```bash
npm install
npm run dev
```
Open the URL it prints (usually http://localhost:5173) and make sure the
draft board loads and picks save/reload correctly.

## 2. Push it to GitHub
Vercel deploys from a Git repo.
```bash
cd draft-assistant-vercel
git init
git add .
git commit -m "Draft assistant app"
```
Then create a new empty repo on GitHub (github.com/new) and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/draft-assistant.git
git branch -M main
git push -u origin main
```

## 3. Connect it to Vercel
1. Go to https://vercel.com and sign in (GitHub login is easiest).
2. Click **Add New → Project**.
3. Select the `draft-assistant` repo you just pushed.
4. Vercel auto-detects Vite — leave the defaults:
   - Build Command: `vite build`
   - Output Directory: `dist`
5. Click **Deploy**.

That's it — you'll get a live URL (something like
`draft-assistant-yourname.vercel.app`) you can open on your phone or laptop
on draft day. Any time you push a new commit to `main`, Vercel redeploys
automatically.

## Updating later
If you (or I) tweak `DraftAssistant.jsx` again, just replace
`src/DraftAssistant.jsx` with the new version, commit, and push — Vercel
picks it up automatically.
