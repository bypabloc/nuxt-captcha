<script setup lang="ts">
/**
 * @component VKTimeline
 * @description Componente que muestra un timeline responsivo con pasos numerados.
 * En modo desktop se muestra horizontal, en móvil se muestra vertical.
 * Permite personalizar colores, bordes, sombras y numeración.
 *
 * @props {ITimelineStep[]} steps - Pasos del timeline con título y descripción
 * @props {ColorName} accentColor - Color principal del timeline (línea y círculos)
 * @props {boolean} extendedLine - Si la línea debe extenderse más allá de los círculos
 * @props {number} circleDesktopSize - Tamaño de los círculos en desktop (px)
 * @props {number} circleMobileSize - Tamaño de los círculos en mobile (px)
 * @props {boolean} containerBorder - Si se debe aplicar borde al contenedor
 * @props {boolean} containerShadow - Si se debe aplicar sombra al contenedor (independiente del borde)
 * @props {ColorName} titleBgColor - Color de fondo para el título
 * @props {ColorName} titleTextColor - Color del texto del título
 * @props {ColorName} descriptionBgColor - Color de fondo para la descripción
 * @props {ColorName} descriptionTextColor - Color del texto de la descripción
 * @props {boolean} showNumbers - Si se deben mostrar números en los círculos
 * @props {boolean} lineShadow - Si se debe aplicar sombra a la línea del timeline
 * @props {string} linePosition - Posición de la línea en modo desktop (top o bottom)
 * @props {string} titlePosition - Posición del título respecto a la descripción (top, bottom, left, right)
 * @props {string} titlePadding - Padding para el título en formato "x-2 y-1" (se traduce a px-2 py-1)
 * @props {string} containerPadding - Padding para el contenedor en formato "x-2 y-1" (se traduce a px-2 py-1)
 * @props {string} circleAlignment - Alineación vertical de los círculos respecto al contenedor (start, center, end)
 *
 * @slots title - Slot opcional para personalizar el contenido del título
 *
 * @example
 * <VKTimeline
 *   :steps="steps"
 *   accent-color="medium-green"
 *   container-border
 *   container-shadow
 *   title-text-color="dark-green"
 *   line-shadow
 *   title-position="right"
 *   title-padding="x-2 y-1"
 *   container-padding="x-6 y-3"
 *   circle-alignment="center"
 * />
 *
 * @example
 * <VKTimeline :steps="steps">
 *   <template #title="{ step }">
 *     <div class="custom-title">{{ step.title }}</div>
 *   </template>
 * </VKTimeline>
 *
 * @author Pablo Contreras
 * @since 2025/05/05
 */
import type { ColorName } from '@/design-system/presets/colors.preset'
import {
    COLOR_NAMES,
    isValidColorName,
} from '@/design-system/presets/colors.preset'
import type {
    TypographyStyle,
    TypographyVariant,
} from '@/design-system/presets/typography.preset'
import {
    isValidStyle,
    isValidVariant,
} from '@/design-system/presets/typography.preset'

// Composables
const display = useDisplay()
const $logger = useNuxtApp().$logger

/**
 * Convierte un string de padding en formato "x-2 y-1" a clases Tailwind
 * @param {string} padding - String en formato "x-2 y-1"
 * @returns {string[]} - Array de clases Tailwind (px-2 py-1)
 */
function parsePadding(padding: string): string[] {
  if (!padding || padding === '0') return []

  const classes: string[] = []
  const parts = padding.split(' ')

  for (const part of parts) {
    // Validar formato x-2, y-3, etc.
    const match: RegExpMatchArray | null = part.match(/^([xy])-(\d+|px)$/)
    if (!match) {
      $logger.warn(
        `Formato de padding inválido: "${part}". Debe ser "x-<número>" o "y-<número>"`,
      )
      continue
    }

    const [, direction, value]: [string, string, string] = match as [
      string,
      string,
      string,
    ]
    if (direction === 'x') {
      classes.push(`px-${value}`)
    } else if (direction === 'y') {
      classes.push(`py-${value}`)
    }
  }

  return classes
}

// Props
const props = withDefaults(
  defineProps<{
    /**
     * Pasos del timeline con título y descripción
     */
    steps: ITimelineStep[]
    /**
     * Nombre del color según el sistema de diseño para la línea y círculos
     */
    accentColor?: ColorName
    /**
     * Indica si la línea debe extenderse más allá de los círculos en los extremos.
     * Por defecto es `false`, la línea no se extiende.
     */
    extendedLine?: boolean
    /**
     * Tamaño de los círculos en escritorio (en píxeles)
     */
    circleDesktopSize?: number
    /**
     * Tamaño de los círculos en móvil (en píxeles)
     */
    circleMobileSize?: number
    /**
     * Si se debe aplicar un borde al contenedor de cada paso
     */
    containerBorder?: boolean
    /**
     * Si se debe aplicar sombra al contenedor de cada paso
     * La sombra aplicada es: box-shadow: 0px 3.204px 3.204px 0px rgba(0, 0, 0, 0.12)
     */
    containerShadow?: boolean
    /**
     * Color de fondo para el contenedor del título
     */
    titleBgColor?: ColorName
    /**
     * Color de texto para el título
     */
    titleTextColor?: ColorName
    /**
     * Color de fondo para el contenedor de la descripción
     */
    descriptionBgColor?: ColorName
    /**
     * Color de texto para la descripción
     */
    descriptionTextColor?: ColorName
    /**
     * Si se deben mostrar números en los puntos del timeline
     * Por defecto es true
     */
    showNumbers?: boolean
    /**
     * Si se debe aplicar sombra a la línea del timeline
     * Por defecto es false
     */
    lineShadow?: boolean
    /**
     * Posición de la línea en modo desktop (top o bottom)
     * Por defecto es top
     */
    linePosition?: 'top' | 'bottom'
    /**
     * Posición del título respecto a la descripción
     * Por defecto es 'top' (arriba)
     */
    titlePosition?: 'top' | 'bottom' | 'left' | 'right'
    titleStyle?: TypographyStyle
    titleVariant?: TypographyVariant
    /**
     * Padding para el título en formato "x-2 y-1"
     * Se convierte en clases Tailwind px-2 py-1
     */
    titlePadding?: string
    /**
     * Padding para el contenedor en formato "x-6 y-3"
     * Se convierte en clases Tailwind px-6 py-3
     */
    containerPadding?: string
    /**
     * Alineación vertical de los círculos respecto al contenedor de contenido
     */
    circleAlignment?: 'start' | 'center' | 'end'
  }>(),
  {
    accentColor: COLOR_NAMES.MEDIUM_GREEN as ColorName,
    extendedLine: false,
    circleDesktopSize: 48,
    circleMobileSize: 40,
    containerBorder: false,
    containerShadow: false,
    titleBgColor: COLOR_NAMES.WHITE as ColorName,
    titleTextColor: COLOR_NAMES.DARK_GRAY as ColorName,
    descriptionBgColor: COLOR_NAMES.WHITE as ColorName,
    descriptionTextColor: COLOR_NAMES.DARK_GRAY as ColorName,
    showNumbers: true,
    lineShadow: false,
    linePosition: 'top',
    titlePosition: 'top',
    titleStyle: 'subtitle-4' as TypographyStyle,
    titleVariant: 'regular',
    titlePadding: '0',
    containerPadding: '0',
    circleAlignment: 'center',
  },
)

/**
 * Genera las clases CSS basadas en el color seleccionado para la línea y círculos
 */
const accentClasses = computed((): string[] => {
  if (!isValidColorName(props.accentColor)) {
    $logger.warn(
      `Color "${props.accentColor}" no válido. Usando el color por defecto (${COLOR_NAMES.MEDIUM_GREEN}).`,
    )
    return [`vk-color-bg-${COLOR_NAMES.MEDIUM_GREEN}`]
  }
  return [`vk-color-bg-${props.accentColor}`]
})

/**
 * Clases para el contenedor de título y descripción
 */
const containerClasses = computed((): string[] => {
  const classes: string[] = []

  if (props.containerBorder) {
    classes.push('border rounded-md')
  }

  return classes
})

/**
 * Clases para el título
 */
const titleClasses = computed((): string[] => {
  const classes = []

  // Controlar el ancho y orientación según la posición
  if (props.titlePosition === 'top' || props.titlePosition === 'bottom') {
    classes.push('w-full')
  } else {
    // Para posiciones laterales, aplicamos clases para orientación vertical
    classes.push('w-auto writing-vertical vk-timeline-title-vertical')
  }

  if (!isValidColorName(props.titleBgColor)) {
    $logger.warn(
      `Color de fondo de título "${props.titleBgColor}" no válido. Usando el color por defecto (${COLOR_NAMES.WHITE}).`,
    )
    classes.push(`vk-color-bg-${COLOR_NAMES.WHITE}`)
  } else {
    classes.push(`vk-color-bg-${props.titleBgColor}`)
  }

  if (!isValidColorName(props.titleTextColor)) {
    $logger.warn(
      `Color de texto de título "${props.titleTextColor}" no válido. Usando el color por defecto (${COLOR_NAMES.DARK_GRAY}).`,
    )
    classes.push(`vk-color-text-${COLOR_NAMES.DARK_GRAY}`)
  } else {
    classes.push(`vk-color-text-${props.titleTextColor}`)
  }

  // Aplicar estilo y variante tipográfica
  if (!isValidStyle(props.titleStyle)) {
    $logger.warn(`Estilo tipográfico "${props.titleStyle}" no válido.`)
    return classes
  }

  if (!isValidVariant(props.titleVariant)) {
    $logger.warn(`Variante tipográfica "${props.titleVariant}" no válida.`)
    return classes
  }

  // Agregar clases de padding para el título
  const paddingClasses = parsePadding(props.titlePadding)
  classes.push(...paddingClasses)

  return classes
})

/**
 * Clases para la descripción
 */
const descriptionClasses = computed((): string[] => {
  const classes = []

  // Controlar el ancho según la posición
  if (props.titlePosition === 'top' || props.titlePosition === 'bottom') {
    classes.push('w-full')
  } else {
    // Para posiciones laterales, la descripción ocupa la mayor parte del espacio
    classes.push('flex-1')
  }

  if (!isValidColorName(props.descriptionBgColor)) {
    $logger.warn(
      `Color de fondo de descripción "${props.descriptionBgColor}" no válido. Usando el color por defecto (${COLOR_NAMES.WHITE}).`,
    )
    classes.push(`vk-color-bg-${COLOR_NAMES.WHITE}`)
  } else {
    classes.push(`vk-color-bg-${props.descriptionBgColor}`)
  }

  if (!isValidColorName(props.descriptionTextColor)) {
    $logger.warn(
      `Color de texto de descripción "${props.descriptionTextColor}" no válido. Usando el color por defecto (${COLOR_NAMES.DARK_GRAY}).`,
    )
    classes.push(`vk-color-text-${COLOR_NAMES.DARK_GRAY}`)
  } else {
    classes.push(`vk-color-text-${props.descriptionTextColor}`)
  }

  const paddingClasses = parsePadding(props.containerPadding)
  classes.push(...paddingClasses)

  return classes
})

/**
 * Clases para el contenedor que agrupa el título y la descripción
 * basadas en la posición del título
 */
const contentContainerClasses = computed((): string[] => {
  const classes = ['flex gap-2 w-full']

  switch (props.titlePosition) {
    case 'top':
      classes.push('flex-col items-center')
      break
    case 'bottom':
      classes.push('flex-col-reverse items-center')
      break
    case 'left':
      classes.push('flex-row items-start vk-title-left')
      break
    case 'right':
      classes.push('flex-row-reverse items-start vk-title-right')
      break
    default:
      classes.push('flex-col items-center')
  }

  return classes
})

/**
 * Estilos para la sombra del contenedor
 */
const containerShadowStyle = computed(() => {
  return props.containerShadow
    ? { boxShadow: '0px 3.204px 3.204px 0px rgba(0, 0, 0, 0.12)' }
    : {}
})

/**
 * Estilos dinámicos para la línea horizontal (desktop)
 */
const horizontalLineStyle = computed(() => {
  const styles: Record<string, string> = {
    left: props.extendedLine ? '0' : `${props.circleDesktopSize / 2}px`,
    right: props.extendedLine ? '0' : `${props.circleDesktopSize / 2}px`,
  }

  // Calcular la posición vertical según linePosition
  if (props.linePosition === 'top') {
    styles.top = `${props.circleDesktopSize / 2}px`
  } else {
    styles.bottom = `${props.circleDesktopSize / 2}px`
  }

  if (props.lineShadow) {
    styles.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.2)'
  }

  return styles
})

/**
 * Estilos dinámicos para la línea vertical (mobile)
 */
const verticalLineStyle = computed(() => {
  const styles: Record<string, string> = {
    top: `0px`,
    bottom: `0px`,
    left: `${props.circleMobileSize / 2}px`, // Centrar horizontalmente
  }

  if (props.lineShadow) {
    styles.boxShadow = '2px 0px 4px rgba(0, 0, 0, 0.2)'
  }

  return styles
})

/**
 * Estilos para el círculo en desktop
 */
const desktopCircleStyle = computed(() => ({
  width: `${props.circleDesktopSize}px`,
  height: `${props.circleDesktopSize}px`,
  fontSize: `${Math.max(14, props.circleDesktopSize / 3)}px`,
}))

/**
 * Estilos para el círculo en mobile
 */
const mobileCircleStyle = computed(() => ({
  width: `${props.circleMobileSize}px`,
  height: `${props.circleMobileSize}px`,
  fontSize: `${Math.max(14, props.circleMobileSize / 3)}px`,
}))

/**
 * Estilos para el contenedor de pasos en desktop
 */
const desktopStepStyle = computed(() => {
  const styles: Record<string, string> = {
    width: `${100 / props.steps.length}%`,
  }

  return styles
})

/**
 * Estilo para el contenedor principal de pasos en desktop
 */
const desktopContainerStyle = computed(() => {
  // Determinar el padding vertical según la posición de la línea
  if (props.linePosition === 'top') {
    return { paddingTop: `${props.circleDesktopSize / 2}px` }
  } else {
    return { paddingBottom: `${props.circleDesktopSize / 2}px` }
  }
})

/**
 * Clases para la alineación vertical de los círculos en relación al contenedor
 * Solo aplica en modo desktop
 */
const circleAlignmentClasses = computed(() => {
  const classes: string[] = ['items-center justify-center']

  if (props.linePosition === 'top') {
    switch (props.circleAlignment) {
      case 'start':
        classes.push('items-start justify-start')
        classes.push('self-start')
        break
      case 'center':
        classes.push('items-center justify-center')
        classes.push('self-center')
        break
      case 'end':
        classes.push('items-end justify-end')
        classes.push('self-end')
        break
      default:
        classes.push('items-center justify-center')
        classes.push('self-center')
    }
  } else {
    // Para linePosition=bottom, invertimos la alineación
    switch (props.circleAlignment) {
      case 'start':
        classes.push('items-end justify-end')
        classes.push('self-end')
        break
      case 'center':
        classes.push('items-center justify-center')
        classes.push('self-center')
        break
      case 'end':
        classes.push('items-start justify-start')
        classes.push('self-start')
        break
      default:
        classes.push('items-center justify-center')
        classes.push('self-center')
    }
  }

  return classes
})

/**
 * Clases para el contenedor de los pasos en desktop
 * Incluye alineación según circleAlignment
 */
const desktopStepClasses = computed(() => {
  const classes = [
    'relative z-10 flex flex-col items-center text-center max-w-[219px] gap-4 px-4',
  ]

  // Agregamos las clases de alineación vertical
  switch (props.circleAlignment) {
    case 'start':
      classes.push('justify-start')
      break
    case 'center':
      classes.push('justify-center')
      break
    case 'end':
      classes.push('justify-end')
      break
    default:
      classes.push('justify-center')
  }

  return classes
})
</script>

<template>
  <div class="vk-timeline">
    <!-- Desktop (Horizontal) -->
    <div
      v-if="display.lgAndUp.value"
      class="w-full"
      :class="{ 'flex flex-col justify-end': linePosition === 'bottom' }"
      :style="desktopContainerStyle"
    >
      <div
        class="relative flex justify-between"
        :class="{
          'items-start': linePosition === 'top',
          'items-end': linePosition === 'bottom',
        }"
      >
        <!-- Línea horizontal -->
        <div
          class="absolute h-1"
          :class="accentClasses"
          :style="horizontalLineStyle"
        />

        <!-- Pasos del timeline -->
        <div
          v-for="(step, index) in steps"
          :key="`desktop-${index}`"
          :class="desktopStepClasses"
          :style="desktopStepStyle"
        >
          <!-- Círculo con número, posicionado según linePosition -->
          <div
            v-if="linePosition === 'top'"
            class="flex items-center justify-center rounded-full text-white font-bold"
            :class="[accentClasses, circleAlignmentClasses]"
            :style="desktopCircleStyle"
          >
            <span v-if="showNumbers">{{ index + 1 }}</span>
          </div>

          <!-- Título y descripción con posición configurable -->
          <div
            :class="[containerClasses, contentContainerClasses]"
            :style="containerShadowStyle"
          >
            <!-- Título -->
            <div :class="titleClasses">
              <!-- Slot para personalización del título -->
              <slot
                name="title"
                :step="step"
                :index="index"
              >
                <VKText
                  :style="props.titleStyle"
                  :variant="props.titleVariant"
                  :color="titleTextColor"
                  tag="h3"
                >
                  {{ step.title }}
                </VKText>
              </slot>
            </div>

            <!-- Descripción -->
            <div :class="descriptionClasses">
              <VKText tag="p">
                {{ step.description }}
              </VKText>
            </div>
          </div>

          <!-- Círculo con número, posicionado según linePosition -->
          <div
            v-if="linePosition === 'bottom'"
            class="flex items-center justify-center rounded-full text-white font-bold"
            :class="[accentClasses, circleAlignmentClasses]"
            :style="desktopCircleStyle"
          >
            <span v-if="showNumbers">{{ index + 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile (Vertical) -->
    <div v-else>
      <div class="relative">
        <!-- Línea vertical conectora - Extiende según altura total de los pasos -->
        <div
          class="absolute w-1 h-full"
          :class="accentClasses"
          :style="verticalLineStyle"
        />

        <!-- Pasos del timeline -->
        <div
          v-for="(step, index) in steps"
          :key="`mobile-${index}`"
          class="grid grid-cols-[auto_1fr] gap-2 mb-4"
        >
          <!-- Círculo con número -->
          <div class="flex items-center justify-center z-10 h-full">
            <div
              class="rounded-full text-white font-bold z-11 flex items-center justify-center"
              :class="[accentClasses, circleAlignmentClasses]"
              :style="mobileCircleStyle"
            >
              <span v-if="showNumbers">{{ index + 1 }}</span>
            </div>
          </div>

          <!-- Título y descripción con posición configurable -->
          <div
            :class="containerClasses"
            :style="containerShadowStyle"
          >
            <div :class="contentContainerClasses">
              <!-- Título -->
              <div :class="titleClasses">
                <!-- Slot para personalización del título -->
                <slot
                  name="title"
                  :step="step"
                  :index="index"
                >
                  <VKText
                    :style="props.titleStyle"
                    :variant="props.titleVariant"
                    tag="h3"
                    :color="titleTextColor"
                  >
                    {{ step.title }}
                  </VKText>
                </slot>
              </div>

              <!-- Descripción -->
              <div :class="descriptionClasses">
                <VKText tag="p">
                  {{ step.description }}
                </VKText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para la orientación vertical del título */
.vk-timeline-title-vertical {
  writing-mode: vertical-lr;
  text-orientation: mixed;
  transform: rotate(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ajustes para el layout con título vertical */
.vk-title-left,
.vk-title-right {
  align-items: stretch;
}
</style>
