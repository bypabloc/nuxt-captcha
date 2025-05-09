import { apiCoreService } from '@/services/apiCore.service'


// Interfaces utilizadas en este archivo

/**
 * Respuesta de lista de ofertas.
 */
export interface ListResponse {
  results: Array<{
    id: string
    name: string
    [key: string]: any
  }>
  count: number
  [key: string]: any
}

/**
 * Respuesta de detalles de una oferta.
 */
export interface DetailsResponse {
  id: string
  name: string
  description?: string
  [key: string]: any
}

/**
 * Datos requeridos para suscribirse (sin autenticación).
 */
export interface SubscribeData {
  email: string
  context: Record<string, any>
  source: string
  tagSource?: string
}

/**
 * Respuesta del endpoint subscribeTests.
 */
export interface SubscribeResponse {
  success: boolean
  message?: string
  [key: string]: any
}

/**
 * Datos requeridos para suscribirse (con autenticación).
 */
export interface SubscribeTestsAuthData {
  context: string
  source: string
  tagSource?: string
}

/**
 * Respuesta del endpoint subscribeTestsAuth.
 */
export interface SubscribeTestsAuthResponse {
  success: boolean
  message?: string
  [key: string]: any
}


/**
 * Servicio API para obtener ofertas
 * @author Pablo Contreras
 * @since 2025-04-14
 */
export const testsApi = {
  /**
   * Obtiene la lista de ofertas asociadas al usuario autenticado.
   *
   * @returns {Promise<ListResponse>} Promesa que se resuelve con la
   * respuesta de la lista de ofertas
   */
  async getTests(): Promise<ListResponse> {
    const url = '/tests/by-user/'
    const params = {
      method: 'GET',
      useAuth: true,
    }
    const response = (await apiCoreService.request(
      url,
      params,
    )) as ListResponse
    return response
  },

  /**
   * Obtiene los detalles de una oferta específica.
   *
   * @param {string} offerId - ID de la oferta (candidate) a obtener
   * @returns {Promise<DetailsResponse>} Promesa que se resuelve con la
   * respuesta de los detalles de la oferta
   */
  async getOfferDetails(offerId: string): Promise<DetailsResponse> {
    const url = `/tests/detail/${offerId}/`
    const params = {
      method: 'GET',
      useAuth: true,
    }
    const response = (await apiCoreService.request(
      url,
      params,
    )) as DetailsResponse
    return response
  },

  /**
   * Endpoint genérico sin autenticación.
   * @param {SubscribeData} data - Datos requeridos
   * @param {string} turnstileToken - Token turnstile (captcha)
   * @returns {Promise<SubscribeResponse>} Promesa que se resuelve con la
   * respuesta del endpoint
   *
   * @author Pablo Contreras
   * @since 2025-04-25
   */
  async subscribeTests(
    data: SubscribeData,
    turnstileToken: string | undefined,
  ): Promise<SubscribeResponse> {
    const url = '/tests/subscribe-tests/'
    const params = {
      method: 'POST',
      payload: {
        email: data.email,
        context: data.context,
        source: data.source,
        tag_source: data.tagSource,
        'cf-turnstile-response': turnstileToken,
      },
      useAuth: false,
    }
    const response = (await apiCoreService.request(
      url,
      params,
    )) as SubscribeResponse
    return response
  },

  /**
   * Endpoint genérico sin autenticación.
   * @param {SubscribeData} data - Datos requeridos
   * @param {string} turnstileToken - Token turnstile (captcha)
   * @returns {Promise<SubscribeResponse>} Promesa que se resuelve con la
   * respuesta del endpoint
   *
   * @author Pablo Contreras
   * @since 2025-04-25
   */
  async subscribeTestsAuth(
    data: SubscribeTestsAuthData,
  ): Promise<SubscribeTestsAuthResponse> {
    const url = '/tests/subscribe-tests-auth/'
    const params = {
      method: 'POST',
      payload: {
        context: data.context,
        source: data.source,
        tag_source: data.tagSource,
      },
      useAuth: true,
    }
    const response = (await apiCoreService.request(
      url,
      params,
    )) as SubscribeTestsAuthResponse
    return response
  },
}