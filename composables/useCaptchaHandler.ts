// composables/useCaptchaHandler.ts
import { useCaptchaStore } from '~/store/useCaptchaStore'

interface CaptchaHandlerOptions {
  siteKey?: string
}

interface CaptchaHandlerActions {
  /**
   * Verifica si Turnstile está inicializado
   */
  isInitialized: ComputedRef<boolean>
  
  /**
   * Verifica si un captcha específico está verificado
   * @param instanceId ID de la instancia del captcha
   */
  isVerified: (instanceId: string) => boolean
  
  /**
   * Obtiene el token de un captcha específico
   * @param instanceId ID de la instancia del captcha
   */
  getToken: (instanceId: string) => string | null
  
  /**
   * Reinicia un captcha específico
   * @param instanceId ID de la instancia del captcha
   */
  reset: (instanceId: string) => void
  
  /**
   * Establece el estado de verificación
   * @param isVerifying Estado de verificación
   */
  setVerifying: (isVerifying: boolean) => void
  
  /**
   * Establece un error para el captcha
   * @param error Error a establecer
   */
  setError: (error: Error | null) => void
  
  /**
   * Inicializa Turnstile si aún no está inicializado
   */
  ensureInitialized: () => Promise<boolean>
}

/**
 * Composable para manejar captchas Turnstile de Cloudflare.
 * Proporciona métodos para interactuar con el captcha y obtener tokens.
 *
 * @param options Opciones de configuración
 * @returns Acciones para manejar el captcha
 * 
 * @author Pablo Contreras
 * @since 2025/05/09
 */
export const useCaptchaHandler = (options: CaptchaHandlerOptions = {}): CaptchaHandlerActions => {
  const captchaStore = useCaptchaStore()
  const $logger = useNuxtApp().$logger
  const runtimeConfig = useRuntimeConfig()
  
  // Obtener la clave del sitio de las opciones o de la configuración
  const siteKey = options.siteKey || runtimeConfig.public.turnstileSiteKey

  $logger.info(`Usando clave de sitio Turnstile: ${siteKey || 'NO CONFIGURADA'}`)
  
  // Objeto donde guardaremos datos de widgets Turnstile
  const turnstileWidgets = ref<Record<string, { widgetId?: string }>>({})
  
  /**
   * Verifica si window.turnstile existe
   */
  const isTurnstileLoaded = computed((): boolean => {
    return typeof window !== 'undefined' && 'turnstile' in window
  })
  
  /**
   * Carga el script de Turnstile si aún no está cargado
   */
  const loadTurnstileScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isTurnstileLoaded.value) {
        $logger.info('Turnstile ya está cargado, omitiendo carga de script')
        resolve()
        return
      }
      
      try {
        $logger.info('Intentando cargar el script de Turnstile')

        // Verificar si el script ya está en el DOM
        const existingScript = document.querySelector(
          'script[src*="turnstile/v0/api.js"]',
        )
        if (existingScript) {
          $logger.info(
            'Script de Turnstile ya está en el DOM, esperando inicialización',
          )

          // Si el script ya está en el DOM pero Turnstile no está disponible,
          // esperar un poco y luego resolver
          const checkInterval = setInterval(() => {
            if (typeof window.turnstile !== 'undefined') {
              clearInterval(checkInterval)
              $logger.info('Turnstile API detectada tras espera')
              captchaStore.setInitialized(true)
              resolve()
            }
          }, 100)

          // Establecer un timeout por si acaso
          setTimeout(() => {
            clearInterval(checkInterval)
            if (typeof window.turnstile !== 'undefined') {
              $logger.info('Turnstile API detectada tras timeout')
              captchaStore.setInitialized(true)
              resolve()
            } else {
              $logger.error('Timeout esperando a Turnstile API')
              reject(new Error('Timeout esperando a Turnstile API'))
            }
          }, 5000)

          return
        }

        // Definir callback cuando el script se cargue
        window.onloadTurnstileCb = () => {
          $logger.info('Turnstile API cargada correctamente via callback')
          captchaStore.setInitialized(true)
          resolve()
        }

        const script = document.createElement('script')
        script.src =
          'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCb'
        script.async = true
        script.defer = true

        script.onload = () => {
          $logger.info('Script de Turnstile cargado vía onload')
          // El callback onloadTurnstileCb debería manejar esto, pero por si acaso
          setTimeout(() => {
            if (
              !captchaStore.isInitialized &&
              typeof window.turnstile !== 'undefined'
            ) {
              $logger.info('Turnstile API detectada vía timeout post-onload')
              captchaStore.setInitialized(true)
              resolve()
            }
          }, 1000)
        }

        script.onerror = (error) => {
          $logger.error('Error al cargar el script de Turnstile:', error)
          reject(new Error('Error al cargar el script de Turnstile'))
        }

        document.head.appendChild(script)
        $logger.info('Script de Turnstile añadido al DOM')
      } catch (error) {
        $logger.error('Error cargando el script de Turnstile:', error)
        reject(error)
      }
    })
  }
  
  /**
   * Asegura que Turnstile esté inicializado
   */
  const ensureInitialized = async (): Promise<boolean> => {
    if (captchaStore.isInitialized) {
      return true
    }
    
    try {
      await loadTurnstileScript()
      return true
    } catch (error) {
      $logger.error('Error al inicializar Turnstile:', error)
      captchaStore.setError(error instanceof Error ? error : new Error(String(error)))
      return false
    }
  }
  
/**
 * Reinicia un captcha específico y fuerza una nueva verificación
 * @param instanceId - ID de la instancia del captcha a reiniciar
 */
const reset = (instanceId: string): void => {
  if (!isTurnstileLoaded.value) {
    $logger.warn('Turnstile no está cargado, no se puede reiniciar')
    return
  }
  
  try {
    const widgetId = turnstileWidgets.value[instanceId]?.widgetId
    
    if (widgetId) {
      // Limpia el token en el store
      captchaStore.clearToken(instanceId)
      captchaStore.setVerified(instanceId, false)
      
      // Primero intenta el método reset estándar
      window.turnstile.reset(widgetId)
      $logger.info(`Captcha reiniciado: ${instanceId}`)
      
      // Obtén el contenedor del widget
      const container = document.querySelector(`[data-instance-id="${instanceId}"]`)
      if (container) {
        // Para forzar una nueva verificación, vamos a eliminar y volver a crear el widget
        setTimeout(() => {
          try {
            // Elimina el widget actual
            window.turnstile.remove(widgetId)
            delete turnstileWidgets.value[instanceId]
            
            // Re-renderiza un nuevo widget
            const newWidgetId = renderWidget(
              container as HTMLElement,
              instanceId,
              (token) => {
                captchaStore.setToken(instanceId, token)
                $logger.info(`Nuevo token generado para ${instanceId}`)
              },
              (error) => {
                captchaStore.setError(error)
                $logger.error(`Error en nuevo widget para ${instanceId}:`, error)
              },
              () => {
                captchaStore.clearToken(instanceId)
                $logger.info(`Token expirado para nuevo widget ${instanceId}`)
              }
            )
            
            $logger.info(`Nuevo widget creado con ID: ${newWidgetId}`)
          } catch (recreateError) {
            $logger.error(`Error al recrear el widget para ${instanceId}:`, recreateError)
          }
        }, 100) // Pequeño retraso para asegurar que el reset se ha completado
      }
    } else {
      $logger.warn(`No se encontró widgetId para el instanceId: ${instanceId}`)
    }
  } catch (error) {
    $logger.error(`Error al reiniciar el captcha ${instanceId}:`, error)
  }
}

  /**
   * Renderiza un widget de Turnstile
   */
  const renderWidget = (
    container: HTMLElement,
    instanceId: string,
    onSuccess: (token: string) => void,
    onError: (error: Error) => void,
    onExpired: () => void,
  ): string | undefined => {
    if (!isTurnstileLoaded.value) {
      $logger.warn(
        'Turnstile no está cargado, no se puede renderizar el widget',
      )
      return undefined
    }

    try {
      // Configuración para el widget
      const widgetParams = {
        sitekey: siteKey,
        callback: (token: string) => {
          captchaStore.setToken(instanceId, token)
          onSuccess(token)
        },
        'expired-callback': () => {
          captchaStore.clearToken(instanceId)
          onExpired()
        },
        'error-callback': (error: any) => {
          const errorObj =
            error instanceof Error ? error : new Error(String(error))
          captchaStore.setError(errorObj)
          onError(errorObj)
        },
        theme: 'light',
      }

      // Renderizar el widget
      const widgetId = window.turnstile.render(container, widgetParams)
      turnstileWidgets.value[instanceId] = { widgetId }

      container.setAttribute('data-widget-id', widgetId)

      $logger.info(
        `Widget Turnstile renderizado: ${instanceId} (ID: ${widgetId})`,
      )
      return widgetId
    } catch (error) {
      $logger.error(`Error al renderizar widget para ${instanceId}:`, error)
      return undefined
    }
  }
  
  // Guardar referencia a renderWidget para usar desde el componente
  provide('renderTurnstileWidget', renderWidget)
  
  return {
    isInitialized: computed(() => captchaStore.isInitialized),
    isVerified: captchaStore.isVerified,
    getToken: captchaStore.getToken,
    reset,
    setVerifying: captchaStore.setVerifying,
    setError: captchaStore.setError,
    ensureInitialized
  }
}

// Definición del tipo window.turnstile
declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement, 
        params: Record<string, any>
      ) => string
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
      remove: (widgetId: string) => void
    }
    onloadTurnstileCb: () => void
  }
}