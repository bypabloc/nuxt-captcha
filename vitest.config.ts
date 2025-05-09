import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // env: loadEnv('', process.cwd(), ''),
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'jsdom',
      },
    },
    reporters: ['default'],
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './.coverage',
      exclude: [
        '**/node_modules/**',
        '**/.nuxt/**',
        '**/.output/**',
        '**/*/types/**',
        'rules/**',
        '**/*.vue',
        '**.mjs',
        '**/*.config.ts',
        'plugins/**',
        'design-system/**',
        '*.config.ts',
      ],
    },
  },
})
