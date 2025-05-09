import { defineNuxtPlugin } from '#app/nuxt'
import type { ColorName } from '@/design-system/presets/colors.preset'
import { useLoadingStore } from '@/store/useLoadingStore'

/**
 * Plugin para controlar el estado de carga global de la aplicación.
 * Proporciona una API para mostrar/ocultar el overlay de carga desde cualquier lugar.
 *
 * @author Pablo Contreras
 * @since 2025/05/06
 */
export default defineNuxtPlugin({
  name: 'loading',
  
  // La carga debe ser posterior al plugin logger
  dependsOn: ['logger'],
  
  setup(nuxtApp: NuxtAppExtension) {
    const $logger = nuxtApp.$logger
    const loadingStore = useLoadingStore()
    
    $logger.info('Inicializando plugin de Loading')
    
    // Inicialmente ocultar el overlay (por si estuviera activo en app.vue)
    loadingStore.hide()
    
    return {
      provide: {
        loading: {
          /**
           * Muestra el overlay de carga con opciones de configuración
           * @param message - Mensaje opcional para mostrar durante la carga
           * @param withLogo - Si debe mostrar el logo VK (predeterminado: true)
           * @param color - Color del componente de carga (del sistema de diseño)
           */
          show: (
            message?: string,
            withLogo: boolean = true,
            color?: ColorName,
          ): void => {
            $logger.info(
              `Plugin loading: mostrando overlay${message ? ` con mensaje: ${message}` : ''}`,
            )
            loadingStore.show(message, withLogo, color)
          },

          /**
           * Oculta el overlay de carga
           */
          hide: (): void => {
            $logger.info('Plugin loading: ocultando overlay')
            loadingStore.hide()
          },

          /**
           * Establece un nuevo mensaje en el overlay de carga
           * @param message - Mensaje a mostrar
           */
          setMessage: (message: string): void => {
            $logger.info(`Plugin loading: estableciendo mensaje: ${message}`)
            loadingStore.setMessage(message)
          },

          /**
           * Configura las opciones visuales del overlay
           * @param withLogo - Si debe mostrar el logo
           * @param color - Color del componente de carga
           */
          setOptions: (withLogo?: boolean, color?: ColorName): void => {
            $logger.info('Plugin loading: actualizando opciones visuales')
            loadingStore.setOptions(withLogo, color)
          },
        },
      },
    }
  },
})