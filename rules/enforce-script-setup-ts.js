/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */

/**
 * Regla ESLint personalizada para forzar el uso de <script setup lang="ts"> en componentes Vue
 *
 * Esta regla verifica que todos los archivos .vue:
 * 1. Contengan un bloque <script>
 * 2. El bloque script tenga el atributo setup
 * 3. El bloque script tenga el atributo lang="ts"
 *
 * Ahora incluye:
 * - Autofixer para convertir automáticamente scripts incorrectos
 * - Capacidad para ignorar archivos específicos
 * - Soporte para comentarios de exclusión dentro de los archivos
 *
 * @example
 * // Correcto:
 * <script setup lang="ts">
 * // código TypeScript...
 * </script>
 *
 * // Incorrecto (falta setup):
 * <script lang="ts">
 * // código...
 * </script>
 *
 * // Para excluir un archivo:
 * // eslint-disable-next-line enforce-script-setup-ts/enforce-script-setup-ts
 * <script lang="ts">
 * // código...
 * </script>
 *
 * @author Pablo Contreras
 * @since 2025/04/10
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce using <script setup lang="ts"> in Vue components',
      category: 'essential',
      recommended: true,
    },
    fixable: 'code', // Ahora es fijable
    schema: [
      {
        type: 'object',
        properties: {
          // Patrones de archivos que deben ignorarse
          ignoreFiles: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          // Si se debe preservar el contenido al hacer fix
          preserveContent: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingScriptSetupTs: 'Vue components must use <script setup lang="ts">.',
      missingSetup:
        'Vue components must use <script setup lang="ts">. Found <script lang="ts"> without setup attribute.',
      missingLangTs:
        'Vue components must use <script setup lang="ts">. Found <script setup> without lang="ts" attribute.',
      missingScriptBlock:
        'Vue components must include a <script setup lang="ts"> block.',
    },
  },
  create(context) {
    // Si no es un archivo .vue, no hay nada que validar
    if (!context.getFilename().endsWith('.vue')) {
      return {}
    }

    // Verificar si el archivo está en la lista de ignorados
    const options = context.options[0] || {}
    const ignoreFiles = options.ignoreFiles || []
    const preserveContent = options.preserveContent !== false
    const fileName = context.getFilename()

    if (ignoreFiles.some((pattern) => new RegExp(pattern).test(fileName))) {
      return {}
    }

    // Expresiones regulares para identificar diferentes tipos de bloques script
    const scriptSetupTsRegex =
      /<script\s+(?=.*?\bsetup\b)(?=.*?\blang=["']ts["'])[^>]*>/
    const scriptLangTsNoSetupRegex =
      /<script\s+(?=.*?\blang=["']ts["'])(?!.*?\bsetup\b)[^>]*>/
    const scriptSetupNoLangTsRegex =
      /<script\s+(?=.*?\bsetup\b)(?!.*?\blang=["']ts["'])[^>]*>/
    const scriptNoSetupNoLangTsRegex =
      /<script\s+(?!.*?\bsetup\b)(?!.*?\blang=["']ts["'])[^>]*>/
    const scriptNoAttributesRegex = /<script>/

    return {
      Program(node) {
        const sourceCode = context.getSourceCode()
        const sourceText = sourceCode.getText()

        // Verificar si el comentario de exclusión está presente
        const comments = sourceCode.getAllComments()
        for (const comment of comments) {
          if (
            comment.value.includes('eslint-disable') &&
            comment.value.includes('enforce-script-setup-ts')
          ) {
            return
          }
        }

        // Detectar tipo de script
        const hasScriptSetupTs = scriptSetupTsRegex.test(sourceText)
        const hasScriptLangTsNoSetup = scriptLangTsNoSetupRegex.test(sourceText)
        const hasScriptSetupNoLangTs = scriptSetupNoLangTsRegex.test(sourceText)
        const hasScriptNoSetupNoLangTs =
          scriptNoSetupNoLangTsRegex.test(sourceText)
        const hasScriptNoAttributes = scriptNoAttributesRegex.test(sourceText)

        if (!hasScriptSetupTs) {
          if (hasScriptLangTsNoSetup) {
            context.report({
              node,
              messageId: 'missingSetup',
              fix: preserveContent
                ? function (fixer) {
                    return fixer.replaceText(
                      node,
                      sourceText.replace(
                        /<script\s+(?=.*?\blang=["']ts["'])(?!.*?\bsetup\b)[^>]*>/,
                        '<script setup lang="ts">',
                      ),
                    )
                  }
                : null,
            })
          } else if (hasScriptSetupNoLangTs) {
            context.report({
              node,
              messageId: 'missingLangTs',
              fix: preserveContent
                ? function (fixer) {
                    return fixer.replaceText(
                      node,
                      sourceText.replace(
                        /<script\s+(?=.*?\bsetup\b)(?!.*?\blang=["']ts["'])[^>]*>/,
                        '<script setup lang="ts">',
                      ),
                    )
                  }
                : null,
            })
          } else if (hasScriptNoSetupNoLangTs || hasScriptNoAttributes) {
            context.report({
              node,
              messageId: 'missingScriptSetupTs',
              fix: preserveContent
                ? function (fixer) {
                    const replacedText = sourceText.replace(
                      /<script\s*[^>]*>/,
                      '<script setup lang="ts">',
                    )
                    return fixer.replaceText(node, replacedText)
                  }
                : null,
            })
          } else {
            // No hay bloque script, añadir uno nuevo
            context.report({
              node,
              messageId: 'missingScriptBlock',
              fix: function (fixer) {
                // Buscar el principio del archivo o la etiqueta template para insertar antes
                const templateIndex = sourceText.indexOf('<template')
                const insertPosition = templateIndex > -1 ? templateIndex : 0

                return fixer.insertTextBeforeRange(
                  [insertPosition, insertPosition],
                  '<script setup lang="ts">\n// Código del componente\n</script>\n\n',
                )
              },
            })
          }
        }
      },
    }
  },
}
