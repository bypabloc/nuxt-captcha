<script setup lang="ts">
/**
 * @component VKText
 * @description Componente para mostrar textos con los estilos tipográficos del sistema de diseño.
 * Permite aplicar diferentes estilos y variantes tipográficas de manera consistente.
 *
 * @example
 * <VKText style="hero" variant="light">Texto con estilo Hero Light</VKText>
 * <VKText style="title-1" variant="bold">Título 1 Bold</VKText>
 * <VKText style="body">Texto con estilo Body (regular por defecto)</VKText>
 *
 * @author Pablo Contreras
 * @since 2025/04/23
 */
import type { ColorName } from '@/design-system/presets/colors.preset'
import {
    COLOR_NAMES,
    isValidColorName,
} from '@/design-system/presets/colors.preset'
import type {
    TypographyStyle,
    TypographyVariant,
} from '@/design-system/presets/typography.preset'
import {
    TYPOGRAPHY_STYLES,
    TYPOGRAPHY_VARIANTS,
} from '@/design-system/presets/typography.preset'

defineOptions({
  name: 'ComponentsVKText',
})

const $logger = useNuxtApp().$logger

// Definición de props
const props = withDefaults(
  defineProps<{
    style?: TypographyStyle
    variant?: TypographyVariant
    tag?: string
    color?: ColorName
    hyphens?: 'auto' | 'manual' | 'none'
  }>(),
  {
    style: 'body' as TypographyStyle,
    variant: 'regular',
    tag: 'div',
    color: COLOR_NAMES.DARK_GRAY as ColorName,
    hyphens: 'none',
  },
)

/**
 * Valida que el color sea válido y retorna el valor normalizado
 */
const isValidColor = computed((): ColorName => {
  if (!isValidColorName(props.color)) {
    $logger.warn(
      `Color "${props.color}" no válido. Usando el color por defecto (${COLOR_NAMES.DARK_GRAY}).`,
    )
    return COLOR_NAMES.DARK_GRAY
  }

  return props.color as ColorName
})

/**
 * Valida que el valor del estilo sea válido
 */
const isValidStyle = computed((): boolean => {
  const validStyles = Object.values(TYPOGRAPHY_STYLES)
  return validStyles.includes(props.style)
})

/**
 * Valida que el valor de la variante sea válida
 */
const isValidVariant = computed((): boolean => {
  const validVariants = Object.values(TYPOGRAPHY_VARIANTS)
  return validVariants.includes(props.variant)
})

/**
 * Genera las clases CSS basadas en el estilo y variante seleccionados
 */
const typographyClasses = computed((): string[] => {
  const classes: string[] = []

  if (!isValidStyle.value) {
    $logger.warn(`Estilo tipográfico "${props.style}" no válido.`)
    return classes
  }

  if (!isValidVariant.value) {
    $logger.warn(`Variante tipográfica "${props.variant}" no válida.`)
    return classes
  }

  // Si tanto el estilo como la variante son válidos, construimos la clase completa
  classes.push(`vk-typography-${props.style}-${props.variant}`)

  if (!isValidColor.value) {
    $logger.warn(
      `Color "${props.color}" no válido. Usando el color por defecto (${COLOR_NAMES.DARK_GRAY}).`,
    )
    return classes
  }

  classes.push(`vk-color-text-${props.color}`)

  return classes
})

const typographyStyles = computed((): string => {
  const styles: string[] = []

  if (props.hyphens !== 'none') {
    styles.push(`hyphens: ${props.hyphens};`)
  }

  return styles.join(' ')
})
</script>

<template>
  <component
    :is="tag"
    :class="typographyClasses"
    :style="typographyStyles"
  >
    <slot />
  </component>
</template>
