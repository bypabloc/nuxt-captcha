<script setup lang="ts">
/**
 * @component VKTextarea
 * @description Componente atómico para áreas de texto con soporte para autocompletado y conteo de caracteres
 *
 * @props {string} modelValue - Valor del textarea (v-model)
 * @props {string} placeholder - Texto de placeholder
 * @props {boolean} disabled - Si el textarea está deshabilitado
 * @props {boolean} readonly - Si el textarea es de solo lectura
 * @props {boolean} error - Si el textarea tiene un error de validación
 * @props {number} rows - Número de filas
 * @props {number} maxlength - Máximo número de caracteres permitidos
 * @props {boolean} showCharCount - Si se muestra el contador de caracteres
 * @props {boolean} autoResize - Si el textarea se ajusta automáticamente al contenido
 * @props {string} name - Atributo name del textarea
 * @props {string} id - ID del textarea
 *
 * @emits update:modelValue - Emitido cuando cambia el valor del textarea
 * @emits blur - Emitido cuando el textarea pierde el foco
 * @emits focus - Emitido cuando el textarea obtiene el foco
 *
 * @example
 * <VKTextarea
 *   v-model="commentText"
 *   placeholder="Escriba su comentario aquí"
 *   :rows="4"
 *   :maxlength="500"
 *   show-char-count
 *   auto-resize
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

defineOptions({
  name: 'ComponentsVKTextarea',
})

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    error?: boolean
    rows?: number
    maxlength?: number
    showCharCount?: boolean
    autoResize?: boolean
    name?: string
    id?: string
  }>(),
  {
    placeholder: '',
    disabled: false,
    readonly: false,
    error: false,
    rows: 3,
    showCharCount: false,
    autoResize: false,
    maxlength: undefined,
    name: '',
    id: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur' | 'focus', event: FocusEvent): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const textareaClasses = computed(() => [
  'w-full px-3 py-2 border rounded-md shadow-sm text-base',
  'focus:outline-none focus:ring-2',
  {
    'border-red-500 focus:border-red-500 focus:ring-red-500': props.error,
    'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !props.error,
    'bg-gray-100 cursor-not-allowed': props.disabled,
    'bg-gray-50': props.readonly && !props.disabled,
  },
])

const charCount = computed(() => props.modelValue?.length || 0)

const autoResize = (): void => {
  if (props.autoResize && textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
}

const handleInput = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)

  if (props.autoResize) {
    autoResize()
  }
}

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent): void => {
  emit('focus', event)
}

onMounted(() => {
  if (props.autoResize && props.modelValue) {
    autoResize()
  }
})

watch(
  () => props.modelValue,
  () => {
    if (props.autoResize) {
      nextTick(autoResize)
    }
  },
)
</script>

<template>
  <div>
    <textarea
      :id="id"
      ref="textareaRef"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :rows="rows"
      :class="textareaClasses"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <div
      v-if="showCharCount"
      class="mt-1 text-sm text-right"
      :class="
        maxlength && charCount >= maxlength ? 'text-red-500' : 'text-gray-500'
      "
    >
      {{ charCount }}{{ maxlength ? ` / ${maxlength}` : '' }}
    </div>
  </div>
</template>
