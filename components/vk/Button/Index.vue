<script setup lang="ts">
/**
 * @component VKButton
 * @description Componente de botón con diferentes variantes y estilos, compatible con iconos.
 * Implementa los modos fixed, wrapped y small según las especificaciones de diseño.
 * Soporta personalización de colores y estado de carga.
 *
 * @props {string} variant - Variante del botón (primary, outline, text)
 * @props {string} size - Tamaño del botón (fixed, wrapped, small)
 * @props {boolean} disabled - Si el botón está deshabilitado
 * @props {boolean} block - Si el botón debe ocupar todo el ancho disponible
 * @props {string} iconPosition - Posición del icono (leading, trailing)
 * @props {string} justify - Alineación horizontal del contenido (start, center, end)
 * @props {number|string} width - Ancho personalizado del botón (px, rem, %, etc.) o 'full' para ancho completo
 * @props {boolean} mpClean - Si es true, elimina todo el padding y margin independientemente de otras propiedades
 * @props {number} px - Padding horizontal personalizado (0-6)
 * @props {number} py - Padding vertical personalizado (0-6)
 * @props {number} m - Margin en todos los lados (0-6)
 * @props {number} mx - Margin horizontal (0-6)
 * @props {number} my - Margin vertical (0-6)
 * @props {number} p - Padding en todos los lados (0-6)
 * @props {string} bgColor - Color de fondo personalizado (nombre del color en el sistema de diseño)
 * @props {string} textColor - Color de texto personalizado (nombre del color en el sistema de diseño)
 * @props {string} borderColor - Color de borde personalizado (nombre del color en el sistema de diseño)
 * @props {boolean} isLoading - Indica si el botón está en estado de carga
 *
 * @slots default - Contenido principal del botón
 * @slots icon - Icono a mostrar junto al texto del botón
 *
 * @emits click - Emitido cuando se hace clic en el botón
 *
 * @author Pablo Contreras
 * @since 2025/04/28
 */

import type { ColorName } from '@/design-system/presets/colors.preset';
import { COLOR_NAMES } from '@/design-system/presets/colors.preset';

defineOptions({
  name: 'ComponentsVKButton',
})

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'outline' | 'text'
    size?: 'fixed' | 'wrapped' | 'small'
    disabled?: boolean
    block?: boolean
    iconPosition?: 'leading' | 'trailing'
    justify?: 'start' | 'center' | 'end'
    width?: string | number
    mpClean?: boolean
    px?: number
    py?: number
    p?: number
    mx?: number
    my?: number
    m?: number
    bgColor?: string
    textColor?: string
    borderColor?: string
    isLoading?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'wrapped',
    disabled: false,
    block: false,
    iconPosition: 'leading',
    justify: 'center',
    width: undefined,
    mpClean: false,
    px: undefined,
    py: undefined,
    p: undefined,
    mx: undefined,
    my: undefined,
    m: undefined,
    bgColor: undefined,
    textColor: '',
    borderColor: undefined,
    isLoading: false,
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const slots = useSlots()
const display = useDisplay()

const { isMobile }: { isMobile: ComputedRef<boolean> } = display
const hasIconSlot = computed(() => !!slots.icon)

// Acceso a la propiedad mpClean usando la notación de corchetes
const isMpClean = computed(() => props.mpClean)

// Calcular si el botón debe ser "block" basado en la prop o el estado móvil
const isBlock = computed(() => {
  // Si se especifica width="full", siempre debe ser block
  if (props.width === 'full') {
    return true
  }
  return props.block || isMobile.value
})

const sizeToWidth: Record<string, string> = {
  fixed: '300px',
  small: '120px',
  wrapped: '360px',
}

const buttonWidth = computed((): string | undefined => {
  // Si hay un ancho personalizado y no es 'full'
  if (props.width && props.width !== 'full') {
    return typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  // Si es ancho completo, no necesitamos max-width
  if (props.width === 'full') {
    return '100%'
  }

  // Caso normal basado en móvil y tamaño
  if (isMobile.value) {
    return '100%'
  }

  // Usar el objeto de mapeo para obtener el ancho según el tamaño
  return sizeToWidth[props.size ?? 'wrapped']
})

// Mapeo de valores de justify a clases de flexbox
const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
}

// Clases base que se aplican a todos los botones
const baseClasses = computed(() => [
  { 'cursor-pointer': !props.disabled && !props.isLoading },
  { 'cursor-not-allowed': props.disabled || props.isLoading },
  'font-medium rounded-md focus:outline-none transition-colors duration-200',
  'inline-flex items-center',
  justifyClasses[props.justify], // Aplicar la clase de justificación según la prop
  { 'w-full': isBlock.value },
  { 'opacity-50 cursor-not-allowed': props.disabled },
  { 'gap-2': hasIconSlot.value },
])

// Determinar las clases de padding según el modo y las propiedades
const paddingClasses = computed((): string[] => {
  // Si el modo mpClean está activo, no aplicar ningún padding
  if (isMpClean.value) {
    return ['p-0']
  }

  const classes = []

  // Padding en todos los lados (p) tiene prioridad sobre px/py individuales
  if (props.p !== undefined) {
    classes.push(`p-${props.p}`)
  } else {
    // Padding horizontal (px)
    if (props.px !== undefined) {
      classes.push(`px-${props.px}`)
    } else if (!isMpClean.value) {
      // Valor predeterminado según el tamaño
      classes.push(props.size === 'small' ? 'px-3' : 'px-4')
    }

    // Padding vertical (py)
    if (props.py !== undefined) {
      classes.push(`py-${props.py}`)
    } else if (!isMpClean.value) {
      // Valor predeterminado según el tamaño
      classes.push(props.size === 'small' ? 'py-1' : 'py-2')
    }
  }

  return classes
})

// Determinar las clases de margin según el modo y las propiedades
const marginClasses = computed((): string[] => {
  // Si el modo mpClean está activo, no aplicar ningún margin
  if (isMpClean.value) {
    return ['m-0']
  }

  const classes = []

  // Margin en todos los lados (m) tiene prioridad sobre mx/my individuales
  if (props.m !== undefined) {
    classes.push(`m-${props.m}`)
  } else {
    // Margin horizontal (mx)
    if (props.mx !== undefined) {
      classes.push(`mx-${props.mx}`)
    }

    // Margin vertical (my)
    if (props.my !== undefined) {
      classes.push(`my-${props.my}`)
    }
  }

  return classes
})

// Clases de tamaño según el tipo de botón
const sizeClasses = computed((): string => {
  // Valores base según el tamaño seleccionado
  const sizes = {
    fixed: 'text-sm',
    wrapped: 'text-sm',
    small: 'text-xs',
  }

  return sizes[props.size] || sizes.wrapped
})

// Clases de colores según las props y variante
const colorClasses = computed((): string[] => {
  const classes = []

  // Si hay colores personalizados, aplicarlos
  if (props.bgColor) {
    classes.push(`vk-color-bg-${props.bgColor}`)
  }

  if (props.textColor) {
    classes.push(`vk-color-text-${props.textColor}`)
  }

  if (props.borderColor) {
    classes.push(`border vk-color-border-color-${props.borderColor}`)
  }

  // Si no hay colores personalizados, usar las clases de variante
  if (classes.length === 0) {
    const variants = {
      primary: 'vk-color-bg-medium-green text-white hover:bg-emerald-600',
      outline:
        'bg-white border border-emerald-500 vk-color-text-medium-green hover:bg-emerald-50',
      text: 'bg-transparent vk-color-text-medium-green hover:bg-gray-50',
    }

    return [variants[props.variant] || variants.primary]
  }

  return classes
})

// Convertir propiedades de color a tipos ColorName
const textColorComputed = computed((): ColorName => {
  if (props.textColor) {
    return props.textColor as ColorName
  }

  // Valores predeterminados basados en la variante
  return props.variant === 'primary'
    ? (COLOR_NAMES.WHITE as ColorName)
    : (COLOR_NAMES.MEDIUM_GREEN as ColorName)
})

// Color para el icono de carga
const colorIconLoading = computed((): ColorName => {
  // Si hay color de texto personalizado, usarlo para el icono de carga
  if (props.textColor) {
    return props.textColor as ColorName
  }

  // Si no, usar el color basado en la variante
  return props.variant === 'primary'
    ? (COLOR_NAMES.WHITE as ColorName)
    : (COLOR_NAMES.MEDIUM_GREEN as ColorName)
})

// Estilos personalizados para el botón
const buttonStyles = computed(() => ({
  width: buttonWidth.value,
  maxWidth: props.width === 'full' ? '100%' : buttonWidth.value,
}))

const handleClick = (event: MouseEvent): void => {
  if (!props.disabled && !props.isLoading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled || isLoading"
    :class="[
      baseClasses,
      sizeClasses,
      ...colorClasses,
      ...paddingClasses,
      ...marginClasses,
    ]"
    :style="buttonStyles"
    @click="handleClick"
  >
    <!-- Icono de carga -->
    <VKIcon
      v-if="isLoading"
      pkg="svg-spinners"
      icon="ring-resize"
      :color="colorIconLoading"
      size="14"
      class="mr-2"
    />

    <!-- Icono a la izquierda -->
    <span
      v-if="hasIconSlot && iconPosition === 'leading' && !isLoading"
      class="inline-flex"
    >
      <slot name="icon" />
    </span>

    <!-- Contenido principal -->
    <VKText
      :style="props.size === 'small' ? 'button-small' : 'button'"
      variant="bold"
      tag="div"
      :color="textColorComputed"
    >
      <slot />
    </VKText>

    <!-- Icono a la derecha -->
    <span
      v-if="hasIconSlot && iconPosition === 'trailing' && !isLoading"
      class="inline-flex"
    >
      <slot name="icon" />
    </span>
  </button>
</template>
