<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { IBannerItem } from "../../../../model/render-blocks.model";
import { NuxtLink } from "#components";

defineProps<{
  data: IBannerItem;
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
      <h4
        class="block left-0 px-4 top-1/2 -translate-y-1/2 absolute w-full text-center text-[1.75rem] lg:text-[3.5rem] font-semibold text-white"
      >
        {{ data.title }}
      </h4>
      <span
        v-if="data.showLinkButton"
        class="flex absolute left-1/2 bottom-4 lg:bottom-9 -translate-x-1/2 gap-4 text-white items-center text-[1.25rem] lg:text-[1.5rem] font-semibold capitalize"
        >Смотреть <SvgoLongArray aria-hidden="true" class="text-[3rem] !mb-0" filled
      /></span>
    </component>
  </article>
</template>
