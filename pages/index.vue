<script setup lang="ts">
/**
 * @component IndexPage
 * @description Página de inicio temporal que muestra un diseño estático.
 *
 * @author Pablo Contreras
 * @since 2025/04/30
 */

const $config = useNuxtApp().$config
const $loading = useNuxtApp().$loading
const $logger = useNuxtApp().$logger

$logger.debug('IndexPage', 'index.vue', 'Cargando página de inicio temporal', $config)

interface Step {
  name: string
  description: string
  path: string
}

const steps: Record<string, Step> = {
  'coming-soon': {
    name: 'ComingSoon',
    description: 'Página próximamente',
    path: 'root/features/coming-soon/components/Index',
  },
  'pre-launch': {
    name: 'PreLaunch',
    description: 'Página previa al lanzamiento',
    path: 'root/features/pre-launch/components/Index',
  },
}

const currentStepLanding = computed(() => {
  const currentStepLanding = $config.public.currentStepLanding as string
  if (!currentStepLanding) {
    return 'coming-soon'
  }
  return currentStepLanding
})

const currentStepData: Step = steps[currentStepLanding.value]
const logoutActions = useLogout()
onMounted(() => {
  logoutActions.logout({ shouldRedirect: false })
})

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
