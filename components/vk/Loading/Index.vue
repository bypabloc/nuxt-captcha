<script setup lang="ts">
/**
 * @component VKLoading
 * @description Componente de logo animado con efecto "shine" (brillo) para indicadores de carga.
 * Implementa un efecto de brillo que se mueve diagonalmente a través del logo.
 *
 * @props {string} fillColor - Color de relleno base del SVG
 * @props {string} shineColor - Color del efecto de brillo
 * @props {string|number} width - Ancho del SVG
 * @props {string|number} height - Alto del SVG
 * @props {number} duration - Duración de la animación en segundos
 * @props {string} animationType - Tipo de animación ('sweep', 'pulse', 'fade')
 * @props {number} shineWidth - Grosor del efecto shine en porcentaje (1-100)
 *
 * @example
 * <VKLoading
 *   fill-color="#77D272"
 *   shine-color="white"
 *   width="60"
 *   height="70"
 *   animation-type="sweep"
 *   :shine-width="30"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/05/06
 */

defineOptions({
  name: 'ComponentsVKLoading',
})

type VKLoadingAnimationType = 'sweep' | 'pulse' | 'fade'

const props = withDefaults(
  defineProps<{
    fillColor?: string
    shineColor?: string
    width?: string | number
    height?: string | number
    duration?: number
    animationType?: VKLoadingAnimationType
    shineWidth?: number
  }>(),
  {
    fillColor: '#77D272',
    shineColor: 'white',
    width: 45,
    height: 53,
    duration: 1,
    animationType: 'sweep',
    shineWidth: 90,
  },
)

// Convertir propiedades de tamaño a valores con unidades si son números
const svgWidth = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

const svgHeight = computed(() => {
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

// Calcular los ID únicos para el gradiente y clip-path
const uniqueId = ref(`vk-loader-${Math.random().toString(36).substring(2, 11)}`)
const gradientId = computed(() => `gradient-${uniqueId.value}`)
const clipPathId = computed(() => `clip-${uniqueId.value}`)

// Referencias a los elementos SVG stop para manipulación directa
const stop1Ref = ref<SVGStopElement | null>(null)
const stop2Ref = ref<SVGStopElement | null>(null)
const stop3Ref = ref<SVGStopElement | null>(null)

// Estado para la animación
const isAnimating = ref(false)
let animationFrame: number | null = null
const startTime = ref(Date.now())

// Calcular posiciones de los puntos de parada basados en el ancho del shine
const shineHalfWidth = computed(() => props.shineWidth / 2)

// Función de animación para el efecto shine
const animateShine = (): void => {
  if (!isAnimating.value) return

  const now = Date.now()
  const elapsed = now - startTime.value
  const durationMs = props.duration * 1000
  
  // Calcular la posición del brillo (0-1)
  const progress = (elapsed % durationMs) / durationMs
  
  // Establecer las posiciones de los puntos de parada para crear el efecto shine
  // La posición varía de -30% a 130% para asegurar que el brillo entra y sale completamente
  if (stop1Ref.value && stop2Ref.value && stop3Ref.value) {
    // Usamos shineHalfWidth para establecer el grosor del efecto
    const midPos = -20 + progress * 150 // Posición central del brillo
    const pos1 = midPos - shineHalfWidth.value // Inicio del brillo
    const pos2 = midPos // Centro del brillo (máxima intensidad)
    const pos3 = midPos + shineHalfWidth.value // Final del brillo
    
    stop1Ref.value.setAttribute('offset', `${pos1}%`)
    stop2Ref.value.setAttribute('offset', `${pos2}%`)
    stop3Ref.value.setAttribute('offset', `${pos3}%`)
  }
  
  // Continuar la animación
  animationFrame = requestAnimationFrame(animateShine)
}

// Iniciar la animación
const startAnimation = (): void => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  startTime.value = Date.now()
  animateShine()
}

// Detener la animación
const stopAnimation = (): void => {
  isAnimating.value = false
  
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

// Configurar o detener la animación cuando cambia el tipo
watch(
  () => props.animationType,
  (newType: VKLoadingAnimationType) => {
    if (newType === 'sweep') {
      startAnimation()
    } else {
      stopAnimation()
    }
  },
  { immediate: true }
)

// Reiniciar la animación cuando cambie la duración o el ancho del brillo
watch(
  [(): number => props.duration, (): number => props.shineWidth],
  () => {
    if (props.animationType === 'sweep') {
      stopAnimation()
      startAnimation()
    }
  }
)

// Aplicar diferentes clases según el tipo de animación
const animationClass = computed(() => {
  return `vk-loader-animation--${props.animationType}`
})

// Propiedades de animación CSS para pulse y fade
const animationStyle = computed(() => {
  return {
    '--animation-duration': `${props.duration}s`,
    '--fill-color': props.fillColor,
    '--shine-color': props.shineColor,
  }
})

// Limpiar la animación al desmontar el componente
onBeforeUnmount(() => {
  stopAnimation()
})

// Iniciar la animación cuando se monta el componente
onMounted(() => {
  if (props.animationType === 'sweep') {
    startAnimation()
  }
})
</script>

<template>
  <div
    class="vk-loader-logo"
    :class="animationClass"
    :style="[
      { width: svgWidth, height: svgHeight },
      animationStyle as any
    ]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="svgWidth"
      :height="svgHeight"
      viewBox="0 0 45 53"
      fill="none"
    >
      <defs>
        <!-- Gradiente para la animación sweep (efecto shine) controlado por JS -->
        <linearGradient
          v-if="animationType === 'sweep'"
          :id="gradientId"
          x1="100%"
          y1="100%"
          x2="0%"
          y2="0%"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0%"
            :stop-color="fillColor"
            stop-opacity="1"
          />
          <stop
            ref="stop1Ref"
            offset="-20%"
            :stop-color="fillColor"
            stop-opacity="1"
          />
          <stop
            ref="stop2Ref"
            offset="-5%"
            :stop-color="shineColor"
            stop-opacity="0.8"
          />
          <stop
            ref="stop3Ref"
            offset="10%"
            :stop-color="fillColor"
            stop-opacity="1"
          />
          <stop
            offset="100%"
            :stop-color="fillColor"
            stop-opacity="1"
          />
        </linearGradient>
        
        <!-- Gradiente para la animación pulse (pulso) -->
        <linearGradient
          v-else-if="animationType === 'pulse'"
          :id="gradientId"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            :stop-color="fillColor"
            stop-opacity="1"
            class="pulse-stop-1"
          />
          <stop
            offset="100%"
            :stop-color="shineColor"
            stop-opacity="1"
            class="pulse-stop-2"
          />
        </linearGradient>
        
        <!-- Gradiente para la animación fade (desvanecimiento) -->
        <linearGradient
          v-else
          :id="gradientId"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            :stop-color="fillColor"
            stop-opacity="0.6"
            class="fade-stop-1"
          />
          <stop
            offset="100%"
            :stop-color="fillColor"
            stop-opacity="1"
            class="fade-stop-2"
          />
        </linearGradient>
        
        <clipPath :id="clipPathId">
          <rect
            width="44.1324"
            height="52.053"
            fill="white"
            transform="translate(0.528442 0.689453)"
          />
        </clipPath>
      </defs>
      
      <g :clip-path="`url(#${clipPathId})`">
        <path
          d="M41.5283 0.689453C43.2566 0.689684 44.6592 2.09275 44.6592 3.81934V30.6758C44.659 42.8547 34.7709 52.7402 22.5938 52.7402C10.4148 52.7418 0.527344 42.8557 0.527344 30.6768V3.81934C0.527344 2.09275 1.92971 0.689679 3.65625 0.689453H41.5283ZM11.4639 28.5312C11.2516 28.5312 11.0837 28.7086 11.0908 28.9209C11.2963 35.0899 16.3789 40.043 22.5957 40.043H22.5986C28.8154 40.043 33.8991 35.0881 34.1045 28.9209C34.1116 28.7086 33.9428 28.5312 33.7305 28.5312H31.9014C31.7015 28.5313 31.5373 28.6888 31.5303 28.8887C31.341 33.653 27.4079 37.4705 22.5977 37.4707C17.7872 37.4707 13.8526 33.6531 13.665 28.8887C13.658 28.6888 13.4929 28.5312 13.293 28.5312H11.4639ZM11.5479 9.42773C11.272 9.42784 11.0402 9.63151 11.04 9.92676V14.9883H5.97949C5.68404 14.9883 5.48047 15.2183 5.48047 15.4961V17.1416C5.48063 17.4174 5.68416 17.6494 5.97949 17.6494H11.04V22.709C11.04 23.0044 11.2702 23.2079 11.5479 23.208H13.1934C13.4694 23.208 13.7012 23.0044 13.7012 22.709V17.6494H18.7617C19.0569 17.6493 19.2606 17.4192 19.2607 17.1416V15.4961C19.2607 15.2202 19.0571 14.9884 18.7617 14.9883H13.7012V9.92676C13.701 9.63144 13.471 9.42773 13.1934 9.42773H11.5479ZM26.4297 14.9883C26.1344 14.9883 25.9309 15.2176 25.9307 15.4951V17.1406C25.9307 17.4166 26.1342 17.6484 26.4297 17.6484H39.2119C39.5073 17.6484 39.7109 17.4184 39.7109 17.1406V15.4951C39.7107 15.2194 39.5071 14.9883 39.2119 14.9883H26.4297Z"
          :fill="`url(#${gradientId})`"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.vk-loader-logo {
  position: relative;
  display: inline-block;
}

/* Las animaciones Pulse y Fade siguen usando CSS */

/* Animación tipo pulso (pulse) */
.vk-loader-animation--pulse .pulse-stop-1,
.vk-loader-animation--pulse .pulse-stop-2 {
  animation: pulseColor var(--animation-duration) infinite alternate ease-in-out;
}

@keyframes pulseColor {
  0% {
    stop-color: var(--fill-color);
  }
  100% {
    stop-color: var(--shine-color);
  }
}

/* Animación tipo desvanecimiento (fade) */
.vk-loader-animation--fade .fade-stop-1,
.vk-loader-animation--fade .fade-stop-2 {
  animation: fadeOpacity var(--animation-duration) infinite alternate ease-in-out;
}

@keyframes fadeOpacity {
  0% {
    stop-opacity: 0.6;
  }
  100% {
    stop-opacity: 1;
  }
}
</style>