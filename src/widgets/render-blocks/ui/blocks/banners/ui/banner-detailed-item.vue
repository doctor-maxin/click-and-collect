<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { IBannerDetailedItem } from "../../../../model/render-blocks.model";
import { NuxtLink } from "#components";

defineProps<{
  data: IBannerDetailedItem;
}>();
</script>
<template>
  <article class="relative">
    <component :is="data.link ? NuxtLink : 'div'" :to="data.link">
      <FeatureRenderMedia
        :media="data.media"
        :mobile-media="data.mobileMedia"
        image-provider="customS3"
        :desktop-image-modifiers="{ width: 1920, quality: 82 }"
        :mobile-image-modifiers="{ width: 720, quality: 82 }"
      />

      <div
        class="absolute text-white bottom-0 left-0 px-4 lg:px-[4.6875rem] pb-8 flex w-full flex-col gap-5 lg:gap-9"
      >
        <p class="text-base lg:text-[1.5rem] font-bold leading-6 lg:leading-8">
          {{ data.description }}
        </p>
        <span
          v-if="data.showLinkButton"
          class="flex mr-auto lg:mr-0 ml-auto gap-4 items-center text-[1.25rem] lg:text-[1.5rem] font-semibold"
          >{{ data.linkButtonText ? data.linkButtonText : "Смотреть" }}
          <SvgoLongArray aria-hidden="true" class="text-[3rem] !mb-0" filled
        /></span>
      </div>
    </component>
  </article>
</template>
