import { offersApi } from '@/modules/offers/api/offers.api'
import { usePreEnrollmentStore } from '@/modules/offers/store/usePreEnrollmentStore'

interface PreEnrollmentActions {
  preEnroll(email: string): Promise<void>
}

/**
 * Acciones para la preinscripción a ofertas.
 *
 * @author Eugenio Canales
 * @since 2025-04-30
 */
export const usePreEnrollment = (): PreEnrollmentActions => {
  const $logger = useNuxtApp().$logger
  const preEnrollmentStore = usePreEnrollmentStore()
  const captcha = useCaptchaHandler()

  /**
   * Proceso de preinscripción a ofertas (para landing pre-evento).
   *
   * @returns {Promise<void>} - Se resuelve cuando se obtiene la preinscripción
   * y se actualiza el store
   *
   * @author Eugenio Canales
   * @since 2025-04-30
   */
  const preEnroll = async (email: string): Promise<void> => {
    try {
      const captchaToken = captcha.token.value
      preEnrollmentStore.startSubmitting()
      const response = await offersApi.subscribeOffers(
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
        await captcha.resetCaptcha()
        captcha.setVerifying(false)
      }
    } catch (error) {
      $logger.error('pre enrollment error', error)
      await captcha.resetCaptcha()
      captcha.setVerifying(false)
    }
  }

  return {
    preEnroll,
  }
}
