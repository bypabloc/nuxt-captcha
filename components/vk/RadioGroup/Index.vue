<script setup lang="ts">
/**
 * @component VKRadioGroup
 * @description Componente para agrupar botones de radio con soporte para opciones en línea o verticales
 *
 * @props {string | number | boolean} modelValue - Valor seleccionado (v-model)
 * @props {Array} options - Opciones disponibles para selección
 * @props {string} name - Nombre del grupo de radios
 * @props {boolean} inline - Si los radios se muestran en línea (horizontal)
 * @props {boolean} disabled - Si todos los radios están deshabilitados
 * @props {string} legend - Título del grupo (opcional)
 * @props {boolean} error - Si hay un error en la selección
 * @props {string} errorMessage - Mensaje de error a mostrar
 *
 * @emits update:modelValue - Emitido cuando cambia la selección
 *
 * @example
 * <VKRadioGroup
 *   v-model="gender"
 *   :options="[
 *     { value: 'M', label: 'Masculino' },
 *     { value: 'F', label: 'Femenino' },
 *     { value: 'O', label: 'Otro', disabled: true }
 *   ]"
 *   name="gender"
 *   legend="Género"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

defineOptions({
  name: 'ComponentsVKRadioGroup',
})

/**
 * Interfaz para las opciones de radio en el grupo.
 *
 * @property {string | number | boolean} value - Valor único de la opción
 * @property {string} label - Texto a mostrar para la opción
 * @property {boolean} disabled - Si la opción está deshabilitada
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */
interface RadioOption {
  value: string | number | boolean
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | boolean
    options: Array<RadioOption> | Array<string | number>
    name: string
    inline?: boolean
    disabled?: boolean
    legend?: string
    error?: boolean
    errorMessage?: string
  }>(),
  {
    inline: false,
    disabled: false,
    error: false,
    errorMessage: '',
    legend: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void
}>()

const normalizedOptions = computed(() => {
  return props.options.map((option: RadioOption | string | number) => {
    if (typeof option === 'object') {
      return option
    } else {
      return {
        value: option,
        label: String(option),
      }
    }
  })
})

const handleSelection = (value: string | number | boolean): void => {
  emit('update:modelValue', value)
}
</script>

<template>
  <fieldset>
    <legend
      v-if="legend"
      class="text-sm font-medium mb-2"
      :class="error ? 'text-red-600' : 'text-gray-700'"
    >
      {{ legend }}
    </legend>

    <div :class="inline ? 'flex flex-wrap gap-x-6 gap-y-2' : 'space-y-2'">
      <div
        v-for="option in normalizedOptions"
        :key="String(option.value)"
      >
        <VKRadio
          :model-value="modelValue"
          :value="option.value"
          :label="option.label"
          :disabled="disabled || option.disabled"
          :name="name"
          @update:model-value="handleSelection"
        />
      </div>
    </div>

    <p
      v-if="error && errorMessage"
      class="mt-1 text-sm text-red-600"
    >
      {{ errorMessage }}
    </p>
  </fieldset>
</template>
