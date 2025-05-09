import { defineStore } from 'pinia'

/**
 * Store para almacenar parámetros que vengan el el hash de la URL.
 * Un middleware los recoge y los almacena aquí.
 *
 * @author Pablo Contreras
 * @since 2025-04-16
 */
export const useUrlHashParamsStore = defineStore('urlHashParams', () => {
  const _params: Ref<Record<string, string>> = ref({})

  /**
   * getters
   */
  const params = computed(() => _params.value)

  /**
   * Limpia el estado del store.
   */
  const clear = (): void => {
    _params.value = {}
  }
  /**
   * Setea los parámetros de la URL.
   * @param {Record<string, string>} params Parámetros de la URL
   */
  const setParams = (
    params: Record<string, string> | Record<never, never>,
  ): void => {
    _params.value = params
  }

  return { params, clear, setParams }
})
