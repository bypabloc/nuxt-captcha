// design-system/presets/index.preset.ts

import type { Preset } from 'unocss'
import { definePreset } from 'unocss'
import colorsPreset, { generateColorSafelist } from './colors.preset'
import { generateIconSafelist } from './icons.preset'
import spacingPreset from './spacing.preset'
import typographyPreset, {
    generateTypographySafelist,
} from './typography.preset'
import variablesPreset from './variables.preset'

/**
 * Preset combinado de UnoCSS para todo el sistema de diseño
 * Combina presets de tipografía, colores, variables y espaciado
 *
 * @since 2025/04/11
 */
interface DesignSystemPresetOptions {
  name?: string
  typography?: {
    prefix?: string
    fontFamily?: string
  }
  colors?: {
    prefix?: {
      text?: string
      bg?: string
      border?: string
    }
  }
  variables?: {
    prefix?: {
      width?: string
      height?: string
      order?: string
      gap?: string
    }
  }
  spacing?: {
    defaultUnit?: string
  }
}

export default definePreset((params?: DesignSystemPresetOptions): Preset => {
  const {
    name = 'design-system',
    typography = {},
    colors = {},
    variables = {},
    spacing = {},
  }: {
    name?: string
    typography?: {
      prefix?: string
      fontFamily?: string
    }
    colors?: {
      prefix?: {
        text?: string
        bg?: string
        border?: string
      }
    }
    variables?: {
      prefix?: {
        width?: string
        height?: string
        order?: string
        gap?: string
      }
    }
    spacing?: {
      defaultUnit?: string
    }
  } = params || {}

  const typographyPrefix = typography.prefix || 'vk-typography-'

  const colorPrefixes = {
    text: colors.prefix?.text || 'vk-color-text-',
    bg: colors.prefix?.bg || 'vk-color-bg-',
    border: colors.prefix?.border || 'vk-color-border-color-',
  }

  const colorSafelist = generateColorSafelist(colorPrefixes)
  const iconSafelist = generateIconSafelist()
  const typographySafelist = generateTypographySafelist(typographyPrefix)

  return {
    name,
    presets: [
      typographyPreset({
        name: `${name}-typography`,
        options: {
          prefix: typography.prefix,
          fontFamily: typography.fontFamily,
        },
      }),
      colorsPreset({
        name: `${name}-colors`,
        options: {
          prefix: colors.prefix,
        },
      }),
      variablesPreset({
        name: `${name}-variables`,
        options: {
          prefix: variables.prefix,
        },
      }),
      spacingPreset({
        name: `${name}-spacing`,
        options: {
          defaultUnit: spacing.defaultUnit,
        },
      }),
    ],
    safelist: [...colorSafelist, ...iconSafelist, ...typographySafelist],
  }
})
