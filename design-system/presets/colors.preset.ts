// design-system/presets/colors.preset.ts

import type { Preset, Rule } from 'unocss'
import { definePreset } from 'unocss'

/**
 * Preset de UnoCSS para utilidades de color
 *
 * ## Ejemplos de uso
 *
 * - `vk-color-text-destacame` → Aplica el color destacame al texto
 * - `vk-color-bg-success` → Aplica el color de éxito al fondo
 * - `vk-color-border-color-error` → Aplica el color de error a los bordes
 *
 * @author Pablo Contreras
 * @since 2025/04/16
 */
interface ColorsPresetOptions {
  name?: string
  options?: {
    prefix?: {
      text?: string
      bg?: string
      border?: string
    }
  }
}

/**
 * Definición centralizada de los nombres de colores.
 * Utilizamos un objeto constante como única fuente de verdad para
 * los valores de los nombres de colores.
 *
 * @author Pablo Contreras
 * @since 2025/04/24
 */
export const COLOR_NAMES = {
  // Colores primarios
  WHITE: 'white',
  BABY_BLUE: 'baby-blue',
  FLUOR_GREEN: 'fluor-green',
  DARK_GREEN: 'dark-green',
  DARK_GRAY: 'dark-gray',

  // Colores secundarios
  DARK_BLUE: 'dark-blue',
  MEDIUM_GREEN: 'medium-green',
  GRAY: 'gray',
  LIGHT_GRAY: 'light-gray',

  // Escalas para fluor-green (90-20)
  FLUOR_GREEN_90: 'fluor-green-90',
  FLUOR_GREEN_80: 'fluor-green-80',
  FLUOR_GREEN_70: 'fluor-green-70',
  FLUOR_GREEN_60: 'fluor-green-60',
  FLUOR_GREEN_50: 'fluor-green-50',
  FLUOR_GREEN_40: 'fluor-green-40',
  FLUOR_GREEN_30: 'fluor-green-30',
  FLUOR_GREEN_20: 'fluor-green-20',

  // Escalas para dark-green (90-20)
  DARK_GREEN_90: 'dark-green-90',
  DARK_GREEN_80: 'dark-green-80',
  DARK_GREEN_70: 'dark-green-70',
  DARK_GREEN_60: 'dark-green-60',
  DARK_GREEN_50: 'dark-green-50',
  DARK_GREEN_40: 'dark-green-40',
  DARK_GREEN_30: 'dark-green-30',
  DARK_GREEN_20: 'dark-green-20',

  // Escalas para dark-gray (90-20)
  DARK_GRAY_90: 'dark-gray-90',
  DARK_GRAY_80: 'dark-gray-80',
  DARK_GRAY_70: 'dark-gray-70',
  DARK_GRAY_60: 'dark-gray-60',
  DARK_GRAY_50: 'dark-gray-50',
  DARK_GRAY_40: 'dark-gray-40',
  DARK_GRAY_30: 'dark-gray-30',
  DARK_GRAY_20: 'dark-gray-20',

  error: 'error',
  success: 'success',
  warning: 'warning',
  info: 'info',
} as const

/**
 * Tipo que representa los valores válidos de nombres de colores.
 * Se genera automáticamente a partir del objeto COLOR_NAMES.
 *
 * @author Pablo Contreras
 * @since 2025/04/24
 */
export type ColorName = (typeof COLOR_NAMES)[keyof typeof COLOR_NAMES]

/**
 * Función para validar si un valor es un nombre de color válido.
 *
 * @param colorName - Nombre de color a validar
 * @returns true si el valor es un nombre de color válido, false en caso contrario
 *
 * @author Pablo Contreras
 * @since 2025/04/24
 */
export function isValidColorName(colorName: string): boolean {
  return Object.values(COLOR_NAMES).includes(colorName as ColorName)
}

// Define colors based on the image palette
export const colors: Record<string, string> = {
  // Colores primarios
  [COLOR_NAMES.WHITE]: '#FFFFFF',
  [COLOR_NAMES.BABY_BLUE]: '#D9F2FF',
  [COLOR_NAMES.FLUOR_GREEN]: '#01D46C',
  [COLOR_NAMES.DARK_GREEN]: '#003017',
  [COLOR_NAMES.DARK_GRAY]: '#212121',

  // Colores secundarios
  [COLOR_NAMES.DARK_BLUE]: '#7AB6D5',
  [COLOR_NAMES.MEDIUM_GREEN]: '#1BA461',
  [COLOR_NAMES.GRAY]: '#bababa',
  [COLOR_NAMES.LIGHT_GRAY]: '#D8D7D7',

  // Escalas para fluor-green (90-20)
  [COLOR_NAMES.FLUOR_GREEN_90]: '#19D87A',
  [COLOR_NAMES.FLUOR_GREEN_80]: '#33DD89',
  [COLOR_NAMES.FLUOR_GREEN_70]: '#4DE297',
  [COLOR_NAMES.FLUOR_GREEN_60]: '#66E6A6',
  [COLOR_NAMES.FLUOR_GREEN_50]: '#80EBB5',
  [COLOR_NAMES.FLUOR_GREEN_40]: '#99EFC3',
  [COLOR_NAMES.FLUOR_GREEN_30]: '#B3F4D2',
  [COLOR_NAMES.FLUOR_GREEN_20]: '#CCF8E0',

  // Escalas para dark-green (90-20)
  [COLOR_NAMES.DARK_GREEN_90]: '#19442E',
  [COLOR_NAMES.DARK_GREEN_80]: '#335845',
  [COLOR_NAMES.DARK_GREEN_70]: '#4D6D5C',
  [COLOR_NAMES.DARK_GREEN_60]: '#668374',
  [COLOR_NAMES.DARK_GREEN_50]: '#80978A',
  [COLOR_NAMES.DARK_GREEN_40]: '#99ABA1',
  [COLOR_NAMES.DARK_GREEN_30]: '#B3C0B8',
  [COLOR_NAMES.DARK_GREEN_20]: '#CCD5CF',

  // Escalas para dark-gray (90-20)
  [COLOR_NAMES.DARK_GRAY_90]: '#393939',
  [COLOR_NAMES.DARK_GRAY_80]: '#525252',
  [COLOR_NAMES.DARK_GRAY_70]: '#6B6B6B',
  [COLOR_NAMES.DARK_GRAY_60]: '#848484',
  [COLOR_NAMES.DARK_GRAY_50]: '#9D9D9D',
  [COLOR_NAMES.DARK_GRAY_40]: '#B6B6B6',
  [COLOR_NAMES.DARK_GRAY_30]: '#CFCFCF',
  [COLOR_NAMES.DARK_GRAY_20]: '#E8E8E8',

  // Colores de estado
  [COLOR_NAMES.error]: '#FF0031',
  [COLOR_NAMES.success]: '#1BA461',
  [COLOR_NAMES.warning]: '#FFA500',
  [COLOR_NAMES.info]: '#0000FF',
}

/**
 * Genera una lista de clases de safelist basada en los colores del sistema
 *
 * @param prefixes Los prefijos para las clases (texto, fondo, borde)
 * @returns Array de strings con todas las clases posibles
 *
 * @author Pablo Contreras
 * @since 2025/04/17
 */
export const generateColorSafelist = (
  prefixes: {
    text: string
    bg: string
    border: string
  },
  includeOnly?: string[],
): string[] => {
  const safelist: string[] = []
  const colorNames = includeOnly || Object.values(COLOR_NAMES)

  colorNames.forEach((colorName: string) => {
    safelist.push(`${prefixes.text}${colorName}`)
    safelist.push(`${prefixes.border}${colorName}`)
    safelist.push(`${prefixes.bg}${colorName}`)
  })

  return safelist
}

export default definePreset((params?: ColorsPresetOptions): Preset => {
  const {
    name = 'colors-preset',
    options = {
      prefix: {
        text: 'vk-color-text-',
        bg: 'vk-color-bg-',
        border: 'vk-color-border-color-',
      },
    },
  }: {
    name?: string
    options?: {
      prefix?: {
        text?: string
        bg?: string
        border?: string
      }
    }
  } = params || {}

  const prefix = {
    text: options.prefix?.text || 'vk-color-text-',
    bg: options.prefix?.bg || 'vk-color-bg-',
    border: options.prefix?.border || 'vk-color-border-color-',
  }

  const colorsDark: Record<string, string> = {}

  const textColorRules: Rule[] = Object.entries(colors).map(
    ([name, value]: [string, string]): Rule => [
      new RegExp(`^${prefix.text}${name}$`),
      (): Record<string, string> => ({ color: `${value} !important` }),
    ],
  )

  const bgColorRules: Rule[] = Object.entries(colors).map(
    ([name, value]: [string, string]): Rule => [
      new RegExp(`^${prefix.bg}${name}$`),
      (): Record<string, string> => ({
        'background-color': `${value} !important`,
      }),
    ],
  )

  const borderColorRules: Rule[] = Object.entries(colors).map(
    ([name, value]: [string, string]): Rule => [
      new RegExp(`^${prefix.border}${name}$`),
      (): Record<string, string> => ({ 'border-color': `${value} !important` }),
    ],
  )

  const darkHoverRules: Rule[] = Object.entries(colorsDark).map(
    ([name, value]: [string, string]): Rule => [
      new RegExp(`^${prefix.bg}${name}--dark:hover$`),
      (): Record<string, string> => ({
        'background-color': `${value} !important`,
      }),
    ],
  )

  return {
    name,
    rules: [
      ...textColorRules,
      ...bgColorRules,
      ...borderColorRules,
      ...darkHoverRules,
    ],
    theme: {
      colors,
    },
    layers: {
      utilities: -1,
    },
    shortcuts: {
      'text-primary': 'vk-color-text-dark-green',
      'bg-primary': 'vk-color-bg-medium-green',
    },
  }
})
