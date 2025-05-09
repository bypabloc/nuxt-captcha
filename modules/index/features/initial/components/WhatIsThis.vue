<script setup lang="ts">
/**
 * @component WhatIsThis
 * @description Componente que describe qué es esto
 *
 * @author Pablo Contreras
 * @since 2025/05/02
 */

import type { Ref } from 'vue'

const { t }: II18n = useTranslations()
const display = useDisplay()

interface Partner {
  id: number
  name: string
  logo: string
}

const partners: Ref<Partner[]> = ref([
  {
    id: 1,
    name: 'Scotiabank',
    logo: '/images/logos/scotiabank.png',
  },
  {
    id: 2,
    name: 'Armony',
    logo: '/images/logos/armony.png',
  },
  {
    id: 3,
    name: 'SBPay',
    logo: '/images/logos/sbpay.png',
  },
  {
    id: 4,
    name: 'Banco Falabella',
    logo: '/images/logos/banco-falabella.png',
  },
  {
    id: 5,
    name: 'Partner 5',
    logo: '/images/logos/banco-falabella.png',
  },
  {
    id: 6,
    name: 'Partner 6',
    logo: '/images/logos/banco-falabella.png',
  },
  {
    id: 7,
    name: 'Partner 7',
    logo: '/images/logos/banco-falabella.png',
  },
  {
    id: 8,
    name: 'Partner 8',
    logo: '/images/logos/banco-falabella.png',
  },
])

const shufflePartnersArray = (arr: Partner[]): Partner[] =>
  arr.sort(() => Math.random() - 0.5)

onMounted(() => {
  partners.value = shufflePartnersArray(partners.value)
})
</script>

<template>
  <section
    id="que-es"
    class="vk-color-bg-white w-full flex justify-center px-4 pb-12"
    :class="[!display.isMobile.value ? 'gap-4 pt-4' : 'gap-8 pt-8']"
  >
    <div
      flex
      flex-col
      items-center
      justify-center
      gap-4
      text-center
      class="max-w-[800px]"
    >
      <VKImage
        src="/images/logo-1-negro-landing.png"
        max-h-64
        object-cover
      />
      <VKText :style="'subtitle-3'">
        <i18n-t keypath="landing.preLaunch.whatIsThis.what_we_are">
          <template #boldText1>
            <b>
              {{ t('landing.preLaunch.whatIsThis.what_we_are_bold_1') }}
            </b>
          </template>
          <template #boldText2>
            <b>
              {{ t('landing.preLaunch.whatIsThis.what_we_are_bold_2') }}
            </b>
          </template>
        </i18n-t>
      </VKText>
      <VKText class="bg-blue-100 p-2">
        <i18n-t keypath="landing.preLaunch.whatIsThis.the_problem">
          <template #boldText>
            <b>
              {{ t('landing.preLaunch.whatIsThis.the_problem_bold') }}
            </b>
          </template>
        </i18n-t>
      </VKText>
      <VKText :style="'subtitle-3'">
        <i18n-t keypath="landing.preLaunch.whatIsThis.together_we">
          <template #boldText>
            <b>
              {{ t('landing.preLaunch.whatIsThis.together_we_bold') }}
            </b>
          </template>
        </i18n-t>
      </VKText>
      <VKCarousel
        :items="partners"
        :desktop-visible-items="4"
        :autoplay="true"
        :autoplay-speed="5000"
        w-full
        max-w-4xl
      >
        <template #item="{ item }">
          <VKCard
            w-full
            h-14
            p-2
            flex
            items-center
            justify-center
            bg-white
            rounded-lg
          >
            <VKImage
              :src="`${item.logo}`"
              :alt="`${item.name}`"
              max-h-full
              max-w-full
              object-contain
            />
          </VKCard>
        </template>
      </VKCarousel>
    </div>
  </section>
</template>

<style scoped></style>
