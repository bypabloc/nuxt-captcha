import { defineStore } from 'pinia'

const RESPONSE_CODES: Record<number, string> = {
  200: 'offers.pre_enrollment.success',
}

/**
 * Store para la preinscripción a ofertas.
 *
 * @author Eugenio Canales
 * @since 2025-04-30
 */
export const usePreEnrollmentStore = defineStore('preEnrollment', () => {
  const _loading: Ref<boolean> = ref(false)
  const _error: Ref<boolean> = ref(false)
  const _statusCode: Ref<string | null> = ref(null)
  const _messageCode: Ref<string> = ref('')

  const isLoading = computed(() => _loading.value)
  const hasError = computed(() => _error.value)
  const statusCode = computed(() => _statusCode.value)
  const messageCode = computed(() => _messageCode.value)

  const startSubmitting = (): void => {
    _loading.value = true
    _error.value = false
    _statusCode.value = null
    _messageCode.value = ''
  }
  const finishSubmitting = (success: boolean, code: number): void => {
    _loading.value = false
    _error.value = !success
    _statusCode.value = code.toString()
    _messageCode.value = RESPONSE_CODES[code] || 'offers.pre_enrollment.error'
  }
  const reset = (): void => {
    _loading.value = false
    _error.value = false
    _statusCode.value = null
    _messageCode.value = ''
  }
  return {
    isLoading,
    hasError,
    statusCode,
    messageCode,
    startSubmitting,
    finishSubmitting,
    reset,
  }
})
