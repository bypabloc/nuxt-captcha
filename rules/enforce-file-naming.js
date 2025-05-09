/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */

/**
 * Regla ESLint personalizada para validar convenciones de nombres de archivos
 *
 * Esta regla verifica que:
 * 1. Los componentes Vue sigan PascalCase (Component.vue)
 * 2. Los composables usen el prefijo "use" (useFeature.ts)
 * 3. Los archivos de store sigan el patrón correcto (module.store.ts o useModuleStore.ts)
 * 4. Las páginas y layouts usen kebab-case (feature-name.vue)
 * 5. Las utilidades y otras funciones usen camelCase (utilityName.ts)
 *
 * @author Pablo Contreras
 * @since 2025/04/10
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce file naming conventions',
      category: 'best-practices',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Convención para componentes Vue
          componentCase: {
            enum: ['PascalCase', 'kebab-case'],
            default: 'PascalCase',
          },
          // Convención para páginas
          pageCase: {
            enum: ['kebab-case', 'camelCase'],
            default: 'kebab-case',
          },
          // Convención para stores
          storePattern: {
            enum: ['module.store.ts', 'useModuleStore.ts', 'both'],
            default: 'both',
          },
          // Convención para utilidades
          utilityCase: {
            enum: ['camelCase', 'kebab-case'],
            default: 'camelCase',
          },
          // Carpetas ignoradas
          ignoredFolders: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: ['node_modules', '.git', 'dist', '.nuxt', '.output'],
          },
          // Patrones de archivos a ignorar (nueva propiedad)
          ignoredFiles: {
            type: 'array',
            items: {
              type: 'string',
            },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidComponentName:
        'Vue component file name should be in {{case}}: "{{expected}}"',
      invalidComposableName:
        'Composable file name should start with "use" and be in camelCase: "{{expected}}"',
      invalidStoreName:
        'Store file name should follow pattern {{pattern}}: "{{expected}}"',
      invalidPageName: 'Page file name should be in {{case}}: "{{expected}}"',
      invalidUtilityName:
        'Utility file name should be in {{case}}: "{{expected}}"',
      invalidApiName:
        'API file name should be in camelCase and end with .api.ts: "{{expected}}"',
      invalidModelName:
        'Model file name should be in PascalCase: "{{expected}}"',
      invalidTypeName:
        'Types file name should match the context or use types.ts: "{{expected}}"',
    },
  },
  create(context) {
    const options = context.options[0] || {}
    const componentCase = options.componentCase || 'PascalCase'
    const pageCase = options.pageCase || 'kebab-case'
    const storePattern = options.storePattern || 'both'
    const utilityCase = options.utilityCase || 'camelCase'
    const ignoredFolders = options.ignoredFolders || [
      'node_modules',
      '.git',
      'dist',
      '.nuxt',
      '.output',
    ]
    // Obtener los patrones de archivos a ignorar
    const ignoredFiles = options.ignoredFiles || [
      '.*\\.spec\\.ts$',
      '.*\\.test\\.ts$',
      '.*\\.cy\\.ts$',
      '.*\\.e2e\\.ts$',
      '.*/tests/.*',
      '.*/__tests__/.*',
      '.*/vitest/.*',
      '.*/jest/.*',
    ]

    // Convertir un string a diferentes formatos
    function toKebabCase(str) {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
    }

    function toCamelCase(str) {
      return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^[A-Z]/, (c) => c.toLowerCase())
    }

    function toPascalCase(str) {
      const camel = toCamelCase(str)
      return camel.charAt(0).toUpperCase() + camel.slice(1)
    }

    // Obtener el nombre base sin extensión
    function getBaseName(fileName) {
      return fileName.split('.')[0]
    }

    // Verificar si el archivo está en una carpeta ignorada
    const filePath = context.getFilename()
    const normalizedPath = filePath.replace(/\\/g, '/')

    // Verificar si el archivo coincide con algún patrón en ignoreFiles
    if (
      ignoredFiles.some((pattern) => new RegExp(pattern).test(normalizedPath))
    ) {
      return {}
    }

    // Verificar si el archivo está en una carpeta ignorada
    if (
      ignoredFolders.some((folder) => normalizedPath.includes(`/${folder}/`))
    ) {
      return {}
    }

    // Extraer detalles del archivo
    const pathParts = normalizedPath.split('/')
    const fileName = pathParts[pathParts.length - 1]
    const fileExt = fileName.includes('.') ? fileName.split('.').pop() : ''
    const baseName = getBaseName(fileName)

    return {
      Program(node) {
        // Si es un archivo Vue, verificar su convención de nombres según el tipo
        if (fileExt === 'vue') {
          // Determinar si es un componente, página o layout
          const isComponent = normalizedPath.includes('/components/')
          const isPage = normalizedPath.includes('/pages/')
          const isLayout = normalizedPath.includes('/layouts/')

          // Para componentes
          if (isComponent) {
            if (
              componentCase === 'PascalCase' &&
              !/^[A-Z][a-zA-Z0-9]*$/.test(baseName)
            ) {
              const expected = toPascalCase(baseName) + '.vue'
              context.report({
                node,
                messageId: 'invalidComponentName',
                data: {
                  case: 'PascalCase',
                  expected,
                },
              })
            } else if (
              componentCase === 'kebab-case' &&
              !/^[a-z][a-z0-9-]*$/.test(baseName)
            ) {
              const expected = toKebabCase(baseName) + '.vue'
              context.report({
                node,
                messageId: 'invalidComponentName',
                data: {
                  case: 'kebab-case',
                  expected,
                },
              })
            }
          }

          // Para páginas y layouts
          if (isPage || isLayout) {
            if (
              pageCase === 'kebab-case' &&
              !/^[a-z][a-z0-9-]*$/.test(baseName) &&
              baseName !== 'index'
            ) {
              const expected = toKebabCase(baseName) + '.vue'
              context.report({
                node,
                messageId: 'invalidPageName',
                data: {
                  case: 'kebab-case',
                  expected,
                },
              })
            } else if (
              pageCase === 'camelCase' &&
              !/^[a-z][a-zA-Z0-9]*$/.test(baseName) &&
              baseName !== 'index'
            ) {
              const expected = toCamelCase(baseName) + '.vue'
              context.report({
                node,
                messageId: 'invalidPageName',
                data: {
                  case: 'camelCase',
                  expected,
                },
              })
            }
          }
        }

        // Verificar archivos TypeScript y JavaScript
        if (['ts', 'js', 'mjs', 'tsx', 'jsx'].includes(fileExt)) {
          // Composables (deben comenzar con "use" y seguir camelCase)
          if (
            normalizedPath.includes('/composables/') ||
            fileName.startsWith('use')
          ) {
            if (
              !fileName.startsWith('use') ||
              !/^use[A-Z][a-zA-Z0-9]*\.(ts|js|mjs|tsx|jsx)$/.test(fileName)
            ) {
              // Determinar el nombre esperado
              let expected
              if (fileName.startsWith('use') && !/^use[A-Z]/.test(fileName)) {
                // Ya comienza con "use" pero no sigue camelCase
                const nameWithoutPrefix = fileName.substring(3)
                expected = 'use' + toPascalCase(nameWithoutPrefix)
              } else {
                // No comienza con "use"
                expected = 'use' + toPascalCase(baseName) + '.' + fileExt
              }

              context.report({
                node,
                messageId: 'invalidComposableName',
                data: {
                  expected,
                },
              })
            }
          }

          // Archivos de store
          if (
            normalizedPath.includes('/store/') ||
            fileName.includes('store') ||
            fileName.includes('Store')
          ) {
            const validStorePatterns = []

            if (storePattern === 'module.store.ts' || storePattern === 'both') {
              validStorePatterns.push(/^[a-z][a-zA-Z0-9]*\.store\.(ts|js)$/)
            }

            if (
              storePattern === 'useModuleStore.ts' ||
              storePattern === 'both'
            ) {
              validStorePatterns.push(/^use[A-Z][a-zA-Z0-9]*Store\.(ts|js)$/)
            }

            if (!validStorePatterns.some((pattern) => pattern.test(fileName))) {
              // Determinar el nombre esperado
              let expected
              if (storePattern === 'module.store.ts') {
                expected = toCamelCase(baseName) + '.store.ts'
              } else if (storePattern === 'useModuleStore.ts') {
                // Extraer el nombre base sin "store" o "Store"
                const cleanName = baseName
                  .replace(/[sS]tore$/, '')
                  .replace(/^use/, '')
                expected = 'use' + toPascalCase(cleanName) + 'Store.ts'
              } else {
                // Si es "both", sugerimos el que parece más cercano
                if (
                  fileName.startsWith('use') ||
                  fileName.endsWith('Store.ts')
                ) {
                  const cleanName = baseName
                    .replace(/[sS]tore$/, '')
                    .replace(/^use/, '')
                  expected = 'use' + toPascalCase(cleanName) + 'Store.ts'
                } else {
                  expected =
                    toCamelCase(baseName.replace(/[sS]tore$/, '')) + '.store.ts'
                }
              }

              context.report({
                node,
                messageId: 'invalidStoreName',
                data: {
                  pattern: storePattern,
                  expected,
                },
              })
            }
          }

          // Archivos de API
          if (normalizedPath.includes('/api/') || fileName.includes('.api.')) {
            if (!/^[a-z][a-zA-Z0-9]*\.api\.(ts|js)$/.test(fileName)) {
              const cleanName = baseName.replace(/\.api$/, '')
              const expected = toCamelCase(cleanName) + '.api.ts'

              context.report({
                node,
                messageId: 'invalidApiName',
                data: {
                  expected,
                },
              })
            }
          }

          // Modelos y tipos
          if (
            normalizedPath.includes('/types/') ||
            normalizedPath.includes('/models/')
          ) {
            // Los modelos deben usar PascalCase
            if (
              normalizedPath.includes('/models/') &&
              !/^[A-Z][a-zA-Z0-9]*\.(ts|js)$/.test(fileName)
            ) {
              const expected = toPascalCase(baseName) + '.ts'

              context.report({
                node,
                messageId: 'invalidModelName',
                data: {
                  expected,
                },
              })
            }

            // Los tipos pueden ser types.ts o seguir el contexto
            if (
              normalizedPath.includes('/types/') &&
              fileName !== 'types.ts' &&
              fileName !== 'index.ts' &&
              !/^[a-z][a-zA-Z0-9]*-types\.(ts|js)$/.test(fileName) &&
              !/^[a-z][a-zA-Z0-9]*\.(types|d)\.(ts|js)$/.test(fileName)
            ) {
              const expected = fileName.includes('-')
                ? toKebabCase(baseName) + '-types.ts'
                : toCamelCase(baseName) + '.types.ts'

              context.report({
                node,
                messageId: 'invalidTypeName',
                data: {
                  expected,
                },
              })
            }
          }

          // Utilidades
          if (
            normalizedPath.includes('/utils/') ||
            normalizedPath.includes('/helpers/')
          ) {
            if (
              utilityCase === 'camelCase' &&
              !/^[a-z][a-zA-Z0-9]*\.(ts|js|mjs)$/.test(fileName)
            ) {
              const expected = toCamelCase(baseName) + '.' + fileExt

              context.report({
                node,
                messageId: 'invalidUtilityName',
                data: {
                  case: 'camelCase',
                  expected,
                },
              })
            } else if (
              utilityCase === 'kebab-case' &&
              !/^[a-z][a-z0-9-]*\.(ts|js|mjs)$/.test(fileName)
            ) {
              const expected = toKebabCase(baseName) + '.' + fileExt

              context.report({
                node,
                messageId: 'invalidUtilityName',
                data: {
                  case: 'kebab-case',
                  expected,
                },
              })
            }
          }
        }
      },
    }
  },
}
