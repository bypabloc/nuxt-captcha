<script setup lang="ts">
/**
 * @component VKDialog
 * @description Componente para mostrar ventanas de diálogo modal utilizando el elemento nativo dialog HTML
 * con animaciones suaves de entrada y salida.
 *
 * @props {boolean} modelValue - Estado del diálogo (abierto/cerrado) (v-model)
 * @props {string} title - Título del diálogo (opcional)
 * @props {boolean} persistent - Si es true, no se cierra al hacer clic fuera o presionar ESC
 * @props {boolean} closeButton - Muestra un botón para cerrar en la esquina superior derecha
 * @props {string} width - Ancho personalizado del diálogo
 * @props {string} maxWidth - Ancho máximo del diálogo (sm, md, lg, xl, full)
 * @props {boolean} fullscreen - Si el diálogo debe ocupar toda la pantalla
 * @props {string} zIndex - Índice z-index personalizado
 *
 * @emits update:modelValue - Emitido cuando cambia el estado del diálogo
 * @emits open - Emitido cuando el diálogo se abre
 * @emits close - Emitido cuando el diálogo se cierra
 * @emits cancel - Emitido cuando se cancela el diálogo (clic fuera o ESC)
 *
 * @slots header - Contenido personalizado para la cabecera
 * @slots default - Contenido principal del diálogo
 * @slots footer - Contenido personalizado para el pie
 * @slots close-icon - Icono personalizado para el botón de cerrar
 *
 * @example
 * <VKDialog
 *   v-model="showDialog"
 *   title="Confirmación"
 *   persistent
 *   @close="handleClose"
 * >
 *   <p>¿Está seguro de que desea continuar?</p>
 *
 *   <template #footer>
 *     <div class="flex justify-end gap-2">
 *       <VKButton variant="outline" @click="showDialog = false">
 *         Cancelar
 *       </VKButton>
 *       <VKButton @click="confirm">
 *         Confirmar
 *       </VKButton>
 *     </div>
 *   </template>
 * </VKDialog>
 *
 * @author Pablo Contreras
 * @since 2025/04/15
 */

defineOptions({
  name: 'ComponentsVKDialog',
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    persistent?: boolean
    closeButton?: boolean
    width?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    fullscreen?: boolean
    zIndex?: string
  }>(),
  {
    persistent: false,
    closeButton: true,
    maxWidth: 'md',
    fullscreen: false,
    zIndex: 'auto',
    title: '',
    width: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'open' | 'close' | 'cancel'): void
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

const isAnimating = ref(false)
const isVisible = ref(false)

const maxWidthClasses = computed((): string => {
  const widths: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full w-full',
  }
  return widths[props.maxWidth] || 'max-w-md'
})

const dialogStyles = computed((): Record<string, string> => {
  const styles: Record<string, string> = {}

  if (props.width) {
    styles.width = props.width
  }

  if (props.zIndex !== 'auto') {
    styles.zIndex = props.zIndex
  }

  return styles
})

const dialogClasses = computed((): (string | Record<string, boolean>)[] => [
  'vk-dialog',
  maxWidthClasses.value,
  {
    'vk-dialog--fullscreen': props.fullscreen,
    'vk-dialog--has-title': !!props.title,
  },
])

const containerClasses = computed((): (string | Record<string, boolean>)[] => [
  'vk-dialog__container',
  {
    'opacity-0 scale-95': !isVisible.value,
    'opacity-100 scale-100': isVisible.value,
  },
])

const open = async (): Promise<void> => {
  if (!dialogRef.value) return

  if (!dialogRef.value.open) {
    isAnimating.value = true

    if (dialogRef.value.hasAttribute('open')) {
      dialogRef.value.setAttribute('open', '')
    } else {
      dialogRef.value.showModal()
    }

    await nextTick()

    isVisible.value = true

    setTimeout(() => {
      isAnimating.value = false
      emit('open')
    }, 300)
  }
}

const close = async (): Promise<void> => {
  if (!dialogRef.value || !dialogRef.value.open) return

  isAnimating.value = true

  isVisible.value = false

  setTimeout(() => {
    if (dialogRef.value) {
      dialogRef.value.close()
      isAnimating.value = false
      emit('close')
    }
  }, 300)
}

const handleCloseClick = (): void => {
  emit('update:modelValue', false)
  close()
}

const handleBackdropClick = (event: MouseEvent): void => {
  if (props.persistent || isAnimating.value) return
  const target = event.target as HTMLElement
  if (target.tagName === 'DIALOG') {
    emit('update:modelValue', false)
    emit('cancel')
    close()
  }
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && props.persistent) {
    event.preventDefault()
  }
}

watch(
  () => props.modelValue,
  (newValue: boolean): void => {
    nextTick((): void => {
      if (newValue && !isAnimating.value) {
        open()
      } else if (!newValue && !isAnimating.value) {
        close()
      }
    })
  },
  { immediate: true },
)

onMounted((): void => {
  if (dialogRef.value) {
    dialogRef.value.addEventListener('cancel', (event: Event): void => {
      if (props.persistent || isAnimating.value) {
        event.preventDefault()
      } else {
        emit('update:modelValue', false)
        emit('cancel')
      }
    })

    if (props.modelValue && !dialogRef.value.open) {
      open()
    }
  }

  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount((): void => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <dialog
    ref="dialogRef"
    :class="dialogClasses"
    :style="dialogStyles"
    @click="handleBackdropClick"
  >
    <div
      :class="containerClasses"
      class="transition-all duration-300 ease-out"
    >
      <div
        v-if="title || $slots.header || closeButton"
        class="vk-dialog__header"
      >
        <slot name="header">
          <h2
            v-if="title"
            class="vk-dialog__title"
          >
            {{ title }}
          </h2>
        </slot>

        <button
          v-if="closeButton"
          type="button"
          class="vk-dialog__close-button"
          aria-label="Cerrar"
          @click="handleCloseClick"
        >
          <slot name="close-icon">
            <i
              class="i-mdi-close w-5 h-5"
              aria-hidden="true"
            />
          </slot>
        </button>
      </div>

      <div class="vk-dialog__body">
        <slot />
      </div>

      <div
        v-if="$slots.footer"
        class="vk-dialog__footer"
      >
        <slot name="footer" />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.vk-dialog {
  padding: 0;
  margin: auto;
  border-radius: 0.5rem;
  border: none;
  overflow: hidden;
  background-color: transparent;
  color: var(--vk-color-text-oxford, #062754);
  box-shadow: none;
}

.vk-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.vk-dialog[open]::backdrop {
  opacity: 1;
}

.vk-dialog__container {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2rem);
  background-color: var(--vk-color-bg-white, white);
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform-origin: center;
}

.vk-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
}

.vk-dialog__title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--vk-color-text-oxford, #062754);
}

.vk-dialog__close-button {
  align-self: flex-start;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--vk-color-text-oxford-60, #6a7f98);
  border-radius: 0.25rem;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.vk-dialog__close-button:hover {
  color: var(--vk-color-text-oxford, #062754);
  background-color: var(--vk-color-bg-oxford-10, #e6e9ee);
}

.vk-dialog__body {
  padding: 16px;
  padding-top: 0;
  overflow-y: auto;
}

.vk-dialog__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--vk-color-border-color-oxford-10, #e6e9ee);
  background-color: var(--vk-color-bg-perl, #fafafa);
}

.vk-dialog.max-w-sm {
  max-width: 24rem;
}

.vk-dialog.max-w-md {
  max-width: 28rem;
}

.vk-dialog.max-w-lg {
  max-width: 32rem;
}

.vk-dialog.max-w-xl {
  max-width: 36rem;
}

.vk-dialog.max-w-full {
  max-width: calc(100vw - 2rem);
}

.vk-dialog--fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0;
  border-radius: 0;
}

.vk-dialog--fullscreen .vk-dialog__container {
  height: 100vh;
  border-radius: 0;
}

.vk-dialog--fullscreen .vk-dialog__body {
  flex: 1;
}

@media (max-width: 640px) {
  .vk-dialog:not(.vk-dialog--fullscreen) {
    width: calc(100vw - 2rem) !important;
    max-width: none !important;
  }
}
</style>
