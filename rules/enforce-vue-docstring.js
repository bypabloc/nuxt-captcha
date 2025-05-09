/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */

/**
 * Regla ESLint personalizada para validar el formato de docstring en componentes Vue
 *
 * Verifica que todos los componentes Vue tengan un docstring completo que incluya:
 * - @component con nombre del componente
 * - @description con la descripción del componente
 * - @props (si tiene props)
 * - @emits (si emite eventos)
 * - @slots (si utiliza slots)
 * - @example con al menos un ejemplo de uso
 * - @author con el nombre del autor
 * - @since con la fecha de creación/modificación
 *
 * @example
 * /**
 *  * @component MyComponent
 *  * @description Descripción del componente
 *  * @props {Type} propName - Descripción de la prop
 *  * @emits eventName - Descripción del evento
 *  * @slots default - Descripción del slot
 *  * @example
 *  * <MyComponent :prop="value" @event="handler">
 *  *   Contenido
 *  * </MyComponent>
 *  * @author Nombre del Autor
 *  * @since YYYY/MM/DD
 *  *\/
 *
 * @author Pablo Contreras
 * @since 2025/04/10
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce proper docstring format for Vue components',
      category: 'best-practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          // Campos obligatorios
          requiredFields: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'component',
                'description',
                'props',
                'emits',
                'slots',
                'example',
                'author',
                'since',
              ],
            },
            default: ['component', 'description', 'example', 'author', 'since'],
          },
          // Opcional: Formato de fecha requerido (regex como string)
          dateFormat: {
            type: 'string',
            default: '^\\d{4}/\\d{2}/\\d{2}$', // YYYY/MM/DD
          },
          // Carpetas a ignorar
          ignoreFolders: {
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
      missingDocstring: 'Component is missing a docstring comment',
      incompleteDocstring:
        'Component docstring is missing required fields: {{missingFields}}',
      missingComponentTag:
        'Docstring should include @component tag with component name',
      missingDescriptionTag:
        'Docstring should include @description tag with component description',
      missingExampleTag:
        'Docstring should include @example tag with usage example',
      missingAuthorTag: 'Docstring should include @author tag with author name',
      missingSinceTag:
        'Docstring should include @since tag with date in format YYYY/MM/DD',
      invalidDateFormat: 'Date in @since tag should be in format YYYY/MM/DD',
      missingPropsTag:
        'Component has props but is missing @props tag in docstring',
      missingEmitsTag:
        'Component has emits but is missing @emits tag in docstring',
      missingSlotsTag:
        'Component has slots but is missing @slots tag in docstring',
    },
  },
  create(context) {
    const options = context.options[0] || {}
    const requiredFields = options.requiredFields || [
      'component',
      'description',
      'example',
      'author',
      'since',
    ]
    const dateFormatRegex = new RegExp(
      options.dateFormat || '^\\d{4}/\\d{2}/\\d{2}$',
    )
    const ignoreFolders = options.ignoreFolders || []

    const fileName = context.getFilename()

    // Verificar si el archivo está en una carpeta ignorada
    if (ignoreFolders.some((folder) => fileName.includes(folder))) {
      return {}
    }

    // Solo verificar archivos .vue
    if (!fileName.endsWith('.vue')) {
      return {}
    }

    // Extraer el nombre del componente del nombre del archivo
    const componentBaseName = fileName.split('/').pop().replace('.vue', '')

    // Generar un docstring de ejemplo para sugerencias de corrección
    function generateExampleDocstring(
      componentName,
      hasProps,
      hasEmits,
      hasSlots,
    ) {
      const lines = [
        '/**',
        ` * @component ${componentName}`,
        ' * @description Descripción del componente',
      ]

      if (hasProps) {
        lines.push(' * @props {Type} propName - Descripción de la prop')
      }

      if (hasEmits) {
        lines.push(' * @emits eventName - Descripción del evento')
      }

      if (hasSlots) {
        lines.push(' * @slots default - Descripción del slot')
      }

      lines.push(' * @example')

      let exampleTag = ` * <${componentName}`
      if (hasProps) exampleTag += ' :propName="value"'
      if (hasEmits) exampleTag += ' @eventName="handler"'
      lines.push(exampleTag)

      if (hasSlots) {
        lines.push(' *   Contenido del slot')
        lines.push(` * </${componentName}>`)
      } else {
        lines.push(' * />')
      }

      lines.push(' * @author Tu Nombre')
      lines.push(
        ' * @since ' +
          new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      )
      lines.push(' */')

      return lines.join('\n')
    }

    return {
      // Verificar el primer bloque de script en componentes Vue
      'Program > ExportNamedDeclaration:first-child'(node) {
        if (!node.leadingComments || node.leadingComments.length === 0) {
          context.report({
            node,
            messageId: 'missingDocstring',
            fix(fixer) {
              // Detectar si hay props, emits o slots en el código
              const sourceCode = context.getSourceCode().getText()
              const hasProps = /defineProps/.test(sourceCode)
              const hasEmits = /defineEmits/.test(sourceCode)
              const hasSlots =
                /useSlots\(\)/.test(sourceCode) || /<slot/.test(sourceCode)

              const exampleDocstring = generateExampleDocstring(
                componentBaseName,
                hasProps,
                hasEmits,
                hasSlots,
              )
              return fixer.insertTextBefore(node, exampleDocstring + '\n')
            },
          })
          return
        }

        // Encontrar el último comentario como docstring
        const docComment = node.leadingComments
          .filter(
            (comment) =>
              comment.type === 'Block' && comment.value.includes('*'),
          )
          .pop()

        if (!docComment) {
          context.report({
            node,
            messageId: 'missingDocstring',
            fix(fixer) {
              const sourceCode = context.getSourceCode().getText()
              const hasProps = /defineProps/.test(sourceCode)
              const hasEmits = /defineEmits/.test(sourceCode)
              const hasSlots =
                /useSlots\(\)/.test(sourceCode) || /<slot/.test(sourceCode)

              const exampleDocstring = generateExampleDocstring(
                componentBaseName,
                hasProps,
                hasEmits,
                hasSlots,
              )
              return fixer.insertTextBefore(node, exampleDocstring + '\n')
            },
          })
          return
        }

        // Verificar contenido del docstring
        const docString = docComment.value

        // Verificar campos requeridos
        const missingFields = []

        // Detectar características del componente
        const sourceCode = context.getSourceCode().getText()
        const hasProps = /defineProps/.test(sourceCode)
        const hasEmits = /defineEmits/.test(sourceCode)
        const hasSlots =
          /useSlots\(\)/.test(sourceCode) || /<slot/.test(sourceCode)

        // Verificar @component
        if (
          requiredFields.includes('component') &&
          !/@component\s+\w+/.test(docString)
        ) {
          missingFields.push('component')
          context.report({
            node: docComment,
            messageId: 'missingComponentTag',
          })
        }

        // Verificar @description
        if (
          requiredFields.includes('description') &&
          !/@description/.test(docString)
        ) {
          missingFields.push('description')
          context.report({
            node: docComment,
            messageId: 'missingDescriptionTag',
          })
        }

        // Verificar @example
        if (requiredFields.includes('example') && !/@example/.test(docString)) {
          missingFields.push('example')
          context.report({
            node: docComment,
            messageId: 'missingExampleTag',
          })
        }

        // Verificar @author
        if (
          requiredFields.includes('author') &&
          !/@author\s+\w+/.test(docString)
        ) {
          missingFields.push('author')
          context.report({
            node: docComment,
            messageId: 'missingAuthorTag',
          })
        }

        // Verificar @since
        if (requiredFields.includes('since')) {
          const sinceMatch = docString.match(/@since\s+(\S+)/)
          if (!sinceMatch) {
            missingFields.push('since')
            context.report({
              node: docComment,
              messageId: 'missingSinceTag',
            })
          } else if (!dateFormatRegex.test(sinceMatch[1])) {
            context.report({
              node: docComment,
              messageId: 'invalidDateFormat',
            })
          }
        }

        // Verificar @props si el componente tiene props
        if (
          hasProps &&
          requiredFields.includes('props') &&
          !/@props/.test(docString)
        ) {
          missingFields.push('props')
          context.report({
            node: docComment,
            messageId: 'missingPropsTag',
          })
        }

        // Verificar @emits si el componente emite eventos
        if (
          hasEmits &&
          requiredFields.includes('emits') &&
          !/@emits/.test(docString)
        ) {
          missingFields.push('emits')
          context.report({
            node: docComment,
            messageId: 'missingEmitsTag',
          })
        }

        // Verificar @slots si el componente usa slots
        if (
          hasSlots &&
          requiredFields.includes('slots') &&
          !/@slots/.test(docString)
        ) {
          missingFields.push('slots')
          context.report({
            node: docComment,
            messageId: 'missingSlotsTag',
          })
        }

        // Reportar campos faltantes en conjunto
        if (missingFields.length > 0) {
          context.report({
            node: docComment,
            messageId: 'incompleteDocstring',
            data: {
              missingFields: missingFields.join(', '),
            },
          })
        }
      },
    }
  },
}
