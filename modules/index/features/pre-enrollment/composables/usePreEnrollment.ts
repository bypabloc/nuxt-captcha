// modules/index/features/pre-enrollment/composables/usePreEnrollment.ts
import { testsApi } from '@/modules/index/api/test.api'
import { usePreEnrollmentStore } from '@/modules/index/store/usePreEnrollmentStore'
import { useCaptchaStore } from '@/store/useCaptchaStore'

interface PreEnrollmentActions {
  preEnroll(email: string, instanceId: string): Promise<void>
}

/**
 * Acciones para la preinscripción a ofertas.
 *
 * @author Pablo Contreras
 * @since 2025-04-30
 * @updated 2025-05-09
 */
export const usePreEnrollment = (): PreEnrollmentActions => {
  const $logger = useNuxtApp().$logger
  const preEnrollmentStore = usePreEnrollmentStore()
  const captchaStore = useCaptchaStore()

  /**
   * Proceso de preinscripción a ofertas (para landing pre-evento).
   *
   * @param {string} email - Email para la preinscripción
   * @param {string} instanceId - ID de la instancia del captcha para obtener el token
   * @returns {Promise<void>} - Se resuelve cuando se obtiene la preinscripción
   * y se actualiza el store
   *
   * @author Pablo Contreras
   * @since 2025-04-30
   * @updated 2025-05-09
   */
  const preEnroll = async (
    email: string,
    instanceId: string,
  ): Promise<void> => {
    try {
      // Obtener el token del captcha usando el instanceId
      const captchaToken = captchaStore.getToken(instanceId)

      if (!captchaToken) {
        $logger.error('Token de captcha no disponible para', instanceId)
        preEnrollmentStore.finishSubmitting(false, 422)
        return
      }

      preEnrollmentStore.startSubmitting()
      const response = await testsApi.subscribeTests(
        {
          source: 'landing',
          email,
          tagSource: 'notify_me_start',
          context: {},
        },
        captchaToken,
      )
      preEnrollmentStore.finishSubmitting(response.status, response.statusCode)

      if (!response.status) {
        // Reiniciar el captcha si la respuesta no fue exitosa
        try {
          const captchaHandler = useCaptchaHandler()
          captchaHandler.reset(instanceId)
          captchaHandler.setVerifying(false)
        } catch (error) {
          $logger.error('Error al reiniciar el captcha:', error)
        }
      }
    } catch (error) {
      $logger.error('pre enrollment error', error)

      // Reiniciar el captcha en caso de error
      try {
        const captchaHandler = useCaptchaHandler()
        captchaHandler.reset(instanceId)
        captchaHandler.setVerifying(false)
      } catch (captchaError) {
        $logger.error('Error al reiniciar el captcha:', captchaError)
      }

      preEnrollmentStore.finishSubmitting(false, 500)
    }
  }

  return {
    preEnroll,
  }
}
