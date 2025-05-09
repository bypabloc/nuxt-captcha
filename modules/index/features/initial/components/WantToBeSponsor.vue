<script setup lang="ts">
/**
 * @component WantToBeSponsor
 *
 * @author Pablo Contreras
 * @since 2025/05/01
 */
const display = useDisplay()

const $logger = useNuxtApp().$logger

const { t }: II18n = useTranslations()

$logger.info('WantToBeSponsor component loaded')
</script>

<template>
  <section
    id="quiero-ser-sponsor"
    class="vk-color-bg-baby-blue w-full flex justify-center px-4 pb-12"
    :class="[!display.isMobile.value ? 'gap-4 pt-4' : 'gap-8 pt-8']"
  >
    <div class="flex flex-col items-center justify-center gap-4 max-w-[800px]">
      <VKText
        :style="!display.isMobile.value ? 'title-1' : 'title-2'"
        variant="bold"
        tag="h2"
      >
        {{ t('landing.preLaunch.wantToBeSponsor.title') }}
      </VKText>
      <VKText
        :style="'subtitle-3'"
        tag="h3"
      >
        {{ t('landing.preLaunch.wantToBeSponsor.description') }}
      </VKText>
      <VKAsyncComponent
        path="index/features/partner-enrollment/components/PartnerEnrollment"
      />
      <VKText
        tag="p"
      >
        {{ t('landing.preLaunch.wantToBeSponsor.or_download_brochure') }}
      </VKText>
      <VKButton
        :bg-color="'dark-gray'"
        icon-position="trailing"
        :href="t('landing.preLaunch.wantToBeSponsor.brochure_link')"
        target="_blank"
        rel="noopener noreferrer"
        :download="t('landing.preLaunch.wantToBeSponsor.brochure_name')"
        :class="!display.isMobile.value ? 'w-[300px]' : 'w-full'"
      >
        {{ t('landing.preLaunch.wantToBeSponsor.button_download_brochure') }}
        <template #icon>
          <VKIcon
            icon="tray-download"
            size="24"
            color="white"
          />
        </template>
      </VKButton>
    </div>
  </section>
</template>

<style scoped></style>
