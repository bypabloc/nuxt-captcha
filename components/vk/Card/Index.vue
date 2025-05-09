<script setup lang="ts">
/**
 * @component VKCard
 * @description Componente de tarjeta para mostrar contenido con soporte para cabecera, cuerpo y pie
 *
 * @props {string} variant - Variante visual de la tarjeta (default, flat, outlined)
 * @props {boolean} hoverEffect - Si la tarjeta debe mostrar efecto al pasar el ratón
 * @props {string} maxWidth - Ancho máximo de la tarjeta (auto, sm, md, lg, xl, full)
 * @props {string} bgColor - Color de fondo de la tarjeta (clases de Tailwind)
 *
 * @slots header - Contenido para la cabecera de la tarjeta
 * @slots default - Contenido principal de la tarjeta
 * @slots footer - Contenido para el pie de la tarjeta
 * @slots image - Contenido para una imagen en la parte superior de la tarjeta
 *
 * @example
 * <VKCard>
 *   <template #header>
 *     <h3 class="text-lg font-medium">Título de la tarjeta</h3>
 *   </template>
 *
 *   <p>Contenido principal de la tarjeta...</p>
 *
 *   <template #footer>
 *     <div class="flex justify-end">
 *       <VKButton>Acción</VKButton>
 *     </div>
 *   </template>
 * </VKCard>
 *
 * @author Pablo Contreras
 * @since 2025/04/14
 */
import type { CSSProperties } from 'vue';

defineOptions({
  name: 'ComponentsVKCard',
})

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'flat' | 'outlined'
    hoverEffect?: boolean
    maxWidth?: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
    bgColor?: string
    noBodyPadding?: boolean
    backgroundLayerStyle?: CSSProperties
    overlayLayerStyle?: CSSProperties
    contentWrapperFullHeightFlexCol?: boolean
  }>(),
  {
    variant: 'default',
    hoverEffect: false,
    maxWidth: 'auto',
    bgColor: 'bg-white',
    noBodyPadding: false,
    backgroundLayerStyle: undefined,
    overlayLayerStyle: undefined,
    contentWrapperFullHeightFlexCol: false,
  },
)

const cardClasses = computed(() => [
  props.backgroundLayerStyle ? '' : props.bgColor,
  'overflow-hidden rounded-lg',
  {
    'shadow-vk': props.variant === 'default',
    'border border-gray-200': props.variant === 'outlined',
    'hover:shadow-lg transition-shadow duration-300': props.hoverEffect,
    'max-w-sm mx-auto': props.maxWidth === 'sm',
    'max-w-md mx-auto': props.maxWidth === 'md',
    'max-w-lg mx-auto': props.maxWidth === 'lg',
    'max-w-xl mx-auto': props.maxWidth === 'xl',
    'w-full': props.maxWidth === 'full',
  },
])

const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)
const hasImage = computed(() => !!slots.image)

const slots = useSlots()
</script>

<template>
  <div :class="cardClasses">
    <div
      class="relative z-[1]"
      :class="{ 'flex flex-col h-full': contentWrapperFullHeightFlexCol }"
    >
      <div
        v-if="backgroundLayerStyle"
        class="absolute inset-0"
        :style="backgroundLayerStyle"
      />
      <div
        v-if="overlayLayerStyle"
        class="absolute inset-0"
        :style="overlayLayerStyle"
      />

      <div
        v-if="hasImage && !backgroundLayerStyle"
        class="relative"
      >
        <slot name="image" />
      </div>

      <div
        v-if="hasHeader"
        class="relative px-4 py-3 border-b border-gray-200"
      >
        <slot name="header" />
      </div>

      <div
        :class="[
          !noBodyPadding ? 'px-4 py-5 sm:p-6' : '',
          'flex-grow',
          'relative',
        ]"
      >
        <slot />
      </div>

      <div
        v-if="hasFooter"
        class="relative px-4 py-3 border-t border-gray-200 bg-gray-50"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.shadow-vk {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
}
</style>
