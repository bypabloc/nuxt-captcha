// design-system/presets/icons.preset.ts

import type { Preset } from 'unocss'
import { definePreset } from 'unocss'

// Define la interfaz para el objeto iconsData
interface IconsData {
  collection: Record<string, Record<string, string>>
  safelist: string[]
}

// Valor por defecto para iconsData
const defaultIconsData: IconsData = {
  collection: {},
  safelist: [],
}

// Intentar importar el JSON desde node_modules
let iconsData: IconsData = defaultIconsData
try {
  // Importar desde la nueva ubicación
  const importedData = await import('vk/icons/generated.json').catch(
    (err: unknown) => {
      // eslint-disable-next-line no-console
      console.warn('Error loading icons from node_modules:', err)
      return defaultIconsData
    },
  )
  iconsData = importedData as IconsData
} catch (error) {
  // eslint-disable-next-line no-console
  console.warn(
    'No se pudo cargar vk/icons/generated.json. Se usará una colección vacía por defecto.',
    error,
  )
}

/**
 * Definición centralizada de los paquetes de iconos soportados.
 */
export const ICON_PACKAGES = {
  MDI: 'mdi',
  GARDEN: 'garden',
  SVG_SPINNERS: 'svg-spinners',
  CI: 'ci',
  VK: 'vk',
} as const

export type IconPackage = (typeof ICON_PACKAGES)[keyof typeof ICON_PACKAGES]

export function isValidIconPackage(pkg: string): boolean {
  return Object.values(ICON_PACKAGES).includes(pkg as IconPackage)
}

// Extraer nombres de iconos VK del JSON cargado
export const vkIconNames: string[] =
  iconsData.collection && iconsData.collection.vk
    ? Object.keys(iconsData.collection.vk)
    : []

// Tipos literales estáticos basados en el ejemplo proporcionado
// Esto proporciona autocompletado en el editor incluso si el JSON falla en cargar
export type VKIconLiteral =
  | 'ahorro-light'
  | 'alarma-light'
  | 'audifonos-light'
  | 'balance-light'
  | 'banco-light'
  | 'barra-grafica-up-light'
  | 'billetera-light'
  | 'bolsa-dinero-light'
  | 'caja-fuerte-light'
  | 'calculadora-light'
  | 'calendario-light'
  | 'campana-light'
  | 'chat-light'
  | 'click-light'
  | 'comprobante-light'
  | 'corona-light'
  | string // Permitir otros valores que puedan existir en el JSON

export const commonIcons: Record<IconPackage, string[]> = {
  [ICON_PACKAGES.MDI]: [
    'close',
    'instagram',
    'youtube',
    'linkedin',
    'keyboard-arrow-left',
    'chevron-left',
    'chevron-right',
    'help-circle',
    'tray-download',
    'arrow-right',
  ],
  [ICON_PACKAGES.GARDEN]: ['twitter-stroke-16'],
  [ICON_PACKAGES.SVG_SPINNERS]: ['ring-resize'],
  [ICON_PACKAGES.CI]: [
    'checkbox',
    'checkbox-check',
    'checkbox-fill',
    'checkbox-unchecked',
  ],
  [ICON_PACKAGES.VK]: vkIconNames, // Usar los nombres extraídos del JSON
}

// Tipos específicos para cada paquete de iconos
export type MDIIcon = (typeof commonIcons)[typeof ICON_PACKAGES.MDI][number]
export type GardenIcon =
  (typeof commonIcons)[typeof ICON_PACKAGES.GARDEN][number]
export type SVGSpinnersIcon =
  (typeof commonIcons)[typeof ICON_PACKAGES.SVG_SPINNERS][number]
export type CIIcon = (typeof commonIcons)[typeof ICON_PACKAGES.CI][number]
export type VKIcon = VKIconLiteral // Usar el tipo literal que define los iconos conocidos

// Define un tipo mapeado que relaciona cada paquete con su tipo de iconos correspondiente
export type IconTypeMap = {
  [ICON_PACKAGES.MDI]: MDIIcon
  [ICON_PACKAGES.GARDEN]: GardenIcon
  [ICON_PACKAGES.SVG_SPINNERS]: SVGSpinnersIcon
  [ICON_PACKAGES.CI]: CIIcon
  [ICON_PACKAGES.VK]: VKIcon
}

/**
 * Verifica si un icono es válido para un paquete específico.
 *
 * @param icon Nombre del icono a verificar
 * @param pkg Paquete de iconos
 * @returns true si el icono es válido para el paquete, false en caso contrario
 */
export function isValidIconForPackage(icon: string, pkg: IconPackage): boolean {
  if (pkg === ICON_PACKAGES.VK) {
    // Para VK, verificar contra los iconos cargados del JSON
    return vkIconNames.includes(icon)
  }
  return commonIcons[pkg].includes(icon)
}

export const generateIconSafelist = (
  iconsByPackage: Record<string, string[]> = commonIcons,
): string[] => {
  const safelist: string[] = []

  Object.entries(iconsByPackage).forEach(([pkg, icons]: [string, string[]]) => {
    icons.forEach((icon: string) => {
      safelist.push(`i-${pkg}-${icon}`)
    })
  })

  // También agregar los iconos del JSON precargado
  if (iconsData.safelist?.length) {
    safelist.push(...iconsData.safelist)
  }

  return safelist
}

export interface SVGIconLoaderOptions {
  basePath: string
  collectionName?: string
  debug?: boolean
  enabled?: boolean
}

export interface IconsPresetOptions {
  name?: string
  customIcons?: Record<string, string[]>
  svgOptions?: SVGIconLoaderOptions
}

export interface IconsPreset extends Preset {
  collection: Record<string, Record<string, () => string>>
}

export default definePreset((params?: IconsPresetOptions): IconsPreset => {
  const {
    name = 'icons-preset',
    customIcons,
    svgOptions,
  }: IconsPresetOptions = params || {}

  // Si svgOptions está definido y habilitado, podemos mostrar información de debug
  if (svgOptions?.debug) {
    // eslint-disable-next-line no-console
    console.log(`Icons preset initialized with options:`, svgOptions)
    // eslint-disable-next-line no-console
    console.log(`Loaded VK icons:`, vkIconNames.length)
  }

  // Combinar iconos personalizados con los comunes
  const iconSet = customIcons ? { ...commonIcons, ...customIcons } : commonIcons
  const safelist = generateIconSafelist(iconSet)

  // Crear la colección de iconos a partir del JSON precargado
  const svgIconCollection: Record<string, Record<string, () => string>> = {}

  // Convertir los datos del JSON a la estructura esperada por UnoCSS
  if (iconsData.collection) {
    Object.entries(iconsData.collection).forEach(
      ([collectionName, icons]: [string, Record<string, string>]) => {
        svgIconCollection[collectionName] = {}

        Object.entries(icons).forEach(
          ([iconName, svgContent]: [string, string]) => {
            // Crear una función que devuelve el contenido SVG
            svgIconCollection[collectionName][iconName] = (): string =>
              svgContent
          },
        )
      },
    )
  }

  return {
    name,
    shortcuts: {},
    safelist,
    preflights: [
      {
        getCSS: (): string => {
          if (svgOptions?.debug) {
            // eslint-disable-next-line no-console
            console.log(
              `Loaded SVG icons count:`,
              Object.keys(
                svgIconCollection[svgOptions.collectionName || 'vk'] || {},
              ).length,
            )
          }
          return ''
        },
      },
    ],
    collection: svgIconCollection,
  } as IconsPreset
})
