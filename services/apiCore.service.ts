import { useRouter, useRuntimeConfig } from '#app'
import type { ApiParams, ApiResponse } from '~/types/apiResponse.types'

const genericError: ApiResponse<object> = {
  statusCode: 500,
  status: false,
  code: null,
  detail: 'Unknown error',
  data: {},
}

/**
 * Servicio para manejar solicitudes API al core.
 *
 * @author Pablo Contreras
 * @since 2025-04-09
 */
export const apiCoreService = {
  /**
   * Realiza una solicitud a un endpoint del core específico.
   *
   * @param {string} url - La URL a la que se realizará la solicitud
   * @param {ApiParams} params - Los parámetros para la solicitud API
   * @param {boolean} [params.useAuth] - Si necesita autenticación (por defecto: true)
   * @param {string} params.method - Método HTTP para la solicitud (GET, POST, etc.)
   * @param {object} [params.payload] - Cuerpo de la solicitud (opcional)
   *
   * @returns {Promise<ApiResponse>} Una promesa que se resuelve en una respuesta API
   * @returns {string} response.status - El estado de la respuesta API
   * @returns {string} response.detail - Información detallada sobre la respuesta
   * @returns {any} response.data - Los datos devueltos por la API
   *
   * @throws {Error} Captura y registra cualquier error, devuelve una respuesta de error genérica
   */
  async request(url: string, params: ApiParams): Promise<ApiResponse<object>> {
    const configVars = useRuntimeConfig()
    const router = useRouter()
    const apiBaseUrl = configVars.public.apiBaseUrl
    try {
      const useAuth = params.useAuth === undefined ? true : params.useAuth
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      if (useAuth) {
        const token = localStorage.getItem('auth.token')
        headers.Authorization = `JWT ${token}`
      }

      const fetchParams: RequestInit = {
        method: params.method,
        headers,
      }

      if (params.method !== 'GET') {
        fetchParams.body = JSON.stringify(params.payload || {})
      }

      const response: Response = await fetch(`${apiBaseUrl}${url}`, fetchParams)

      const responseJson = await response.json()
      const {
        status,
        detail,
        data,
      }: { status: boolean; detail: string; data: object } = responseJson

      if (useAuth && response.status === 401) {
        router.push('/logout')
      }

      return {
        statusCode: response.status,
        status,
        code: responseJson.code || null,
        detail,
        data,
      } as ApiResponse<object>
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in API request:', error)
      return genericError
    }
  },
}
