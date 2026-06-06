# Favorites Lab

REST API + frontend to manage customers and favorite products, powered by the [Fake Store API](https://fakestoreapi.com).

**Team:** Stingy Namake

## Stack

- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Frontend:** Plain HTML + CSS + JavaScript
- **Container:** Docker Compose (backend + frontend)
- **CI/CD:** GitHub Actions
- **Deploy target:** Cloudflare (Workers + Pages)

## Local Development

### Prerequisites

- Docker and Docker Compose

### Run

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- API: http://localhost:3000/api

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/customers | Create customer |
| GET | /api/customers | List customers |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer |
| POST | /api/customers/:id/favorites | Add favorite |
| GET | /api/customers/:id/favorites | List favorites |
| DELETE | /api/customers/:id/favorites/:product_id | Remove favorite |

## Project Structure

```
.
├── backend/              # REST API (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── index.js               # Entry point
│   │   ├── db.js                  # SQLite setup + schema
│   │   ├── routes/
│   │   │   ├── customers.js       # Customer CRUD
│   │   │   └── favorites.js       # Favorites CRUD
│   │   └── services/
│   │       └── fakestore.js       # Fake Store API client
│   └── Dockerfile
├── frontend/             # Frontend (HTML + CSS + JS)
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── nginx.conf
│   └── Dockerfile
├── .github/workflows/    # GitHub Actions
│   ├── build.yml
│   └── deploy.yml
└── docker-compose.yml
```

## Deploy to Cloudflare

1. Add `CF_API_TOKEN` and `CF_ACCOUNT_ID` to GitHub secrets
2. Push to `main` — the deploy workflow runs automatically
3. Backend → Cloudflare Worker (`favorites-lab-api`)
4. Frontend → Cloudflare Pages (`favorites-lab`)
