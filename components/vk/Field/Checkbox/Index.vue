<script setup lang="ts">
/**
 * @component VKFieldCheckbox
 * @description Componente de casilla de verificación para formularios con soporte para validación.
 * Permite definir valores personalizados y mostrar errores de validación.
 * Implementa la lógica para mostrar errores solo después del envío del formulario.
 * Soporta estado intermedio a través de la prop 'intermediate'.
 *
 * @props {String} name - Nombre del campo (requerido para validación)
 * @props {String|Number|Boolean} checkedValue - Valor cuando está marcado
 * @props {String|Number|Boolean} uncheckedValue - Valor cuando no está marcado
 * @props {Boolean} required - Si el campo es requerido
 * @props {Boolean} disabled - Si el campo está deshabilitado
 * @props {Boolean} intermediate - Si el checkbox debe mostrarse en estado intermedio
 * @props {String} maxWidth - Ancho máximo del campo completo (incluyendo etiqueta)
 * @props {ColorName} textColor - Color de texto para las etiquetas y contenido
 * @props {TypographyStyle} textStyle - Estilo tipográfico para el texto
 * @props {TypographyVariant} textVariant - Variante tipográfica para el texto
 *
 * @slots label - Contenido para la etiqueta del campo
 * @slots error - Contenido personalizado para los mensajes de error
 *
 * @example
 * <VKFieldCheckbox
 *   name="acceptTerms"
 *   checkedValue="1"
 *   uncheckedValue="0"
 *   required
 *   textColor="medium-green"
 *   textStyle="body"
 *   textVariant="bold"
 * >
 *   <template #label>
 *     Acepto los términos y condiciones
 *   </template>
 * </VKFieldCheckbox>
 *
 * @author Pablo Contreras
 * @since 2025/04/25
 * @updated 2025/05/07
 */
import { useField, type FieldMeta } from 'vee-validate'
import type { Ref } from 'vue'
import { fieldBaseProps } from '../BaseProps'

defineOptions({
  name: 'ComponentsVKFieldCheckbox',
})

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  checkedValue: {
    type: [String, Number, Boolean],
    default: true,
  },
  uncheckedValue: {
    type: [String, Number, Boolean],
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  intermediate: {
    type: Boolean,
    default: false,
  },
  ...fieldBaseProps,
})

// Obtener la configuración para mostrar validaciones después del envío
const showValidationOnSubmit = inject('showValidationOnSubmit', ref(true))

// Obtener el estado de envío del formulario desde el componente padre
const isFormSubmitted = inject<Ref<boolean>>('isFormSubmitted', ref(false))

// Estado para el hover
const isHovered = ref(false)

// Uso de useField para validación con opciones específicas para checkbox
const {
  value,
  errorMessage,
  handleChange,
  meta,
}: {
  value: Ref<typeof props.checkedValue | typeof props.uncheckedValue>
  errorMessage: Ref<string | undefined>
  handleChange: (e: Event | boolean) => void
  meta: FieldMeta<unknown>
} = useField(props.name, undefined, {
  type: 'checkbox',
  checkedValue: props.checkedValue,
  uncheckedValue: props.uncheckedValue,
})

// Determina si se debe mostrar el error
const shouldShowError = computed(() => {
  // Si showValidationOnSubmit es falso, mostrar errores siempre
  if (!showValidationOnSubmit.value) {
    return !!errorMessage.value
  }

  // Si showValidationOnSubmit es true, mostrar errores solo si el formulario ha sido enviado
  return isFormSubmitted.value && !!errorMessage.value
})

// Verificamos si está marcado
const isChecked = computed(() => {
  return value.value === props.checkedValue
})

// Clases para el checkbox
const checkboxClasses = computed(() => [
  'vk-field-checkbox__input',
  {
    'vk-field-checkbox__input--error': shouldShowError.value,
    'vk-field-checkbox__input--disabled': props.disabled,
    'vk-field-checkbox__input--valid': meta.validated && !errorMessage.value,
  },
])

// Clases para el contenedor
const containerClasses = computed(() => [
  'vk-field-checkbox',
  `vk-color-text-${props.textColor}`,
  `vk-color-bg-${props.bgColor}`,
  {
    'vk-field-checkbox--error': shouldShowError.value,
    'vk-field-checkbox--valid': meta.validated && !errorMessage.value,
    'vk-field-checkbox--disabled': props.disabled,
  },
])

// Determina qué icono mostrar según el estado
const checkboxIcon = computed(() => {
  if (props.intermediate) {
    return 'checkbox-fill'
  }
  if (isChecked.value) {
    return 'checkbox-check'
  }
  if (isHovered.value) {
    return 'checkbox'
  }
  return 'checkbox-unchecked'
})

// Manejadores para el hover
const handleMouseEnter = (): void => {
  if (!props.disabled) {
    isHovered.value = true
  }
}

const handleMouseLeave = (): void => {
  isHovered.value = false
}
</script>

<template>
  <div :class="containerClasses">
    <div class="vk-field-checkbox__control">
      <div
        class="vk-field-checkbox__custom-input-container"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <input
          :id="name"
          type="checkbox"
          :class="checkboxClasses"
          :checked="isChecked"
          :disabled="disabled"
          @change="handleChange"
        >
        <div class="vk-field-checkbox__custom-input">
          <VKIcon
            pkg="ci"
            :icon="checkboxIcon"
            class="vk-field-checkbox__icon"
            color="medium-green"
          />
        </div>
      </div>
      <label
        :for="name"
        class="vk-field-checkbox__label"
      >
        <VKText
          :style="textStyle"
          :variant="textVariant"
          :color="textColor"
        >
          <slot name="label" />
          <span
            v-if="required"
            class="vk-color-text-medium-green"
          >*</span>
        </VKText>
      </label>
    </div>

    <div
      v-if="shouldShowError"
      class="vk-field-checkbox__error"
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
.vk-field-checkbox__control {
  display: flex;
  align-items: flex-start;
}

.vk-field-checkbox__custom-input-container {
  position: relative;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vk-field-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

.vk-field-checkbox__input--disabled {
  cursor: not-allowed;
}

.vk-field-checkbox__custom-input {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: all 0.2s ease;
  pointer-events: none;
}

.vk-field-checkbox__icon {
  transition: all 0.2s ease-in-out;
}

/* Estado de error */
.vk-field-checkbox__input--error + .vk-field-checkbox__custom-input {
  color: #dc2626;
}

/* Estado válido */
.vk-field-checkbox__input--valid + .vk-field-checkbox__custom-input {
  color: #10b981;
}

/* Estado deshabilitado */
.vk-field-checkbox__input--disabled + .vk-field-checkbox__custom-input {
  opacity: 0.5;
}

.vk-field-checkbox__label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  padding-top: 1px;
}

.vk-field-checkbox--disabled .vk-field-checkbox__label {
  opacity: 0.5;
  cursor: not-allowed;
}

.vk-field-checkbox__error {
  margin-top: 0.25rem;
  margin-left: 1.5rem;
  font-size: 0.75rem;
  color: #dc2626;
}
</style>
