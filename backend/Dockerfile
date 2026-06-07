FROM node:22-bookworm-slim
RUN apt-get update -qq && apt-get install -y -qq ca-certificates curl 2>/dev/null && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 8787
