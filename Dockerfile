# syntax=docker/dockerfile:1

FROM node:22-bookworm AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM ruby:3.3-bookworm AS generator
WORKDIR /usr/src/app

COPY Gemfile Gemfile.lock ./
RUN bundle config set --local path 'vendor/bundle' \
    && bundle install --jobs 4

COPY --from=builder /usr/src/app ./
ENV JEKYLL_ENV=production
RUN bundle exec jekyll build --trace


FROM nginx:1.27-alpine AS server
COPY --from=generator /usr/src/app/_site /usr/share/nginx/html
