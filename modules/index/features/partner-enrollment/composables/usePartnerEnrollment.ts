import { testsApi } from '@/modules/index/api/test.api'
import { usePartnerEnrollmentStore } from '@/modules/index/store/usePartnerEnrollmentStore'

interface PartnerEnrollmentActions {
  enrollAsPartner(email: string): Promise<void>
}

/**
 * Acciones para inscripción como partner
 *
 * @author Pablo Contreras
 * @since 2025-05-06
 */
export const usePartnerEnrollment = (): PartnerEnrollmentActions => {
  const $logger = useNuxtApp().$logger
  const partnerEnrollmentStore = usePartnerEnrollmentStore()

  // TODO: import composable for captcha handling

  /**
   * Proceso de inscripción como partner.
   *
   * @returns {Promise<void>} - Se resuelve cuando se obtiene la inscripción
   * y se actualiza el store
   *
   * @author Pablo Contreras
   * @since 2025-05-06
   */
  const enrollAsPartner = async (email: string): Promise<void> => {
    try {
      const captchaToken = '' // TODO: add captcha value
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
        // TODO: add captcha reset
        // TODO: add captcha setVerifying
      }
    } catch (error) {
      $logger.error('partner enrollment error', error)
      // TODO: add captcha reset
      // TODO: add captcha setVerifying
    }
  }

  return {
    enrollAsPartner,
  }
}
