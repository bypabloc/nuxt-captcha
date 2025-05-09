<script setup lang="ts">
/**
 * @component PagesIndex
 * @description Página de inicio.
 *
 * @author Pablo Contreras
 * @since 2025/04/30
 */

defineOptions({
  name: 'PagesIndex',
})

const $config = useNuxtApp().$config
const $loading = useNuxtApp().$loading
const $logger = useNuxtApp().$logger

$logger.debug('IndexPage', 'index.vue', 'Cargando página de inicio', $config)

interface Step {
  name: string
  description: string
  path: string
}

const steps: Record<string, Step> = {
  'initial': {
    name: 'Initial',
    description: 'Pantalla de carga inicial',
    path: 'index/features/initial/components/Index',
  },
}

const currentStepLanding = computed(() => {
  const currentStepLanding = $config.public.currentStepLanding as string
  if (!currentStepLanding) {
    return 'initial'
  }
  return currentStepLanding
})

const currentStepData: Step = steps[currentStepLanding.value]

const handleLoadingStart = (): void => {
  $loading.show()
}
const handleLoadingFinish = (): void => {
  $loading.hide()
}
</script>

<template>
  <VKAsyncComponent
    :path="currentStepData.path"
    @start="handleLoadingStart"
    @finish="handleLoadingFinish"
  />
</template>

<style scoped></style>
