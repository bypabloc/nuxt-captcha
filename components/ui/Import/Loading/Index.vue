<script setup lang="ts">
/**
 * Componente que muestra un indicador de carga
 *
 * @author Pablo Contreras
 * @created 2025/04/30
 */
</script>

<template>
  <div class="loading-indicator">
    <div class="spinner" />
    <div class="loading-text">Cargando componente...</div>
  </div>
</template>

<style scoped>
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 100px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4285f4;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
