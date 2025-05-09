// modules/index/features/partner-enrollment/composables/usePartnerEnrollment.ts
import { testsApi } from '@/modules/index/api/test.api'
import { usePartnerEnrollmentStore } from '@/modules/index/store/usePartnerEnrollmentStore'
import { useCaptchaStore } from '@/store/useCaptchaStore'

interface PartnerEnrollmentActions {
  enrollAsPartner(email: string, instanceId: string): Promise<void>
}

/**
 * Acciones para inscripción como partner
 *
 * @author Pablo Contreras
 * @since 2025-05-06
 * @updated 2025-05-09
 */
export const usePartnerEnrollment = (): PartnerEnrollmentActions => {
  const $logger = useNuxtApp().$logger
  const partnerEnrollmentStore = usePartnerEnrollmentStore()
  const captchaStore = useCaptchaStore()

  /**
   * Proceso de inscripción como partner.
   *
   * @param {string} email - Email para la inscripción
   * @param {string} instanceId - ID de la instancia del captcha para obtener el token
   * @returns {Promise<void>} - Se resuelve cuando se obtiene la inscripción
   * y se actualiza el store
   *
   * @author Pablo Contreras
   * @since 2025-05-06
   * @updated 2025-05-09
   */
  const enrollAsPartner = async (
    email: string,
    instanceId: string,
  ): Promise<void> => {
    try {
      // Obtener el token del captcha usando el instanceId
      const captchaToken = captchaStore.getToken(instanceId)

      if (!captchaToken) {
        $logger.error('Token de captcha no disponible para', instanceId)
        partnerEnrollmentStore.finishSubmitting(false, 422)
        return
      }

      partnerEnrollmentStore.startSubmitting()
      const response = await testsApi.subscribeTests(
        {
          source: 'landing',
          email,
          tagSource: 'want_participate_partner',
          context: {},
        },
        captchaToken,
      )
      partnerEnrollmentStore.finishSubmitting(
        response.status,
        response.statusCode,
      )

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
      $logger.error('partner enrollment error', error)

      // Reiniciar el captcha en caso de error
      try {
        const captchaHandler = useCaptchaHandler()
        captchaHandler.reset(instanceId)
        captchaHandler.setVerifying(false)
      } catch (captchaError) {
        $logger.error('Error al reiniciar el captcha:', captchaError)
      }

      partnerEnrollmentStore.finishSubmitting(false, 500)
    }
  }

  return {
    enrollAsPartner,
  }
}
