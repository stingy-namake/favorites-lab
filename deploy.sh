#!/bin/bash
set -e

echo "=== Deploying FakeStore ==="

echo "--- Backend: Running D1 migrations ---"
cd backend
npx wrangler d1 migrations apply fakestore-db --remote

echo "--- Backend: Deploying Worker ---"
npx wrangler deploy

echo "--- Frontend: Building ---"
cd ../frontend
npm run build

echo "--- Frontend: Deploying to Pages ---"
npx wrangler pages deploy .svelte-kit/cloudflare --project-name favorites-lab

echo "=== Done! ==="
