# It's blog for TautCony

## Hope I could write some interesting things here.

## Deps

- ruby >= 2.6
    - bundler[`Gemfile`]
- node >= 11
    - npm[`package.json`]

### Install

```bash
$ npm install
$ bundle install --path vendor/bundle
```

## Dev

```bash
$ npm start # start jekyll server

$ npm run build:dev # build main script with auto recompile
$ npm run build:prod # build main script for production
$ npm run build:update # build update page script for production
```

## Deploy

```bash
$ npm run build:prod && npm run build:update && jekyll build # build site and deploy to server
$ # OR
$ docker build -t tautcony/tc-blog . # build site and pack it into a docker image
```
