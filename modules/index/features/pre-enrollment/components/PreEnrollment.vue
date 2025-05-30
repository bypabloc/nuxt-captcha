<script setup lang="ts">
/**
 * @component SubscriptionForm
 * @description Formulario para suscribirse al servicio de notificaciones
 * utilizando el correo electrónico con validación y captcha.
 *
 * @author Pablo Contreras
 * @since 2025/05/07
 */

import { useI18n } from '#imports'
import { usePreEnrollment } from '@/modules/index/features/pre-enrollment/composables/usePreEnrollment'
import { usePreEnrollmentStore } from '@/modules/index/store/usePreEnrollmentStore'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

defineOptions({
  name: 'ModulesIndexFeaturesPreEnrollment',
})

const $logger = useNuxtApp().$logger
const { t }: I18n = useI18n()
const preEnrollmentStore = usePreEnrollmentStore()
const preEnrollmentActions = usePreEnrollment()
const captchaHandler = useCaptchaHandler()



const isSubmitting = ref(false)

// Esquema de validación utilizando zod
const zodSchema = z.object({
  email: z
    .string()
    .min(1, t('subscription.form.fields.email.required'))
    .email(t('subscription.form.fields.email.format')),
})

const validationSchema = toTypedSchema(zodSchema)

const initialValues = {
  email: '',
}

// Gestión del envío del formulario
const handleSubmit = async (values: Record<string, unknown>): Promise<void> => {
  try {
    if (isSubmitting.value || preEnrollmentStore.isLoading) {
      return
    }

    const email = values.email as string
    isSubmitting.value = true

    // Verificar si el captcha está verificado
    if (!captchaHandler.isVerified('pre-enrollment')) {
      $logger.warn('Captcha no verificado')
      isSubmitting.value = false
      return
    }

    // Llamar a la función de pre-inscripción con el instanceId del captcha
    await preEnrollmentActions.preEnroll(email, 'pre-enrollment')

    if (preEnrollmentStore.hasError) {
      isSubmitting.value = false
      return
    }

    // Completar proceso exitoso
    isSubmitting.value = false
  } catch (error) {
    isSubmitting.value = false
  }
}

const showMessage = computed(
  () => !preEnrollmentStore.isLoading && preEnrollmentStore.statusCode
)

const messageType = computed((): 'success' | 'error' | 'info' => {
  if (!showMessage.value) return 'info'
  return preEnrollmentStore.hasError ? 'error' : 'success'
})

const isFormSubmitted = inject<Ref<boolean>>('isFormSubmitted', ref(false))

const errorTextForCaptcha = computed(() => {
  if (isFormSubmitted.value && !captchaHandler.isVerified('pre-enrollment')) {
    return 'Por favor, complete el captcha'
  }
  return ''
})

const handleCaptchaError = (error: Error): void => {
  $logger.error('Error en el captcha:', error)
}

const handleCaptchaSuccess = (token: string): void => {
  $logger.info('Captcha completado con éxito:', token)
}

const handleCaptchaExpired = (): void => {
  $logger.warn('El captcha ha expirado, por favor complételo nuevamente')
}

onMounted(() => {
  isSubmitting.value = false
  preEnrollmentStore.reset()
  // Inicializar el captcha
  captchaHandler.ensureInitialized()
})
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <VKFormFlex
      v-if="messageType !== 'success'"
      w-full
      layout="column"
      :validation-schema="validationSchema"
      :initial-values="initialValues"
      show-validation-on-submit
      @submit="handleSubmit"
    >
      <div class="flex flex-col md:flex-row items-center gap-2">
        <VKFieldInput
          name="email"
          type="email"
          class="w-full mb-2 md:mb-0"
          :placeholder="t('subscription.form.fields.email.placeholder')"
        />
      </div>

      <div class="flex flex-col items-center gap-4">
        <VKButton
          type="submit"
          class="w-full"
          :is-loading="preEnrollmentStore.isLoading"
          :disabled="
            preEnrollmentStore.isLoading || !captchaHandler.isVerified('pre-enrollment')
          "
        >
          {{ t('subscription.form.actions.subscribe') }}
        </VKButton>

        <VKCaptcha
          theme="light"
          :error-text="errorTextForCaptcha"
          instance-id="pre-enrollment"
          container-class="w-full flex justify-center"
          @success="handleCaptchaSuccess"
          @expired="handleCaptchaExpired"
          @error="handleCaptchaError"
          @mounted="() => { $logger.info('Captcha montado correctamente') }"
        />

        <VKAlert
          v-if="showMessage"
          :type="messageType"
          dismissible
          aria-label="message-response"
        >
          {{ t(preEnrollmentStore.messageCode) }}
        </VKAlert>
      </div>
    </VKFormFlex>

    <VKAlert
      v-else
      :type="messageType"
      aria-label="message-response"
    >
      {{ t(preEnrollmentStore.messageCode) }}
    </VKAlert>
  </div>
</template>
