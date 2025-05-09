import prettierPlugin from 'eslint-plugin-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

/**
 * Configuración de ESLint para el proyecto DebtFlow
 *
 * Este archivo configura ESLint integrando reglas personalizadas para asegurar
 * que el código siga el estándar del proyecto, incluyendo:
 *
 * - Patrones de encapsulación segura en Pinia
 * - Uso consistente de <script setup lang="ts"> en componentes Vue
 * - Nomenclatura adecuada para composables (prefijo "use")
 * - Formato correcto de docstrings en componentes Vue
 * - Estructura de carpetas según DDD + Feature-First
 * - Coherencia en definiciones de tipos
 * - Validación de nombres de archivos
 *
 * @author Pablo Contreras
 * @since 2025/04/10
 */


const TEST_IGNORE_PATTERNS = [
  '.*\\.spec\\.ts$',
  '.*\\.test\\.ts$',
  '.*\\.cy\\.ts$',
  '.*\\.e2e\\.ts$',
  '.*/tests/.*',
  '.*/__tests__/.*',
  '.*/vitest/.*',
  '.*/jest/.*',
]

// Reglas originales
const enforceScriptSetupTs = await import('./rules/enforce-script-setup-ts.js')
const enforceTypescriptOnly = await import('./rules/enforce-typescript-only.js')
const enforcePiniaStateAccess = await import(
  './rules/enforce-pinia-state-access.js'
)

// Reglas mejoradas
const enforceComposableNaming = await import(
  './rules/enforce-composable-naming.js'
)
const enforceVueDocstring = await import('./rules/enforce-vue-docstring.js')
const enforceTypeConsistency = await import(
  './rules/enforce-type-consistency.js'
)
const enforceFileNaming = await import('./rules/enforce-file-naming.js')

export default withNuxt({
  plugins: {
    'enforce-script-setup-ts': {
      rules: {
        'enforce-script-setup-ts': enforceScriptSetupTs.default,
      },
    },
    'enforce-typescript-only': {
      rules: {
        'enforce-typescript-only': enforceTypescriptOnly.default,
      },
    },
    'enforce-pinia-state-access': {
      rules: {
        'enforce-pinia-state-access': enforcePiniaStateAccess.default,
      },
    },

    'enforce-composable-naming': {
      rules: {
        'enforce-composable-naming': enforceComposableNaming.default,
      },
    },
    'enforce-vue-docstring': {
      rules: {
        'enforce-vue-docstring': enforceVueDocstring.default,
      },
    },
    'enforce-type-consistency': {
      rules: {
        'enforce-type-consistency': enforceTypeConsistency.default,
      },
    },
    'enforce-file-naming': {
      rules: {
        'enforce-file-naming': enforceFileNaming.default,
      },
    },
    prettier: prettierPlugin,
  },
  rules: {
    // Habilitar reglas mejoradas
    'enforce-pinia-state-access/enforce-pinia-state-access': [
      'error',
      {
        // Archivos a ignorar
        ignoreFiles: [
          ...TEST_IGNORE_PATTERNS,
          // Archivos de prueba
          '.*\\.spec\\.ts$',
          '.*\\.test\\.ts$',
          // Archivos de configuración
          'eslint\\.config\\..*',
          'nuxt\\.config\\.ts',
        ],
        // Funciones adicionales que crean estado
        additionalStateCreators: [
          'useState', // useState de Nuxt 3
          'useLocalStorage', // Almacenamiento local reactivo
          'useSessionStorage', // Almacenamiento de sesión reactivo
          'useRequestState', // Estados de solicitud personalizados
          'createLocalState', // Cualquier función personalizada de creación de estado
        ],
      },
    ],

    'enforce-script-setup-ts/enforce-script-setup-ts': [
      'error',
      {
        // Archivos a ignorar (como componentes de terceros o legacy)
        ignoreFiles: [
          ...TEST_IGNORE_PATTERNS,
          'node_modules/',
          '\\.nuxt/',
          'components/legacy/',
          'components/third-party/',
        ],
        // Preservar contenido al autofix
        preserveContent: true,
      },
    ],

    'enforce-composable-naming/enforce-composable-naming': [
      'error',
      {
        // Rutas adicionales donde buscar composables
        additionalComposablePaths: [
          '/modules/*/composables/',
          '/modules/*/features/*/composables/',
        ],
        // Aplicar la regla a todas las funciones que empiezan con "use"
        enforceAllUsePrefix: true,
      },
    ],

    'enforce-vue-docstring/enforce-vue-docstring': [
      'error',
      {
        // Campos requeridos en docstrings
        requiredFields: [
          'component',
          'description',
          'props',
          'emits',
          'slots',
          'example',
          'author',
          'since',
        ],
        // Formato de fecha requerido
        dateFormat: '^\\d{4}/\\d{2}/\\d{2}$',
        // Carpetas a ignorar
        ignoreFolders: ['node_modules/', '.nuxt/', 'components/legacy/'],
      },
    ],

    'enforce-type-consistency/enforce-type-consistency': 'off',

    'enforce-file-naming/enforce-file-naming': [
      'warn',
      {
        // Convención para componentes Vue
        componentCase: 'PascalCase',
        // Convención para páginas
        pageCase: 'kebab-case',
        // Convención para stores
        storePattern: 'both',
        // Convención para utilidades
        utilityCase: 'camelCase',
        // Carpetas ignoradas
        ignoredFolders: [
          'node_modules',
          '.git',
          'dist',
          '.nuxt',
          '.output',
          'public',
          'assets',
          'static',
        ],
        ignoredFiles: TEST_IGNORE_PATTERNS,
      },
    ],

    'enforce-typescript-only/enforce-typescript-only': [
      'error',
      {
        ignoreFiles: ['rules/'],
      },
    ],

    // Orden de los bloques en componentes Vue
    'vue/block-order': [
      'error',
      {
        order: ['docs', 'script', 'template', 'style'],
      },
    ],

    // Reglas de Vue.js y TypeScript estándar
    'no-console': ['error'],
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'error',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-unused-vars': 'warn',
    'vue/html-indent': [
      'error',
      2,
      {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: [],
      },
    ],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always',
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'never',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/block-lang': [
      'error',
      {
        script: {
          lang: 'ts',
        },
      },
    ],
    '@typescript-eslint/typedef': [
      'error',
      {
        parameter: true,
        propertyDeclaration: true,
        memberVariableDeclaration: true,
        arrayDestructuring: true,
        objectDestructuring: true,
        arrowParameter: true,
        variableDeclarationIgnoreFunction: true,

        variableDeclaration: false,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    semi: ['error', 'never'],
  },
  ignores: [
    '.nuxt',
    '.output',
    'dist',
    'node_modules',
    'rules',
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/tests/**',
    '**/__tests__/**',
  ],
})
