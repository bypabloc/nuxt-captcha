/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Archivo de declaración de tipos para plugins de Nuxt
 * Define las extensiones de tipado para plugins personalizados como logger
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */

import type { Logger } from '@/plugins/logger'
import type { PluginOptions } from 'nuxt/app'

/**
 * Interfaz para los datos de prueba
 */
interface DATA_DUMMY {
  identityCode: string
  email: string
  serialNumber: string
  termsAndConditions: boolean
  [key: string]: string | boolean
}

// Extiende los tipos de Nuxt para reconocer nuestros plugins
declare module '#app' {
  interface NuxtApp {
    /**
     * Plugin logger para registrar mensajes en la consola con formato mejorado
     */
    $logger: Logger
    $config: {
      public: {
        env: string
        data_dummy: Record<string, any>
        [key: string]: string | Record<string, any>
      }
    }

    /**
     * Método para registrar hooks en la aplicación Nuxt
     */
    hook: (hook: string, callback: (args?: any) => void) => void

    /**
     * Método para eliminar hooks registrados
     */
    unhook: (hook: string) => void

    /**
     * Método para verificar si un hook existe
     */
    hookOnce: (hook: string, callback: (args?: any) => void) => void
  }
  interface DefineNuxtPluginOptions {
    setup(nuxtApp: INuxtAppExtension): unknown
  }
}

// Extiende los tipos para los composables y la API
declare module 'nuxt/dist/app/nuxt' {
  interface NuxtApp {
    /**
     * Plugin logger para registrar mensajes en la consola con formato mejorado
     */
    $logger: Logger
    $config: {
      public: {
        env: string
        data_dummy: Record<string, any>
        [key: string]: string | Record<string, any>
      }
    }

    /**
     * Método para registrar hooks en la aplicación Nuxt
     */
    hook: (hook: string, callback: (args?: any) => void) => void

    /**
     * Método para eliminar hooks registrados
     */
    unhook: (hook: string) => void

    /**
     * Método para verificar si un hook existe
     */
    hookOnce: (hook: string, callback: (args?: any) => void) => void
  }
}

// Extiende el contexto global de vue
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    /**
     * Plugin logger para registrar mensajes en la consola con formato mejorado
     */
    $logger: Logger
    $config: {
      public: {
        env: string
        data_dummy: Record<string, any>
        [key: string]: string | Record<string, any>
      }
    }

    /**
     * Método para registrar hooks en la aplicación Nuxt
     */
    hook: (hook: string, callback: (args?: any) => void) => void

    /**
     * Método para eliminar hooks registrados
     */
    unhook: (hook: string) => void

    /**
     * Método para verificar si un hook existe
     */
    hookOnce: (hook: string, callback: (args?: any) => void) => void
  }
}

export interface INuxtAppExtension extends NuxtApp {
  /**
   * Plugin logger para registrar mensajes en la consola con formato mejorado
   */
  $logger: Logger
  $config: {
    public: {
      env: string
      data_dummy: DATA_DUMMY
      [key: string]: string | DATA_DUMMY | any
    }
  }

  /**
   * Método para registrar hooks en la aplicación Nuxt
   */
  hook: (hook: string, callback: (args?: any) => void) => void

  /**
   * Método para eliminar hooks registrados
   */
  unhook: (hook: string) => void

  /**
   * Método para verificar si un hook existe
   */
  hookOnce: (hook: string, callback: (args?: any) => void) => void
}

declare module '#app' {
  // Sobrescribe el tipo de defineNuxtPlugin
  export function defineNuxtPlugin<Options extends PluginOptions>(
    plugin: Options & {
      setup?: (
        nuxtApp: INuxtAppExtension,
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      ) => void | Promise<void> | Record<string, any>
    },
  ): any
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtAppExtension extends INuxtAppExtension {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ITimelineStep extends TimelineStep {}
}

// Esto asegura que el archivo sea tratado como un módulo
export { }

