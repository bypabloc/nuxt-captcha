<script setup lang="ts" generic="T extends { id: number }">
/**
 * @component VKCarousel
 * @description Componente de carrusel responsivo.
 *              Desktop: Muestra N items por página, desliza página completa.
 *              Mobile: Muestra 4 items (2x2 grid) por página, desliza página completa.
 *              Botones de navegación pueden ser ocultados por breakpoint
 *
 * @author Pablo Contreras
 * @since 2025/05/04
 */

import type { ColorName } from '@/design-system/presets/colors.preset';
import { COLOR_NAMES } from '@/design-system/presets/colors.preset';

const display = useDisplay()

const props = withDefaults(
  defineProps<{
    items: T[] // Use the generic type T for items
    desktopVisibleItems?: number
    mobileVisibleItems?: 1 | 4 // Use literal types for validator equivalent
    autoplay?: boolean
    autoplaySpeed?: number
    showNavButtonsDesktop?: boolean
    showNavButtonsMobile?: boolean
    navButtonIconColor?: ColorName
    navButtonBackgroundColor?: ColorName
  }>(),
  {
    // Default values
    desktopVisibleItems: 4,
    mobileVisibleItems: 4,
    autoplay: false,
    autoplaySpeed: 3000,
    showNavButtonsDesktop: true,
    showNavButtonsMobile: true,
    navButtonIconColor: COLOR_NAMES.DARK_GRAY as ColorName,
    navButtonBackgroundColor: COLOR_NAMES.WHITE as ColorName,
  },
)

const currentIndex = ref(0)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

const effectiveVisibleItems = computed(() => {
  // Define cuántos elementos constituyen una "página" basado en breakpoints
  return display.mobileOrTablet.value
    ? props.mobileVisibleItems
    : props.desktopVisibleItems
})

// --- Cálculos de páginas ---
const totalPages = computed(() => {
  // Número total de páginas
  if (
    !props.items ||
    props.items.length === 0 ||
    effectiveVisibleItems.value <= 0
  )
    return 0
  return Math.ceil(props.items.length / effectiveVisibleItems.value)
})

const currentPageIndex = computed(() => {
  if (
    effectiveVisibleItems.value <= 0 ||
    !props.items ||
    props.items.length === 0
  )
    return 0
  // Asegura que el currentIndex se alinee con el inicio de la página antes de calcular
  const validIndex = Math.min(currentIndex.value, maxIndex.value)
  return Math.floor(validIndex / effectiveVisibleItems.value)
})

const maxIndex = computed(() => {
  // Valor más alto del currentIndex (índice de inicio de la última página)
  if (
    !props.items ||
    props.items.length === 0 ||
    effectiveVisibleItems.value <= 0
  )
    return 0
  // Asegura que no calculemos un índice negativo si items < visibleItems
  return Math.max(0, props.items.length - effectiveVisibleItems.value)
})

const prev = (): void => {
  // Volver una página hacia atrás
  const newIndex = currentIndex.value - effectiveVisibleItems.value
  if (newIndex >= 0) {
    currentIndex.value = Math.max(0, newIndex)
  }
  stopAutoplay()
}

const next = (event?: MouseEvent | boolean): void => {
  const isAutoplay = typeof event === 'boolean' ? event : false
  // Avanzar una página
  const newIndex = currentIndex.value + effectiveVisibleItems.value
  if (newIndex <= maxIndex.value) {
    currentIndex.value = newIndex
  } else if (currentIndex.value < maxIndex.value) {
    // Si no está alineado perfectamente, va al primer índice de la última página
    currentIndex.value = maxIndex.value
  } else if (props.autoplay && totalPages.value > 1) {
    // Volver al inicio si hay autoplay y hay más de una página
    currentIndex.value = 0
  }
  
  // Only stop autoplay on manual navigation
  if (!isAutoplay) {
    stopAutoplay()
  }
}

const goToSlide = (pageIndex: number): void => {
  // Ir al índice específico de una página
  const newIndex = pageIndex * effectiveVisibleItems.value
  // Asegura que no se exceda el maxIndex calculado
  currentIndex.value = Math.max(0, Math.min(newIndex, maxIndex.value))
  stopAutoplay()
}

const startAutoplay = (): void => {
  stopAutoplay()
  // Solo inicia autoplay si se habilita en la prop y hay más de 1 página
  if (props.autoplay && totalPages.value > 1) {
    autoplayInterval = setInterval(() => {
      // Usa 'next' para avanzar páginas, indicando que es autoplay
      next(true)
    }, props.autoplaySpeed)
  }
}

const stopAutoplay = (): void => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

// --- Mobile Specific Grouping ---
const groupedItemsMobileGrid = computed(() => {
  // This is specifically for the 4-item (2x2) grid layout
  if (
    !display.mobileOrTablet.value ||
    props.mobileVisibleItems !== 4 ||
    !props.items
  )
    return []
  const chunkSize = 4 // Items per page in 2x2 grid
  const result = []
  for (let i = 0; i < props.items.length; i += chunkSize) {
    result.push(props.items.slice(i, i + chunkSize))
  }
  return result
})

// Computed property to decide if nav buttons should be shown
const shouldShowNavButtons = computed(() => {
  if (display.mobileOrTablet.value) {
    return props.showNavButtonsMobile
  } else {
    return props.showNavButtonsDesktop
  }
})

// Computed property to check if 'prev' should be disabled
const isPrevDisabled = computed(() => {
  return currentIndex.value === 0
})

// Computed property to check if 'next' should be disabled
const isNextDisabled = computed(() => {
  if (!props.items || props.items.length === 0) return true
  // Disable if already showing the last item(s)
  return currentIndex.value >= maxIndex.value
})

// Variable CSS para los items visibles en escritorio
const carouselStyle = computed(() => ({
  '--visible-items-desktop': props.desktopVisibleItems,
}))

// Add responsive controls for navigation button spacing
const navButtonSpacing = computed(() => {
  if (display.mobile.value) {
    return 'mx-1' // Smaller margin on very small screens
  }
  return 'mx-2' // Default margin
})

// Add control for carousel width constraints
const carouselContainerClass = computed(() => {
  if (display.mobile.value) {
    return 'w-full max-w-full overflow-hidden flex-shrink-1'
  }
  return 'overflow-hidden flex-grow'
})

// Add a computed property for mobile item container padding
const mobileItemContainerClass = computed(() => {
  if (display.mobile.value) {
    // Different padding for very small screens
    if (window.innerWidth < 400) {
      return 'px-1'
    }
    return 'px-2'
  }
  return 'px-4'
})

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

watch(
  (): [boolean, number, number] => [
    display.mobileOrTablet.value,
    props.desktopVisibleItems,
    props.mobileVisibleItems,
  ],
  (
    [isNowMobile, newDesktopItems, newMobileItems]: [boolean, number, number],
    [wasMobile, oldDesktopItems, oldMobileItems]: [boolean, number, number],
  ) => {
    // Ensure props are treated as numbers, providing fallbacks if necessary (though props should guarantee numbers)
    const oldDesktop =
      typeof oldDesktopItems === 'number'
        ? oldDesktopItems
        : props.desktopVisibleItems
    const oldMobile =
      typeof oldMobileItems === 'number'
        ? oldMobileItems
        : props.mobileVisibleItems
    const newDesktop =
      typeof newDesktopItems === 'number'
        ? newDesktopItems
        : props.desktopVisibleItems
    const newMobile =
      typeof newMobileItems === 'number'
        ? newMobileItems
        : props.mobileVisibleItems

    // Determine old and new items per page based on the breakpoint *before* and *after* the change
    // Ensure wasMobile and isNowMobile are treated as booleans
    const oldVisibleItems = wasMobile ? oldMobile : oldDesktop
    const newVisibleItems = isNowMobile ? newMobile : newDesktop

    if (oldVisibleItems === newVisibleItems) return // No change in visible items, no need to adjust index

    // Calculate the approximate page the user was on before the change
    // Ensure division by zero is avoided and types are numbers
    const currentApproxPage =
      oldVisibleItems > 0 ? Math.floor(currentIndex.value / oldVisibleItems) : 0

    // Calculate the new starting index for that page with the new item count
    const newIndex = currentApproxPage * newVisibleItems

    // Recalculate maxIndex based on the *new* configuration
    // Ensure props.items.length is treated as a number
    const itemsLength = props.items?.length ?? 0
    const newMaxIndex = Math.max(0, itemsLength - newVisibleItems)

    // Adjust index: ensure it's within bounds [0, newMaxIndex]
    currentIndex.value = Math.max(0, Math.min(newIndex, newMaxIndex))

    // Restart autoplay if needed
    startAutoplay()
  },
  { deep: true }, // Watch nested properties if display is reactive object
)
</script>

<template>
  <div
    class="carousel-wrapper w-full"
    :style="carouselStyle"
  >
    <!-- Unified Carousel View for Desktop and Mobile -->
    <div class="flex items-center w-full">
      <!-- Prev Button -->
      <button
        v-if="shouldShowNavButtons"
        class="carousel-nav-button flex-shrink-0 rounded-full p-2 focus:outline-none disabled:opacity-25 hover:enabled:bg-gray-100 cursor-pointer disabled:cursor-default"
        :class="[`vk-color-bg-${navButtonBackgroundColor}`, navButtonSpacing]"
        :disabled="isPrevDisabled"
        @click="prev"
      >
        <VKIcon
          icon="chevron-left"
          :size="display.mobile.value ? '32' : '42'"
          :color="navButtonIconColor"
        />
      </button>

      <!-- Carousel Items Container -->
      <div :class="carouselContainerClass">
        <div
          class="flex transition-transform duration-300 ease-in-out"
          :style="{ transform: `translateX(-${currentPageIndex * 100}%)` }"
        >
          <!-- Desktop Rendering: Linear Items -->
          <template v-if="!display.mobileOrTablet.value">
            <div
              v-for="item in items"
              :key="item.id"
              class="carousel-item-width flex-shrink-0"
            >
              <div class="px-2 py-2 h-full">
                <slot
                  name="item"
                  :item="item"
                />
              </div>
            </div>
          </template>

          <!-- Mobile Rendering -->
          <template v-else>
            <!-- Mobile: 2x2 Grid per Page -->
            <template v-if="mobileVisibleItems === 4">
              <div
                v-for="(pageItems, pageIdx) in groupedItemsMobileGrid"
                :key="`mobile-grid-page-${pageIdx}`"
                class="mobile-page-container w-full flex-shrink-0"
              >
                <div class="grid grid-cols-2 gap-2 sm:gap-4 p-1">
                  <div
                    v-for="item in pageItems"
                    :key="`mobile-grid-item-${item.id}`"
                    class="mobile-grid-item"
                  >
                    <div class="h-full">
                      <slot
                        name="item"
                        :item="item"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Mobile: 1 Item per Page -->
            <template v-else-if="mobileVisibleItems === 1">
              <div
                v-for="item in items"
                :key="`mobile-single-${item.id}`"
                class="mobile-single-item-container w-full flex-shrink-0 flex justify-center items-center"
                :class="mobileItemContainerClass"
              >
                <div class="mobile-item-wrapper">
                  <slot
                    name="item"
                    :item="item"
                  />
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>

      <!-- Next Button -->
      <button
        v-if="shouldShowNavButtons"
        class="carousel-nav-button flex-shrink-0 rounded-full p-2 focus:outline-none disabled:opacity-25 hover:enabled:bg-gray-100 cursor-pointer disabled:cursor-default"
        :class="[`vk-color-bg-${navButtonBackgroundColor}`, navButtonSpacing]"
        :disabled="isNextDisabled"
        @click="next"
      >
        <VKIcon
          icon="chevron-right"
          :size="display.mobile.value ? '32' : '42'"
          :color="navButtonIconColor"
        />
      </button>
    </div>

    <!-- Indicator Dots (Represent Pages) -->
    <div
      v-if="items && totalPages > 1"
      class="flex justify-center mt-4"
    >
      <button
        v-for="(_, pageIndex) in Array.from({ length: totalPages })"
        :key="pageIndex"
        class="h-2 w-2 mx-1 rounded-full focus:outline-none transition-colors duration-300"
        :class="
          currentPageIndex === pageIndex
            ? 'bg-green-500'
            : 'bg-gray-300 hover:bg-gray-400'
        "
        @click="goToSlide(pageIndex)"
      />
    </div>
  </div>
</template>

<style scoped>
.carousel-nav-button {
  align-self: center;
  z-index: 10;
}

/* Desktop width */
@media (min-width: 768px) {
  .carousel-item-width {
    width: calc(100% / var(--visible-items-desktop));
  }
}

/* Mobile specific styles */
@media (max-width: 639px) {
  .carousel-nav-button {
    padding: 0.25rem; /* Smaller padding on very small screens */
  }
}

.mobile-page-container,
.mobile-single-item-container {
  /* Ensure pages take up full width */
  box-sizing: border-box;
  width: 100%;
}

.mobile-item-wrapper {
  width: 100%;
  max-width: 280px;
}

@media (min-width: 400px) and (max-width: 639px) {
  .mobile-item-wrapper {
    max-width: 320px;
  }
}

@media (min-width: 640px) and (max-width: 959px) {
  .mobile-item-wrapper {
    max-width: 400px;
  }
}
</style>
