// store/useCaptchaStore.ts
import { defineStore } from 'pinia'

export type CaptchaState = {
  isInitialized: boolean
  isVerifying: boolean
  hasError: boolean
  error: Error | null
  tokens: Record<string, string | null>
  verified: Record<string, boolean>
}

/**
 * Store para controlar el estado global de captchas Turnstile.
 * Maneja tokens para múltiples instancias de captcha.
 *
 * @author Pablo Contreras
 * @since 2025/05/09
 */
export const useCaptchaStore = defineStore('captcha', () => {
  // Estado
  const _isInitialized = ref(false)
  const _isVerifying = ref(false)
  const _hasError = ref(false)
  const _error = ref<Error | null>(null)
  const _tokens = ref<Record<string, string | null>>({})
  const _verified = ref<Record<string, boolean>>({})

  // Getters
  const isInitialized = computed(() => _isInitialized.value)
  const isVerifying = computed(() => _isVerifying.value)
  const hasError = computed(() => _hasError.value)
  const error = computed(() => _error.value)
  const tokens = computed(() => _tokens.value)
  const verified = computed(() => _verified.value)

  /**
   * Verifica si un captcha específico está verificado
   * @param instanceId ID de la instancia del captcha
   */
  const isVerified = (instanceId: string): boolean => {
    return !!_verified.value[instanceId]
  }

  /**
   * Obtiene el token de un captcha específico
   * @param instanceId ID de la instancia del captcha
   */
  const getToken = (instanceId: string): string | null => {
    console.log('getToken', instanceId, _tokens.value[instanceId])
    return _tokens.value[instanceId] || null
  }

  // Actions
  /**
   * Establece el estado de inicialización del captcha
   */
  const setInitialized = (value: boolean): void => {
    _isInitialized.value = value
  }

  /**
   * Establece el estado de verificación (proceso)
   */
  const setVerifying = (value: boolean): void => {
    _isVerifying.value = value
  }

  /**
   * Establece un token para una instancia específica
   */
  const setToken = (instanceId: string, token: string | null): void => {
    _tokens.value[instanceId] = token
    if (token) {
      _verified.value[instanceId] = true
      _hasError.value = false
      _error.value = null
    } else {
      _verified.value[instanceId] = false
    }
  }

  /**
   * Establece un error para el captcha
   */
  const setError = (error: Error | null): void => {
    _hasError.value = !!error
    _error.value = error
  }

  /**
   * Limpia el token de una instancia específica
   */
  const clearToken = (instanceId: string): void => {
    _tokens.value[instanceId] = null
    _verified.value[instanceId] = false
  }

  /**
   * Restablece todos los estados
   */
  const reset = (): void => {
    _isInitialized.value = false
    _isVerifying.value = false
    _hasError.value = false
    _error.value = null
    _tokens.value = {}
    _verified.value = {}
  }

  const setVerified = (instanceId: string, value: boolean): void => {
    _verified.value[instanceId] = value
  }

  return {
    // Estado
    isInitialized,
    isVerifying,
    hasError,
    error,
    tokens,
    verified,

    // Getters
    isVerified,
    getToken,

    // Actions
    setInitialized,
    setVerifying,
    setVerified,
    setToken,
    setError,
    clearToken,
    reset,
  }
})
