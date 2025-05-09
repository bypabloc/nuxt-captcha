import type { Preset, Rule } from 'unocss'
import { definePreset } from 'unocss'

/**
 * Preset de UnoCSS para variables de diseño
 *
 * ## Ejemplos de uso
 *
 * - `vk-var-width-50` → width: 50%
 * - `vk-var-height-75` → height: 75%
 * - `vk-flex-order-2` → order: 2
 * - `vk-gap-4` → gap: 16px
 *
 * @since 2025/04/11
 */
interface VariablesPresetOptions {
  name?: string
  options?: {
    prefix?: {
      width?: string
      height?: string
      order?: string
      gap?: string
    }
  }
}

export default definePreset((params?: VariablesPresetOptions): Preset => {
  const {
    name = 'variables-preset',
    options = {
      prefix: {
        width: 'vk-var-width-',
        height: 'vk-var-height-',
        order: 'vk-flex-order-',
        gap: 'vk-gap-',
      },
    },
  }: {
    name?: string
    options?: {
      prefix?: {
        width?: string
        height?: string
        order?: string
        gap?: string
      }
    }
  } = params || {}

  const prefix = {
    width: options.prefix?.width || 'vk-var-width-',
    height: options.prefix?.height || 'vk-var-height-',
    order: options.prefix?.order || 'vk-flex-order-',
    gap: options.prefix?.gap || 'vk-gap-',
  }

  const widthRules: Rule[] = []
  for (let i: number = 0; i <= 100; i++) {
    widthRules.push([
      new RegExp(`^${prefix.width}${i}$`),
      (): Record<string, string> => ({ width: `${i}% !important` }),
    ])
  }

  const heightRules: Rule[] = []
  for (let i: number = 0; i <= 100; i++) {
    heightRules.push([
      new RegExp(`^${prefix.height}${i}$`),
      (): Record<string, string> => ({ height: `${i}% !important` }),
    ])
  }

  const orderRules: Rule[] = []
  for (let i: number = 0; i <= 100; i++) {
    orderRules.push([
      new RegExp(`^${prefix.order}${i}$`),
      (): Record<string, string> => ({ order: `${i} !important` }),
    ])
  }

  const gapRules: Rule[] = []
  for (let i: number = 0; i <= 100; i++) {
    gapRules.push([
      new RegExp(`^${prefix.gap}${i}$`),
      (): Record<string, string> => ({ gap: `${i * 4}px !important` }),
    ])
  }

  return {
    name,
    rules: [...widthRules, ...heightRules, ...orderRules, ...gapRules],
  }
})
