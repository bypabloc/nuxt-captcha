/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/typedef */
/**
 * Regla ESLint personalizada para asegurar coherencia en definiciones de tipos
 *
 * Esta regla verifica que:
 * 1. Se usen interfaces para estructuras de datos/modelos principales
 * 2. Se usen types para uniones, intersecciones y aliases
 * 3. Se siga una convención de nombres consistente
 * 4. Los tipos tengan docstrings adecuados
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce consistency in type definitions',
      category: 'best-practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          // Convención de nombres para interfaces
          interfaceNaming: {
            enum: ['PascalCase', 'IPascalCase'],
            default: 'PascalCase',
          },
          // Convención de nombres para tipos
          typeNaming: {
            enum: ['PascalCase', 'TPascalCase'],
            default: 'PascalCase',
          },
          // Cuándo usar interfaces vs types
          preferInterface: {
            type: 'array',
            items: {
              enum: ['object', 'class', 'function', 'extension'],
            },
            default: ['object', 'class', 'extension'],
          },
          // Cuándo usar types
          preferType: {
            type: 'array',
            items: {
              enum: ['union', 'intersection', 'primitive', 'tuple', 'alias'],
            },
            default: ['union', 'intersection', 'primitive', 'tuple', 'alias'],
          },
          // Requerir docstrings
          requireDocstring: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useInterface: 'Use interface instead of type for object types: {{name}}',
      useType: 'Use type instead of interface for {{category}}: {{name}}',
      renameInterface:
        'Interface name "{{name}}" should follow {{convention}} convention',
      renameType:
        'Type name "{{name}}" should follow {{convention}} convention',
      missingDocstring:
        'Type definition for "{{name}}" should have a docstring comment',
      useExtends:
        'Use "extends" instead of intersection when extending an interface',
      inconsistentNaming:
        'Type naming is inconsistent. Consider using a prefix like "T" for types or "I" for interfaces across the project',
    },
  },
  create(context) {
    const options = context.options[0] || {}
    const interfaceNaming = options.interfaceNaming || 'PascalCase'
    const typeNaming = options.typeNaming || 'PascalCase'
    const preferInterface = options.preferInterface || [
      'object',
      'class',
      'extension',
    ]
    const requireDocstring = options.requireDocstring !== false

    // Verificar si un nombre sigue la convención PascalCase
    function isPascalCase(name) {
      return /^[A-Z][a-zA-Z0-9]*$/.test(name)
    }

    // Verificar si un nombre sigue la convención IPascalCase
    function isIPascalCase(name) {
      return /^I[A-Z][a-zA-Z0-9]*$/.test(name)
    }

    // Verificar si un nombre sigue la convención TPascalCase
    function isTPascalCase(name) {
      return /^T[A-Z][a-zA-Z0-9]*$/.test(name)
    }

    // Determinar si un nodo es un tipo de objeto
    function isObjectType(node) {
      return node.type === 'TSTypeLiteral'
    }

    // Determinar si un nodo tiene un comentario de documentación (mejorado)
    function hasDocstring(node) {
      const sourceCode = context.getSourceCode()

      // 1. Verificar comentarios directamente adjuntos al nodo
      const commentsBefore = sourceCode.getCommentsBefore(node)
      if (
        commentsBefore.some(
          (comment) =>
            comment.type === 'Block' && comment.value.trim().startsWith('*'),
        )
      ) {
        return true
      }

      // 2. Verificar comentarios adjuntos al token principal del nodo
      const nodeToken = sourceCode.getFirstToken(node)
      if (nodeToken) {
        const commentsForToken = sourceCode.getCommentsBefore(nodeToken)
        if (
          commentsForToken.some(
            (comment) =>
              comment.type === 'Block' && comment.value.trim().startsWith('*'),
          )
        ) {
          return true
        }
      }

      // 3. Búsqueda extendida para casos especiales
      if (node.loc) {
        const lineStart = node.loc.start.line
        const allComments = sourceCode.getAllComments()

        // Buscar cualquier comentario de bloque que pueda ser un docstring
        const potentialDocstrings = allComments.filter(
          (comment) =>
            comment.type === 'Block' && comment.value.trim().startsWith('*'),
        )

        for (const comment of potentialDocstrings) {
          // Comprobar si este comentario podría estar asociado con nuestro nodo

          // Caso 1: El comentario está justo antes del nodo (con posible export entre medias)
          if (
            comment.loc.end.line < lineStart &&
            lineStart - comment.loc.end.line <= 5
          ) {
            // Verificar si no hay otro nodo significativo entre el comentario y nuestro nodo
            const commentEndPos = comment.range[1]
            const nodeStartPos = node.range[0]

            // Texto entre el comentario y el nodo
            const textBetween = sourceCode
              .getText()
              .slice(commentEndPos, nodeStartPos)

            // Si solo contiene whitespace, exports, o comentarios simples, es válido
            if (
              /^[\s\n]*(export\s+default\s+|export\s+)?(\s*\/\/[^\n]*\n\s*)*$/.test(
                textBetween,
              )
            ) {
              return true
            }
          }

          // Caso 2: Este comentario podría estar dentro del nodo (para declaraciones complejas)
          if (
            comment.range[0] >= node.range[0] &&
            comment.range[1] <= node.range[1] &&
            // Asegurarse de que es el primer comentario dentro del nodo
            comment.range[0] - node.range[0] < 50 // Número arbitrario de caracteres para buscar solo al principio
          ) {
            return true
          }
        }

        // Caso 3: Consideración especial para docstrings al inicio del archivo
        // (donde podría no haber un nodo anterior al que asociar el comentario)
        if (lineStart <= 10) {
          // Si el nodo está cerca del inicio del archivo
          const leadingComments = allComments.filter(
            (comment) =>
              comment.type === 'Block' &&
              comment.value.trim().startsWith('*') &&
              comment.loc.start.line < lineStart,
          )

          if (leadingComments.length > 0) {
            // Verificar si este es el primer nodo después del primer docstring en el archivo
            const firstDocstring = leadingComments.sort(
              (a, b) => a.loc.start.line - b.loc.start.line,
            )[0]

            // Comprobar si no hay otros nodos que puedan reclamar este docstring
            const nodesInBetween = sourceCode.getNodesBetween(
              firstDocstring,
              node,
            )

            if (nodesInBetween.length <= 1) {
              // Solo el docstring y tal vez un 'export'
              return true
            }
          }
        }
      }

      return false
    }

    return {
      // Verificar definiciones de interfaz
      TSInterfaceDeclaration(node) {
        const name = node.id.name

        // Verificar convención de nombres
        if (interfaceNaming === 'PascalCase' && !isPascalCase(name)) {
          context.report({
            node: node.id,
            messageId: 'renameInterface',
            data: {
              name,
              convention: 'PascalCase',
            },
            fix(fixer) {
              // Convertir a PascalCase si comienza con I
              if (isIPascalCase(name)) {
                return fixer.replaceText(node.id, name.substring(1))
              }

              // Convertir primera letra a mayúscula
              return fixer.replaceText(
                node.id,
                name.charAt(0).toUpperCase() + name.slice(1),
              )
            },
          })
        } else if (interfaceNaming === 'IPascalCase' && !isIPascalCase(name)) {
          context.report({
            node: node.id,
            messageId: 'renameInterface',
            data: {
              name,
              convention: 'IPascalCase',
            },
            fix(fixer) {
              // Si ya está en PascalCase, añadir el prefijo I
              if (isPascalCase(name)) {
                return fixer.replaceText(node.id, 'I' + name)
              }

              // Convertir a IPascalCase
              return fixer.replaceText(
                node.id,
                'I' + name.charAt(0).toUpperCase() + name.slice(1),
              )
            },
          })
        }

        // Verificar si se debe usar un tipo en lugar de una interfaz
        const shouldUseType = node.extends && node.extends.length > 1 // Múltiples extensiones deberían ser una intersección

        if (shouldUseType) {
          context.report({
            node,
            messageId: 'useType',
            data: {
              category: 'multiple extension',
              name,
            },
          })
        }

        // Verificar docstring
        if (requireDocstring && !hasDocstring(node)) {
          context.report({
            node,
            messageId: 'missingDocstring',
            data: {
              name,
            },
          })
        }
      },

      // Verificar definiciones de tipo
      TSTypeAliasDeclaration(node) {
        const name = node.id.name

        // Verificar convención de nombres
        if (typeNaming === 'PascalCase' && !isPascalCase(name)) {
          context.report({
            node: node.id,
            messageId: 'renameType',
            data: {
              name,
              convention: 'PascalCase',
            },
            fix(fixer) {
              // Convertir a PascalCase si comienza con T
              if (isTPascalCase(name)) {
                return fixer.replaceText(node.id, name.substring(1))
              }

              // Convertir primera letra a mayúscula
              return fixer.replaceText(
                node.id,
                name.charAt(0).toUpperCase() + name.slice(1),
              )
            },
          })
        } else if (typeNaming === 'TPascalCase' && !isTPascalCase(name)) {
          context.report({
            node: node.id,
            messageId: 'renameType',
            data: {
              name,
              convention: 'TPascalCase',
            },
            fix(fixer) {
              // Si ya está en PascalCase, añadir el prefijo T
              if (isPascalCase(name)) {
                return fixer.replaceText(node.id, 'T' + name)
              }

              // Convertir a TPascalCase
              return fixer.replaceText(
                node.id,
                'T' + name.charAt(0).toUpperCase() + name.slice(1),
              )
            },
          })
        }

        // Verificar si se debe usar una interfaz en lugar de un tipo
        if (
          isObjectType(node.typeAnnotation) &&
          preferInterface.includes('object')
        ) {
          context.report({
            node,
            messageId: 'useInterface',
            data: {
              name,
            },
          })
        }

        // Verificar docstring
        if (requireDocstring && !hasDocstring(node)) {
          context.report({
            node,
            messageId: 'missingDocstring',
            data: {
              name,
            },
          })
        }
      },
    }
  },
}
