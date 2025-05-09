import { testsApi } from '@/modules/index/api/test.api'
import { usePreEnrollmentStore } from '@/modules/index/store/usePreEnrollmentStore'

interface PreEnrollmentActions {
  preEnroll(email: string): Promise<void>
}

/**
 * Acciones para la preinscripción a ofertas.
 *
 * @author Pablo Contreras
 * @since 2025-04-30
 */
export const usePreEnrollment = (): PreEnrollmentActions => {
  const $logger = useNuxtApp().$logger
  const preEnrollmentStore = usePreEnrollmentStore()

  // TODO: import composable for captcha handling

  /**
   * Proceso de preinscripción a ofertas (para landing pre-evento).
   *
   * @returns {Promise<void>} - Se resuelve cuando se obtiene la preinscripción
   * y se actualiza el store
   *
   * @author Pablo Contreras
   * @since 2025-04-30
   */
  const preEnroll = async (email: string): Promise<void> => {
    try {
      const captchaToken = '' // TODO: add captcha value
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
        // TODO: add captcha reset
        // TODO: add captcha setVerifying
      }
    } catch (error) {
      $logger.error('pre enrollment error', error)
      // TODO: add captcha reset
      // TODO: add captcha setVerifying
    }
  }

  return {
    preEnroll,
  }
}
