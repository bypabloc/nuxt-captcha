/**
 * Composable para controlar el componente VKLoadingOverlay global de la aplicación.
 * Proporciona funciones para mostrar y ocultar el overlay de carga, así como
 * para establecer mensajes personalizados.
 *
 * @author Pablo Contreras
 * @since 2025/05/06
 */
import type { ColorName } from '@/design-system/presets/colors.preset'
import { useLoadingStore } from '@/store/useLoadingStore'
import type { ComputedRef } from 'vue'

export interface LoadingActions {
  /**
   * Muestra el overlay de carga con opciones de configuración
   * @param message - Mensaje opcional para mostrar durante la carga
   * @param withLogo - Si debe mostrar el logo VK (predeterminado: true)
   * @param color - Color del componente de carga (del sistema de diseño)
   */
  show: (message?: string, withLogo?: boolean, color?: ColorName) => void

  /**
   * Oculta el overlay de carga
   */
  hide: () => void

  /**
   * Cambia el mensaje que se muestra en el overlay de carga
   * @param message - Nuevo mensaje a mostrar
   */
  setMessage: (message: string) => void

  /**
   * Configura las opciones visuales del overlay
   * @param withLogo - Si debe mostrar el logo
   * @param color - Color del componente de carga
   */
  setOptions: (withLogo?: boolean, color?: ColorName) => void

  /**
   * Estado reactivo que indica si el overlay de carga está visible
   */
  isLoading: ComputedRef<boolean>

  /**
   * Mensaje actual que se muestra en el overlay de carga
   */
  message: ComputedRef<string | undefined>

  /**
   * Si se muestra el logo en el overlay
   */
  showLogo: ComputedRef<boolean>

  /**
   * Color del componente de carga
   */
  loadingColor: ComputedRef<ColorName>
}

export const useLoading = (): LoadingActions => {
  const loadingStore = useLoadingStore()
  const $logger = useNuxtApp().$logger

  /**
   * Muestra el overlay de carga con opciones de configuración
   * @param message - Mensaje opcional para mostrar durante la carga
   * @param withLogo - Si debe mostrar el logo VK (predeterminado: true)
   * @param color - Color del componente de carga (del sistema de diseño)
   */
  const show = (
    message?: string, 
    withLogo: boolean = true,
    color?: ColorName
  ): void => {
    $logger.info(`Mostrando overlay de carga${message ? `: ${message}` : ''}`)
    loadingStore.show(message, withLogo, color)
  }

  /**
   * Oculta el overlay de carga
   */
  const hide = (): void => {
    $logger.info('Ocultando overlay de carga')
    loadingStore.hide()
  }

  /**
   * Cambia el mensaje que se muestra en el overlay de carga
   * @param message - Nuevo mensaje a mostrar
   */
  const setMessage = (message: string): void => {
    $logger.info(`Cambiando mensaje de overlay: ${message}`)
    loadingStore.setMessage(message)
  }

  /**
   * Configura las opciones visuales del overlay
   * @param withLogo - Si debe mostrar el logo
   * @param color - Color del componente de carga
   */
  const setOptions = (withLogo?: boolean, color?: ColorName): void => {
    $logger.info('Actualizando opciones visuales del overlay')
    loadingStore.setOptions(withLogo, color)
  }

  return {
    show,
    hide,
    setMessage,
    setOptions,
    isLoading: computed(() => loadingStore.isLoading),
    message: computed(() => loadingStore.message),
    showLogo: computed(() => loadingStore.showLogo),
    loadingColor: computed(() => loadingStore.loadingColor)
  }
}