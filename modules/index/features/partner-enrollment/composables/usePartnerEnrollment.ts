import { offersApi } from '@/modules/offers/api/offers.api'
import { usePartnerEnrollmentStore } from '@/modules/offers/store/usePartnerEnrollmentStore'

interface PartnerEnrollmentActions {
  enrollAsPartner(email: string): Promise<void>
}

/**
 * Acciones para inscripción como partner
 *
 * @author Eugenio Canales
 * @since 2025-05-06
 */
export const usePartnerEnrollment = (): PartnerEnrollmentActions => {
  const $logger = useNuxtApp().$logger
  const partnerEnrollmentStore = usePartnerEnrollmentStore()
  const captcha = useCaptchaHandler()

  /**
   * Proceso de inscripción como partner.
   *
   * @returns {Promise<void>} - Se resuelve cuando se obtiene la inscripción
   * y se actualiza el store
   *
   * @author Eugenio Canales
   * @since 2025-05-06
   */
  const enrollAsPartner = async (email: string): Promise<void> => {
    try {
      const captchaToken = captcha.token.value
      partnerEnrollmentStore.startSubmitting()
      const response = await offersApi.subscribeOffers(
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
        await captcha.resetCaptcha()
        captcha.setVerifying(false)
      }
    } catch (error) {
      $logger.error('partner enrollment error', error)
      await captcha.resetCaptcha()
      captcha.setVerifying(false)
    }
  }

  return {
    enrollAsPartner,
  }
}
