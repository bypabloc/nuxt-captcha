<script setup lang="ts">
/**
 * @component VKImageOverlay
 * @description Componente para mostrar una capa superpuesta sobre la imagen
 *
 * @props {string} color - Color de fondo de la capa
 * @props {string} opacity - Opacidad de la capa (0-1)
 *
 * @author Pablo Contreras
 * @since 2025/04/21
 */

defineOptions({
  name: 'ComponentsVKImageOverlay',
})

defineProps({
  color: {
    type: String,
    default: 'rgba(0, 0, 0, 0.5)',
  },
  opacity: {
    type: String,
    default: '0.5',
  },
})
</script>

<template>
  <div
    class="vk-imagen-overlay"
    :style="{
      backgroundColor: color,
      opacity: opacity,
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.vk-imagen-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
</style>
