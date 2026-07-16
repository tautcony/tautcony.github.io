# Astro SSG → nginx static files.
# Uses committed src/data/lastmod.json (no git history in the image).
#
# Builder stage is discarded; only the nginx stage ships.
# Prefer slim/stable tags so rebuilds pick up OS/runtime security patches.
#
# Override base images when Docker Hub is unreachable, e.g.:
#   docker build \
#     --build-arg NODE_IMAGE=docker.m.daocloud.io/library/node:24-bookworm-slim \
#     --build-arg NGINX_IMAGE=docker.m.daocloud.io/library/nginx:stable-alpine \
#     -t tautcony/tc-blog .

ARG NODE_IMAGE=node:24-bookworm-slim
ARG NGINX_IMAGE=nginx:stable-alpine

FROM ${NODE_IMAGE} AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run lastmod:check && npm run build

FROM ${NGINX_IMAGE}
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
