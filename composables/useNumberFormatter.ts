interface NumberFormatterActions {
  /**
   * Formatea un numero o un string representando un numero a entero
   * Retorna un string vacio si el input es invalido
   * @param value El numero o string a formatear
   * @returns El entero como string o un string vació si hay error
   */
  formatInteger(value: number | string): string
}

/**
 * Provee funciones para formatear números
 * @returns {NumberFormatterActions}
 *
 * @author Pablo Contreras
 * @since 2025-04-30
 */
export const useNumberFormatter = (): NumberFormatterActions => {
  const $logger = useNuxtApp().$logger

  const formatInteger = (value: number | string): string => {
    try {
      const numberValue = parseFloat(value.toString())
      if (isNaN(numberValue)) {
        throw new Error('Invalid number input')
      }
      // Usa parseInt para obtener el entero, truncando los decimales.
      // Convierte de vuelta a string
      return parseInt(numberValue.toString(), 10).toString()
    } catch (error) {
      $logger.error('Error formatting number to integer:', error)
      return ''
    }
  }

  return { formatInteger }
}
