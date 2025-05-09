<script setup lang="ts">
/**
 * @component VKSpinner
 * @description Componente para mostrar un indicador de carga con animación de rotación
 *
 * @props {string} size - Tamaño del spinner (xs, sm, md, lg, xl)
 * @props {ColorName} color - Color del spinner usando el sistema de colores de la aplicación
 * @props {boolean} overlay - Si debe mostrarse como overlay sobre un contenedor
 * @props {string} label - Texto descriptivo opcional para acompañar al spinner
 * @props {boolean} labelPosition - Posición del texto (top, bottom)
 *
 * @example
 * <VKSpinner
 *   size="md"
 *   color="medium-green"
 *   label="Cargando..."
 * />
 *
 * @example
 * <!-- Como overlay sobre un contenedor -->
 * <div class="relative h-64">
 *   <VKSpinner overlay />
 * </div>
 *
 * @author Pablo Contreras
 * @since 2025/05/06
 */

import type { ColorName } from '@/design-system/presets/colors.preset'
import {
    COLOR_NAMES,
    isValidColorName,
} from '@/design-system/presets/colors.preset'

defineOptions({
  name: 'ComponentsVKSpinner',
})

/**
 * Interfaz para definir las dimensiones del spinner según su tamaño.
 *
 * @property {string} size - Tamaño del spinner en píxeles
 * @property {string} borderWidth - Ancho del borde del spinner en píxeles
 *
 * @author Pablo Contreras
 * @since 2025/05/06
 */
interface SpinnerDimension {
  size: string
  borderWidth: string
}

const $logger = useNuxtApp().$logger

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    color?: ColorName
    overlay?: boolean
    label?: string
    labelPosition?: 'top' | 'bottom'
  }>(),
  {
    size: 'md',
    color: COLOR_NAMES.MEDIUM_GREEN as ColorName,
    overlay: false,
    labelPosition: 'bottom',
    label: '',
  },
)

const sizeMap = computed(
  (): Record<string, SpinnerDimension> => ({
    xs: { size: '16px', borderWidth: '2px' },
    sm: { size: '24px', borderWidth: '2px' },
    md: { size: '32px', borderWidth: '3px' },
    lg: { size: '48px', borderWidth: '4px' },
    xl: { size: '64px', borderWidth: '5px' },
  }),
)

const dimensions = computed((): SpinnerDimension => sizeMap.value[props.size])

/**
 * Valida que el color sea válido y retorna el valor normalizado
 */
const validatedColor = computed((): ColorName => {
  if (!isValidColorName(props.color)) {
    $logger.warn(
      `Color "${props.color}" no válido. Usando el color por defecto (${COLOR_NAMES.MEDIUM_GREEN}).`,
    )
    return COLOR_NAMES.MEDIUM_GREEN
  }

  return props.color
})

const containerClasses = computed((): (string | Record<string, boolean>)[] => [
  'vk-spinner-container',
  {
    'vk-spinner-container--overlay': props.overlay,
    'vk-spinner-container--with-label': !!props.label,
    [`vk-spinner-container--label-${props.labelPosition}`]: !!props.label,
  },
])

const spinnerClasses = computed((): string[] => [
  'vk-spinner',
  `vk-color-border-color-${validatedColor.value}`,
])

const spinnerStyles = computed(
  (): Record<string, string> => ({
    width: dimensions.value.size,
    height: dimensions.value.size,
    borderWidth: dimensions.value.borderWidth,
  }),
)
</script>

<template>
  <div :class="containerClasses">
    <span
      v-if="label && labelPosition === 'top'"
      class="vk-spinner-label"
      :class="{ [`vk-spinner-label--${size}`]: true }"
    >
      {{ label }}
    </span>

    <div
      :class="spinnerClasses"
      :style="spinnerStyles"
      role="status"
      aria-label="Cargando"
    />

    <span
      v-if="label && labelPosition === 'bottom'"
      class="vk-spinner-label"
      :class="{ [`vk-spinner-label--${size}`]: true }"
    >
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.vk-spinner-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.vk-spinner-container--overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.vk-spinner-container--label-top {
  flex-direction: column;
}

.vk-spinner-container--label-bottom {
  flex-direction: column-reverse;
}

.vk-spinner {
  display: inline-block;
  border-radius: 50%;
  border-style: solid;
  border-bottom-color: transparent !important;
  animation: spinner-rotate 0.8s linear infinite;
}

.vk-spinner-label {
  color: var(--vk-color-text-oxford-70, #516887);
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.vk-spinner-label--xs {
  font-size: 0.75rem;
  margin: 0.25rem 0;
}

.vk-spinner-label--sm {
  font-size: 0.875rem;
  margin: 0.375rem 0;
}

.vk-spinner-label--lg {
  font-size: 1rem;
  margin: 0.625rem 0;
}

.vk-spinner-label--xl {
  font-size: 1.125rem;
  margin: 0.75rem 0;
}

@keyframes spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>