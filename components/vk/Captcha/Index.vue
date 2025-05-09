<!-- components/vk/Captcha/Index.vue -->
<script setup lang="ts">
/**
 * @component VKCaptcha
 * @description Componente para renderizar y gestionar captchas Turnstile de Cloudflare.
 * Soporta múltiples instancias en la misma página.
 * 
 * @props {string} theme - Tema del captcha ('light' o 'dark')
 * @props {string} instanceId - ID único para identificar esta instancia del captcha
 * @props {string} containerClass - Clases CSS adicionales para el contenedor
 * @props {string} errorText - Texto de error personalizado
 * @props {string} siteKey - Clave del sitio para Turnstile (opcional, usa la configuración por defecto)
 * 
 * @emits success - Emitido cuando el captcha se completa correctamente, con el token generado
 * @emits error - Emitido cuando ocurre un error en el captcha
 * @emits expired - Emitido cuando el token del captcha expira
 * @emits mounted - Emitido cuando el componente de captcha ha sido montado
 *
 * @example
 * <VKCaptcha
 *   theme="light"
 *   instance-id="my-form"
 *   container-class="w-full flex justify-center"
 *   @success="handleSuccess"
 *   @error="handleError"
 *   @expired="handleExpired"
 *   @mounted="handleMounted"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/05/09
 */

defineOptions({
  name: 'ComponentsVKCaptcha',
})

// Propiedades del componente
const props = withDefaults(
  defineProps<{
    theme?: 'light' | 'dark'
    instanceId: string
    containerClass?: string
    errorText?: string
    siteKey?: string
  }>(),
  {
    theme: 'light',
    containerClass: '',
    errorText: '',
    siteKey: '',
  },
)

// Eventos emitidos por el componente
const emit = defineEmits<{
  (e: 'success', token: string): void
  (e: 'error', error: Error): void
  (e: 'expired'): void
  (e: 'mounted'): void
}>()

// Obtener el logger
const $logger = useNuxtApp().$logger

// Inicializar el manejador de captcha
const captchaHandler = useCaptchaHandler({
  siteKey: props.siteKey,
})

// Referencia al contenedor del captcha
const captchaContainerRef = ref<HTMLElement | null>(null)

// Función de renderizado de Turnstile (inyectada por el composable)
type RenderTurnstileWidgetFn = (
  container: HTMLElement,
  instanceId: string,
  onSuccess: (token: string) => void,
  onError: (error: Error) => void,
  onExpired: () => void
) => string | undefined

const renderTurnstileWidget = inject<RenderTurnstileWidgetFn>('renderTurnstileWidget')

// Verificar si hay un mensaje de error para mostrar
const showError = computed(() => {
  return props.errorText || (captchaHandler.isVerified(props.instanceId) ? '' : '')
})

// Callbacks para eventos de Turnstile
const onTurnstileSuccess = (token: string): void => {
  $logger.info(`Captcha completado con éxito: ${props.instanceId}`)
  emit('success', token)
}

const onTurnstileError = (error: Error): void => {
  $logger.error(`Error en captcha ${props.instanceId}:`, error)
  emit('error', error)
}

const onTurnstileExpired = (): void => {
  $logger.info(`Token de captcha expirado: ${props.instanceId}`)
  emit('expired')
}

// Inicialización y montaje del captcha
onMounted(async () => {
  $logger.info(`Montando componente captcha: ${props.instanceId}`)
  
  try {
    // Asegurar que Turnstile está inicializado
    const initialized = await captchaHandler.ensureInitialized()
    
    $logger.info(`Estado de inicialización de Turnstile: ${initialized ? 'OK' : 'Error'}`)
    
    if (!initialized) {
      $logger.error('No se pudo inicializar Turnstile')
      throw new Error('No se pudo inicializar Turnstile')
    }
    
    // Esperar a que el contenedor esté disponible en el DOM
    await nextTick()
    
    $logger.info(`Contenedor disponible: ${!!captchaContainerRef.value}`)
    $logger.info(`Función renderTurnstileWidget disponible: ${!!renderTurnstileWidget}`)
    
    if (captchaContainerRef.value && renderTurnstileWidget) {
      const widgetId = renderTurnstileWidget(
        captchaContainerRef.value,
        props.instanceId,
        onTurnstileSuccess,
        onTurnstileError,
        onTurnstileExpired
      )
      
      $logger.info(`Widget creado con ID: ${widgetId || 'null'}`)
      
      // Emitir evento de montaje
      emit('mounted')
    } else {
      $logger.error(`No se pudo renderizar el widget para ${props.instanceId}: contenedor o función no disponible`)
    }
  } catch (error) {
    $logger.error(`Error al montar el captcha ${props.instanceId}:`, error)
    onTurnstileError(error instanceof Error ? error : new Error(String(error)))
  }
})

// Limpieza al desmontar
onBeforeUnmount(() => {
  $logger.info(`Desmontando componente captcha: ${props.instanceId}`)
})

// Exponer métodos útiles para padres
defineExpose({
  reset: () => captchaHandler.reset(props.instanceId),
  getToken: () => captchaHandler.getToken(props.instanceId),
  isVerified: () => captchaHandler.isVerified(props.instanceId),
})
</script>

<template>
  <div :class="['vk-captcha', containerClass]">
    <!-- Contenedor para el captcha -->
    <div
      ref="captchaContainerRef"
      :class="['vk-captcha__container', `vk-captcha__container--${theme}`]"
      :data-turnstile-container="true"
      :data-instance-id="instanceId"
    ></div>
    
    <!-- Mensaje de error -->
    <div
      v-if="showError"
      class="vk-captcha__error mt-2 text-sm text-red-500"
    >
      {{ showError }}
    </div>
  </div>
</template>

<style scoped>
.vk-captcha {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.vk-captcha__container {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 70px;
}

.vk-captcha__error {
  text-align: center;
  width: 100%;
}
</style>
