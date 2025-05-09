<script setup lang="ts">
/**
 * @component VKImageLoader
 * @description Componente para mostrar un indicador de carga mientras la imagen se está cargando
 *
 * @author Pablo Contreras
 * @since 2025/04/21
 */

defineOptions({
  name: 'ComponentsVKImageLoader',
})
</script>

<template>
  <div class="vk-imagen-loader">
    <div class="vk-imagen-loader__spinner" />
  </div>
</template>

<style scoped>
.vk-imagen-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.vk-imagen-loader__spinner {
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-top-color: #ccc;
  border-radius: 50%;
  animation: vk-imagen-spinner 0.8s linear infinite;
}

@keyframes vk-imagen-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
