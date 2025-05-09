/**
 * Interfaz genérica que representa la estructura estandarizada de respuesta de la API.
 *
 * @template T - El tipo de datos que contendrá la propiedad `data`.
 * @property {number} statusCode - El código de estado HTTP de la respuesta.
 * @property {boolean} status - Indica si la operación fue exitosa o no.
 * @property {string} detail - Mensaje descriptivo sobre el resultado de la operación.
 * @property {string | undefined | null} code - Código de error específico, si aplica.
 * @property {T} data - Los datos retornados por la API, tipados según el parámetro genérico T.
 */
interface ApiResponse<T> {
  statusCode: number
  status: boolean
  code: string | null
  detail: string
  data: T
}

/**
 * Interfaz que define los parámetros para realizar una solicitud a la API.
 *
 * @property {string} method - El método HTTP a utilizar (GET, POST, PUT, DELETE, etc.).
 * @property {boolean} useAuth - Indica si la solicitud debe incluir autenticación.
 * @property {object} [payload] - Datos opcionales a enviar en el cuerpo de la solicitud.
 */
interface ApiParams {
  method: string
  useAuth: boolean
  payload?: object
}

export type { ApiParams, ApiResponse }
