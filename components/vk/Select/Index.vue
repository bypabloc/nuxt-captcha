<script setup lang="ts">
/**
 * @component VKSelect
 * @description Componente atómico para campos de selección estilizado con soporte para opciones múltiples o individuales
 *
 * @props {string | number | Array} modelValue - Valor seleccionado (v-model)
 * @props {Array} options - Opciones disponibles para selección
 * @props {string} placeholder - Texto de placeholder
 * @props {boolean} disabled - Si el select está deshabilitado
 * @props {boolean} multiple - Si permite selección múltiple
 * @props {boolean} error - Si el campo tiene un error de validación
 * @props {string} name - Atributo name del select
 * @props {string} id - ID del select
 *
 * @emits update:modelValue - Emitido cuando cambia el valor seleccionado
 * @emits blur - Emitido cuando el select pierde el foco
 * @emits focus - Emitido cuando el select obtiene el foco
 *
 * @example
 * <VKSelect
 *   v-model="selectedCountry"
 *   :options="[
 *     { value: 'cl', label: 'Chile' },
 *     { value: 'ar', label: 'Argentina' },
 *     { value: 'pe', label: 'Perú' }
 *   ]"
 *   placeholder="Seleccione un país"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

defineOptions({
  name: 'ComponentsVKSelect',
})

/**
 * Interfaz para las opciones de selección en el componente.
 *
 * @property {string | number} value - Valor único de la opción
 * @property {string} label - Texto a mostrar para la opción
 * @property {boolean} disabled - Si la opción está deshabilitada
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */
interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | Array<string | number>
    options: Array<SelectOption> | Array<string | number>
    placeholder?: string
    disabled?: boolean
    multiple?: boolean
    error?: boolean
    name?: string
    id?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    placeholder: 'Seleccione una opción',
    disabled: false,
    multiple: false,
    error: false,
    size: 'md',
    name: '',
    id: '',
  },
)

const emit = defineEmits<{
  (
    e: 'update:modelValue',
    value: string | number | Array<string | number>,
  ): void
  (e: 'blur' | 'focus', event: FocusEvent): void
}>()

const normalizedOptions = computed(() => {
  return props.options.map((option: SelectOption | string | number) => {
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

const selectClasses = computed(() => [
  'block w-full px-3 py-2 border rounded-md shadow-sm text-base appearance-none',
  'focus:outline-none focus:ring-2 bg-white pr-8',
  {
    'border-red-500 focus:border-red-500 focus:ring-red-500': props.error,
    'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !props.error,
    'bg-gray-100 cursor-not-allowed text-gray-500': props.disabled,
    'py-1 text-sm': props.size === 'sm',
    'py-2 text-base': props.size === 'md',
    'py-3 text-lg': props.size === 'lg',
  },
])

const handleChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement

  if (props.multiple) {
    const selectedOptions = Array.from(target.selectedOptions).map(
      (option: HTMLOptionElement) => {
        const value = option.value
        return !isNaN(Number(value)) && value !== '' ? Number(value) : value
      },
    )
    emit('update:modelValue', selectedOptions)
  } else {
    const value = target.value
    const processedValue =
      !isNaN(Number(value)) && value !== '' ? Number(value) : value
    emit('update:modelValue', processedValue)
  }
}

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent): void => {
  emit('focus', event)
}
</script>

<template>
  <div class="relative">
    <select
      :id="id"
      :name="name"
      :value="modelValue"
      :multiple="multiple"
      :disabled="disabled"
      :class="selectClasses"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <option
        v-if="!multiple && placeholder"
        value=""
        disabled
        selected
      >
        {{ placeholder }}
      </option>

      <option
        v-for="option in normalizedOptions"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>

    <div
      v-if="!multiple"
      class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
      :class="{ 'opacity-50': disabled }"
    >
      <i
        class="i-mdi-chevron-down w-5 h-5 text-gray-400"
        aria-hidden="true"
      />
    </div>
  </div>
</template>
