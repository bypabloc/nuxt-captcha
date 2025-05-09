<script setup lang="ts">
/**
 * @component VKIcon
 * @description Componente atómico para mostrar iconos de diferentes librerías con opciones
 * flexibles de tamaño y color.
 *
 * @props {string} icon - Nombre del icono sin el prefijo 'i-' (p. ej. 'instagram')
 * @props {IconPackage} pkg - Paquete de iconos a utilizar ('mdi', 'garden', etc.). Debe ser un valor válido del objeto ICON_PACKAGES
 * @props {string|number} size - Tamaño del icono en píxeles
 * @props {string} color - Color del icono (nombre del color en el sistema de diseño)
 * @props {string} label - Texto alternativo para lectores de pantalla (accesibilidad)
 *
 * @example
 * <VKIcon
 *   icon="instagram"
 *   :pkg="ICON_PACKAGES.MDI"
 *   size="32"
 *   color="white"
 *   label="Instagram"
 * />
 *
 * @example
 * <VKIcon
 *   icon="ahorro-light"
 *   :pkg="ICON_PACKAGES.VK"
 *   color="medium-green"
 *   label="Ahorro"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/21
 */
import type { ColorName } from '@/design-system/presets/colors.preset'
import {
    COLOR_NAMES,
    isValidColorName,
} from '@/design-system/presets/colors.preset'
import type { IconPackage } from '@/design-system/presets/icons.preset'
import {
    commonIcons,
    ICON_PACKAGES,
    isValidIconForPackage,
    isValidIconPackage,
    vkIconNames,
} from '@/design-system/presets/icons.preset'

defineOptions({
  name: 'ComponentsVKIcon',
})

const $logger = useNuxtApp().$logger

const props = withDefaults(
  defineProps<{
    icon: string
    pkg?: IconPackage
    size?: string | number
    color?: ColorName
    label?: string
  }>(),
  {
    pkg: ICON_PACKAGES.MDI,
    size: '24',
    color: COLOR_NAMES.DARK_GRAY as ColorName,
    label: '',
  },
)

/**
 * Valida que el color sea válido y retorna el valor normalizado
 */
const colorName = computed((): ColorName => {
  if (!isValidColorName(props.color)) {
    $logger.warn(
      `Color "${props.color}" no válido. Usando el color por defecto (${COLOR_NAMES.DARK_GRAY}).`,
    )
    return COLOR_NAMES.DARK_GRAY
  }

  return props.color as ColorName
})

/**
 * Valida que el valor de pkg sea válido y retorna el valor normalizado
 */
const validatedPkg = computed((): IconPackage => {
  if (typeof props.pkg === 'string' && !isValidIconPackage(props.pkg)) {
    $logger.warn(
      `Paquete de iconos "${props.pkg}" no válido. Usando el paquete por defecto (${ICON_PACKAGES.MDI}).`,
    )
    return ICON_PACKAGES.MDI
  }

  return props.pkg
})

/**
 * Validación cuando cambian las props
 */
watch(
  () => [props.icon, props.pkg] as [string, IconPackage],
  ([newIcon, newPkg]: [string, IconPackage]) => {
    if (newPkg === ICON_PACKAGES.VK) {
      // Para los iconos de VK no mostramos advertencias si no está en vkIconNames,
      // ya que podría ser un icono que existe en el JSON pero no conocemos estáticamente
      if (
        vkIconNames.length > 0 &&
        !isValidIconForPackage(newIcon as string, newPkg as IconPackage)
      ) {
        $logger.warn(
          `El icono "${newIcon}" no parece estar en la colección de iconos VK. Verifica que existe en el JSON.`,
        )
      }
    } else if (
      !isValidIconForPackage(newIcon as string, newPkg as IconPackage)
    ) {
      // Para otros paquetes, mostramos la advertencia con los iconos disponibles
      $logger.warn(
        `El icono "${newIcon}" no es válido para el paquete "${newPkg}". Iconos disponibles: ${commonIcons[newPkg as IconPackage].join(', ')}`,
      )
    }
  },
  { immediate: true },
)

/**
 * Construye el nombre completo del icono con los prefijos necesarios.
 * Si el icono ya contiene un nombre de paquete (como 'garden-twitter'),
 * no se añade el paquete predeterminado.
 */
const fullIconName = computed((): string => {
  return `i-${validatedPkg.value}-${props.icon}`
})

/**
 * Calcula las clases para el icono, combinando:
 * - Nombre del icono con prefijos
 * - Tamaño
 * - Color
 */
const iconClasses = computed((): string[] => {
  const classes = [
    fullIconName.value,
    `vk-icon--size-${props.size}`,
    `text-${props.color}`,
    `vk-color-text-${colorName.value}`,
  ]

  return classes
})

/**
 * Calcula los estilos inline para el icono basados en el tamaño.
 */
const iconStyles = computed((): Record<string, string> => {
  const size =
    typeof props.size === 'number' || !isNaN(Number(props.size))
      ? `${props.size}px`
      : props.size

  return {
    width: size,
    height: size,
    display: 'inline-block',
    'vertical-align': 'middle',
  }
})

const ariaHidden = computed((): boolean => {
  return !props.label
})
</script>

<template>
  <span
    class="vk-icon"
    role="img"
    :aria-label="label"
    :aria-hidden="ariaHidden"
  >
    <i
      :class="iconClasses"
      :style="iconStyles"
    />
    <span
      v-if="label"
      class="sr-only"
    >
      {{ label }}
    </span>
  </span>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
