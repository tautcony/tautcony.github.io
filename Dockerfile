# syntax=docker/dockerfile:1
# Astro SSG → nginx. Does NOT regenerate lastmod (uses committed src/data/lastmod.json).

FROM node:22.12-bookworm AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

# Copy sources (see .dockerignore). No .git required for production build.
COPY . .
RUN npm run lastmod:check \
    && npm run build

FROM nginx:1.27-alpine AS server
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
