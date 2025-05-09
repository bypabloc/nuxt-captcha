<script setup lang="ts">
/**
 * @component PartnerEnrollment
 * @description Formulario para inscribirse como partner utilizando correo electrónico 
 * con validación y captcha integrado. Incluye botón de envío con icono de flecha
 * dentro del campo de email.
 *
 * @author Pablo Contreras
 * @since 2025/05/07
 */

import { useI18n } from '#imports'
import { usePartnerEnrollment } from '@/modules/index/features/partner-enrollment/composables/usePartnerEnrollment'
import { usePartnerEnrollmentStore } from '@/modules/index/store/usePartnerEnrollmentStore'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

defineOptions({
  name: 'ModulesIndexFeaturesPartnerEnrollment',
})

const $logger = useNuxtApp().$logger
const { t }: I18n = useI18n()
const partnerEnrollmentStore = usePartnerEnrollmentStore()
const partnerEnrollmentActions = usePartnerEnrollment()
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
    if (isSubmitting.value || partnerEnrollmentStore.isLoading) {
      return
    }

    const email = values.email as string
    isSubmitting.value = true

    // Verificar si el captcha está verificado
    if (!captchaHandler.isVerified('partner-enrollment')) {
      $logger.warn('Captcha no verificado')
      isSubmitting.value = false
      return
    }

    // Llamar a la función de inscripción como partner con el instanceId del captcha
    await partnerEnrollmentActions.enrollAsPartner(email, 'partner-enrollment')

    if (partnerEnrollmentStore.hasError) {
      isSubmitting.value = false
      return
    }

    // Completar proceso exitoso
    isSubmitting.value = false
  } catch (error) {
    isSubmitting.value = false
  }
}

const isFormSubmitted = inject<Ref<boolean>>('isFormSubmitted', ref(false))

const showMessage = computed(
  () => !partnerEnrollmentStore.isLoading && partnerEnrollmentStore.statusCode
)

const messageType = computed((): 'success' | 'error' | 'info' => {
  if (!showMessage.value) return 'info'
  return partnerEnrollmentStore.hasError ? 'error' : 'success'
})

const errorTextForCaptcha = computed(() => {
  if (isFormSubmitted.value && !captchaHandler.isVerified('partner-enrollment')) {
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

const isFormDisabled = computed(() => {
  return isSubmitting.value || 
         partnerEnrollmentStore.isLoading
})

onMounted(() => {
  isSubmitting.value = false
  partnerEnrollmentStore.reset && partnerEnrollmentStore.reset()
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
      <!-- Campo de email con botón integrado -->
      <VKFieldInput
        name="email"
        :placeholder="t('subscription.form.fields.email.placeholder')"
      >
        <template #append>
          <VKButton 
            type="submit" 
            size="small"
            width="fixed"
            :disabled="isFormDisabled || !captchaHandler.isVerified('partner-enrollment')"
          >
            <VKIcon 
              icon="arrow-right" 
              size="24" 
              color="white" 
            />
          </VKButton>
        </template>
      </VKFieldInput>

      <div class="flex flex-col items-center gap-4 mt-4">
        <VKCaptcha
          theme="light"
          :error-text="errorTextForCaptcha"
          instance-id="partner-enrollment"
          container-class="w-full flex justify-center"
          @success="handleCaptchaSuccess"
          @expired="handleCaptchaExpired"
          @error="handleCaptchaError"
          @mounted="() => { $logger.info('Captcha montado correctamente') }"
        />

        <VKAlert
          v-if="showMessage"
          :type="messageType"
          aria-label="message-response"
        >
          {{ t(partnerEnrollmentStore.messageCode) }}
        </VKAlert>
      </div>
    </VKFormFlex>

    <VKAlert
      v-else
      :type="messageType"
      aria-label="message-response"
    >
      {{ t(partnerEnrollmentStore.messageCode) }}
    </VKAlert>
  </div>
</template>
