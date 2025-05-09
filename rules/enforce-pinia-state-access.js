/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */

/**
 * Improved ESLint rule for enforcing proper Pinia state encapsulation patterns
 *
 * This rule verifies:
 * 1. In store files:
 *    - Prevents exporting raw state variables (ref/reactive) directly
 *    - Tracks variables created with ref() or reactive() as state
 *    - Allows exporting computed properties
 *
 * Note: This rule only verifies state encapsulation in store files and doesn't
 * validate access to store properties from outside store files.
 *
 * @example
 * // Incorrect (in store):
 * const count = ref(0)
 * return { count } // Exports raw state directly
 *
 * // Correct (in store):
 * const count = ref(0)
 * const currentCount = computed(() => count.value)
 * return { currentCount } // Exports computed property
 *
 * @author Pablo Contreras
 * @since 2025/04/10
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce proper Pinia state encapsulation patterns',
      category: 'essential',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          // Files to ignore
          ignoreFiles: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          // Additional state creation functions to track
          additionalStateCreators: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      directStateExport:
        "Store should not export state '{{stateName}}' directly. Use getters (computed properties) instead.",
    },
  },
  create(context) {
    // Get configuration
    const options = context.options[0] || {}
    const ignoreFiles = options.ignoreFiles || []
    const additionalStateCreators = options.additionalStateCreators || []

    // Check if the file should be ignored
    const fileName = context.getFilename()
    if (ignoreFiles.some((pattern) => new RegExp(pattern).test(fileName))) {
      return {}
    }

    const isStoreFile = fileName.includes('/store/')

    // Solo aplicar la regla en archivos de store
    if (!isStoreFile) {
      return {} // No hacemos ninguna validación en archivos que no son de store
    }

    // Track variables within the current scope
    const stateVariables = new Map() // All variables created with ref() or reactive()
    const computedVariables = new Map() // All variables created with computed()

    // Standard state creator functions
    const stateCreators = [
      'ref',
      'reactive',
      'shallowRef',
      'shallowReactive',
      ...additionalStateCreators,
    ]

    // Getter creator functions
    const getterCreators = ['computed']

    // In store files: Track state variables and prevent their direct export
    return {
      // Track variable declarations with ref/reactive
      VariableDeclarator(node) {
        // Check for patterns like: const count = ref(0)
        if (
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier'
        ) {
          const funcName = node.init.callee.name

          if (
            stateCreators.includes(funcName) &&
            node.id &&
            node.id.type === 'Identifier'
          ) {
            // This is a state variable
            stateVariables.set(node.id.name, {
              node: node,
              creator: funcName,
            })
          } else if (
            getterCreators.includes(funcName) &&
            node.id &&
            node.id.type === 'Identifier'
          ) {
            // This is a computed/getter variable
            computedVariables.set(node.id.name, {
              node: node,
              creator: funcName,
            })
          }
        }
      },

      // Check for direct state export in store's return statement
      'ReturnStatement > ObjectExpression > Property'(node) {
        // First, handle shorthand properties: return { count }
        if (node.shorthand && node.key.type === 'Identifier') {
          const varName = node.key.name

          if (stateVariables.has(varName)) {
            context.report({
              node,
              messageId: 'directStateExport',
              data: {
                stateName: varName,
              },
            })
          }
        }
        // Then handle explicit properties: return { count: count }
        else if (
          !node.shorthand &&
          node.key.type === 'Identifier' &&
          node.value.type === 'Identifier'
        ) {
          const varName = node.value.name

          if (stateVariables.has(varName)) {
            context.report({
              node,
              messageId: 'directStateExport',
              data: {
                stateName: varName,
              },
            })
          }
        }
      },
    }
  },
}
