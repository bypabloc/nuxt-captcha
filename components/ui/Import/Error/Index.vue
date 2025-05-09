<script setup lang="ts">
/**
 * @component ErrorFallback
 * @description Componente que se muestra cuando ocurre un error al cargar un componente asíncrono
 *
 * @author Pablo Contreras
 * @since 2025/04/30
 */

// Definimos las props para recibir el error y la función de reintento
defineProps<{
  error?: Error | null | unknown
  retry?: () => void
}>()
</script>

<template>
  <div class="error-container">
    <div class="error-card">
      <div class="error-icon">
        <svg
          class="w-16 h-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h2 class="error-title">Error al cargar el componente</h2>
      <p
        v-if="error"
        class="error-message"
      >
        {{ error instanceof Error ? error.message : String(error) }}
      </p>
      <button
        v-if="retry"
        class="retry-button"
        @click="retry"
      >
        Intentar nuevamente
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 2rem;
}

.error-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  max-width: 400px;
}

.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.retry-button {
  background-color: #ef4444;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #dc2626;
}
</style>
