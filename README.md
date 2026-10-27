# Ziki Decision Desk (HNG15 proposal)

A reproduction of the Ziki app with one change: the home screen becomes a **Decision Desk**.

> Your agents only ask when they need a yes or no. Say "always" once and they stop asking.

## Routes
- `#/` Decision Desk (the proposal)
- `#/classic` original dashboard (reproduction)
- `#/issues` original issue list (reproduction)
- `#/issue/106` original issue page (reproduction)

## Run
```bash
npm install
npm run dev
```

## Deploy
Vercel: import the repo, framework preset **Vite**, build `npm run build`, output `dist`.
Netlify: same build command, publish directory `dist`.

Mock data only. Nothing talks to the real Ziki API.
