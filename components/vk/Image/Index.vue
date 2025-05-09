<script setup lang="ts">
/**
 * @component VKImage
 * @description Componente optimizado para la manipulación y visualización de imágenes con soporte
 * para múltiples propiedades CSS, efectos visuales y estrategias de carga.
 *
 * @props {string} src - Ruta absoluta de la imagen (si es proporcionada, se ignora 'path')
 * @props {string} path - Ruta de la imagen relativa a /public/images/
 * @props {string} alt - Texto alternativo para la imagen
 * @props {string} width - Ancho de la imagen (con unidades: px, rem, %, etc.)
 * @props {string} height - Alto de la imagen (con unidades: px, rem, %, etc.)
 * @props {string} maxWidth - Ancho máximo de la imagen
 * @props {string} maxHeight - Alto máximo de la imagen
 * @props {string} minWidth - Ancho mínimo de la imagen
 * @props {string} minHeight - Alto mínimo de la imagen
 * @props {string} aspectRatio - Relación de aspecto (ejemplo: '16/9', '4/3', '1/1')
 * @props {string} objectFit - Modo de ajuste (fill, contain, cover, none, scale-down)
 * @props {string} objectPosition - Posición del contenido de la imagen
 * @props {string} borderRadius - Radio de borde de la imagen
 * @props {boolean} rounded - Si es true, aplica borderRadius='50%' para imagen circular
 * @props {string} fallbackText - Texto a mostrar cuando la imagen no se puede cargar
 * @props {boolean} lazy - Si la carga de la imagen debe ser lazy
 * @props {string} quality - Calidad de la imagen (low, medium, high, auto)
 * @props {string} filter - Filtros CSS para la imagen (blur, brightness, etc.)
 * @props {boolean} grayscale - Si la imagen debe mostrarse en escala de grises
 * @props {string} brightness - Brillo de la imagen (0-200%)
 * @props {string} boxShadow - Sombra CSS para la imagen
 * @props {string} opacity - Opacidad de la imagen (0-1)
 * @props {boolean} zoom - Habilita efecto de zoom al hacer hover
 * @props {number} zoomScale - Escala de zoom al hacer hover (1.1, 1.2, etc.)
 * @props {boolean} overlay - Si debe mostrarse una capa encima de la imagen
 * @props {string} overlayColor - Color de la capa
 * @props {string} overlayOpacity - Opacidad de la capa (0-1)
 * @props {string} transition - Transición CSS personalizada
 * @props {string} className - Clases CSS adicionales
 *
 * @slots default - Contenido adicional sobre la imagen
 * @slots fallback - Contenido personalizado para mostrar cuando la imagen no carga
 * @slots overlay - Contenido personalizado para la capa de superposición
 *
 * @emits error - Emitido cuando ocurre un error al cargar la imagen
 * @emits load - Emitido cuando la imagen carga correctamente
 * @emits zoom - Emitido cuando se activa el efecto de zoom (hover)
 * @emits click - Emitido cuando se hace clic en la imagen
 *
 * @example
 * <VKImage
 *   path="banner.jpg"
 *   alt="Banner promocional"
 *   width="100%"
 *   max-height="500px"
 *   aspect-ratio="16/9"
 *   object-fit="cover"
 *   @click="handleImageClick"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/21
 */
defineOptions({
  name: 'ComponentsVKImage',
})

const props = withDefaults(
  defineProps<{
    path?: string
    src?: string
    alt?: string
    width?: string
    height?: string
    maxWidth?: string
    maxHeight?: string
    minWidth?: string
    minHeight?: string
    aspectRatio?: string
    objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
    objectPosition?: string
    borderRadius?: string
    rounded?: boolean
    fallbackText?: string
    lazy?: boolean
    quality?: 'low' | 'medium' | 'high' | 'auto'
    filter?: string
    grayscale?: boolean
    brightness?: string
    boxShadow?: string
    opacity?: string
    zoom?: boolean
    zoomScale?: number
    overlay?: boolean
    overlayColor?: string
    overlayOpacity?: string
    transition?: string
    className?: string
  }>(),
  {
    path: '',
    src: '',
    alt: '',
    width: '',
    height: '',
    maxWidth: '',
    maxHeight: '',
    minWidth: '',
    minHeight: '',
    aspectRatio: '',
    objectFit: 'cover',
    objectPosition: 'center',
    borderRadius: '',
    rounded: false,
    fallbackText: '',
    lazy: true,
    quality: 'auto',
    filter: '',
    grayscale: false,
    brightness: '',
    boxShadow: '',
    opacity: '',
    zoom: false,
    zoomScale: 1.1,
    overlay: false,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    overlayOpacity: '0.5',
    transition: 'all 0.3s ease',
    className: '',
  },
)

const emit = defineEmits<{
  error: [event: Event]
  load: [event: Event]
  zoom: [isZoomed: boolean]
  click: [event: MouseEvent]
}>()

// Usar shallowRef para estados que no necesitan reactividad profunda
const isLoaded = shallowRef(false)
const hasError = shallowRef(false)
const isHovered = shallowRef(false)

// Memorizar el cálculo de la ruta completa para evitar recálculos innecesarios
const fullImagePath = computed((): string => {
  if (props.src) {
    return props.src
  }

  if (!props.path) {
    return ''
  }

  if (props.path.startsWith('/images/')) {
    return props.path
  }

  if (props.path.startsWith('/')) {
    return `/images${props.path}`
  }

  return `/images/${props.path}`
})

// Clases de contenedor calculadas una vez
const containerClasses = computed(() => [
  'vk-imagen-container',
  props.className,
  {
    'vk-imagen-container--zoom': props.zoom,
    'vk-imagen-container--overlay': props.overlay,
    'vk-imagen-container--has-error': hasError.value,
    'vk-imagen-container--loaded': isLoaded.value,
    'vk-imagen-container--loading': !isLoaded.value,
    'vk-imagen-container--hovered': isHovered.value,
  },
])

// Clases de imagen calculadas una vez
const imageClasses = computed(() => [
  'vk-imagen',
  {
    'vk-imagen--rounded': props.rounded,
    'vk-imagen--grayscale': props.grayscale,
    'vk-imagen--error': hasError.value,
    'vk-imagen--loaded': isLoaded.value,
    'vk-imagen--loading': !isLoaded.value,
  },
])

// Memoizar los estilos del contenedor para evitar recálculos
const containerStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.width) styles.width = props.width
  if (props.height) styles.height = props.height
  if (props.maxWidth) styles.maxWidth = props.maxWidth
  if (props.maxHeight) styles.maxHeight = props.maxHeight
  if (props.minWidth) styles.minWidth = props.minWidth
  if (props.minHeight) styles.minHeight = props.minHeight
  if (props.aspectRatio) styles.aspectRatio = props.aspectRatio
  if (props.boxShadow) styles.boxShadow = props.boxShadow

  if (props.rounded) {
    styles.borderRadius = '50%'
  } else if (props.borderRadius) {
    styles.borderRadius = props.borderRadius
  }

  return styles
})

// Memoizar los estilos de la imagen para evitar recálculos
const imageStyles = computed(() => {
  const styles: Record<string, string> = {
    objectFit: props.objectFit,
    objectPosition: props.objectPosition,
    transition: props.transition,
  }

  let filterValue = ''

  if (props.grayscale) {
    filterValue += 'grayscale(1) '
  }

  if (props.brightness) {
    filterValue += `brightness(${props.brightness}) `
  }

  if (props.filter) {
    filterValue += props.filter
  }

  if (filterValue) {
    styles.filter = filterValue.trim()
  }

  if (props.opacity) {
    styles.opacity = props.opacity
  }

  if (props.zoom && isHovered.value) {
    styles.transform = `scale(${props.zoomScale})`
  }

  return styles
})

// Mejorar la accesibilidad: asegurarse de que la imagen sea correctamente anunciada
const ariaDescription = computed(() => {
  if (!props.alt) return undefined
  return props.alt
})

const handleError = (event: Event): void => {
  hasError.value = true
  emit('error', event)
}

const handleLoad = (event: Event): void => {
  isLoaded.value = true
  emit('load', event)
}

const handleMouseEnter = (): void => {
  isHovered.value = true
  if (props.zoom) {
    emit('zoom', true)
  }
}

const handleMouseLeave = (): void => {
  isHovered.value = false
  if (props.zoom) {
    emit('zoom', false)
  }
}

const handleClick = (event: MouseEvent): void => {
  emit('click', event)
}
</script>

<template>
  <div
    :class="containerClasses"
    :style="containerStyles"
    role="img"
    :aria-label="ariaDescription"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <!-- Loader mientras se carga la imagen -->
    <VKImageLoader v-if="!isLoaded && !hasError" />

    <!-- Imagen principal -->
    <img
      v-if="!hasError"
      :src="fullImagePath"
      :alt="alt"
      :style="imageStyles"
      :class="imageClasses"
      :loading="lazy ? 'lazy' : 'eager'"
      @error="handleError"
      @load="handleLoad"
    >

    <!-- Overlay encima de la imagen -->
    <VKImageOverlay
      v-if="overlay && !hasError"
      :color="overlayColor"
      :opacity="isHovered ? overlayOpacity : '0'"
    >
      <slot name="overlay" />
    </VKImageOverlay>

    <!-- Contenido adicional sobre la imagen -->
    <slot v-if="!hasError" />

    <!-- Fallback para errores de carga -->
    <VKImageFallback
      v-if="hasError"
      :text="fallbackText || alt || 'Imagen no disponible'"
    >
      <slot name="fallback" />
    </VKImageFallback>
  </div>
</template>

<style scoped>
.vk-imagen-container {
  display: inline-block;
  position: relative;
  overflow: hidden;
  vertical-align: middle;
}

.vk-imagen {
  display: block;
  width: 100%;
  height: 100%;
  object-position: center;
  transition-property: transform, filter, opacity;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}

.vk-imagen--rounded {
  border-radius: 50%;
}

.vk-imagen--grayscale {
  filter: grayscale(1);
}

.vk-imagen--loading {
  opacity: 0;
}

.vk-imagen--loaded {
  opacity: 1;
}

.vk-imagen-container--zoom {
  cursor: pointer;
}
</style>
