<script setup lang="ts">
/**
 * @component VKForm
 * @description Componente base para formularios con soporte para validación vee-validate y zod.
 * Proporciona integración con el sistema de diseño, manejo de errores y focus automático en campos inválidos.
 * Soporta layout adaptativo (grid en desktop, columna en mobile) con último elemento centrado cuando es impar.
 *
 * @props {Object} validationSchema - Schema de validación para el formulario
 * @props {Object} initialValues - Valores iniciales para los campos
 * @props {Boolean} validateOnMount - Si debe validarse al montar el componente
 * @props {String} generalError - Mensaje de error general para todo el formulario
 *
 * @emits submit - Se emite cuando el formulario se envía con datos válidos
 * @emits reset - Se emite cuando el formulario se reinicia
 *
 * @slots default - Contenido principal del formulario (campos)
 * @slots error - Contenido personalizado para mostrar errores generales
 * @slots title - Título del formulario
 * @slots subtitle - Subtítulo del formulario
 * @slots footer - Contenido del pie del formulario
 *
 * @example
 * <VKForm
 *   :validation-schema="schema"
 *   :initial-values="{ email: 'contacto@ejemplo.com' }"
 *   grid-layout
 *   @submit="handleSubmit"
 * >
 *   <VKFieldInput name="nombre" required>
 *     <template #label>Nombre</template>
 *   </VKFieldInput>
 *   <VKFieldInput name="apellido" required>
 *     <template #label>Apellido</template>
 *   </VKFieldInput>
 *   <VKFieldInput name="email" type="email" required>
 *     <template #label>Correo Electrónico</template>
 *   </VKFieldInput>
 * </VKForm>
 *
 * @author Pablo Contreras
 * @since 2025/04/25
 */
import { useForm } from 'vee-validate'

defineOptions({
  name: 'ComponentsVKForm',
})

const display = useDisplay()

const { isMobile }: { isMobile: ComputedRef<boolean> } = display

// Definición de tipos específicos para las funciones
// Usamos unknown en lugar de any para mantener seguridad de tipos
type FormValues = Record<string, unknown>

// Definición de tipos para la desestructuración
type FormContextType = ReturnType<typeof useForm>

const props = defineProps({
  validationSchema: {
    type: Object,
    default: () => ({}),
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  validateOnMount: {
    type: Boolean,
    default: false,
  },
  generalError: {
    type: String,
    default: '',
  },
})

const slots = useSlots()
const hasTitleSlot = computed(() => !!slots.title)
const hasSubtitleSlot = computed(() => !!slots.subtitle)

// Estado de envío del formulario - Ahora manejado internamente
const isSubmitted = ref(false)

const $logger = useNuxtApp().$logger
$logger.info('VKForm', 'Props:', props)
$logger.info('VKForm', 'Slots:', slots)

const emit = defineEmits<{
  submit: [values: FormValues]
  reset: []
}>()

// Configuración del formulario con vee-validate
// No anotamos el tipo explícitamente para permitir inferencia de tipos
const formContext = useForm({
  validationSchema: props.validationSchema,
  initialValues: props.initialValues,
  validateOnMount: props.validateOnMount,
})

// Extraemos las propiedades y métodos del context con anotación de tipo
const {
  handleSubmit,
  handleReset,
  resetForm,
  submitForm,
  values,
  errors,
  errorBag,
  meta,
  isSubmitting,
  defineField,
  setFieldError,
  setErrors,
  setValues,
  setFieldValue,
  validateField,
  validate,
}: FormContextType = formContext

// Proporcionar el contexto del formulario a los componentes hijos
provide('form', {
  handleSubmit,
  handleReset,
  resetForm,
  submitForm,
  values,
  errors,
  errorBag,
  meta,
  isSubmitting,
  defineField,
  setFieldError,
  setErrors,
  setValues,
  setFieldValue,
  validateField,
  validate,
})

// Proporcionar isSubmitted para que los componentes hijos puedan acceder directamente
provide('isFormSubmitted', isSubmitted)

// Computamos si el formulario es válido basado en meta
const isValid = computed(() => meta.value.valid)

// Calculamos las clases del contenedor de los campos del formulario según el layout
const formFieldsContainerClasses = computed(() => {
  return !isMobile.value
    ? 'grid grid-cols-2 gap-x-4 gap-y-6 max-w-4xl vk-form-grid'
    : 'flex flex-col w-full max-w-xl'
})

/**
 * Función para enfocar el primer campo inválido en el formulario
 * Busca elementos con clases de error específicas y hace focus en el primero
 */
const focusFirstInvalidField = async (): Promise<void> => {
  await nextTick()

  // Los selectores para diferentes tipos de campos inválidos
  const selectors = [
    // Campos de entrada de texto, email, password, etc.
    'input.vk-field-input__input--error',
    // Checkbox con error
    'input.vk-field-checkbox__input--error',
    // Select con error
    'select.vk-field-select__select--error',
    // Textarea con error
    'textarea.vk-field-textarea__input--error',
  ]

  // Buscar el primer elemento inválido
  const invalidField = document.querySelector(selectors.join(', '))

  if (invalidField && invalidField instanceof HTMLElement) {
    // Hacer focus en el elemento inválido
    invalidField.focus()
    // Hacer scroll para mostrar el campo con error
    invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  // Si no se encuentra el campo directamente, buscar el contenedor del campo
  const containerSelectors = [
    '.vk-field-input--error',
    '.vk-field-checkbox--error',
    '.vk-field-select--error',
    '.vk-field-textarea--error',
  ]

  const invalidContainer = document.querySelector(containerSelectors.join(', '))

  if (invalidContainer && invalidContainer instanceof HTMLElement) {
    // Buscar el input dentro del contenedor
    const inputElement = invalidContainer.querySelector(
      'input, select, textarea',
    )

    if (inputElement && inputElement instanceof HTMLElement) {
      inputElement.focus()
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      // Si no se encuentra un elemento de entrada, al menos hacer scroll al contenedor
      invalidContainer.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

// Función que se ejecuta antes de que el formulario se envíe para validación
const beforeSubmit = (): void => {
  // Establecer isSubmitted a true antes de cualquier validación
  isSubmitted.value = true
}

// Manejador de envío del formulario modificado con focus automático
const onSubmit = (event: Event): void => {
  // Marcar el formulario como enviado
  beforeSubmit()

  // Prevenir el comportamiento predeterminado del formulario
  event.preventDefault()

  // Usar el handleSubmit de vee-validate para validar y procesar el envío
  handleSubmit((values: FormValues) => {
    $logger.info('VKForm', 'Formulario enviado con valores:', values)
    emit('submit', values)
  })(event)

  // Verificar después de la validación si hay errores y enfocar el campo
  nextTick(async () => {
    if (!meta.value.valid) {
      await focusFirstInvalidField()
    }
  })
}

// Manejador para el reset del formulario
const onReset = (): void => {
  // Resetear el estado de envío
  isSubmitted.value = false
  handleReset()
  emit('reset')
}

// Proporcionar error general al contexto
provide('generalError', toRef(props, 'generalError'))
</script>

<template>
  <form
    class="vk-form flex justify-center items-center w-full"
    @submit="onSubmit"
    @reset.prevent="onReset"
  >
    <div class="flex flex-col gap-6 w-full items-center">
      <div
        v-if="hasTitleSlot"
        class="vk-form__header w-full"
      >
        <div
          class="vk-form__header-content flex flex-col gap-2"
          :class="{ 'justify-center items-center': !isMobile }"
        >
          <VKText
            :style="'subtitle-1'"
            variant="bold"
            color="dark-green"
          >
            <slot name="title" />
          </VKText>
          <div v-if="hasSubtitleSlot">
            <VKText tag="p">
              <slot name="subtitle" />
            </VKText>
          </div>
        </div>
      </div>

      <!-- Contenedor principal centrado -->
      <div class="flex justify-center w-full">
        <!-- Contenedor de campos con layout adaptativo -->
        <div :class="formFieldsContainerClasses">
          <slot
            :values="values"
            :errors="errors"
            :meta="meta"
            :is-submitting="isSubmitting"
            :is-submitted="isSubmitted"
            :is-valid="isValid"
            :reset="onReset"
            :submit="onSubmit"
          />
        </div>
      </div>

      <div class="flex flex-col justify-center items-center gap-6">
        <slot
          name="footer"
          :values="values"
          :errors="errors"
          :meta="meta"
          :is-submitting="isSubmitting"
          :is-submitted="isSubmitted"
          :is-valid="isValid"
          :reset="onReset"
          :submit="onSubmit"
        />

        <div
          v-if="generalError"
          class="vk-form__error"
        >
          <slot name="error">
            <p class="vk-form__error-message">{{ generalError }}</p>
          </slot>
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped>
.vk-form {
  width: 100%;
}

.vk-form__error {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  background-color: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.vk-form__error-message {
  color: rgb(220, 38, 38);
  font-size: 0.875rem;
}

/* Centrar el último elemento cuando hay un número impar de elementos en modo grid */
.vk-form-grid > *:last-child:nth-child(odd) {
  grid-column: 1 / span 2;
  max-width: 50%;
  justify-self: center;
}
</style>
