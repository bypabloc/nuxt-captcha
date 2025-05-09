// middleware/dev-only.ts
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  if (import.meta.server) {
    return
  }
  const nuxtApp = useNuxtApp()
  const $logger = nuxtApp.$logger
  const env = nuxtApp.$config.public.env

  $logger.info('Middleware de desarrollo:', env, to)

  const envAllowed = ['development', 'test', 'local']
  const isDev = envAllowed.includes(env)

  if (!isDev) {
    return navigateTo('/')
  }
})
