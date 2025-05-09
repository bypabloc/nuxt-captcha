<script setup lang="ts">
/**
 * @component VKCheckbox
 * @description Componente atómico para checkbox estilizado
 *
 * @props {boolean} modelValue - Estado del checkbox (v-model)
 * @props {string} label - Texto de la etiqueta
 * @props {boolean} disabled - Si el checkbox está deshabilitado
 * @props {string} id - ID del checkbox
 * @props {string} name - Nombre del checkbox
 * @props {string} value - Valor del checkbox (para grupos)
 *
 * @emits update:modelValue - Emitido cuando cambia el estado del checkbox
 *
 * @example
 * <VKCheckbox
 *   v-model="acceptTerms"
 *   label="Acepto los términos y condiciones"
 *   name="terms"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

defineOptions({
  name: 'ComponentsVKCheckbox',
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    label?: string
    disabled?: boolean
    id?: string
    name?: string
    value?: string
  }>(),
  {
    disabled: false,
    label: '',
    id: '',
    name: '',
    value: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const handleChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}

const checkboxId = computed(
  () => props.id || `checkbox-${Math.random().toString(36).substring(2, 11)}`,
)
</script>

<template>
  <div class="flex items-start">
    <div class="flex items-center h-5">
      <input
        :id="checkboxId"
        :name="name"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :value="value"
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        @change="handleChange"
      >
    </div>
    <div
      v-if="label"
      class="ml-3 text-sm"
    >
      <label
        :for="checkboxId"
        class="font-medium text-gray-700"
        :class="{ 'text-gray-400': disabled }"
      >
        {{ label }}
      </label>
    </div>
  </div>
</template>
