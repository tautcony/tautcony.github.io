FROM node:13 AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:prod
RUN npm run build:update


FROM ruby:2.6 AS generator
WORKDIR /usr/src/app
# RUN bundle config mirror.https://rubygems.org https://gems.ruby-china.com

COPY Gemfile ./
RUN bundle install
COPY --from=builder /usr/src/app ./
RUN jekyll build --trace


FROM nginx:1.17.8 AS server
WORKDIR /usr/share/nginx/html
COPY --from=generator /usr/src/app/_site ./
