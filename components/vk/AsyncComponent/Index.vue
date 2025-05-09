<script setup lang="ts">
/**
 * @component VKAsyncComponent
 * @description Componente para cargar componentes asincrónicamente con manejo automático de estados
 * Proporciona feedback visual durante la carga, manejo de errores, y soporte para Suspense.
 *
 * @props {string} path - Ruta del componente a cargar
 * @props {BasePath} basePath - Ruta base para la carga del componente
 * @props {number} delay - Retraso antes de mostrar el componente de carga (ms)
 * @props {number} timeout - Tiempo máximo de espera para la carga (ms)
 * @props {Component} loadingComponent - Componente personalizado para mostrar durante la carga
 * @props {Component} errorComponent - Componente personalizado para mostrar en caso de error
 * 
 * @emits start - Emitido cuando se inicia la carga del componente
 * @emits finish - Emitido cuando se finaliza la carga del componente
 *
 * @example
 * <VKAsyncComponent
 *   path="features/dashboard/Dashboard"
 *   basePath="@/modules/"
 *   :delay="300"
 *   @start="handleLoadingStart"
 *   @finish="handleLoadingFinish"
 * />
 *
 * @author Pablo Contreras
 * @since 2025/04/30
 */
import { useNuxtApp } from '#app'
import type { BasePath } from '@/composables/useAsyncComponent'
import { BASE_PATHS, useAsyncComponent } from '@/composables/useAsyncComponent'
import type { Component } from 'vue'
import { computed, watch } from 'vue'

defineOptions({
  name: 'ComponentsVKAsyncComponent',
})

// Acceder al logger
const $logger = useNuxtApp().$logger

// Definición explícita de props con tipado fuerte
const props = withDefaults(
  defineProps<{
    /**
     * Ruta del componente a cargar
     */
    path: string
    /**
     * Ruta base para la carga del componente
     */
    basePath?: BasePath
    /**
     * Retraso antes de mostrar el componente de carga (ms)
     */
    delay?: number
    /**
     * Tiempo máximo de espera (ms)
     */
    timeout?: number
    /**
     * Componente personalizado para mostrar durante la carga
     */
    loadingComponent?: Component | null
    /**
     * Componente personalizado para mostrar en caso de error
     */
    errorComponent?: Component | null
  }>(),
  {
    basePath: BASE_PATHS.MODULES as BasePath,
    delay: 200,
    timeout: 30000,
    loadingComponent: null,
    errorComponent: null,
  },
)

const emit = defineEmits<{
  (e: 'close' | 'start' | 'finish'): void
}>()

// Validar ruta del componente
if (!props.path) {
  $logger?.warn(
    'VKAsyncComponent: Se requiere especificar una ruta para el componente',
  )
}

// Usar el composable internamente
const asyncResult = useAsyncComponent(props.path, {
  basePath: props.basePath,
  delay: props.delay,
  timeout: props.timeout,
  loadingComponent: props.loadingComponent,
  errorComponent: props.errorComponent,
})

// Determinar el estado actual para mostrar solo un componente a la vez
const currentState = computed(() => {
  if (asyncResult.hasError.value) return 'error'
  if (asyncResult.isLoading.value) return 'loading'
  return 'ready'
})

// Observar cambios en el estado de carga para emitir eventos
let loadingStarted = false

watch(() => asyncResult.isLoading.value, (isLoading: unknown, oldIsLoading: unknown) => {
// Si cambia a true (inicia carga) y no había comenzado antes
  if (isLoading && !oldIsLoading && !loadingStarted) {
    loadingStarted = true
    emit('start')
  }
  
  // Si cambia a false (finaliza carga) y había comenzado antes
  if (!isLoading && oldIsLoading && loadingStarted) {
    loadingStarted = false
    emit('finish')
  }
}, { immediate: true })

// Para ser mostrado en las herramientas de desarrollo de Vue
defineExpose({
  retry: asyncResult.retry,
  error: asyncResult.error,
  isLoading: asyncResult.isLoading,
  hasError: asyncResult.hasError,
})
</script>

<template>
  <Suspense>
    <template #default>
      <component :is="asyncResult.component" />
    </template>

    <template #fallback>
      <div class="vk-async-component__fallback">
        <template v-if="currentState === 'error'">
          <component
            :is="asyncResult.errorComponent"
            :error="asyncResult.error"
            :retry="asyncResult.retry"
          />
        </template>
        <template v-else-if="currentState === 'loading'">
          <component :is="asyncResult.loadingComponent" />
        </template>
        <template v-else>
          <!-- Estado intermedio mientras Suspense resuelve -->
          <div class="vk-async-component__waiting">
            <component :is="asyncResult.loadingComponent" />
          </div>
        </template>
      </div>
    </template>
  </Suspense>
</template>

<style scoped>
.vk-async-component__fallback {
  width: 100%;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vk-async-component__waiting {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>