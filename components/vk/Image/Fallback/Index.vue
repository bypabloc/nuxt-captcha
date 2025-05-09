<script setup lang="ts">
/**
 * @component VKImageFallback
 * @description Componente para mostrar un fallback cuando la imagen no puede cargarse
 *
 * @props {string} text - Texto a mostrar como fallback
 *
 * @author Pablo Contreras
 * @since 2025/04/21
 */

defineOptions({
  name: 'ComponentsVKImageFallback',
})

defineProps({
  text: {
    type: String,
    default: 'Imagen no disponible',
  },
})
</script>

<template>
  <div class="vk-imagen-fallback">
    <slot>
      <span>{{ text }}</span>
    </slot>
  </div>
</template>

<style scoped>
.vk-imagen-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  color: #666;
  text-align: center;
  font-size: 0.875rem;
  border-radius: inherit;
  padding: 0.5rem;
  box-sizing: border-box;
}
</style>
