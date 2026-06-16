# url-shortener-web

React frontend for the [url-shortener](https://github.com/yashvisuals/url-shortener)
GraphQL API. Register/log in, shorten URLs, and see click stats.

**Live demo:** https://url-shortener-web-eight.vercel.app
_(free tier — the first request may take ~30s while the API wakes up)_

## Stack

- React + TypeScript (Vite)
- Apollo Client (GraphQL)

## Running it

The backend needs to be running first (default http://localhost:3000/graphql).

```bash
cp .env.example .env   # point VITE_API_URL at your backend if it differs
npm install
npm run dev
```

Open http://localhost:5173.

## How it works

The JWT from login/register is stored in localStorage and attached as an
`Authorization: Bearer` header on every GraphQL request (see `src/apollo.ts`).
