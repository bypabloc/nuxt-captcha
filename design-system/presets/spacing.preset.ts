import type { Preset, Rule } from 'unocss'
import { definePreset } from 'unocss'

/**
 * Preset de UnoCSS para utilidades dinámicas de espaciado personalizado
 * Proporciona utilidades de espaciado flexibles con múltiples opciones de formato
 *
 * ## Ejemplos de uso
 *
 * ### Valores numéricos fijos (unidades px)
 * - `m-4` → margin: 4px
 * - `p-16` → padding: 16px
 * - `gap-24` → gap: 24px
 *
 * ### Con unidades explícitas
 * - `m-2.5rem` → margin: 2.5rem
 * - `p-1.5em` → padding: 1.5em
 * - `gap-10vh` → gap: 10vh
 * - `mx-5%` → margin-left: 5%; margin-right: 5%
 *
 * ### Valores de fracción
 * - `m-1/2` → margin: 50%
 * - `p-1/4` → padding: 25%
 * - `gap-3/4` → gap: 75%
 *
 * ### Valores especiales
 * - `m-auto` → margin: auto
 * - `mx-auto` → margin-left: auto; margin-right: auto
 *
 * @author Pablo Contreras
 * @since 2025/04/11
 */
interface SpacingPresetOptions {
  name?: string
  options?: {
    defaultUnit?: string
  }
}

export default definePreset((params?: SpacingPresetOptions): Preset => {
  const {
    name = 'spacing-preset',
    options = { defaultUnit: 'px' },
  }: {
    name?: string
    options?: { defaultUnit?: string }
  } = params || {}

  /**
   * Convierte una cadena de valor de espaciado a un valor CSS válido
   * Maneja varios formatos: números, fracciones y valores con unidades
   *
   * @param value Valor de espaciado (ej. '4', '1/2', '2.5rem')
   * @returns Un valor de espaciado CSS válido
   */
  const getSpacingValue = (value: string): string => {
    if (value === 'auto') return 'auto'

    if (value.includes('/')) {
      const [numerator, denominator]: [number, number] = value
        .split('/')
        .map(Number) as [number, number]
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return `${(numerator / denominator) * 100}%`
      }
    }

    const unitRegex = /^([-.\d]+)(rem|em|px|%|vh|vw|vmin|vmax|ch|ex)$/
    const unitMatch = value.match(unitRegex)
    if (unitMatch) {
      return value
    }

    const numericValue = parseFloat(value)
    if (!isNaN(numericValue)) {
      return `${numericValue}${options.defaultUnit}`
    }

    return value
  }

  return {
    name,
    rules: [
      [
        /^m-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          margin: getSpacingValue(s),
        }),
      ],
      [
        /^mx-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-left': getSpacingValue(s),
          'margin-right': getSpacingValue(s),
        }),
      ],
      [
        /^my-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-top': getSpacingValue(s),
          'margin-bottom': getSpacingValue(s),
        }),
      ],
      [
        /^mt-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-top': getSpacingValue(s),
        }),
      ],
      [
        /^mr-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-right': getSpacingValue(s),
        }),
      ],
      [
        /^mb-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-bottom': getSpacingValue(s),
        }),
      ],
      [
        /^ml-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-left': getSpacingValue(s),
        }),
      ],

      [
        /^p-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          padding: getSpacingValue(s),
        }),
      ],
      [
        /^px-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'padding-left': getSpacingValue(s),
          'padding-right': getSpacingValue(s),
        }),
      ],
      [
        /^py-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'padding-top': getSpacingValue(s),
          'padding-bottom': getSpacingValue(s),
        }),
      ],
      [
        /^pt-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'padding-top': getSpacingValue(s),
        }),
      ],
      [
        /^pr-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'padding-right': getSpacingValue(s),
        }),
      ],
      [
        /^pb-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'padding-bottom': getSpacingValue(s),
        }),
      ],
      [
        /^pl-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'padding-left': getSpacingValue(s),
        }),
      ],

      [
        /^gap-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          gap: getSpacingValue(s),
        }),
      ],
      [
        /^gap-x-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'column-gap': getSpacingValue(s),
        }),
      ],
      [
        /^gap-y-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'row-gap': getSpacingValue(s),
        }),
      ],

      [
        /^space-x-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, Record<string, string>> => ({
          '& > :not([hidden]) ~ :not([hidden])': {
            '--un-space-x-reverse': '0',
            'margin-right': `calc(${getSpacingValue(s)} * var(--un-space-x-reverse))`,
            'margin-left': `calc(${getSpacingValue(s)} * calc(1 - var(--un-space-x-reverse)))`,
          },
        }),
      ],
      [
        /^space-y-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, Record<string, string>> => ({
          '& > :not([hidden]) ~ :not([hidden])': {
            '--un-space-y-reverse': '0',
            'margin-top': `calc(${getSpacingValue(s)} * calc(1 - var(--un-space-y-reverse)))`,
            'margin-bottom': `calc(${getSpacingValue(s)} * var(--un-space-y-reverse))`,
          },
        }),
      ],

      [
        /^-m-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          margin: `-${getSpacingValue(s)}`,
        }),
      ],
      [
        /^-mx-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-left': `-${getSpacingValue(s)}`,
          'margin-right': `-${getSpacingValue(s)}`,
        }),
      ],
      [
        /^-my-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-top': `-${getSpacingValue(s)}`,
          'margin-bottom': `-${getSpacingValue(s)}`,
        }),
      ],
      [
        /^-mt-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-top': `-${getSpacingValue(s)}`,
        }),
      ],
      [
        /^-mr-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-right': `-${getSpacingValue(s)}`,
        }),
      ],
      [
        /^-mb-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-bottom': `-${getSpacingValue(s)}`,
        }),
      ],
      [
        /^-ml-([-.\d\w/%]+)$/,
        ([, s]: string[]): Record<string, string> => ({
          'margin-left': `-${getSpacingValue(s)}`,
        }),
      ],
    ] as Rule[],
    shortcuts: {
      'm-auto': 'margin-auto',
      'mx-auto': 'margin-left-auto margin-right-auto',
    },
  }
})
