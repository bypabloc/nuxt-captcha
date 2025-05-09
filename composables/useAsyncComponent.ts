/**
 * Composable para cargar componentes asincrónicamente con manejo mejorado de errores
 *
 * @author Pablo Contreras
 * @since 2025/04/30
 */
import { useNuxtApp } from '#app'
import type { Component, ComputedRef, Ref } from 'vue'
import { defineAsyncComponent, ref, shallowRef } from 'vue'

// Importamos fallbacks por defecto
import ErrorFallback from '@/components/ui/Import/Error/Index.vue'
import LoadingFallback from '@/components/ui/Import/Loading/Index.vue'

type AsyncImporter = () => Promise<{ default: Component }>
const modulesMap = import.meta.glob(
  ['@/modules/**/*.vue', '@/components/**/*.vue', '@/pages/**/*.vue'],
  { eager: false },
) as Record<string, AsyncImporter>

export type BasePath = '@/components/' | '@/modules/' | '@/' | '' | string

export const BASE_PATHS = {
  COMPONENTS: '/components/',
  MODULES: '/modules/',
  ROOT: '/',
  EMPTY: '',
} as const

export interface AsyncComponentOptions {
  basePath?: BasePath
  delay?: number
  timeout?: number
  loadingComponent?: Component | null
  errorComponent?: Component | null
  onError?: (
    error: Error,
    retry: () => void,
    fail: () => void,
    attempts: number,
  ) => void
}

export interface AsyncComponentResult {
  component: Component
  isLoading: Ref<boolean>
  hasError: ComputedRef<boolean>
  retry: () => void
  loadingComponent: Component
  errorComponent: Component
  error: Ref<Error | null>
}

const defaultOptions: AsyncComponentOptions = {
  basePath: BASE_PATHS.MODULES,
  delay: 200,
  timeout: 30000,
  loadingComponent: null,
  errorComponent: null,
}

export function useAsyncComponent(
  path: string,
  options: AsyncComponentOptions = {},
): AsyncComponentResult {
  const nuxtApp = useNuxtApp()
  const $logger = nuxtApp.$logger || console

  const merged = { ...defaultOptions, ...options }

  const {
    basePath,
    delay,
    timeout,
    loadingComponent,
    errorComponent,
    onError,
  }: AsyncComponentOptions = merged

  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const hasError = computed(() => !!error.value)
  const retryCallback = ref<() => void>(() => {})

  const defaultLoadingComponent = loadingComponent ?? LoadingFallback
  const defaultErrorComponent = errorComponent ?? ErrorFallback

  // Usamos shallowRef para evitar problemas de reactividad con componentes
  const loadingComponentRef = shallowRef<Component>(defaultLoadingComponent)
  const errorComponentRef = shallowRef<Component>(defaultErrorComponent)

  const normalize = (p: string): string => {
    const ext = p.endsWith('.vue') ? '' : '.vue'
    let nominal = `${p}${ext}`
    // Si no contiene alias @/, anteponer basePath
    if (
      !nominal.startsWith('@/') &&
      !nominal.startsWith('./') &&
      !nominal.startsWith('../')
    ) {
      nominal = `${basePath}${nominal}`
    }
    return nominal
  }

  const loader = async (): Promise<Component> => {
    try {
      isLoading.value = true

      const key = normalize(path)
      $logger.info(`Intentando cargar: ${key}`)

      const importer = modulesMap[key]
      if (!importer) {
        throw new Error(`Componente no encontrado en map: ${key}`)
      }

      // Importar el componente
      const mod = await importer()
      return mod.default
    } catch (e) {
      $logger.error(`Error al cargar el componente: ${path}`, e)
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err
      throw err
    } finally {
      $logger.info(`Carga finalizada: ${path}`)
      isLoading.value = false
    }
  }

  const errorHandler = (
    err: Error,
    retry: () => void,
    fail: () => void,
    attempts: number,
  ): void => {
    error.value = err
    isLoading.value = false
    retryCallback.value = retry

    $logger.error(`Error al cargar el componente (${attempts} intentos):`, err)

    if (onError) {
      onError(err, retry, fail, attempts)
    }
  }

  const component = defineAsyncComponent({
    loader,
    loadingComponent: loadingComponentRef.value,
    errorComponent: errorComponentRef.value,
    delay,
    timeout,
    suspensible: true,
    onError: errorHandler,
  })

  const retry = (): void => {
    if (hasError.value) {
      $logger.info(`Reintentando cargar: ${path}`)
      console.log(`Reintentando cargar el componente: ${path}`)
      error.value = null
      retryCallback.value()
    } else {
      console.warn(`No hay error para reintentar`)
      $logger.warn(`No hay error para reintentar`)
    }
  }

  return {
    component,
    isLoading,
    hasError,
    retry,
    loadingComponent: loadingComponentRef.value,
    errorComponent: errorComponentRef.value,
    error,
  }
}
