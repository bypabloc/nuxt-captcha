<script setup lang="ts">
/**
 * @component TypographyPage
 * @description Página de demostración de los diferentes estilos tipográficos del sistema de diseño
 *
 * @author Pablo Contreras
 * @since 2025/04/23
 */

// Importando los tipos específicos desde el módulo de tipografía
import type {
  TypographyStyle,
  TypographyVariant,
} from '@/design-system/presets/typography.preset'

definePageMeta({
  layout: 'app',
  middleware: 'dev-only',
})

// Definimos interfaces para nuestros elementos tipográficos
interface TypographyItem {
  style: TypographyStyle
  variant: TypographyVariant
  text: string
}

interface TypographyGroup {
  title: string
  items: TypographyItem[]
}

// Definimos nuestros grupos con el tipo correcto
const typographyGroups: TypographyGroup[] = [
  {
    title: 'Hero',
    items: [
      {
        style: 'hero',
        variant: 'light',
        text: 'Hero Light - La tipografía más grande del sistema',
      },
      {
        style: 'hero',
        variant: 'bold',
        text: 'Hero Bold - Usada para encabezados principales',
      },
    ],
  },
  {
    title: 'Títulos',
    items: [
      {
        style: 'title-1',
        variant: 'light',
        text: 'Title 1 Light - Título de primer nivel',
      },
      {
        style: 'title-1',
        variant: 'bold',
        text: 'Title 1 Bold - Título de primer nivel destacado',
      },
      {
        style: 'title-2',
        variant: 'light',
        text: 'Title 2 Light - Título de segundo nivel',
      },
      {
        style: 'title-2',
        variant: 'bold',
        text: 'Title 2 Bold - Título de segundo nivel destacado',
      },
      {
        style: 'title-3',
        variant: 'light',
        text: 'Title 3 Light - Título de tercer nivel',
      },
      {
        style: 'title-3',
        variant: 'bold',
        text: 'Title 3 Bold - Título de tercer nivel destacado',
      },
    ],
  },
  {
    title: 'Subtítulos',
    items: [
      {
        style: 'subtitle-1',
        variant: 'light',
        text: 'Subtitle 1 Light - Subtítulo de primer nivel',
      },
      {
        style: 'subtitle-1',
        variant: 'regular',
        text: 'Subtitle 1 Regular - Subtítulo de primer nivel normal',
      },
      {
        style: 'subtitle-1',
        variant: 'medium',
        text: 'Subtitle 1 Medium - Subtítulo de primer nivel medio',
      },
      {
        style: 'subtitle-1',
        variant: 'bold',
        text: 'Subtitle 1 Bold - Subtítulo de primer nivel destacado',
      },

      {
        style: 'subtitle-2',
        variant: 'regular',
        text: 'Subtitle 2 Regular - Subtítulo de segundo nivel',
      },
      {
        style: 'subtitle-2',
        variant: 'bold',
        text: 'Subtitle 2 Bold - Subtítulo de segundo nivel destacado',
      },

      {
        style: 'subtitle-3',
        variant: 'light',
        text: 'Subtitle 3 Light - Subtítulo de tercer nivel',
      },
      {
        style: 'subtitle-3',
        variant: 'regular',
        text: 'Subtitle 3 Regular - Subtítulo de tercer nivel normal',
      },
      {
        style: 'subtitle-3',
        variant: 'bold',
        text: 'Subtitle 3 Bold - Subtítulo de tercer nivel destacado',
      },
      {
        style: 'subtitle-3',
        variant: 'oblique',
        text: 'Subtitle 3 Oblique - Subtítulo de tercer nivel cursiva',
      },
      {
        style: 'subtitle-3',
        variant: 'oblique-bold',
        text: 'Subtitle 3 Oblique Bold - Subtítulo de tercer nivel cursiva destacada',
      },

      {
        style: 'subtitle-4',
        variant: 'light',
        text: 'Subtitle 4 Light - Subtítulo de cuarto nivel',
      },
      {
        style: 'subtitle-4',
        variant: 'regular',
        text: 'Subtitle 4 Regular - Subtítulo de cuarto nivel normal',
      },
      {
        style: 'subtitle-4',
        variant: 'bold',
        text: 'Subtitle 4 Bold - Subtítulo de cuarto nivel destacado',
      },
      {
        style: 'subtitle-4',
        variant: 'oblique',
        text: 'Subtitle 4 Oblique - Subtítulo de cuarto nivel cursiva',
      },
      {
        style: 'subtitle-4',
        variant: 'oblique-bold',
        text: 'Subtitle 4 Oblique Bold - Subtítulo de cuarto nivel cursiva destacada',
      },
    ],
  },
  {
    title: 'Texto de cuerpo',
    items: [
      {
        style: 'body',
        variant: 'light',
        text: 'Body Light - Texto ligero para el cuerpo de la página.',
      },
      {
        style: 'body',
        variant: 'regular',
        text: 'Body Regular - Texto normal para el cuerpo de la página. Se utiliza para la mayoría del contenido textual.',
      },
      {
        style: 'body',
        variant: 'bold',
        text: 'Body Bold - Texto en negrita para destacar partes importantes dentro del cuerpo.',
      },
      {
        style: 'body',
        variant: 'oblique',
        text: 'Body Oblique - Texto en cursiva para enfatizar conceptos o términos especiales.',
      },
      {
        style: 'body',
        variant: 'oblique-bold',
        text: 'Body Oblique Bold - Texto en cursiva y negrita para enfatizar con mayor intensidad.',
      },
    ],
  },
  {
    title: 'Leyendas',
    items: [
      {
        style: 'caption',
        variant: 'light',
        text: 'Caption Light - Texto pequeño para leyendas o notas al pie.',
      },
      {
        style: 'caption',
        variant: 'regular',
        text: 'Caption Regular - Texto normal para leyendas o descripciones breves.',
      },
      {
        style: 'caption',
        variant: 'bold',
        text: 'Caption Bold - Texto destacado para leyendas importantes.',
      },
      {
        style: 'caption',
        variant: 'oblique',
        text: 'Caption Oblique - Texto en cursiva para leyendas de énfasis.',
      },
      {
        style: 'caption',
        variant: 'oblique-bold',
        text: 'Caption Oblique Bold - Texto en cursiva y negrita para leyendas con mayor énfasis.',
      },
    ],
  },
  {
    title: 'Botones',
    items: [
      {
        style: 'button',
        variant: 'bold',
        text: 'BUTTON BOLD - TEXTO PARA BOTONES PRINCIPALES',
      },
      {
        style: 'button-small',
        variant: 'bold',
        text: 'BUTTON SMALL BOLD - TEXTO PEQUEÑO PARA BOTONES SECUNDARIOS',
      },
    ],
  },
  {
    title: 'Textos auxiliares',
    items: [
      {
        style: 'auxiliar',
        variant: 'light',
        text: 'Auxiliar Light - Texto auxiliar ligero para información complementaria.',
      },
      {
        style: 'auxiliar',
        variant: 'regular',
        text: 'Auxiliar Regular - Texto auxiliar normal para información complementaria.',
      },
      {
        style: 'auxiliar',
        variant: 'bold',
        text: 'Auxiliar Bold - Texto auxiliar destacado para información complementaria importante.',
      },
      {
        style: 'auxiliar',
        variant: 'oblique',
        text: 'Auxiliar Oblique - Texto auxiliar en cursiva para información complementaria con énfasis.',
      },
      {
        style: 'auxiliar',
        variant: 'oblique-bold',
        text: 'Auxiliar Oblique Bold - Texto auxiliar en cursiva y negrita para información complementaria con mayor énfasis.',
      },
    ],
  },
  {
    title: 'Mini textos',
    items: [
      {
        style: 'mini-desktop',
        variant: 'bold',
        text: 'MINI DESKTOP BOLD - TEXTO PEQUEÑO PARA ETIQUETAS EN DESKTOP',
      },
      {
        style: 'mini-mobile',
        variant: 'bold',
        text: 'MINI MOBILE BOLD - TEXTO MUY PEQUEÑO PARA ETIQUETAS EN MOBILE',
      },
    ],
  },
]
</script>

<template>
  <NuxtLayout>
    <div class="typography-showcase">
      <h1 class="page-title vk-color-text-dark-green">Sistema Tipográfico</h1>
      <p class="page-description">
        Este catálogo muestra todos los estilos tipográficos disponibles en el
        sistema de diseño, siguiendo la estructura definida en
        <code>design-system/presets/typography.preset.ts</code>.
      </p>

      <VKCard
        v-for="(group, index) in typographyGroups"
        :key="index"
        class="typography-card"
        variant="outlined"
      >
        <template #header>
          <h2 class="vk-color-text-medium-green">{{ group.title }}</h2>
        </template>

        <div class="typography-examples">
          <div
            v-for="(item, itemIndex) in group.items"
            :key="itemIndex"
            class="typography-item"
          >
            <VKText
              :style="item.style"
              :variant="item.variant"
            >
              {{ item.text }}
            </VKText>

            <div class="typography-metadata">
              <code>style="{{ item.style }}" variant="{{ item.variant }}"</code>
            </div>
          </div>
        </div>
      </VKCard>

      <VKCard class="typography-usage-card mt-6">
        <template #header>
          <h2 class="vk-color-text-medium-green">Uso del componente VKText</h2>
        </template>
        <div class="code-example">
          <pre><code>&lt;VKText style="title-1" variant="bold"&gt;
  Título destacado de nivel 1
&lt;/VKText&gt;</code></pre>
        </div>
      </VKCard>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.typography-showcase {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.page-description {
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.5;
}

.typography-card {
  margin-bottom: 1.5rem;
}

.typography-examples {
  display: grid;
  gap: 1.5rem;
}

.typography-item {
  position: relative;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px dashed var(--vk-color-border-color-dark-green-30);
  background-color: var(--vk-color-bg-white);
}

.typography-metadata {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--vk-color-border-color-dark-green-20);
  font-size: 0.75rem;
  color: var(--vk-color-text-dark-green-60);
}

.typography-metadata code {
  font-family: monospace;
  background-color: var(--vk-color-bg-dark-green-20);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.code-example {
  background-color: var(--vk-color-bg-dark-green-20);
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 0.5rem;
}

.code-example pre {
  margin: 0;
  overflow-x: auto;
}

.code-example code {
  font-family: monospace;
  color: var(--vk-color-text-dark-green);
}

@media (min-width: 768px) {
  .typography-examples {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (min-width: 1024px) {
  .typography-examples {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
