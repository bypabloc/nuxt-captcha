declare global {
  interface ITranslationOptions {
    specificKey?: string
    transform?: (
      item: Record<string, unknown>,
      key: string,
      value: unknown,
    ) => Record<string, unknown>
    asArray?: boolean
    sortBy?: string
    reverse?: boolean
    params?: Record<string, unknown>
    itemsParams?:
      | Record<string, Record<string, unknown>>
      | Record<string, unknown>[]
  }

  interface II18n {
    t: (
      key: string,
      params?: Record<string, unknown> | ITranslationOptions,
    ) => string | Record<string, unknown> | unknown[]
    tm: (key: string) => Record<string, unknown> | unknown[]
    rt: (message: unknown, params?: Record<string, unknown>) => string
  }
}

export {}
