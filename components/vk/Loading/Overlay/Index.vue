<script setup lang="ts">
/**
 * @component VKLoadingOverlay
 * @description Componente overlay de carga que cubre toda la pantalla con una animación de carga.
 * Permite mostrar texto estático o rotativo con animación de puntos suspensivos.
 * Bloquea el scroll y mantiene el contenido centrado en pantalla.
 * 
 * Utiliza el store useLoadingStore para gestionar su estado, eliminando la necesidad
 * de pasar props para controlar su visibilidad y configuración básica.
 *
 * @props {boolean} showDots - Si se deben mostrar los puntos suspensivos animados
 * @props {number} dotsInterval - Intervalo en ms para cambiar los puntos suspensivos
 * @props {number} textInterval - Intervalo en ms para rotar entre textos del array
 * @props {ColorName} bgColor - Color de fondo del overlay (color del sistema de diseño)
 * @props {ColorName} textColor - Color del texto (color del sistema de diseño)
 * @props {string|number} zIndex - Índice z para el overlay
 * @props {boolean} blur - Si se debe aplicar efecto blur al fondo
 *
 * @example
 * <!-- Ya no necesita props básicos, se controla mediante el store -->
 * <VKLoadingOverlay />
 *
 * @example
 * <!-- Solo se necesitan props para personalización avanzada -->
 * <VKLoadingOverlay
 *   :dots-interval="300"
 *   bg-color="white"
 *   :blur="false"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/05/06
 */
import type { ColorName } from '@/design-system/presets/colors.preset'
import { useLoadingStore } from '@/store/useLoadingStore'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

defineOptions({
  name: 'ComponentsVKLoadingOverlay',
})

// Obtenemos el store para controlar el estado del overlay
const loadingStore = useLoadingStore()
const $logger = useNuxtApp().$logger

// Mantenemos solo los props que no están controlados por el store
const props = withDefaults(
  defineProps<{
    showDots?: boolean
    dotsInterval?: number
    textInterval?: number
    bgColor?: ColorName
    textColor?: ColorName
    zIndex?: string | number
    blur?: boolean
  }>(),
  {
    showDots: true,
    dotsInterval: 500,
    textInterval: 4000,
    bgColor: 'white' as ColorName,
    textColor: 'dark-gray' as ColorName,
    zIndex: 9999,
    blur: true,
  },
)

// Estado para los puntos suspensivos
const dots = ref('.')
const currentTextIndex = ref(0)
let dotsIntervalId: number | null = null
let textIntervalId: number | null = null

// Referencia al contenedor del overlay
const overlayRef = ref<HTMLElement | null>(null)

// Referencia al elemento que debe recibir el foco
const focusRef = ref<HTMLElement | null>(null)

// Resolver texto a mostrar cuando es un array
const resolveTextFromArray = (text: string | string[]): string => {
  if (Array.isArray(text)) {
    return text.length > 0 ? text[currentTextIndex.value] : ''
  }
  return text
}

// Determinar si hay textos múltiples
const hasMultipleTexts = computed((): boolean => {
  return Array.isArray(loadingStore.message) && loadingStore.message.length > 1
})

// Texto actual a mostrar
const currentText = computed((): string => {
  if (!loadingStore.message) return ''
  return resolveTextFromArray(loadingStore.message)
})

// Texto completo incluyendo los puntos suspensivos
const displayText = computed((): string => {
  if (!currentText.value) return ''
  return props.showDots ? `${currentText.value}${dots.value}` : currentText.value
})

// Estilos calculados para el overlay
const overlayStyles = computed(() => ({
  zIndex: props.zIndex,
}))

// Clases para el overlay
const overlayClasses = computed(() => [
  'vk-loading-overlay',
  `vk-color-bg-${props.bgColor}`,
  { 'vk-loading-overlay--blur': props.blur },
])

// Clases para el texto
const textClasses = computed(() => [
  'vk-loading-overlay__text',
  `vk-color-text-${props.textColor}`,
])

// Actualizamos los puntos suspensivos
const updateDots = (): void => {
  dots.value = dots.value === '.' ? '..' : (dots.value === '..' ? '...' : '.')
}

// Actualizamos el índice del texto actual
const updateTextIndex = (): void => {
  if (!Array.isArray(loadingStore.message)) return
  
  currentTextIndex.value = (currentTextIndex.value + 1) % loadingStore.message.length
}

// Función para iniciar la animación de los puntos suspensivos
const startDotsAnimation = (): void => {
  if (props.showDots && !dotsIntervalId) {
    dotsIntervalId = window.setInterval(updateDots, props.dotsInterval)
  }
}

// Función para iniciar la rotación de textos
const startTextRotation = (): void => {
  if (hasMultipleTexts.value && !textIntervalId) {
    textIntervalId = window.setInterval(updateTextIndex, props.textInterval)
  }
}

// Función para detener todas las animaciones
const stopAnimations = (): void => {
  if (dotsIntervalId) {
    clearInterval(dotsIntervalId)
    dotsIntervalId = null
  }
  
  if (textIntervalId) {
    clearInterval(textIntervalId)
    textIntervalId = null
  }
}

// Bloquear el scroll cuando el overlay está activo
const originalOverflow = ref<string | null>(null)
const scrollPosition = ref(0)
const isScrollLocked = ref(false)

const lockScroll = (): void => {
  if (typeof document === 'undefined' || isScrollLocked.value) return
  
  try {
    // Capturar la posición actual de scroll
    scrollPosition.value = window.pageYOffset || document.documentElement.scrollTop
    
    // Guardar el estilo original de overflow
    const computedStyle = window.getComputedStyle(document.body)
    originalOverflow.value = computedStyle.overflow
    
    // Marcar que el scroll está bloqueado
    isScrollLocked.value = true
    
    // Aplicar estilos para bloquear el scroll
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPosition.value}px`
    document.body.style.width = '100%'
    
    $logger.info('Scroll bloqueado. Posición original:', scrollPosition.value)
  } catch (error) {
    $logger.error('Error al bloquear el scroll:', error)
  }
}

// Restaurar el scroll cuando se oculta el overlay
const unlockScroll = (): void => {
  if (typeof document === 'undefined' || !isScrollLocked.value) return
  
  try {
    // Restaurar los estilos originales
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('position')
    document.body.style.removeProperty('top')
    document.body.style.removeProperty('width')
    
    // Si había un valor de overflow guardado, restaurarlo explícitamente
    if (originalOverflow.value !== null) {
      document.body.style.overflow = originalOverflow.value
    }
    
    // Restaurar la posición de scroll
    window.scrollTo(0, scrollPosition.value)
    
    // Marcar que el scroll está desbloqueado
    isScrollLocked.value = false
    
    $logger.info('Scroll restaurado. Posición restaurada:', scrollPosition.value)
  } catch (error) {
    $logger.error('Error al restaurar el scroll:', error)
  }
}

// Funciones para trampear el foco dentro del overlay
const { activate: trapFocus, deactivate: releaseFocus }: { activate: () => void; deactivate: () => void } = useFocusTrap(overlayRef)

// Observamos los cambios en isLoading del store
watch(() => loadingStore.isLoading, (newValue: boolean) => {
  if (newValue) {
    // El overlay se está mostrando
    $logger.info('Activando overlay de carga desde el componente')
    lockScroll()
    nextTick(() => {
      trapFocus()
      startDotsAnimation()
      startTextRotation()
    })
  } else {
    // El overlay se está ocultando
    $logger.info('Desactivando overlay de carga desde el componente')
    unlockScroll()
    releaseFocus()
    stopAnimations()
  }
}, { immediate: true })

// Observamos cambios en las props relacionadas con animaciones
watch(() => [props.showDots, props.dotsInterval], () => {
  stopAnimations()
  if (loadingStore.isLoading) {
    startDotsAnimation()
  }
})

watch(() => [hasMultipleTexts.value, props.textInterval], () => {
  stopAnimations()
  if (loadingStore.isLoading) {
    startTextRotation()
  }
})

// Limpieza al desmontar el componente
onBeforeUnmount(() => {
  stopAnimations()
  unlockScroll()
  releaseFocus()
})

// Iniciar las animaciones si el overlay está visible al montar el componente
onMounted(() => {
  if (loadingStore.isLoading) {
    lockScroll()
    nextTick(() => {
      trapFocus()
      startDotsAnimation()
      startTextRotation()
    })
  }
})
</script>

<template>
  <Transition name="vk-overlay-fade">
    <div
      v-if="loadingStore.isLoading"
      ref="overlayRef"
      :class="overlayClasses"
      :style="overlayStyles"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-overlay-title"
    >
      <div 
        ref="focusRef"
        class="vk-loading-overlay__content"
        tabindex="0"
      >
        <!-- Componente de carga -->
        <VKLoading
          v-if="loadingStore.showLogo"
          shine-color="white"
          width="60"
          height="70"
          animation-type="sweep"
          :shine-width="30"
          class="mb-4"
        />
        <VKSpinner
          v-else
          size="lg"
          :color="loadingStore.loadingColor"
          class="mb-4"
        />

        <!-- Texto de carga -->
        <div 
          v-if="displayText"
          id="loading-overlay-title"
          :class="textClasses"
        >
          {{ displayText }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.vk-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.vk-loading-overlay--blur {
  backdrop-filter: blur(5px);
}

.vk-loading-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 0.5rem;
  outline: none;
}

.vk-loading-overlay__text {
  margin-top: 1rem;
  font-size: 1.125rem;
  text-align: center;
  max-width: 80%;
}

/* Transiciones */
.vk-overlay-fade-enter-active,
.vk-overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.vk-overlay-fade-enter-from,
.vk-overlay-fade-leave-to {
  opacity: 0;
}
</style>
