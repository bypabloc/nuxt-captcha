// unocss.config.ts
import type { IconifyJSON } from '@iconify/types'
import presetWind4 from '@unocss/preset-wind4'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetMini,
  presetWebFonts,
} from 'unocss'
// Importar el preset con su tipo específico para acceder a collection
import iconsPreset, {
  type IconsPreset,
} from './design-system/presets/icons.preset'
import designSystemPreset from './design-system/presets/index.preset'

// Definir la configuración de iconos SVG
const svgIconsConfig = {
  enabled: true,
  basePath: './assets/icons',
  collectionName: 'vk',
  debug: false,
}

// Crear el preset de iconos personalizado
const customIconsPreset = iconsPreset({
  name: 'custom-icons-preset',
  svgOptions: svgIconsConfig,
}) as IconsPreset

export default defineConfig({
  presets: [
    // Design system presets
    designSystemPreset({
      name: 'vk-design-system',
      typography: {
        prefix: 'vk-typography-',
      },
      colors: {
        prefix: {
          text: 'vk-color-text-',
          bg: 'vk-color-bg-',
          border: 'vk-color-border-color-',
        },
      },
      variables: {
        prefix: {
          width: 'vk-var-width-',
          height: 'vk-var-height-',
          order: 'vk-flex-order-',
          gap: 'vk-gap-',
        },
      },
      spacing: {
        defaultUnit: 'px',
      },
    }),

    // UnoCSS presets
    presetAttributify({}),
    presetWind4({}),
    presetMini({}),
    presetWebFonts({
      timeouts: {
        warning: 2000,
        failure: 5000,
      },
      provider: 'google',
      fonts: {
        murecho: [
          {
            name: 'Murecho',
            weights: ['300', '400', '500', '700'],
            italic: true,
          },
        ],
        workSans: [
          {
            name: 'Work Sans',
            weights: ['300', '400', '500', '700'],
            italic: true,
          },
        ],
      },
    }),

    presetIcons({
      scale: 1.2,
      warn: true,
      // Personalización adicional para manejar SVGs complejos
      customizations: {
        // eslint-disable-next-line @typescript-eslint/typedef
        customize(props) {
          // Usamos una verificación con 'in' para evitar problemas de tipos
          if ('viewBox' in props) {
            const viewBox = props.viewBox as string
            const [x, y, width, height]: number[] = viewBox
              .split(' ')
              .map(Number)
            // Añadir un poco de padding al viewBox - corregido con backticks
            props.viewBox = `${x - 1} ${y - 1} ${width + 2} ${height + 2}`
          }
          return props
        },
      },
      collections: {
        // Colecciones estándar
        mdi: () =>
          import('@iconify-json/mdi/icons.json').then(
            (i: { default: IconifyJSON }): IconifyJSON => i.default,
          ),
        garden: () =>
          import('@iconify-json/garden/icons.json').then(
            (i: { default: IconifyJSON }): IconifyJSON => i.default,
          ),
        'svg-spinners': () =>
          import('@iconify-json/svg-spinners/icons.json').then(
            (i: { default: IconifyJSON }): IconifyJSON => i.default,
          ),
        ci: () =>
          import('@iconify-json/ci/icons.json').then(
            (i: { default: IconifyJSON }): IconifyJSON => i.default,
          ),

        // Colección personalizada con todos los SVGs
        ...(customIconsPreset.collection || {}),
      },
      extraProperties: {
        'font-size': '1.2em',
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),

    // Añadir nuestro preset personalizado para las clases safelist
    customIconsPreset,
  ],
  safelist: [
    // Iconos comunes
    'i-mdi-check',
  ],
})
