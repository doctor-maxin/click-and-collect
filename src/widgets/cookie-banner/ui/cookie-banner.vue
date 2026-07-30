<script setup lang="ts">
import { StrapiBlocks } from "vue-strapi-blocks-renderer";

const { data: config } = useNuxtData<IGlobalConfig>("config");

const cookie = useCookie("isAccepted");
const isOpen = ref(cookie.value ? false : true);

const acceptAction = () => {
  cookie.value = "true";
  isOpen.value = false;
};
</script>
<template>
  <div
    v-if="config?.config?.cookieBanner && isOpen"
    class="fixed z-20 bottom-0 left-0 w-full bg-white/90"
  >
    <div
      class="container flex-col lg:flex-row w-full flex items-start justify-between mx-auto p-4 lg:p-8 gap-3 lg:gap-6"
    >
      <div class="flex flex-col gap-3 sm:gap-4 text-sm sm:text-base leading-6">
        <h4 class="font-medium uppercase">
          {{ config?.config?.cookieBanner?.header }}
        </h4>
        <StrapiBlocks :content="config?.config?.cookieBanner?.content" />
      </div>
      <div>
        <UiButton class="min-w-[9.25rem]" @click="acceptAction">OK</UiButton>
      </div>
      <button
        type="button"
        aria-label="Закрыть уведомление о cookie"
        class="absolute text-base cursor-pointer right-3 top-3"
        @click="isOpen = false"
      >
        <SvgoClose aria-hidden="true" filled />
      </button>
    </div>
  </div>
</template>
