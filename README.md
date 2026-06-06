# Favorites Lab

API REST + frontend para gerenciar clientes e produtos favoritos, consumindo Fake Store API.

**Equipe:** Stingy Namake

## Stack

- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Frontend:** HTML + CSS + JavaScript (vanilla)
- **Docker:** docker-compose (backend + frontend)
- **CI/CD:** GitHub Actions
- **Deploy:** Cloudflare (Workers + Pages)

## Execução Local

### Pré-requisitos

- Docker e Docker Compose

### Comandos

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

### Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/clientes | Criar cliente |
| GET | /api/clientes | Listar clientes |
| PUT | /api/clientes/:id | Editar cliente |
| DELETE | /api/clientes/:id | Remover cliente |
| POST | /api/clientes/:id/favoritos | Adicionar favorito |
| GET | /api/clientes/:id/favoritos | Listar favoritos |
| DELETE | /api/clientes/:id/favoritos/:product_id | Remover favorito |

## Estrutura

```
.
├── backend/          # API REST (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── index.js           # entry point
│   │   ├── db.js              # SQLite setup
│   │   ├── routes/
│   │   │   ├── clientes.js    # CRUD clientes
│   │   │   └── favoritos.js   # CRUD favoritos
│   │   └── services/
│   │       └── fakestore.js   # Fake Store API client
│   └── Dockerfile
├── frontend/         # Frontend (HTML + CSS + JS)
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── nginx.conf
│   └── Dockerfile
├── .github/workflows/  # GitHub Actions
│   ├── build.yml
│   └── deploy.yml
└── docker-compose.yml
```

## Deploy na Cloudflare

1. Configurar `CF_API_TOKEN` e `CF_ACCOUNT_ID` nos secrets do GitHub
2. Fazer push para `main` → GitHub Actions faz deploy automático
3. Backend: Cloudflare Worker (`favorites-lab-api`)
4. Frontend: Cloudflare Pages (`favorites-lab`)
