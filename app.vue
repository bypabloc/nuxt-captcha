<script setup lang="ts">
/**
 * Archivo principal de la aplicación que establece la estructura base.
 * Utiliza NuxtLayout para aplicar el layout correspondiente a cada página.
 *
 * @author Pablo Contreras
 * @since 2025/04/17
 */
</script>

<template>
  <div>
    <VKLoadingOverlay />
    <NuxtPage />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: 'Source Sans Pro', sans-serif;
  color: var(--vk-color-text-dark-gray);
  background-color: var(--vk-color-bg-white);
}
</style>
