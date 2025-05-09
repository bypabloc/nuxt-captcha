import type { Composer } from 'vue-i18n'

export { MyInterface }

declare global {
  interface MyInterface {
    some_field: number
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface I18n extends Composer {}
}

// Esto asegura que el archivo sea tratado como un módulo
export {}
