import type { Preset, Rule } from 'unocss'
import { definePreset } from 'unocss'
import { COLOR_NAMES } from './colors.preset'

/**
 * Definición centralizada de los estilos tipográficos.
 * Utilizamos un objeto constante como única fuente de verdad para
 * los valores de los estilos tipográficos.
 *
 * @author Pablo Contreras
 * @since 2025/04/23
 */
export const TYPOGRAPHY_STYLES = {
  HERO: 'hero',
  TITLE_1: 'title-1',
  TITLE_2: 'title-2',
  TITLE_3: 'title-3',
  SUBTITLE_1: 'subtitle-1',
  SUBTITLE_2: 'subtitle-2',
  SUBTITLE_3: 'subtitle-3',
  SUBTITLE_4: 'subtitle-4',
  BODY: 'body',
  CAPTION: 'caption',
  BUTTON: 'button',
  BUTTON_SMALL: 'button-small',
  AUXILIAR: 'auxiliar',
  MINI_DESKTOP: 'mini-desktop',
  MINI_MOBILE: 'mini-mobile',
} as const

/**
 * Tipo que representa los valores válidos de estilos tipográficos.
 * Se genera automáticamente a partir del objeto TYPOGRAPHY_STYLES.
 *
 * @author Pablo Contreras
 * @since 2025/04/23
 */
export type TypographyStyle =
  (typeof TYPOGRAPHY_STYLES)[keyof typeof TYPOGRAPHY_STYLES]

/**
 * Definición centralizada de las variantes tipográficas.
 * Utilizamos un objeto constante como única fuente de verdad para
 * los valores de las variantes tipográficas.
 *
 * @author Pablo Contreras
 * @since 2025/04/23
 */
export const TYPOGRAPHY_VARIANTS = {
  LIGHT: 'light',
  REGULAR: 'regular',
  MEDIUM: 'medium',
  BOLD: 'bold',
  OBLIQUE: 'oblique',
  OBLIQUE_BOLD: 'oblique-bold',
} as const

/**
 * Tipo que representa los valores válidos de variantes tipográficas.
 * Se genera automáticamente a partir del objeto TYPOGRAPHY_VARIANTS.
 *
 * @author Pablo Contreras
 * @since 2025/04/23
 */
export type TypographyVariant =
  (typeof TYPOGRAPHY_VARIANTS)[keyof typeof TYPOGRAPHY_VARIANTS]

/**
 * Genera una lista de clases de safelist basada en los estilos tipográficos del sistema
 *
 * Esta función crea todas las combinaciones posibles de estilos y variantes tipográficas
 * para que estén disponibles en la compilación final de CSS, incluso si no son detectadas
 * durante el análisis estático del código.
 *
 * @param prefix El prefijo para las clases tipográficas (ej: 'vk-typography-')
 * @param options Opciones para filtrar los estilos o variantes incluidos
 * @returns Array de strings con todas las clases tipográficas posibles
 *
 * @author Pablo Contreras
 * @since 2025/04/23
 */
export const generateTypographySafelist = (
  prefix: string = 'vk-typography-',
  options?: {
    includeOnly?: {
      styles?: TypographyStyle[]
      variants?: TypographyVariant[]
    }
  },
): string[] => {
  const safelist: string[] = []

  // Determinar qué estilos incluir
  const stylesArray: TypographyStyle[] =
    options?.includeOnly?.styles || Object.values(TYPOGRAPHY_STYLES)

  // Determinar qué variantes incluir
  const variantsArray: TypographyVariant[] =
    options?.includeOnly?.variants || Object.values(TYPOGRAPHY_VARIANTS)

  // Generar combinaciones de estilos y variantes
  stylesArray.forEach((style: TypographyStyle) => {
    // Incluir la clase solo para el estilo (sin variante específica)
    safelist.push(`${prefix}${style}`)

    // Incluir combinaciones de estilo-variante
    variantsArray.forEach((variant: TypographyVariant) => {
      safelist.push(`${prefix}${style}-${variant}`)
    })
  })

  return safelist
}

/**
 * Preset de UnoCSS para estilos tipográficos
 *
 * ## Ejemplos de uso
 *
 * - `vk-typography-hero-light` → Aplica el estilo tipográfico hero en su variante light
 * - `vk-typography-title-1-bold` → Aplica el estilo tipográfico title-1 en su variante bold
 * - `vk-typography-body-regular` → Aplica el estilo tipográfico body en su variante regular
 *
 * @author Pablo Contreras
 * @since 2025/04/23
 */
interface TypographyPresetOptions {
  name?: string
  options?: {
    prefix?: string
    fontFamily?: string
  }
  safelist?: {
    includeOnly?: {
      styles?: TypographyStyle[]
      variants?: TypographyVariant[]
    }
  }
}

export function isValidStyle(styleName: string): boolean {
  return Object.values(TYPOGRAPHY_STYLES).includes(styleName as TypographyStyle)
}

export function isValidVariant(variantName: string): boolean {
  return Object.values(TYPOGRAPHY_VARIANTS).includes(
    variantName as TypographyVariant,
  )
}

export default definePreset((params?: TypographyPresetOptions): Preset => {
  const {
    name = 'typography-preset',
    options = {
      prefix: 'vk-typography-',
      fontFamily: undefined,
    },
    safelist = {},
  }: {
    name?: string
    options?: {
      prefix?: string
      fontFamily?: string
    }
    safelist?: {
      includeOnly?: {
        styles?: TypographyStyle[]
        variants?: TypographyVariant[]
      }
    }
  } = params || {}

  const prefix = options.prefix || 'vk-typography-'

  const commonFontSettings = {
    'font-feature-settings': '"liga" off, "clig" off',
    color: `vk-color-text-${COLOR_NAMES.DARK_GRAY}`,
  }

  const typographies: Record<string, Record<string, Record<string, string>>> = {
    // Hero
    [TYPOGRAPHY_STYLES.HERO]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '60px',
        'font-style': 'normal',
        'font-weight': '300',
        'line-height': 'normal',
        'letter-spacing': '-0.5px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '60px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '-0.5px',
      },
    },

    // Title 1
    [TYPOGRAPHY_STYLES.TITLE_1]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '48px',
        'font-style': 'normal',
        'font-weight': '300',
        'line-height': 'normal',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '48px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
      },
    },

    // Title 2
    [TYPOGRAPHY_STYLES.TITLE_2]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '34px',
        'font-style': 'normal',
        'font-weight': '300',
        'line-height': '36px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '34px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
      },
    },

    // Title 3
    [TYPOGRAPHY_STYLES.TITLE_3]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '28px',
        'font-style': 'normal',
        'font-weight': '300',
        'line-height': '36px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '28px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
      },
    },

    // Subtitle 1
    [TYPOGRAPHY_STYLES.SUBTITLE_1]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '24px',
        'font-style': 'normal',
        'font-weight': '300',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.REGULAR]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '24px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.MEDIUM]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '24px',
        'font-style': 'normal',
        'font-weight': '500',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Murecho',
        'font-size': '24px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
    },

    // Subtitle 2
    [TYPOGRAPHY_STYLES.SUBTITLE_2]: {
      [TYPOGRAPHY_VARIANTS.REGULAR]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '24px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.18px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '24px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '0.18px',
      },
    },

    // Subtitle 3
    [TYPOGRAPHY_STYLES.SUBTITLE_3]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '20px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.REGULAR]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '20px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '20px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '20px',
        'font-style': 'italic',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE_BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '20px',
        'font-style': 'italic',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
    },

    // Subtitle 4
    [TYPOGRAPHY_STYLES.SUBTITLE_4]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '18px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.REGULAR]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '18px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '18px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '18px',
        'font-style': 'italic',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE_BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '18px',
        'font-style': 'italic',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
    },

    // Body
    [TYPOGRAPHY_STYLES.BODY]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '16px',
        'font-style': 'normal',
        'font-weight': '300',
        'line-height': '26px',
      },
      [TYPOGRAPHY_VARIANTS.REGULAR]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '16px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.15px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '16px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': '26px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '16px',
        'font-style': 'italic',
        'font-weight': '400',
        'line-height': '26px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE_BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '16px',
        'font-style': 'italic',
        'font-weight': '700',
        'line-height': '26px',
      },
    },

    // Caption
    [TYPOGRAPHY_STYLES.CAPTION]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '14px',
        'font-style': 'normal',
        'font-weight': '300',
        'line-height': '20px',
        'letter-spacing': '0.4px',
      },
      [TYPOGRAPHY_VARIANTS.REGULAR]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '14px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': '20px',
        'letter-spacing': '0.4px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '14px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': '20px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '14px',
        'font-style': 'italic',
        'font-weight': '400',
        'line-height': '20px',
        'letter-spacing': '0.4px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE_BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '14px',
        'font-style': 'italic',
        'font-weight': '700',
        'line-height': '20px',
      },
    },

    // Button
    [TYPOGRAPHY_STYLES.BUTTON]: {
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '14px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': '16px',
        'letter-spacing': '2.5px',
        'text-transform': 'uppercase',
      },
    },

    // Button Small
    [TYPOGRAPHY_STYLES.BUTTON_SMALL]: {
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '10px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': '16px',
        'letter-spacing': '2.5px',
        'text-transform': 'uppercase',
      },
    },

    // Auxiliar
    [TYPOGRAPHY_STYLES.AUXILIAR]: {
      [TYPOGRAPHY_VARIANTS.LIGHT]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '12px',
        'font-style': 'normal',
        'font-weight': '300',
        'line-height': 'normal',
        'letter-spacing': '0.4px',
      },
      [TYPOGRAPHY_VARIANTS.REGULAR]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '12px',
        'font-style': 'normal',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.4px',
      },
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '12px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '0.4px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '12px',
        'font-style': 'italic',
        'font-weight': '400',
        'line-height': 'normal',
        'letter-spacing': '0.4px',
      },
      [TYPOGRAPHY_VARIANTS.OBLIQUE_BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '12px',
        'font-style': 'italic',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '0.4px',
      },
    },

    // Mini Desktop
    [TYPOGRAPHY_STYLES.MINI_DESKTOP]: {
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '12px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '2px',
        'text-transform': 'uppercase',
      },
    },

    // Mini Mobile
    [TYPOGRAPHY_STYLES.MINI_MOBILE]: {
      [TYPOGRAPHY_VARIANTS.BOLD]: {
        ...commonFontSettings,
        'font-family': 'Work Sans',
        'font-size': '10px',
        'font-style': 'normal',
        'font-weight': '700',
        'line-height': 'normal',
        'letter-spacing': '2px',
        'text-transform': 'uppercase',
      },
    },
  }

  // Generate rules for typographies
  const typographyRules: Rule[] = []

  // Iteramos sobre cada estilo tipográfico
  Object.entries(typographies).forEach(
    ([style, variants]: [string, Record<string, Record<string, string>>]) => {
      // Iteramos sobre cada variante del estilo
      Object.entries(variants).forEach(
        ([variant, properties]: [string, Record<string, string>]) => {
          // Creamos una regla para la combinación de estilo y variante
          typographyRules.push([
            new RegExp(`^${prefix}${style}-${variant}$`),
            (): Record<string, string> => properties,
          ])
        },
      )

      // También creamos una regla para solo el estilo (sin variante)
      // Usaremos la variante "regular" como predeterminada, o "bold" si no existe regular
      const defaultVariant = variants[TYPOGRAPHY_VARIANTS.REGULAR]
        ? variants[TYPOGRAPHY_VARIANTS.REGULAR]
        : variants[TYPOGRAPHY_VARIANTS.BOLD]

      if (defaultVariant) {
        typographyRules.push([
          new RegExp(`^${prefix}${style}$`),
          (): Record<string, string> => defaultVariant,
        ])
      }
    },
  )

  // Generar lista de clases safelist para tipografía
  const typographySafelist = generateTypographySafelist(prefix, {
    includeOnly: safelist.includeOnly,
  })

  return {
    name,
    rules: typographyRules,
    safelist: typographySafelist,
  }
})
