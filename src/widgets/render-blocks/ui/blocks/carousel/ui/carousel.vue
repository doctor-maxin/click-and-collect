<script setup lang="ts">
import type { ICarouselBlock } from "~/widgets/render-blocks";
import { FeatureRenderMedia } from "~/features/render-media";

const { data } = defineProps<{
  data: ICarouselBlock;
}>();

const containerRef = ref(null);
const _swiper = useSwiper(containerRef, {
  effect: "slide",
  navigation: {
    enabled: data.slides.length > 1,
    nextEl: ".next-el",
    prevEl: ".prev-el",
  },
  loop: true,
  autoplay: data.autoplay
    ? {
        delay: data.autoplayDelay,
      }
    : false,
});
</script>
<template>
  <section class="relative">
    <ClientOnly>
      <swiper-container ref="containerRef" :init="false" class="relative z-10">
        <swiper-slide v-for="(item, index) in data.slides" :key="item.id">
          <div class="h-screen relative">
            <FeatureRenderMedia
              :media="item.media"
              :mobile-media="item.mobileMedia"
              class="h-full"
              :loading="index === 0 ? 'eager' : 'lazy'"
            />
            <div
              v-if="item.showText"
              class="container py-[5.75rem] lg:py-[12rem] flex h-full absolute left-1/2 top-0 -translate-x-1/2"
              :class="{
                'justify-start': item.textHPosition === 'Left',
                'justify-center text-center': item.textHPosition === 'Center',
                'justify-end text-right': item.textHPosition === 'Right',
                'items-start': item.textVPosition === 'Top',
                'items-center': item.textVPosition === 'Center',
                'items-end': item.textVPosition === 'Bottom',
              }"
            >
              <h2
                class="font-semibold text-[1.25rem] lg:text-[2.75rem] px-8 lg:px-0"
                :style="{
                  color: item.textColor ? item.textColor : 'inherit',
                }"
              >
                {{ item.text }}
              </h2>
            </div>
          </div>
        </swiper-slide>
      </swiper-container>
      <div
        v-if="data.slides.length > 1"
        class="container z-20 hidden lg:flex items-center justify-between h-full absolute left-1/2 top-0 -translate-x-1/2"
      >
        <button
          class="bg-black/25 prev-el rotate-180 cursor-pointer rounded-full"
        >
          <SvgoChevron filled class="text-5xl text-white !mb-0" />
        </button>
        <button class="bg-black/25 cursor-pointer next-el rounded-full">
          <SvgoChevron filled class="text-5xl text-white !mb-0" />
        </button>
      </div>
    </ClientOnly>
  </section>
</template>
