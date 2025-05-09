<script setup lang="ts">
/**
 * @component VKInput
 * @description Componente atómico de entrada de texto con soporte para diferentes tipos y estados
 *
 * @props {string} type - Tipo de input (text, email, password, number, etc.)
 * @props {string} modelValue - Valor del input (v-model)
 * @props {string} placeholder - Texto de placeholder
 * @props {boolean} disabled - Si el input está deshabilitado
 * @props {boolean} readonly - Si el input es de solo lectura
 * @props {boolean} error - Si el input tiene un error de validación
 * @props {string} name - Atributo name del input
 * @props {string} id - ID del input
 * @props {string} autocomplete - Valor para el atributo autocomplete
 *
 * @emits update:modelValue - Emitido cuando cambia el valor del input
 * @emits blur - Emitido cuando el input pierde el foco
 * @emits focus - Emitido cuando el input obtiene el foco
 *
 * @example
 * <VKInput
 *   v-model="email"
 *   type="email"
 *   placeholder="Ingresa tu correo"
 *   :error="!!errors.email"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

defineOptions({
  name: 'ComponentsVKInput',
})

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    type?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    error?: boolean
    name?: string
    id?: string
    autocomplete?: string
    maxlength?: number
    minlength?: number
  }>(),
  {
    type: 'text',
    placeholder: '',
    disabled: false,
    readonly: false,
    error: false,
    name: '',
    id: '',
    autocomplete: '',
    maxlength: undefined,
    minlength: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur' | 'focus', event: FocusEvent): void
}>()

const inputClasses = computed(() => [
  'w-full px-3 py-2 border rounded-md shadow-sm text-base',
  'focus:outline-none focus:ring-2',
  {
    'border-red-500 focus:border-red-500 focus:ring-red-500': props.error,
    'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !props.error,
    'bg-gray-100 cursor-not-allowed': props.disabled,
    'bg-gray-50': props.readonly && !props.disabled,
  },
])

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit(
    'update:modelValue',
    props.type === 'number' ? Number(target.value) : target.value,
  )
}

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent): void => {
  emit('focus', event)
}
</script>

<template>
  <input
    :id="id"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :name="name"
    :autocomplete="autocomplete"
    :maxlength="maxlength"
    :minlength="minlength"
    :class="inputClasses"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
  >
</template>
