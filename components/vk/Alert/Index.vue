<script setup lang="ts">
/**
 * @component VKAlert
 * @description Componente para mostrar mensajes informativos, de éxito, advertencia o error
 *
 * @props {string} type - Tipo de alerta (info, success, warning, error)
 * @props {string} title - Título de la alerta (opcional)
 * @props {boolean} dismissible - Si la alerta puede ser cerrada
 *
 * @emits close - Emitido cuando se cierra la alerta
 *
 * @example
 * <VKAlert
 *   type="success"
 *   title="Operación exitosa"
 *   dismissible
 *   @close="hideAlert"
 * >
 *   Los datos han sido guardados correctamente.
 * </VKAlert>
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

import { useI18n } from '#imports';

defineOptions({
  name: 'ComponentsVKAlert',
})

const { t }: I18n = useI18n()

const props = withDefaults(
  defineProps<{
    type?: 'info' | 'success' | 'warning' | 'error'
    title?: string
    dismissible?: boolean
  }>(),
  {
    type: 'info',
    dismissible: false,
    title: '',
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(true)

const config = computed((): Record<string, string> => {
  const configs = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      iconClass: 'i-mdi-check-circle',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      iconClass: 'i-mdi-alert-circle',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      iconClass: 'i-mdi-alert',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      iconClass: 'i-mdi-information',
    },
    default: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      iconClass: 'i-mdi-information',
    },
  }

  return configs[props.type] || configs.default
})

const closeAlert = (): void => {
  isVisible.value = false
  emit('close')
}
</script>

<template>
  <div
    v-if="isVisible"
    :class="['rounded-md border p-4 mb-4', config.bg, config.border]"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <i
          :class="[config.text, config.iconClass]"
          class="h-5 w-5"
          aria-hidden="true"
        />
      </div>

      <div class="ml-3 flex-1">
        <h3
          v-if="title"
          class="text-sm font-medium"
          :class="config.text"
        >
          {{ title }}
        </h3>

        <div
          class="text-sm mt-1"
          :class="config.text"
        >
          <slot />
        </div>
      </div>

      <div
        v-if="dismissible"
        class="ml-auto pl-3"
      >
        <button
          type="button"
          class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="config.text"
          @click="closeAlert"
        >
          <span class="sr-only">{{ t('components_vk.alert.close') }}</span>
          <svg
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
