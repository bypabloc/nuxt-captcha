// nuxt.config.ts
import { resolve } from 'node:path'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,
    vscode: {
      port: 3001,
      reuseExistingServer: true,
    },
    timeline: {
      enabled: true,
    },
  },
  logLevel: 'info',
  debug: false,
  typescript: {
    typeCheck: true,
    strict: true,
  },
  app: {
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'Nuxt + Captcha',
      charset: 'utf-8',
      meta: [],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://the-full-stack.com/' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },

        // Etiquetas hreflang para idiomas o regiones alternas
        { rel: 'alternate', hreflang: 'es-CL', href: 'https://the-full-stack.com/' },
        // Si se lanzan versiones en otros idiomas, agregarlos aquí
        // Ejemplo: { rel: 'alternate', hreflang: 'en-US', href: 'https://the-full-stack.com/en' },
      ],
      // Sección de scripts: se agrega JSON-LD para datos estructurados que faciliten a los motores de búsqueda comprender el contenido del sitio
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Nuxt + Captcha',
            url: 'https://the-full-stack.com/',
            logo: 'https://the-full-stack.com/images/the-full-stack-og.jpg',
            sameAs: [
              'https://www.facebook.com/the-full-stack',
              'https://twitter.com/the-full-stack',
              'https://www.instagram.com/the-full-stack',
            ],
          }),
        },
      ],
    },
  },
  experimental: {
    asyncEntry: true,
  },
  components: [
    // ~/components/ui/Button/Index.vue => <UIButton />
    { path: '~/components/ui', extensions: ['.vue'], prefix: 'UI' },
  ],
  imports: {
    // https://nuxt.com/docs/guide/directory-structure/composables#how-files-are-scanned
    dirs: ['composables/*.{ts,js,mjs,mts}'],
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@unocss/nuxt',
    '@nuxt/test-utils/module',
  ],
  eslint: {
    config: {
      autoInit: true,
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname, './'),
        '~': resolve(__dirname, './'),
      },
    },
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: true,
      rollupOptions: {
        external: [
          'pkg-types',
          'local-pkg',
          '@antfu/install-pkg',
          'mlly',
          'tinyexec',
          'node:fs',
          'node:path',
          'node:process',
          'fs',
        ],
      },
    },
    ssr: {
      noExternal: ['@nuxt/icon', '@nuxt/scripts'],
    },
  },
  i18n: {
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'es',
    locales: [{ code: 'es', iso: 'es-CL', file: 'es.json' }],
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  runtimeConfig: {
    public: {
      env: '',
      turnstileSiteKey: '',
    },
  },
})
