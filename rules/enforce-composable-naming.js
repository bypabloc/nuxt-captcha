/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */

/**
 * Regla ESLint personalizada para forzar el uso correcto del prefijo "use" en composables
 *
 * Esta regla verifica que:
 * 1. Las funciones exportadas en archivos dentro de carpetas "composables" usen el prefijo "use"
 * 2. Los nombres de archivos de composables también usen el prefijo "use"
 * 3. Las funciones con prefijo "use" cumplan con las convenciones de composables (devolver objetos/funciones)
 *
 * @example
 * // Correcto:
 * // archivo: useCounter.ts
 * export function useCounter() { ... }
 *
 * // Incorrecto:
 * // archivo: counter.ts
 * export function getCounter() { ... }
 *
 * @author Pablo Contreras
 * @since 2025/04/10
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce using "use" prefix for composables',
      category: 'best-practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          // Patrones adicionales de rutas donde se aplica la regla (además de /composables/)
          additionalComposablePaths: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          // Si se debe aplicar la regla a todos los archivos que exportan funciones con prefijo "use"
          enforceAllUsePrefix: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      shouldUsePrefix:
        'Composable function should use "use" prefix. Rename "{{name}}" to "use{{capitalizedName}}".',
      shouldHaveUsePrefix:
        'Composable file should have a "use" prefix. Rename file to "{{suggestedName}}".',
      returnObjectOrFunction:
        'Composable function with "use" prefix should return an object, function, or reactive value.',
      invalidReturnType:
        'Composable "{{name}}" does not return a valid value. Composables should return objects, functions, or reactive values.',
    },
  },
  create(context) {
    const options = context.options[0] || {}
    const additionalPaths = options.additionalComposablePaths || []
    const enforceAllUsePrefix = options.enforceAllUsePrefix !== false

    const fileName = context.getFilename()
    const lastPart = fileName.split('/').pop() || ''
    const isComposableFile =
      fileName.includes('/composables/') ||
      additionalPaths.some((path) => fileName.includes(path))

    // Verifica si un nodo devuelve un valor válido para un composable
    function isValidComposableReturn(node) {
      // Si no hay cuerpo de función
      if (!node.body || node.body.type !== 'BlockStatement') {
        return false
      }

      // Usar un enfoque más seguro para buscar declaraciones return
      let hasValidReturn = false

      // Función para verificar si un valor de retorno es válido para un composable
      const isValidReturnValue = (arg) => {
        if (!arg) return false

        // Objetos, arrays, o funciones son válidos
        if (
          arg.type === 'ObjectExpression' ||
          arg.type === 'ArrayExpression' ||
          arg.type === 'ArrowFunctionExpression' ||
          arg.type === 'FunctionExpression'
        ) {
          return true
        }

        // Llamadas a funciones reactivas
        if (arg.type === 'CallExpression') {
          const callee = arg.callee
          if (callee.type === 'Identifier') {
            const name = callee.name
            return [
              'ref',
              'reactive',
              'computed',
              'toRef',
              'toRefs',
              'shallowRef',
              'shallowReactive',
              'readonly',
              'toRaw',
              'unref',
              'watch',
              'watchEffect',
            ].includes(name)
          }
        }

        return false
      }

      // Usar la API de ESLint para encontrar nodos de retorno de manera segura
      const returnStatements = []
      const sourceCode = context.getSourceCode()

      // Función auxiliar para buscar declaraciones de retorno sin recursión infinita
      const findReturnsInRange = (start, end) => {
        const nodeTypes = sourceCode
          .getTokens({ range: [start, end] })
          .filter(
            (token) => token.type === 'Keyword' && token.value === 'return',
          )

        nodeTypes.forEach((token) => {
          // Buscar el statement completo para cada token 'return'
          const returnStatement = sourceCode.getNodeByRangeIndex(token.range[0])
          if (returnStatement && returnStatement.type === 'ReturnStatement') {
            returnStatements.push(returnStatement)
          }
        })
      }

      // Buscar declaraciones return en el cuerpo de la función
      findReturnsInRange(node.body.range[0], node.body.range[1])

      // Verificar si al menos un return devuelve un valor válido
      hasValidReturn = returnStatements.some((stmt) =>
        isValidReturnValue(stmt.argument),
      )

      return hasValidReturn
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    // Verificar que el nombre del archivo de composable comience con "use"
    if (isComposableFile && !lastPart.startsWith('use')) {
      const baseName = lastPart.split('.')[0]
      const extension = lastPart.includes('.')
        ? lastPart.slice(lastPart.lastIndexOf('.'))
        : ''
      const suggestedName = `use${capitalize(baseName)}${extension}`

      context.report({
        loc: { line: 1, column: 0 },
        messageId: 'shouldHaveUsePrefix',
        data: {
          suggestedName,
        },
      })
    }

    return {
      // Verificar que las funciones exportadas en archivos de composables usen el prefijo "use"
      'ExportNamedDeclaration > FunctionDeclaration'(node) {
        if (isComposableFile && node.id && !node.id.name.startsWith('use')) {
          const name = node.id.name
          const capitalizedName = capitalize(name)

          context.report({
            node,
            messageId: 'shouldUsePrefix',
            data: {
              name,
              capitalizedName,
            },
            fix(fixer) {
              return fixer.replaceText(node.id, `use${capitalizedName}`)
            },
          })
        }

        // Si la función tiene el prefijo "use", verificar que devuelva un valor válido
        if (node.id && node.id.name.startsWith('use')) {
          if (!isValidComposableReturn(node)) {
            context.report({
              node,
              messageId: 'invalidReturnType',
              data: {
                name: node.id.name,
              },
            })
          }
        }
      },

      // Igual verificación para funciones de flecha exportadas
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(
        node,
      ) {
        if (
          node.id &&
          node.id.type === 'Identifier' &&
          node.init &&
          (node.init.type === 'ArrowFunctionExpression' ||
            node.init.type === 'FunctionExpression')
        ) {
          const name = node.id.name

          if (isComposableFile && !name.startsWith('use')) {
            const capitalizedName = capitalize(name)

            context.report({
              node,
              messageId: 'shouldUsePrefix',
              data: {
                name,
                capitalizedName,
              },
              fix(fixer) {
                return fixer.replaceText(node.id, `use${capitalizedName}`)
              },
            })
          }

          // Verificar composables con prefijo "use" en cualquier archivo
          if (enforceAllUsePrefix && name.startsWith('use')) {
            if (!isValidComposableReturn(node.init)) {
              context.report({
                node,
                messageId: 'invalidReturnType',
                data: {
                  name,
                },
              })
            }
          }
        }
      },
    }
  },
}
