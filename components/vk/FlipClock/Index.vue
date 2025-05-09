<script setup lang="ts">
/**
 * @component VKFlipClock
 * @description Componente de reloj con efecto de volteo para mostrar una cuenta regresiva hacia una fecha objetivo.
 * Implementa el efecto de tarjetas que giran al cambiar cada dígito.
 *
 * @props {Date|string} targetDate - Fecha objetivo para la cuenta regresiva
 * @props {string} bgColor - Color de fondo de las tarjetas
 * @props {string} textColor - Color del texto de los dígitos
 * @props {string} labelColor - Color de las etiquetas (DÍAS, HORAS, etc.)
 * @props {string} separatorColor - Color de los separadores (:)
 * @props {string} shadowColor - Color de la sombra de las tarjetas
 * @props {string} size - Tamaño del reloj (sm, md, lg)
 * @props {boolean} showLabels - Indica si se muestran las etiquetas (DÍAS, HORAS, etc.)
 * @props {boolean} showSeparators - Indica si se muestran los separadores entre unidades
 * @props {boolean} showDays - Indica si se muestran los días
 * @props {boolean} showHours - Indica si se muestran las horas
 * @props {boolean} showMinutes - Indica si se muestran los minutos
 * @props {boolean} showSeconds - Indica si se muestran los segundos
 *
 * @emits complete - Emitido cuando la cuenta regresiva llega a cero
 *
 * @author Pablo Contreras
 * @since 2025/05/01
 */

// Props del componente
const props = withDefaults(
  defineProps<{
    targetDate: Date | string
    bgColor?: string
    textColor?: string
    labelColor?: string
    separatorColor?: string
    shadowColor?: string
    size?: 'sm' | 'md' | 'lg'
    showLabels?: boolean
    showSeparators?: boolean
    showDays?: boolean
    showHours?: boolean
    showMinutes?: boolean
    showSeconds?: boolean
  }>(),
  {
    bgColor: '#333',
    textColor: '#ccc',
    labelColor: '#999',
    separatorColor: '#ccc',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    size: 'md',
    showLabels: true,
    showSeparators: true,
    showDays: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
  },
)

const emit = defineEmits<{
  (e: 'complete'): void
}>()

// Estado interno
const isCompleted = ref(false)

// Interface para las unidades de tiempo
interface TimeUnit {
  id: number
  label: string
  visible: boolean
  max: number
  current: number
  degree: number
}

// Estado para las unidades de tiempo
const timeUnits = ref<TimeUnit[]>([
  {
    id: 0,
    label: 'DÍAS',
    visible: props.showDays,
    max: 99,
    current: 0,
    degree: 0,
  },
  {
    id: 1,
    label: 'HORAS',
    visible: props.showHours,
    max: 23,
    current: 0,
    degree: 0,
  },
  {
    id: 2,
    label: 'MINUTOS',
    visible: props.showMinutes,
    max: 59,
    current: 0,
    degree: 0,
  },
  {
    id: 3,
    label: 'SEGUNDOS',
    visible: props.showSeconds,
    max: 59,
    current: 0,
    degree: 0,
  },
])

// Variable para guardar el intervalo de tiempo
let timer: number | null = null

// Unidades de tiempo filtradas por visibilidad
const visibleTimeUnits = computed(() => {
  return timeUnits.value.filter((unit: TimeUnit) => unit.visible)
})

// Calcular las unidades de tiempo con formato para mostrar
const computedTimeUnits = computed(() => {
  return visibleTimeUnits.value.map((unit: TimeUnit) => {
    const currentValue = unit.current
    const nextValue = currentValue + 1 > unit.max ? 0 : currentValue + 1

    const currentFormatted =
      currentValue < 10 ? `0${currentValue}` : `${currentValue}`
    const nextFormatted = nextValue < 10 ? `0${nextValue}` : `${nextValue}`

    const tensDigitChanges =
      Math.floor(currentValue / 10) !== Math.floor(nextValue / 10)

    return {
      ...unit,
      currentFormat: currentFormatted,
      nextFormat: nextFormatted,
      ifTens: tensDigitChanges,
    }
  })
})

// Calcular la fecha objetivo como Date
const targetDateTime = computed(() => {
  if (props.targetDate instanceof Date) {
    return props.targetDate
  }
  return new Date(props.targetDate)
})

// Función para calcular la diferencia de tiempo
const calculateTimeRemaining = (): {
  days: number
  hours: number
  minutes: number
  seconds: number
} => {
  const now = new Date()
  const difference = targetDateTime.value.getTime() - now.getTime()

  // Si la fecha objetivo ya pasó, devuelve ceros
  if (difference <= 0) {
    if (!isCompleted.value) {
      isCompleted.value = true
      emit('complete')
    }

    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  // Calcular días, horas, minutos y segundos
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  )
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}

// Función para actualizar las unidades de tiempo
const updateTimeUnits = (): void => {
  const time = calculateTimeRemaining()

  // Actualizar solo las unidades visibles
  if (props.showDays && time.days !== timeUnits.value[0].current) {
    flip(time.days, 0)
  }
  if (props.showHours && time.hours !== timeUnits.value[1].current) {
    flip(time.hours, 1)
  }
  if (props.showMinutes && time.minutes !== timeUnits.value[2].current) {
    flip(time.minutes, 2)
  }
  if (props.showSeconds && time.seconds !== timeUnits.value[3].current) {
    flip(time.seconds, 3)
  }
}

// Función para animar el flip
const flip = (newVal: number, index: number): void => {
  const timeUnit = timeUnits.value.find((unit: TimeUnit) => unit.id === index)

  if (!timeUnit) return

  if (timeUnit.degree < 180) {
    timeUnit.degree += 6 // Velocidad de la animación
    requestAnimationFrame(() => {
      flip(newVal, index)
    })
  } else {
    timeUnit.degree = 0
    timeUnit.current = newVal
  }
}

// Iniciar el contador cuando se monta el componente
onMounted(() => {
  // Establecer valores iniciales
  const initialTime = calculateTimeRemaining()

  if (timeUnits.value[0]) timeUnits.value[0].current = initialTime.days
  if (timeUnits.value[1]) timeUnits.value[1].current = initialTime.hours
  if (timeUnits.value[2]) timeUnits.value[2].current = initialTime.minutes
  if (timeUnits.value[3]) timeUnits.value[3].current = initialTime.seconds

  // Iniciar intervalo para actualizar cada segundo
  timer = window.setInterval(() => {
    updateTimeUnits()
  }, 1000)
})

// Limpiar el intervalo cuando se desmonta el componente
onBeforeUnmount(() => {
  if (timer !== null) {
    clearInterval(timer)
  }
})

// Tamaños según la prop size
const sizes = computed(() => {
  const sizeMap = {
    sm: {
      containerWidth: '40px',
      containerHeight: '60px',
      fontSize: '50px',
      lineHeight: '60px',
      labelFontSize: '10px',
      separatorFontSize: '30px',
    },
    md: {
      containerWidth: '60px',
      containerHeight: '90px',
      fontSize: '70px',
      lineHeight: '90px',
      labelFontSize: '12px',
      separatorFontSize: '40px',
    },
    lg: {
      containerWidth: '80px',
      containerHeight: '120px',
      fontSize: '90px',
      lineHeight: '120px',
      labelFontSize: '14px',
      separatorFontSize: '50px',
    },
  }

  return sizeMap[props.size]
})

// Estilos computados basados en las props
const cardStyle = computed(() => ({
  background: props.bgColor,
}))

const textStyle = computed(() => ({
  color: props.textColor,
}))

const labelStyle = computed(() => ({
  color: props.labelColor,
  fontSize: sizes.value.labelFontSize,
}))

const separatorStyle = computed(() => ({
  color: props.separatorColor,
  fontSize: sizes.value.separatorFontSize,
}))

const containerStyle = computed(() => ({
  width: sizes.value.containerWidth,
  height: sizes.value.containerHeight,
  boxShadow: `0 2px 5px ${props.shadowColor}`,
}))

const contentStyle = computed(() => ({
  fontSize: sizes.value.fontSize,
  lineHeight: sizes.value.lineHeight,
}))
</script>

<template>
  <div class="vk-flip-clock">
    <div
      v-for="(unit, unitIndex) in computedTimeUnits"
      :key="unit.id"
      class="vk-flip-clock-unit"
    >
      <div class="vk-flip-clock-digits">
        <!-- Primer dígito (decenas) -->
        <div
          class="vk-flip-clock-card-container"
          :style="containerStyle"
        >
          <div
            class="vk-flip-clock-card vk-flip-card-up"
            :style="cardStyle"
          >
            <div class="vk-flip-card-inner">
              <div
                class="vk-flip-card-content"
                :style="[textStyle, contentStyle]"
              >
                {{ unit.nextFormat.charAt(0) }}
              </div>
            </div>
          </div>
          <div
            class="vk-flip-clock-card vk-flip-card-down"
            :style="cardStyle"
          >
            <div class="vk-flip-card-inner">
              <div
                class="vk-flip-card-content"
                :style="[textStyle, contentStyle]"
              >
                {{ unit.currentFormat.charAt(0) }}
              </div>
            </div>
          </div>
          <div
            class="vk-flip-clock-card vk-flip-card-flip"
            :style="{
              ...cardStyle,
              transform: unit.ifTens
                ? `rotateX(-${unit.degree}deg)`
                : 'rotateX(0deg)',
            }"
          >
            <div class="vk-flip-card-inner vk-flip-card-front">
              <div
                class="vk-flip-card-content"
                :style="[textStyle, contentStyle]"
              >
                {{ unit.currentFormat.charAt(0) }}
              </div>
            </div>
            <div class="vk-flip-card-inner vk-flip-card-back">
              <div
                class="vk-flip-card-content"
                :style="[textStyle, contentStyle]"
              >
                {{ unit.nextFormat.charAt(0) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Segundo dígito (unidades) -->
        <div
          class="vk-flip-clock-card-container"
          :style="containerStyle"
        >
          <div
            class="vk-flip-clock-card vk-flip-card-up"
            :style="cardStyle"
          >
            <div class="vk-flip-card-inner">
              <div
                class="vk-flip-card-content"
                :style="[textStyle, contentStyle]"
              >
                {{ unit.nextFormat.charAt(1) }}
              </div>
            </div>
          </div>
          <div
            class="vk-flip-clock-card vk-flip-card-down"
            :style="cardStyle"
          >
            <div class="vk-flip-card-inner">
              <div
                class="vk-flip-card-content"
                :style="[textStyle, contentStyle]"
              >
                {{ unit.currentFormat.charAt(1) }}
              </div>
            </div>
          </div>
          <div
            class="vk-flip-clock-card vk-flip-card-flip"
            :style="{
              ...cardStyle,
              transform: `rotateX(-${unit.degree}deg)`,
            }"
          >
            <div class="vk-flip-card-inner vk-flip-card-front">
              <div
                class="vk-flip-card-content"
                :style="[textStyle, contentStyle]"
              >
                {{ unit.currentFormat.charAt(1) }}
              </div>
            </div>
            <div class="vk-flip-card-inner vk-flip-card-back">
              <div
                class="vk-flip-card-content"
                :style="[textStyle, contentStyle]"
              >
                {{ unit.nextFormat.charAt(1) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Etiqueta -->
      <div
        v-if="showLabels"
        class="vk-flip-clock-label"
        :style="labelStyle"
      >
        {{ unit.label }}
      </div>

      <!-- Separador (colocado en posición absoluta) -->
      <div
        v-if="showSeparators && unitIndex < computedTimeUnits.length - 1"
        class="vk-flip-clock-separator"
        :style="separatorStyle"
      >
        :
      </div>
    </div>
  </div>
</template>

<style scoped>
.vk-flip-clock {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}

.vk-flip-clock-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  position: relative;
}

.vk-flip-clock-digits {
  display: flex;
  flex-direction: row;
  gap: 2px;
}

.vk-flip-clock-card-container {
  position: relative;
  perspective: 200px;
  border-radius: 6px;
  overflow: hidden;
}

.vk-flip-clock-card-container::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.7);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  top: calc(50% - 1px);
  z-index: 1;
}

.vk-flip-clock-card {
  border-radius: 6px;
  position: absolute;
  text-align: center;
  width: 100%;
  height: 50%;
  transform-style: preserve-3d;
  transform-origin: center bottom;
}

.vk-flip-card-inner {
  border-radius: 6px 6px 0 0;
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  backface-visibility: hidden;
  overflow: hidden;
}

.vk-flip-card-content {
  font-weight: bold;
  text-shadow: 1px 2px 2px rgba(0, 0, 0, 0.3);
}

.vk-flip-card-up {
  top: 0;
}

.vk-flip-card-down {
  top: 50%;
}

.vk-flip-card-down .vk-flip-card-inner {
  border-radius: 0 0 6px 6px;
}

.vk-flip-card-down .vk-flip-card-content {
  transform: translateY(-50%);
}

.vk-flip-card-flip {
  top: 0;
  height: 50%;
  transform-origin: 0% 100%;
  /* Quitamos la transición CSS para usar solo la animación JavaScript */
}

.vk-flip-card-back {
  transform: rotateX(180deg);
}

.vk-flip-card-back .vk-flip-card-content {
  transform: rotateX(180deg);
}

.vk-flip-clock-label {
  font-weight: bold;
  margin-top: 8px;
  text-align: center;
}

.vk-flip-clock-separator {
  font-weight: bold;
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-60%);
  text-shadow: 1px 2px 2px rgba(0, 0, 0, 0.3);
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .vk-flip-clock {
    gap: 5px;
  }

  .vk-flip-clock-unit {
    margin: 0 5px;
  }

  .vk-flip-clock-separator {
    right: -10px;
  }
}

@media (max-width: 480px) {
  .vk-flip-clock-unit {
    margin: 0 3px;
  }

  .vk-flip-clock-separator {
    right: -8px;
    font-size: 20px !important;
  }
}
</style>
