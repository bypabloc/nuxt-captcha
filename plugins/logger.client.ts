import { defineNuxtPlugin } from '#app/nuxt'

/**
 * Interfaz para definir los colores por nivel de log
 */
interface LogColors {
  INFO: string
  WARN: string
  ERROR: string
  DEBUG: string
  [key: string]: string
}

/**
 * Interface para acceso a las propiedades y métodos del store de prueba
 */
export interface Logger {
  info: (message: string, ...optionalParams: unknown[]) => void
  warn: (message: string, ...optionalParams: unknown[]) => void
  error: (message: string, ...optionalParams: unknown[]) => void
  debug: (message: string, ...optionalParams: unknown[]) => void
}

export default defineNuxtPlugin({
  name: 'logger',

  // https://nuxt.com/docs/guide/directory-structure/plugins#parallel-plugins
  // parallel: true,
  // dependsOn: ['my-plugin'],

  setup(nuxtApp: NuxtAppExtension) {
    const config = nuxtApp.$config || {}
    const ENV = (config?.public.env as string) || 'production'
    const ENVIRONMENTS_ALLOWED = ['local', 'dev']
    const ALLOWED = ENVIRONMENTS_ALLOWED.includes(ENV)

    const getFileOrigin = (): string => {
      const stack = new Error('log').stack || ''
      const stackLines = stack.split('\n')
      const filteredStackLines = stackLines.filter(
        (line: string) => !line.includes('logger.ts'),
      )

      for (const line of filteredStackLines) {
        const match = line.match(/\/_nuxt\/([\w-/.]+\.(ts|js|vue))/)
        if (match?.[1]) {
          return match[1].replace(/\?.*$/, '')
        }
      }
      return 'unknown'
    }

    // Añadimos tipo de retorno void aquí
    const logWithFileOrigin = (
      level: string,
      message: string,
      ...optionalParams: unknown[]
    ): void => {
      if (ALLOWED) {
        const colors: LogColors = {
          INFO: 'color: rgb(0,255,255)', // Azul claro -> 00FFFF
          WARN: 'color: rgb(255,241,118)', // Naranja -> FFF176
          ERROR: 'color: rgb(239,115,115)', // Rojo -> EF5350
          DEBUG: 'color: rgb(95,158,160)', // Verde -> 5F9EA0
        }

        const color = colors[level as keyof typeof colors] || colors.INFO
        const formattedMessage = `%c[${level}] [${getFileOrigin()}] ${message}`
        const params = optionalParams.length ? optionalParams : []

        // eslint-disable-next-line no-console
        console.log(formattedMessage, color, ...params)
      }
    }

    const logger = {
      info: (message: string, ...optionalParams: unknown[]): void =>
        logWithFileOrigin('INFO', message, ...optionalParams),
      warn: (message: string, ...optionalParams: unknown[]): void =>
        logWithFileOrigin('WARN', message, ...optionalParams),
      error: (message: string, ...optionalParams: unknown[]): void =>
        logWithFileOrigin('ERROR', message, ...optionalParams),
      debug: (message: string, ...optionalParams: unknown[]): void =>
        logWithFileOrigin('DEBUG', message, ...optionalParams),
    }

    return {
      provide: {
        logger,
      },
    }
  },
})
