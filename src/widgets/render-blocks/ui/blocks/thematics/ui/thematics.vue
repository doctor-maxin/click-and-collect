<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { IThematicsBlocks } from "~/widgets/render-blocks";

defineProps<{
  data: IThematicsBlocks;
}>();
</script>
<template>
  <section
    v-if="data.items?.length"
    class="container px-4 lg:px-0 w-full mx-auto snap-x snap-mandatory scroll-mx-4 overflow-x-auto mt-4 mb-6 lg:my-12 flex scroll-px-4 lg:justify-center gap-4 lg:gap-11"
  >
    <article
      v-for="(item, index) of data.items"
      :key="item.id"
      :class="{
        'snap-start': index === 0,
        'snap-end': index > 0,
      }"
    >
      <NuxtLink
        :to="item.link"
        class="flex max-w-[7.8rem] lg:max-w-[10rem] flex-col gap-3 items-center"
      >
        <FeatureRenderMedia
          class="aspect-square w-[6rem] lg:w-[7.5rem]"
          :media="item.image"
          :mobile-media="item.image"
        />

        <span
          class="text-center block w-full font-semibold leading-5 lg:leading-6 text-base lg:text-[1.25rem]"
          :style="{
            color: item.textColor ? item.textColor : 'inherit',
          }"
          >{{ item.text }}</span
        >
      </NuxtLink>
    </article>
  </section>
</template>
