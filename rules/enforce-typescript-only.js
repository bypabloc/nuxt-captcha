/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */

/**
 * Regla ESLint personalizada para forzar el uso exclusivo de TypeScript en el proyecto
 *
 * Esta regla verifica que todos los archivos (excepto los explícitamente permitidos)
 * utilicen extensiones TypeScript (.ts, .tsx) en lugar de JavaScript (.js, .jsx).
 * Los archivos Vue (.vue) están exentos de esta regla.
 *
 * @example
 * // Correcto:
 * // archivo.ts, archivo.tsx, componente.vue
 *
 * // Incorrecto:
 * // archivo.js, archivo.jsx, archivo.mjs
 *
 * @author Pablo Contreras
 * @since 2025/04/10
 */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce using TypeScript files only (.ts, .tsx, .vue)',
      category: 'essential',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          // Patrones de archivos a ignorar
          ignoreFiles: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          // Carpetas a ignorar
          ignoreFolders: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {}
    const configIgnoreFiles = options.ignoreFiles || []
    const configIgnoreFolders = options.ignoreFolders || []

    return {
      Program(node) {
        const filename = context.getFilename()

        // Siempre permitir archivos Vue
        if (filename.endsWith('.vue')) {
          return
        }

        // Lista predeterminada de archivos JS permitidos
        const allowedJsFiles = [
          'eslint.config.mjs',
          '/rules/enforce-script-setup-ts.js',
          '/rules/enforce-typescript-only.js',
          '/rules/enforce-pinia-state-access.js',
        ]

        // Combinar con los archivos ignorados de configuración
        const isAllowedJsFile =
          allowedJsFiles.some((allowedFile) =>
            filename.includes(allowedFile),
          ) ||
          configIgnoreFiles.some((pattern) =>
            new RegExp(pattern).test(filename),
          )

        // Verificar si el archivo está en una carpeta ignorada
        const isIgnoredFolder = configIgnoreFolders.some(
          (folder) =>
            filename.includes(`/${folder}/`) ||
            filename.startsWith(folder + '/'),
        )

        if (isAllowedJsFile || isIgnoredFolder) {
          return
        }

        if (
          filename.endsWith('.js') ||
          filename.endsWith('.jsx') ||
          filename.endsWith('.mjs') ||
          filename.endsWith('.cjs')
        ) {
          context.report({
            node,
            message:
              'JavaScript files are not allowed. Use TypeScript (.ts, .tsx) instead.',
          })
        }
      },
    }
  },
}
