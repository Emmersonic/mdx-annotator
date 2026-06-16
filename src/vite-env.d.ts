/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set at build time for the static GitHub Pages demo (no backend → simulate send). */
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
