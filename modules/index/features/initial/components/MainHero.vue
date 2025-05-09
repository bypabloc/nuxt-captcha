<script setup lang="ts">
/**
 * @component MainHero
 *
 * @author Pablo Contreras
 * @since 2025/05/01
 */

// Para detectar si estamos en mobile
const display = useDisplay()

const $logger = useNuxtApp().$logger

const handleCountdownComplete = (): void => {
  $logger.info('Countdown completed')
}
</script>

<template>
  <!-- Section "MainHero" -->
  <section
    id="home"
    class="relative flex flex-col text-white overflow-hidden"
    style="height: calc(100vh - 48px)"
  >
    <!-- Contenedor de contenido con altura fija -->
    <div
      id="suscribirme"
      class="flex flex-col items-center gap-8 h-full self-stretch relative pt-4"
      :class="[display.isMobile.value ? 'pb-20' : 'pb-30']"
      style="background: linear-gradient(180deg, #212121 64.92%, #2e3b2d 100%)"
    >
      <!-- Content -->
      <div class="container text-center flex flex-col items-center gap-8">
        <div
          :class="[
            'flex items-start justify-center gap-8 px-4',
            display.isMobile.value ? 'flex-col' : 'flex-row',
          ]"
        />

        <!-- Registration Form -->
        <div class="text-center max-w-md px-4">
          <div class="flex flex-col md:items-center justify-center gap-4">
            <VKAsyncComponent
              path="index/features/pre-enrollment/components/PreEnrollment"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
