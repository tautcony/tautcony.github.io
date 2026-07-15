/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_SENTRY_RELEASE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
