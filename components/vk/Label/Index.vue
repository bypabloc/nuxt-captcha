<script setup lang="ts">
/**
 * @component VKLabel
 * @description Componente atómico para etiquetas de formularios
 *
 * @props {string} htmlFor - Valor del atributo for (asocia la etiqueta con un input)
 * @props {boolean} required - Indica si el campo asociado es obligatorio
 * @props {boolean} error - Indica si hay un error en el campo asociado
 *
 * @example
 * <VKLabel
 *   htmlFor="email"
 *   required
 * >
 *   Correo electrónico
 * </VKLabel>
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

defineOptions({
  name: 'ComponentsVKLabel',
})

const props = withDefaults(
  defineProps<{
    htmlFor?: string
    required?: boolean
    error?: boolean
  }>(),
  {
    htmlFor: '',
    required: false,
    error: false,
  },
)

const labelClasses = computed(() => [
  'block text-sm font-medium mb-1',
  {
    'text-red-600': props.error,
    'text-gray-700': !props.error,
  },
])
</script>

<template>
  <label
    :for="htmlFor"
    :class="labelClasses"
  >
    <slot />
    <span
      v-if="required"
      class="text-red-500 ml-1"
    >*</span>
  </label>
</template>
