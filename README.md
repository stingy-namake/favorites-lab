# Favorites Lab Store

E-commerce-style app to browse products and save favorites. Powered by the [Fake Store API](https://fakestoreapi.com).

**Team:** Stingy Namake

## Stack

- **Backend:** Node.js + Express + SQLite (JWT auth)
- **Frontend:** Plain HTML + CSS + JavaScript
- **Container:** Docker Compose
- **CI/CD:** GitHub Actions
- **Deploy target:** Cloudflare (Workers + Pages)

## Features

- Browse products with category filters and pagination
- User registration and login (JWT)
- Save/remove favorites (authenticated)
- Responsive store-like UI

## Local Development

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- API: http://localhost:3000/api

## API Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account (name, email, password) |
| POST | /api/auth/login | Sign in (email, password) → token |
| GET | /api/auth/me | Current user info (requires Bearer token) |

### Products

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List all products |
| GET | /api/products/categories | List categories |
| GET | /api/products/:id | Get single product |

### Favorites (require `Authorization: Bearer <token>`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/favorites | Add favorite `{ product_id }` |
| GET | /api/favorites | List my favorites |
| DELETE | /api/favorites/:product_id | Remove favorite |

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   ├── middleware/auth.js       # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.js              # Register, login, me
│   │   │   ├── products.js          # Proxy to Fake Store API
│   │   │   └── favorites.js         # Favorites CRUD (auth)
│   │   └── services/fakestore.js
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── nginx.conf
│   └── Dockerfile
├── .github/workflows/
│   ├── build.yml
│   └── deploy.yml
└── docker-compose.yml
```

## Deploy to Cloudflare

1. Add `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `JWT_SECRET` to GitHub secrets
2. Push to `main` → auto-deploy
3. Backend → Cloudflare Worker, Frontend → Cloudflare Pages
