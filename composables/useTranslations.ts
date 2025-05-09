// composables/useTranslations.ts
import type { VueMessageType } from 'vue-i18n'

/**
 * Verifica si un valor es del tipo TranslationOptions
 * @param value Valor a comprobar
 * @returns true si el valor es un objeto TranslationOptions
 */
function isTranslationOptions(value: unknown): value is ITranslationOptions {
  return (
    value !== null &&
    typeof value === 'object' &&
    ('specificKey' in value ||
      'transform' in value ||
      'asArray' in value ||
      'sortBy' in value ||
      'reverse' in value ||
      'itemsParams' in value)
  )
}

/**
 * Composable flexible para trabajar con traducciones
 *
 * @author Pablo Contreras
 * @since 2025/05/02
 * @returns {II18n} Funciones y utilidades para manejar traducciones
 */
export function useTranslations(): II18n {
  const { t: originalT, tm, rt }: I18n = useI18n()

  const $logger = useNuxtApp().$logger

  /**
   * Verifica si un valor es un objeto no vacío
   *
   * @param {unknown} value - Valor a verificar
   * @returns {boolean} - True si es un objeto no vacío
   */
  const isValidObject = (value: unknown): boolean => {
    return (
      value !== null &&
      value !== undefined &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as object).length > 0
    )
  }

  /**
   * Verifica si un valor es un array no vacío
   *
   * @param {unknown} value - Valor a verificar
   * @returns {boolean} - True si es un array no vacío
   */
  const isValidArray = (value: unknown): boolean => {
    return Array.isArray(value) && value.length > 0
  }

  /**
   * Obtiene los parámetros específicos para un elemento
   *
   * @param {string|number} itemKey - Clave o índice del elemento
   * @param {ITranslationOptions} options - Opciones de configuración
   * @returns {Record<string, unknown>|undefined} - Parámetros para el elemento o undefined
   */
  const getItemParams = (
    itemKey: string | number,
    options: ITranslationOptions,
  ): Record<string, unknown> | undefined => {
    // Si no hay itemsParams, usar los parámetros globales
    if (!options.itemsParams) {
      return options.params
    }

    // Si es un array, usar el índice numérico
    if (Array.isArray(options.itemsParams)) {
      const index =
        typeof itemKey === 'string' ? parseInt(itemKey, 10) : itemKey
      // Verificar que el índice existe en itemsParams y es válido
      if (!isNaN(index) && index >= 0 && index < options.itemsParams.length) {
        return {
          ...options.params, // Parámetros globales como base
          ...options.itemsParams[index], // Parámetros específicos del elemento
        }
      }
    }
    // Si es un objeto, usar la clave directamente
    else if (
      isValidObject(options.itemsParams) &&
      typeof itemKey === 'string'
    ) {
      if (itemKey in options.itemsParams) {
        return {
          ...options.params, // Parámetros globales como base
          ...options.itemsParams[itemKey], // Parámetros específicos del elemento
        }
      }
    }

    // Si no se encuentra, devolver parámetros globales
    return options.params
  }

  /**
   * Procesa traducciones según configuración
   *
   * @param {string} key - Clave de traducción a buscar
   * @param {ITranslationOptions} options - Opciones de configuración
   * @returns {Record<string, unknown> | unknown[]} - Traducciones procesadas
   */
  const processTranslations = (
    key: string,
    options: ITranslationOptions = {},
  ): Record<string, unknown> | unknown[] => {
    // Obtener el objeto/array de traducciones
    const translationData = tm(key)

    // Verificar si los datos son válidos (ya sea objeto o array)
    const hasData: boolean =
      isValidObject(translationData) || isValidArray(translationData)

    $logger.info(
      `[useTranslations] Clave: ${key}, Datos válidos: ${hasData}`,
      translationData,
    )

    if (!hasData) {
      $logger.warn(
        `[useTranslations] No se encontraron datos para la clave: ${key}`,
      )
      return options.asArray ? [] : {}
    }

    // Si se solicita una clave específica y existe
    if (options.specificKey && translationData[options.specificKey]) {
      // Obtener parámetros específicos para este elemento
      const itemParams = getItemParams(options.specificKey, options)

      // Traducir solo esa clave específica con parámetros
      const specificItem = translationData[options.specificKey]
      // Pasar los parámetros directamente a rt(), asegurando que no sea undefined
      const translatedValue = rt(specificItem, itemParams || {})

      // Return as array or object based on options.asArray
      if (options.asArray) {
        return [{ id: options.specificKey, value: translatedValue }]
      }
      return { [options.specificKey]: translatedValue }
    }

    // Determinar si es un array o un objeto con claves numéricas
    const isArrayType: boolean = Array.isArray(translationData)

    // Para objetos, verificar si todas las claves son numéricas
    const isArrayLike: boolean =
      !isArrayType &&
      Object.keys(translationData as object).every(
        (k: string): boolean => !isNaN(parseInt(k, 10)),
      )

    // Si debe procesarse como array (o ya es un array o tiene claves numéricas o se fuerza con options.asArray)
    if (isArrayType || isArrayLike || options.asArray) {
      let entries: [string, unknown][] = []

      // Convertir a entries según el tipo
      if (isArrayType) {
        // Si es array, convertir a entries con índices
        entries = (translationData as unknown[]).map(
          (value: unknown, index: number): [string, unknown] => [
            String(index),
            value,
          ],
        )
      } else {
        // Si es objeto, usar Object.entries normal
        entries = Object.entries(translationData as object)
      }

      // Convertir a array procesando cada elemento
      const result = entries.map(
        ([itemKey, itemValue]: [string, unknown]): Record<string, unknown> => {
          // Obtener parámetros específicos para este elemento
          const itemParams = getItemParams(itemKey, options)

          // Crear objeto base con id
          const processedItem: Record<string, unknown> = { id: itemKey }

          // Si el elemento es un objeto, procesar cada propiedad
          if (typeof itemValue === 'object' && itemValue !== null) {
            Object.entries(itemValue).forEach(
              ([propKey, propValue]: [string, unknown]): void => {
                // Pasar los parámetros directamente a rt(), asegurando que no sea undefined
                processedItem[propKey] = rt(
                  propValue as VueMessageType,
                  itemParams || {},
                )
              },
            )
          } else {
            // Si es un valor simple, asignarlo a la propiedad 'value'
            // Pasar los parámetros directamente a rt(), asegurando que no sea undefined
            processedItem.value = rt(
              itemValue as VueMessageType,
              itemParams || {},
            )
          }

          // Aplicar transformación personalizada si se proporciona
          if (typeof options.transform === 'function') {
            return options.transform(processedItem, itemKey, itemValue)
          }

          return processedItem
        },
      )

      // Ordenar si se especifica una propiedad de ordenamiento
      if (options.sortBy) {
        result.sort(
          (a: Record<string, unknown>, b: Record<string, unknown>): number => {
            const aValue = a[options.sortBy as string] as
              | string
              | number
              | boolean
            const bValue = b[options.sortBy as string] as
              | string
              | number
              | boolean
            if (aValue < bValue) return -1
            if (aValue > bValue) return 1
            return 0
          },
        )
      } else if (isArrayLike || isArrayType) {
        // Ordenar por id numérico por defecto para array-like objects o arrays reales
        result.sort(
          (a: Record<string, unknown>, b: Record<string, unknown>): number =>
            parseInt(a.id as string, 10) - parseInt(b.id as string, 10),
        )
      }

      // Invertir el orden si se solicita
      if (options.reverse) {
        result.reverse()
      }

      return result
    } else {
      // Procesar como objeto regular
      const result: Record<string, unknown> = {}

      Object.entries(translationData as object).forEach(
        ([key, value]: [string, unknown]): void => {
          // Obtener parámetros específicos para este elemento
          const itemParams = getItemParams(key, options)

          // Si el valor es un objeto, procesar recursivamente sus propiedades
          if (typeof value === 'object' && value !== null) {
            const processedProps: Record<string, unknown> = {}

            Object.entries(value).forEach(
              ([propKey, propValue]: [string, unknown]): void => {
                // Pasar los parámetros directamente a rt(), asegurando que no sea undefined
                processedProps[propKey] = rt(
                  propValue as VueMessageType,
                  itemParams || {},
                )
              },
            )

            result[key] = processedProps
          } else {
            // Si es un valor simple, traducirlo directamente
            // Pasar los parámetros directamente a rt(), asegurando que no sea undefined
            result[key] = rt(value as VueMessageType, itemParams || {})
          }
        },
      )

      // Aplicar transformación personalizada si se proporciona
      if (typeof options.transform === 'function') {
        return options.transform(result, '', translationData)
      }

      return result
    }
  }

  /**
   * Función t mejorada que maneja tanto traducciones simples como complejas
   *
   * @param {string} key - Clave de traducción
   * @param {Record<string, unknown> | ITranslationOptions} params - Parámetros o opciones de traducción
   * @returns {string | Record<string, unknown> | unknown[]} - Traducción procesada
   */
  const enhancedT = (
    key: string,
    params?: Record<string, unknown> | ITranslationOptions,
  ): string | Record<string, unknown> | unknown[] => {
    // Si no hay parámetros, usar t normal
    if (!params) {
      return originalT(key)
    }

    // Verificar si params es ITranslationOptions
    if (isTranslationOptions(params)) {
      // Procesar como traducciones complejas
      return processTranslations(key, params)
    } else {
      // Usar t normal con parámetros simples
      return originalT(key, params)
    }
  }

  // Función rt que pasa directamente los parámetros a Vue I18n
  const rtWithParams = (
    message: unknown,
    params?: Record<string, unknown>,
  ): string => {
    // Type assertion para satisfacer la firma de rt
    return rt(message as VueMessageType, params || {})
  }

  return {
    t: enhancedT,
    tm,
    rt: rtWithParams,
  }
}
