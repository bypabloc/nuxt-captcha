<script setup lang="ts">
/**
 * @component VKRadio
 * @description Componente atómico para botón de tipo radio
 *
 * @props {string | number | boolean} modelValue - Valor seleccionado (v-model)
 * @props {string | number | boolean} value - Valor de esta opción radio
 * @props {string} label - Texto de la etiqueta
 * @props {boolean} disabled - Si el radio está deshabilitado
 * @props {string} name - Nombre del grupo de radio buttons
 * @props {string} id - ID del elemento radio
 *
 * @emits update:modelValue - Emitido cuando cambia el estado del radio
 *
 * @example
 * <VKRadio
 *   v-model="selectedValue"
 *   value="option1"
 *   label="Opción 1"
 *   name="options"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

defineOptions({
  name: 'ComponentsVKRadio',
})

const props = withDefaults(
  defineProps<{
    modelValue: string | number | boolean
    value: string | number | boolean
    label?: string
    disabled?: boolean
    name?: string
    id?: string
  }>(),
  {
    disabled: false,
    label: '',
    name: '',
    id: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void
}>()

const isChecked = computed(() => props.modelValue === props.value)

const handleChange = (): void => {
  if (!props.disabled) {
    emit('update:modelValue', props.value)
  }
}

const radioId = computed(
  () => props.id || `radio-${Math.random().toString(36).substring(2, 11)}`,
)
</script>

<template>
  <div class="flex items-center">
    <input
      :id="radioId"
      type="radio"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
      @change="handleChange"
    >
    <label
      v-if="label"
      :for="radioId"
      class="ml-2 block text-sm font-medium"
      :class="disabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer'"
    >
      {{ label }}
    </label>
  </div>
</template>
