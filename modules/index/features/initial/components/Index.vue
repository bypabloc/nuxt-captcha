<script setup lang="ts">
/**
 * @component PreLaunchPage
 * @description Componente para la página inicial
 *
 * @author Pablo Contreras
 * @since 2025/05/01
 */

import Header from './Header.vue'
import MainHero from './MainHero.vue'
import WantToBeSponsor from './WantToBeSponsor.vue'
import WhatIsThis from './WhatIsThis.vue'

const $logger = useNuxtApp().$logger

onMounted(() => {
  $logger.info('onMounted StagesOfADebt')
})
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <Header />
    <MainHero />
    <WhatIsThis />
    <WantToBeSponsor />
  </div>
</template>

<style scoped></style>
