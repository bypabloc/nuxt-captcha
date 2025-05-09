import type { ComputedRef, Ref } from 'vue'
/**
 * Interfaz que define los breakpoints de la aplicación
 *
 * @author Pablo Contreras
 * @since 2025/04/21
 */
export interface Breakpoints {
  xxs: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

/**
 * Interfaz que define el tipo de retorno del composable useDisplay
 *
 * @author Pablo Contreras
 * @since 2025/04/21
 */
export interface DisplayResult {
  // Breakpoints
  xxs: ComputedRef<boolean>
  xs: ComputedRef<boolean>
  sm: ComputedRef<boolean>
  md: ComputedRef<boolean>
  lg: ComputedRef<boolean>
  xl: ComputedRef<boolean>
  xxl: ComputedRef<boolean>

  // Rangos específicos
  xsOnly: ComputedRef<boolean>
  xxsOnly: ComputedRef<boolean>
  smOnly: ComputedRef<boolean>
  xxsAndDown: ComputedRef<boolean>
  xxsAndUp: ComputedRef<boolean>
  xsAndDown: ComputedRef<boolean>
  xsAndUp: ComputedRef<boolean>
  smAndDown: ComputedRef<boolean>
  smAndUp: ComputedRef<boolean>
  mdOnly: ComputedRef<boolean>
  mdAndDown: ComputedRef<boolean>
  mdAndUp: ComputedRef<boolean>
  lgOnly: ComputedRef<boolean>
  lgAndDown: ComputedRef<boolean>
  lgAndUp: ComputedRef<boolean>
  xlOnly: ComputedRef<boolean>
  xlAndDown: ComputedRef<boolean>
  xlAndUp: ComputedRef<boolean>
  xxlOnly: ComputedRef<boolean>

  // Nombre del breakpoint actual
  name: ComputedRef<string>

  // Dimensiones actuales
  height: Ref<number>
  width: Ref<number>

  // Tipos de dispositivo
  mobile: ComputedRef<boolean>
  mobileOrTablet: ComputedRef<boolean>
  desktop: ComputedRef<boolean>
  isMobile: ComputedRef<boolean>
}

/**
 * Valores predeterminados para los breakpoints (en píxeles)
 * Estos valores generan los rangos utilizados para determinar
 * el tipo de dispositivo según especificaciones proporcionadas.
 */
export const breakpoints: Breakpoints = {
  xxs: 0, // < 330px (Dispositivos ultra pequeños)
  xs: 330, // 330px > < 600px
  sm: 600, // 600px > < 960px
  md: 960, // 960px > < 1280px
  lg: 1280, // 1280px > < 1920px
  xl: 1920, // 1920px > < 2560px
  xxl: 2560, // > 2560px
}

/**
 * Función para actualizar las dimensiones (definida fuera del composable para mejor rendimiento)
 *
 * @param width - Referencia reactiva al ancho de la ventana
 * @param height - Referencia reactiva al alto de la ventana
 * @returns {void}
 */
function updateDimensions(width: Ref<number>, height: Ref<number>): void {
  height.value = window.innerHeight
  width.value = window.innerWidth
}

/**
 * Composable que proporciona información sobre el tamaño de la pantalla
 * y facilita la creación de diseños responsivos.
 *
 * @returns {DisplayResult} Objeto con propiedades reactivas para detectar breakpoints
 *
 * @example
 * // En un componente Vue
 * const { isMobile, name, width } = useDisplay()
 *
 * @example
 * // Uso en un template con propiedades reactivas
 * <div v-if="isMobile.value">
 *   Contenido móvil
 * </div>
 * <div v-else-if="mdAndUp.value">
 *   Contenido para tablets y superiores
 * </div>
 *
 * @author Pablo Contreras
 * @since 2025/04/21
 */
export default function useDisplay(): DisplayResult {
  // Estado interno
  const height = ref<number>(0)
  const width = ref<number>(0)

  // Calcular inicialmente para SSR
  if (typeof window !== 'undefined') {
    height.value = window.innerHeight
    width.value = window.innerWidth
  }

  // Función para actualizar las dimensiones
  const update = (): void => {
    updateDimensions(width, height)
  }

  // Solo agregar event listeners en el cliente
  onMounted((): void => {
    window.addEventListener('resize', update, { passive: true })
    update()
  })

  onUnmounted((): void => {
    window.removeEventListener('resize', update)
  })

  // Computed properties para cada breakpoint
  const xxs = computed((): boolean => width.value < breakpoints.xs)
  const xs = computed(
    (): boolean =>
      width.value >= breakpoints.xs && width.value < breakpoints.sm,
  )
  const sm = computed(
    (): boolean =>
      width.value >= breakpoints.sm && width.value < breakpoints.md,
  )
  const md = computed(
    (): boolean =>
      width.value >= breakpoints.md && width.value < breakpoints.lg,
  )
  const lg = computed(
    (): boolean =>
      width.value >= breakpoints.lg && width.value < breakpoints.xl,
  )
  const xl = computed(
    (): boolean =>
      width.value >= breakpoints.xl && width.value < breakpoints.xxl,
  )
  const xxl = computed((): boolean => width.value >= breakpoints.xxl)

  // Computed properties para rangos específicos
  const xxsOnly = computed((): boolean => xxs.value)
  const xsOnly = computed((): boolean => xs.value)
  const smOnly = computed((): boolean => sm.value)
  const xxsAndDown = computed((): boolean => width.value < breakpoints.sm)
  const xxsAndUp = computed((): boolean => width.value >= breakpoints.xxs)
  const xsAndDown = computed((): boolean => width.value < breakpoints.md)
  const xsAndUp = computed((): boolean => width.value >= breakpoints.xs)
  const smAndDown = computed((): boolean => width.value < breakpoints.md)
  const smAndUp = computed((): boolean => width.value >= breakpoints.sm)
  const mdOnly = computed((): boolean => md.value)
  const mdAndDown = computed((): boolean => width.value < breakpoints.lg)
  const mdAndUp = computed((): boolean => width.value >= breakpoints.md)
  const lgOnly = computed((): boolean => lg.value)
  const lgAndDown = computed((): boolean => width.value < breakpoints.xl)
  const lgAndUp = computed((): boolean => width.value >= breakpoints.lg)
  const xlOnly = computed((): boolean => xl.value)
  const xlAndDown = computed((): boolean => width.value < breakpoints.xxl)
  const xlAndUp = computed((): boolean => width.value >= breakpoints.xl)
  const xxlOnly = computed((): boolean => xxl.value)

  // Nombre del breakpoint actual
  const name = computed((): string => {
    if (xxs.value) return 'xxs'
    if (xs.value) return 'xs'
    if (sm.value) return 'sm'
    if (md.value) return 'md'
    if (lg.value) return 'lg'
    if (xl.value) return 'xl'
    return 'xxl'
  })

  // Propiedades específicas para tipos de dispositivo
  const mobile = computed((): boolean => width.value < breakpoints.md) // Móvil si es xs o sm
  const mobileOrTablet = computed((): boolean => width.value < breakpoints.md) // Móvil o tablet si es xs o sm
  const desktop = computed((): boolean => width.value >= breakpoints.md) // Desktop si es md o superior

  // Alias para mantener compatibilidad
  const isMobile = mobile

  return {
    // Breakpoints
    xxs,
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,

    // Rangos específicos
    xxsAndDown,
    xxsAndUp,
    xsAndDown,
    xsAndUp,
    xxsOnly,
    xsOnly,
    smOnly,
    smAndDown,
    smAndUp,
    mdOnly,
    mdAndDown,
    mdAndUp,
    lgOnly,
    lgAndDown,
    lgAndUp,
    xlOnly,
    xlAndDown,
    xlAndUp,
    xxlOnly,

    // Nombre del breakpoint actual
    name,

    // Dimensiones actuales
    height,
    width,

    // Tipos de dispositivo
    mobile,
    mobileOrTablet,
    desktop,
    isMobile,
  }
}
