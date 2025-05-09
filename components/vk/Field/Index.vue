<script setup lang="ts">
/**
 * @component VKField
 * @description Componente campo de formulario que combina label, input y mensaje de error
 *
 * @props {string} modelValue - Valor del input (v-model)
 * @props {string} label - Texto de la etiqueta
 * @props {string} name - Nombre del campo
 * @props {string} id - ID del campo (por defecto usa name)
 * @props {string} type - Tipo de input
 * @props {string} placeholder - Texto de placeholder
 * @props {boolean} required - Indica si el campo es obligatorio
 * @props {boolean} disabled - Indica si el campo está deshabilitado
 * @props {boolean} readonly - Indica si el campo es de solo lectura
 * @props {string} error - Mensaje de error (si existe)
 * @props {string} helpText - Texto de ayuda adicional
 * @props {ColorName} textColor - Color del texto de la etiqueta
 * @props {TypographyStyle} textStyle - Estilo tipográfico del texto
 * @props {TypographyVariant} textVariant - Variante tipográfica del texto
 * @props {ColorName} bgColor - Color de fondo del campo
 *
 * @emits update:modelValue - Emitido cuando cambia el valor del input
 * @emits blur - Emitido cuando el input pierde el foco
 *
 * @example
 * <VKField
 *   v-model="formData.email"
 *   label="Correo electrónico"
 *   name="email"
 *   type="email"
 *   required
 *   :error="errors.email"
 *   help-text="Usaremos este correo para contactarte"
 *   textColor="medium-green"
 *   textStyle="subtitle-3"
 *   textVariant="bold"
 *   bgColor="light-green"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 * @updated 2025/05/07
 */
import type { ColorName } from '@/design-system/presets/colors.preset';
import { COLOR_NAMES } from '@/design-system/presets/colors.preset';
import type { TypographyStyle, TypographyVariant } from '@/design-system/presets/typography.preset';

defineOptions({
  name: 'ComponentsVKField',
})

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    label?: string
    name: string
    id?: string
    type?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    error?: string
    helpText?: string
    textColor?: ColorName
    textStyle?: TypographyStyle
    textVariant?: TypographyVariant
    bgColor?: ColorName // Añadimos la propiedad bgColor
  }>(),
  {
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    readonly: false,
    label: '',
    id: '',
    error: '',
    helpText: '',
    textColor: COLOR_NAMES.DARK_GRAY as ColorName,
    textStyle: 'caption',
    textVariant: 'regular',
    bgColor: COLOR_NAMES.WHITE as ColorName, // Valor por defecto
  },
)

const fieldId = computed(() => props.id || props.name)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur', event: FocusEvent): void
}>()

const updateValue = (value: string | number): void => {
  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent): void => {
  emit('blur', event)
}
</script>

<template>
  <div class="mb-4">
    <VKLabel
      :for="fieldId"
      :required="required"
      :error="!!error"
    >
      <VKText
        :style="textStyle"
        :variant="textVariant"
        :color="textColor"
      >
        {{ label }}
      </VKText>
    </VKLabel>

    <VKInput
      :id="fieldId"
      :name="name"
      :type="type"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :error="!!error"
      :bg-color="bgColor"
      @update:model-value="updateValue"
      @blur="handleBlur"
    />

    <p
      v-if="error"
      class="mt-1 text-sm text-red-600"
    >
      <VKText
        :style="'caption'"
        variant="regular"
        color="error"
      >
        {{ error }}
      </VKText>
    </p>

    <p
      v-else-if="helpText"
      class="mt-1 text-sm text-gray-500"
    >
      <VKText
        :style="'caption'"
        variant="regular"
        :color="textColor"
      >
        {{ helpText }}
      </VKText>
    </p>
  </div>
</template>
