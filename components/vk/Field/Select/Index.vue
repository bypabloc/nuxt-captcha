<script setup lang="ts">
/**
 * @component VKFieldSelect
 * @description Componente de selección para formularios con soporte para validación.
 * Permite diferentes tipos de opciones y selección múltiple.
 * Implementa la lógica para mostrar errores solo después del envío del formulario.
 *
 * @props {String} name - Nombre del campo (requerido para validación)
 * @props {Array<SelectOption | string | number>} options - Opciones para el select (array de objetos {value, label} o array de valores)
 * @props {Boolean} required - Si el campo es requerido
 * @props {String} placeholder - Texto de placeholder
 * @props {Boolean} disabled - Si el campo está deshabilitado
 * @props {Boolean} multiple - Si permite selección múltiple
 * @props {String} maxWidth - Ancho máximo del campo completo (incluyendo etiqueta)
 * @props {ColorName} textColor - Color de texto para las etiquetas y contenido
 * @props {TypographyStyle} textStyle - Estilo tipográfico para el texto
 * @props {TypographyVariant} textVariant - Variante tipográfica para el texto
 *
 * @slots label - Contenido para la etiqueta del campo
 * @slots error - Contenido personalizado para los mensajes de error
 *
 * @example
 * <VKFieldSelect
 *   name="country"
 *   :options="[
 *     { value: 'cl', label: 'Chile' },
 *     { value: 'ar', label: 'Argentina' },
 *     { value: 'pe', label: 'Perú' }
 *   ]"
 *   required
 *   textColor="medium-green"
 *   textStyle="body"
 *   textVariant="bold"
 * >
 *   <template #label>
 *     País
 *   </template>
 * </VKFieldSelect>
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
  name: 'ComponentsVKFieldSelect',
})

// Interfaces para las opciones del select
interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

// Tipo para las opciones válidas
type OptionValue = SelectOption | string | number

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  options: {
    type: Array as () => Array<OptionValue>,
    default: () => [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: 'Seleccione una opción',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  isFormSubmitted: {
    type: Boolean,
    default: false,
  },
  ...fieldBaseProps,
})

// Obtener estilos base calculados
const { containerStyles }: { containerStyles: ComputedRef<ContainerStyles> } =
  useFieldBaseStyles(props)

// Obtener la configuración para mostrar validaciones después del envío
const showValidationOnSubmit = inject('showValidationOnSubmit', ref(true))

// Uso de useField para validación
const {
  value,
  errorMessage,
  handleChange,
  handleBlur,
  meta,
}: FieldContext<string | number> = useField<string | number>(props.name)

// Determina si se debe mostrar el error
const shouldShowError = computed(() => {
  // Si showValidationOnSubmit es falso, mostrar errores siempre
  if (!showValidationOnSubmit.value) {
    return !!errorMessage.value
  }

  // Si showValidationOnSubmit es true, mostrar errores solo si el formulario ha sido enviado
  return props.isFormSubmitted && !!errorMessage.value
})

// Normalizar las opciones para asegurar formato consistente
const normalizedOptions = computed(() => {
  return props.options.map((option: OptionValue) => {
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

// Clases para el select
const selectClasses = computed(() => [
  'vk-field-select__select',
  `vk-color-text-${props.textColor}`,
  `vk-color-bg-${props.bgColor}`,
  {
    'vk-field-select__select--error': shouldShowError.value,
    'vk-field-select__select--disabled': props.disabled,
    'vk-field-select__select--valid': meta.validated && !errorMessage.value,
    'vk-field-select__select--multiple': props.multiple,
  },
])

// Clases para el contenedor
const containerClasses = computed(() => [
  'vk-field-select',
  {
    'vk-field-select--error': shouldShowError.value,
    'vk-field-select--valid': meta.validated && !errorMessage.value,
    'vk-field-select--disabled': props.disabled,
  },
])
</script>

<template>
  <div
    :class="containerClasses"
    :style="containerStyles"
  >
    <div class="vk-field-select__label-container">
      <VKText
        :style="textStyle"
        :variant="textVariant"
        :color="textColor"
        tag="label"
        :for="name"
        class="vk-field-select__label"
      >
        <slot name="label" />
        <span
          v-if="required"
          class="vk-color-text-medium-green ml-1"
        >*</span>
      </VKText>
    </div>

    <div class="vk-field-select__wrapper">
      <select
        :id="name"
        v-model="value"
        :class="selectClasses"
        :disabled="disabled"
        :multiple="multiple"
        @change="handleChange"
        @blur="handleBlur"
      >
        <option
          v-if="!multiple && placeholder"
          value=""
          disabled
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
        class="vk-field-select__arrow"
      />
    </div>

    <div
      v-if="shouldShowError"
      class="vk-field-select__error"
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
.vk-field-select {
  margin-bottom: 1rem;
  width: 100%;
}

.vk-field-select__label-container {
  margin-bottom: 0.5rem;
}

.vk-field-select__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vk-color-text-oxford, #374151);
  display: flex;
  align-items: center;
}

.vk-field-select__required {
  color: var(--vk-color-error, #dc2626);
  margin-left: 0.25rem;
}

.vk-field-select__wrapper {
  position: relative;
}

.vk-field-select__select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  padding-right: 2rem;
  border: 1px solid var(--vk-color-border, #d1d5db);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  appearance: none;
  background-color: white;
  transition: all 0.2s ease;
}

.vk-field-select__select--multiple {
  padding-right: 0.75rem;
  min-height: 5rem;
}

.vk-field-select__select:focus {
  outline: none;
  border-color: var(--vk-color-primary, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.vk-field-select__select--error {
  border-color: var(--vk-color-error, #dc2626);
}

.vk-field-select__select--error:focus {
  border-color: var(--vk-color-error, #dc2626);
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
}

.vk-field-select__select--valid {
  border-color: var(--vk-color-success, #10b981);
}

.vk-field-select__select--valid:focus {
  border-color: var(--vk-color-success, #10b981);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.vk-field-select__select--disabled {
  background-color: var(--vk-color-bg-disabled, #f3f4f6);
  cursor: not-allowed;
}

.vk-field-select__arrow {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--vk-color-text-muted, #6b7280);
  pointer-events: none;
}

.vk-field-select__error {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--vk-color-error, #dc2626);
}

.vk-field-select__valid-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--vk-color-success, #10b981);
}
</style>
