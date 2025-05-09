<script setup lang="ts">
/**
 * @component Header
 * @description Componente de cabecera para la landing page
 *
 * @author Pablo Contreras
 * @since 2025/05/02
 */

// Para detectar si estamos en mobile
const display = useDisplay()

// Estado para el menú mobile
const mobileMenuOpen = ref(false)

// Función para alternar el menú mobile
const toggleMobileMenu = (): void => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Enlaces del navbar
const navLinks = [
  { text: '¿Qué es esto?', href: '#que-es' },
  { text: '¿Cómo funciona?', href: '#como-funciona' },
]

/**
 * Maneja el scroll suave hacia las secciones al hacer clic en los enlaces del menú
 *
 * @param {Event} event - Evento del clic
 * @param {string} href - Referencia del enlace (con formato #id)
 */
const scrollToSection = (event: Event, href: string): void => {
  // Prevenir comportamiento predeterminado del enlace
  event.preventDefault()

  // Cerrar el menú mobile si está abierto
  if (mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }

  // Obtener el ID de la sección (eliminando el # del href)
  const targetId = href.substring(1)
  const targetElement = document.getElementById(targetId)

  if (targetElement) {
    // Scroll suave hacia el elemento
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}
</script>

<template>
  <!-- Navbar -->
  <header class="bg-black text-white">
    <div
      :class="[
        'flex items-center justify-between py-3',
        display.isMobile.value ? ' mx-4' : ' mx-20',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center">
        <VKImage
          max-height="32"
          path="/logo-light.svg"
          alt="Logo"
        />
      </div>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex md:items-center md:gap-8">
        <a
          v-for="link in navLinks"
          :key="link.text"
          :href="link.href"
          class="text-white hover:text-green-400 transition-colors"
          @click="(e) => scrollToSection(e, link.href)"
        >
          {{ link.text }}
        </a>
      </nav>

      <!-- Mobile Menu Button -->
      <button
        v-if="display.isMobile.value"
        class="md:hidden text-white focus:outline-none"
        @click="toggleMobileMenu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden bg-black py-4 px-6 space-y-4"
    >
      <a
        v-for="link in navLinks"
        :key="link.text"
        :href="link.href"
        class="block text-white text-sm hover:text-green-400 py-2"
        @click="(e) => scrollToSection(e, link.href)"
      >
        {{ link.text }}
      </a>
    </div>
  </header>
</template>

<style scoped>
.landing-gradient {
  background: linear-gradient(to bottom, #111111, #1a2c1a);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
</style>
