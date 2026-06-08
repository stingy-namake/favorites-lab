# Kishin Echoes

E-commerce storefront powered by the [FakeStoreAPI](https://fakestoreapi.com).

## Stack

| Layer | Tech | Deploy |
|---|---|---|
| **Frontend** | SvelteKit 5 + adapter-cloudflare | Cloudflare Pages |
| **Backend** | Hono (Cloudflare Worker) | Cloudflare Workers |
| **Database** | D1 (SQLite on CF) | Cloudflare D1 |
| **CI/CD** | GitHub Actions | Auto on push to `main` |

## Local Dev (Docker)

```sh
docker compose up
```

This starts both services:

- **Backend** — `http://localhost:8787` (wrangler dev with local D1)
- **Frontend** — `http://localhost:5173` (Vite dev server, proxied to backend)

A `JWT_SECRET=dev-secret` is set for local auth. D1 migrations run automatically on startup.

### Without Docker

```sh
# Backend
cd backend
npm install
npx wrangler d1 migrations apply fakestore-db --local
npx wrangler dev --local --port 8787

# Frontend (separate terminal)
cd frontend
npm install
API_PROXY_TARGET=http://localhost:8787 npm run dev
```

## Project Structure

```
├── backend/
│   ├── src/           # Hono worker routes
│   │   ├── index.ts   # App entry, CORS, route mounting
│   │   ├── routes/    # auth, products, cart, favorites, admin
│   │   └── utils/     # cache helpers
│   ├── migrations/    # D1 SQL migrations
│   └── wrangler.toml  # Worker config
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts           # API client (single base URL)
│   │   │   ├── components/      # Svelte components
│   │   │   └── stores/          # Auth, cart, favorites, overlay
│   │   ├── routes/     # SvelteKit pages
│   │   └── app.css     # Global styles
│   ├── static/         # Static assets (logos)
│   └── svelte.config.js
├── deploy.sh           # Manual deploy script
└── docker-compose.yml
```

## Deployment

Push to `main` → GitHub Actions runs:

1. **Backend CI** — `tsc --noEmit` + `vitest`
2. **Frontend CI** — `vite build`
3. **Deploy** — Worker deploy → D1 migrations → Pages deploy

### Prerequisites

- Cloudflare account with Workers/Pages/D1 enabled
- D1 database named `fakestore-db` created
- GitHub repo secrets:
  - `CLOUDFLARE_API_TOKEN` — token with Workers, Pages, D1 edit perms
  - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID

## API Endpoints

All under `/api`:

| Endpoint | Description |
|---|---|
| `GET /api/products` | Paginated product list |
| `GET /api/products/:id` | Single product |
| `GET /api/products/categories` | Category list |
| `POST /api/auth/signup` | Register |
| `POST /api/auth/login` | Login |
| `GET /api/cart` | User's cart (auth) |
| `GET /api/favorites` | User's favorites (auth) |
| `GET /api/admin/users` | User list (admin) |
