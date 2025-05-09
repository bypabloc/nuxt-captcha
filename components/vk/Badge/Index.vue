<script setup lang="ts">
/**
 * @component VKBadge
 * @description Componente para mostrar etiquetas o insignias con diferentes variantes
 *
 * @props {string} variant - Variante de color (default, primary, success, warning, error)
 * @props {boolean} outline - Si debe mostrarse con estilo de borde
 * @props {boolean} rounded - Si debe tener bordes completamente redondeados
 *
 * @example
 * <VKBadge variant="success">
 *   Aprobado
 * </VKBadge>
 *
 * @example
 * <VKBadge variant="error" outline>
 *   Rechazado
 * </VKBadge>
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

defineOptions({
  name: 'ComponentsVKBadge',
})

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
    outline?: boolean
    rounded?: boolean
  }>(),
  {
    variant: 'default',
    outline: false,
    rounded: false,
  },
)

const variantClasses = computed(() => {
  const classes: Record<string, string> = {
    default: props.outline
      ? 'text-gray-600 border-gray-300 bg-white'
      : 'text-gray-800 bg-gray-100',
    primary: props.outline
      ? 'text-blue-600 border-blue-300 bg-white'
      : 'text-white bg-blue-600',
    success: props.outline
      ? 'text-green-600 border-green-300 bg-white'
      : 'text-white bg-green-600',
    warning: props.outline
      ? 'text-yellow-600 border-yellow-300 bg-white'
      : 'text-yellow-800 bg-yellow-100',
    error: props.outline
      ? 'text-red-600 border-red-300 bg-white'
      : 'text-white bg-red-600',
  }

  return classes[props.variant]
})

const badgeClasses = computed(() => [
  'inline-flex items-center px-2.5 py-0.5 text-xs font-medium',
  props.rounded ? 'rounded-full' : 'rounded',
  props.outline ? 'border' : '',
  variantClasses.value,
])
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>
