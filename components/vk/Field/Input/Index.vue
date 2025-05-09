<script setup lang="ts">
/**
 * @component VKFieldInput
 * @description Componente de campo de entrada de texto para formularios con soporte para validación.
 * Incluye etiqueta, campo de entrada y visualización de errores.
 * Implementa la lógica para mostrar errores solo después del envío del formulario.
 * Permite agregar un botón u otro contenido a la derecha del input mediante el slot "append".
 *
 * @props {String} name - Nombre del campo (requerido para validación)
 * @props {String} type - Tipo de input (text, email, password, etc.)
 * @props {Boolean} required - Si el campo es requerido
 * @props {String} placeholder - Texto de placeholder
 * @props {Boolean} disabled - Si el campo está deshabilitado
 * @props {Boolean} readonly - Si el campo es de solo lectura
 * @props {String} autocomplete - Valor para autocomplete
 * @props {Number} maxlength - Longitud máxima del texto
 * @props {Number} minlength - Longitud mínima del texto
 * @props {String} maxWidth - Ancho máximo del campo completo (incluyendo etiqueta)
 * @props {function} formatter - Función para formatear el valor del campo
 * @props {ColorName} textColor - Color de texto para las etiquetas y contenido
 * @props {TypographyStyle} textStyle - Estilo tipográfico para el texto
 * @props {TypographyVariant} textVariant - Variante tipográfica para el texto
 *
 * @slots label - Contenido para la etiqueta del campo
 * @slots error - Contenido personalizado para los mensajes de error
 * @slots append - Contenido a mostrar dentro del input a la derecha (botón, ícono, etc.)
 *
 * @example
 * <VKFieldInput 
 *   name="email" 
 *   type="email" 
 *   required
 *   textColor="medium-green"
 *   textStyle="subtitle-3"
 *   textVariant="bold"
 * >
 *   <template #label>
 *     Correo Electrónico
 *   </template>
 *   <template #append>
 *     <button type="submit" class="...">
 *       <VKIcon icon="arrow-right" />
 *     </button>
 *   </template>
 * </VKFieldInput>
 *
 * @author Pablo Contreras
 * @since 2025/04/25
 * @updated 2025/05/07
 */
import type { FieldContext } from 'vee-validate'
import { useField } from 'vee-validate'
import type { ContainerStyles } from '../BaseProps'
import { fieldBaseProps, useFieldBaseStyles } from '../BaseProps'

defineOptions({
  name: 'ComponentsVKFieldInput',
})

const $logger = useNuxtApp().$logger

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: '',
  },
  maxlength: {
    type: Number,
    default: undefined,
  },
  minlength: {
    type: Number,
    default: undefined,
  },
  formatter: {
    type: Function,
    default: (value: string) => value,
  },
  ...fieldBaseProps,
})

// Obtener estilos base calculados
const { containerStyles }: { containerStyles: ComputedRef<ContainerStyles> } =
  useFieldBaseStyles(props)

// Obtener la configuración para mostrar validaciones después del envío
const showValidationOnSubmit = inject('showValidationOnSubmit', ref(true))

// Obtener el estado de envío del formulario desde el componente padre
const isFormSubmitted = inject<Ref<boolean>>('isFormSubmitted', ref(false))

// Verificar si hay un slot de append
const slots = useSlots()
const hasAppendSlot = computed(() => !!slots.append)

// Uso de useField para validación
const { value, errorMessage, handleBlur, meta }: FieldContext<string | number> =
  useField<string | number>(props.name)

// Determina si se debe mostrar el error
const shouldShowMessage = computed(() => {
  // Si showValidationOnSubmit es falso, mostrar errores siempre
  if (!showValidationOnSubmit.value) {
    return !!errorMessage.value
  }

  // Si showValidationOnSubmit es true, mostrar errores solo si el formulario ha sido enviado
  return isFormSubmitted.value && !!errorMessage.value
})

// Clases para el input basadas en estado
const inputClasses = computed((): (string | Record<string, boolean>)[] => [
  'vk-field-input__input',
  `vk-color-text-${props.textColor}`,
  `vk-color-bg-${props.bgColor}`,
  {
    'vk-field-input__input--error': shouldShowMessage.value,
    'vk-field-input__input--disabled': props.disabled,
    'vk-field-input__input--readonly': props.readonly,
    'vk-field-input__input--valid':
      shouldShowMessage.value && meta.validated && !errorMessage.value,
    'pr-10': hasAppendSlot.value, // Padding derecho extra cuando hay un botón
  },
])

// Clases para el contenedor
const containerClasses = computed((): (string | Record<string, boolean>)[] => [
  'vk-field-input flex flex-col gap-2',
  {
    'vk-field-input--error': shouldShowMessage.value,
    'vk-field-input--valid':
      shouldShowMessage.value && meta.validated && !errorMessage.value,
    'vk-field-input--disabled': props.disabled,
    'vk-field-input--with-append': hasAppendSlot.value,
  },
])

const format = (): void => {
  $logger.info('format', value.value)
  const formattedValue = props.formatter(value.value)
  value.value = formattedValue
}
</script>

<template>
  <div
    :class="containerClasses"
    :style="containerStyles"
  >
    <div class="vk-field-input__label-container">
      <VKText
        :style="textStyle"
        :variant="textVariant"
        :color="textColor"
        tag="label"
      >
        <slot name="label" />
        <span
          v-if="required"
          class="vk-color-text-medium-green ml-1"
        >*</span>
      </VKText>
    </div>

    <div class="vk-field-input__input-wrapper relative">
      <input
        :id="name"
        v-model="value"
        :type="type"
        :class="inputClasses"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :minlength="minlength"
        @blur="handleBlur"
        @input="format"
      >

      <!-- Slot para contenido a la derecha del input (botón, ícono) -->
      <div
        v-if="hasAppendSlot"
        class="vk-field-input__append absolute right-0 top-0 h-full flex items-center justify-center pr-2"
      >
        <slot name="append" />
      </div>
    </div>

    <div
      v-if="shouldShowMessage"
      class="vk-field-input__error"
    >
      <slot name="error">
        <VKText
          :style="'caption'"
          variant="regular"
          color="error"
        >
          {{ errorMessage }}
        </VKText>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* Estilos base */
.vk-field-input {
  width: 100%;
}

.vk-field-input__input-wrapper {
  width: 100%;
  position: relative;
}

.vk-field-input__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vk-color-text-oxford, #374151);
  display: flex;
  align-items: center;
}

.vk-field-input__required {
  color: var(--vk-color-error, #dc2626);
  margin-left: 0.25rem;
}

.vk-field-input__input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--vk-color-border, #d1d5db);
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s ease;
}

.vk-field-input__input:focus {
  outline: none;
  border-color: var(--vk-color-primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.vk-field-input__input--error {
  border-color: var(--vk-color-error, #dc2626);
}

.vk-field-input__input--error:focus {
  border-color: var(--vk-color-error, #dc2626);
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

.vk-field-input__input--valid {
  border-color: var(--vk-color-success, #10b981);
}

.vk-field-input__input--valid:focus {
  border-color: var(--vk-color-success, #10b981);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.vk-field-input__input--disabled,
.vk-field-input__input--readonly {
  background-color: var(--vk-color-bg-disabled, #f3f4f6);
  cursor: not-allowed;
}

.vk-field-input__error {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--vk-color-error, #dc2626);
}

.vk-field-input__valid-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--vk-color-success, #10b981);
}

/* Estilos para el append */
.vk-field-input__append {
  z-index: 10;
}
</style>
