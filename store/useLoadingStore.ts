import type { ColorName } from '@/design-system/presets/colors.preset'
import { COLOR_NAMES, isValidColorName } from '@/design-system/presets/colors.preset'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'

/**
 * Store para gestionar el estado del overlay de carga global.
 * Controla la visibilidad y configuración del componente VKLoadingOverlay.
 *
 * @property {Ref<boolean>} isLoading - Estado que determina si se muestra el overlay de carga
 * @property {Ref<string | undefined>} message - Mensaje opcional a mostrar durante la carga
 * 
 * @author Pablo Contreras
 * @since 2025/05/06
 */
export const useLoadingStore = defineStore('loading', () => {
  const $logger = useNuxtApp().$logger
  const DEFAULT_COLOR: ColorName = COLOR_NAMES.MEDIUM_GREEN as ColorName

  // Estado interno
  const _isLoading: Ref<boolean> = ref(false)
  const _message: Ref<string | undefined> = ref(undefined)
  const _showLogo: Ref<boolean> = ref(true)
  const _loadingColor: Ref<ColorName> = ref(DEFAULT_COLOR)

  // Getters
  const isLoading = computed(() => _isLoading.value)
  const message = computed(() => _message.value)
  const showLogo = computed(() => _showLogo.value)
  const loadingColor = computed(() => _loadingColor.value)

  // Actions
  /**
   * Muestra el overlay de carga con opciones de configuración
   * 
   * @param {string} [message] - Mensaje opcional para mostrar durante la carga
   * @param {boolean} [withLogo=true] - Si debe mostrar el logo VK
   * @param {ColorName} [color='medium-green'] - Color para el componente de carga
   */
  const show = (
    message?: string, 
    withLogo: boolean = true,
    color?: ColorName
  ): void => {
    _isLoading.value = true
    _showLogo.value = withLogo
    
    // Validar el color y usar el predeterminado si es inválido
    if (color && isValidColorName(color)) {
      _loadingColor.value = color
    } else if (color && !isValidColorName(color)) {
      $logger.warn(`Color "${color}" no válido. Usando el color por defecto (${DEFAULT_COLOR}).`)
      _loadingColor.value = DEFAULT_COLOR
    }
    
    if (message) {
      _message.value = message
    }
  }

  /**
   * Oculta el overlay de carga
   */
  const hide = (): void => {
    _isLoading.value = false
    _message.value = undefined
  }

  /**
   * Actualiza el mensaje del overlay de carga sin cambiar su visibilidad
   * 
   * @param {string} message - Nuevo mensaje a mostrar
   */
  const setMessage = (message: string): void => {
    _message.value = message
  }

  /**
   * Configura las opciones visuales del overlay
   * 
   * @param {boolean} [withLogo] - Si debe mostrar el logo
   * @param {ColorName} [color] - Color del componente de carga
   */
  const setOptions = (withLogo?: boolean, color?: ColorName): void => {
    if (withLogo !== undefined) {
      _showLogo.value = withLogo
    }
    
    if (color) {
      if (isValidColorName(color)) {
        _loadingColor.value = color
      } else {
        $logger.warn(`Color "${color}" no válido. Usando el color por defecto (${DEFAULT_COLOR}).`)
        _loadingColor.value = DEFAULT_COLOR
      }
    }
  }

  return {
    // Getters
    isLoading,
    message,
    showLogo,
    loadingColor,

    // Actions
    show,
    hide,
    setMessage,
    setOptions
  }
})
