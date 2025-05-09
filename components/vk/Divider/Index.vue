<script setup lang="ts">
/**
 * @component VKDivider
 * @description Componente para crear líneas divisorias horizontales o verticales,
 * con opciones de personalización para grosor, color, tamaño y comportamiento de expansión.
 *
 * @props {string} orientation - Orientación del divisor ('horizontal' o 'vertical')
 * @props {string} variant - Variante visual del divisor ('primary', 'secondary', 'subtle')
 * @props {number} thickness - Grosor del divisor en píxeles
 * @props {string} length - Longitud del divisor (cuando no usa grow)
 * @props {string} color - Color del divisor (nombre del color de Tailwind, ej: 'bg-emerald-500')
 * @props {string} margin - Margen alrededor del divisor
 * @props {boolean} grow - Si el divisor debe expandirse para llenar el espacio disponible
 *
 * @example
 * <!-- Divisor horizontal básico -->
 * <VKDivider />
 *
 * @example
 * <!-- Divisor vertical con variante primary -->
 * <VKDivider
 *   orientation="vertical"
 *   variant="primary"
 *   grow
 * />
 *
 * @example
 * <!-- Divisor horizontal sutil -->
 * <VKDivider
 *   variant="subtle"
 *   thickness="0.5"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/17
 */
import type { ColorName } from '@/design-system/presets/colors.preset';

defineOptions({
  name: 'ComponentsVKDivider',
})

type Orientation = 'horizontal' | 'vertical'
type Variant = 'primary' | 'secondary' | 'subtle'

const props = withDefaults(
  defineProps<{
    orientation?: Orientation
    variant?: Variant
    thickness?: number
    length?: string
    color?: ColorName
    margin?: string
    grow?: boolean
  }>(),
  {
    orientation: 'horizontal',
    variant: 'subtle',
    thickness: 0.5,
    length: '100%',
    color: 'light-gray',
    margin: '0px',
    grow: false,
  },
)

const isVertical = computed(() => props.orientation === 'vertical')

const colorClass = computed(() => {
  return `vk-color-border-color-${props.color}`
})

const marginClass = computed(() => {
  if (props.margin === '0px') return ''

  const commonMargins: Record<string, string> = {
    '4px': isVertical.value ? 'mx-1' : 'my-1',
    '8px': isVertical.value ? 'mx-2' : 'my-2',
    '12px': isVertical.value ? 'mx-3' : 'my-3',
    '16px': isVertical.value ? 'mx-4' : 'my-4',
    '24px': isVertical.value ? 'mx-6' : 'my-6',
    '32px': isVertical.value ? 'mx-8' : 'my-8',
  }

  return commonMargins[props.margin] || ''
})

const dividerStyles = computed(() => {
  const styles: Record<string, string> = {}
  styles.border = 'none'
  if (props.orientation === 'horizontal') {
    styles.borderTop = `${props.thickness}px solid`
  } else {
    styles.borderRight = `${props.thickness}px solid`
  }

  if (props.margin !== '0px' && !marginClass.value) {
    styles.margin = isVertical.value ? `0 ${props.margin}` : `${props.margin} 0`
  }

  return styles
})

const classes = computed(() => [
  'vk-divider',
  `vk-divider--${props.orientation}`,
  colorClass.value,
  marginClass.value,
  { 'flex-grow': props.grow },
])
</script>

<template>
  <div
    :class="classes"
    :style="dividerStyles"
    aria-hidden="true"
  />
</template>

<style scoped>
.vk-divider {
  display: block;
}

.vk-divider--horizontal {
}

.vk-divider--vertical {
  align-self: stretch;
}
</style>
