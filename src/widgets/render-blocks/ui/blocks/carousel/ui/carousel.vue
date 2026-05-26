<script setup lang="ts">
import type { ICarouselBlock } from "~/widgets/render-blocks";
import { FeatureRenderMedia } from "~/features/render-media";
import { NuxtLink } from "#components";

const { data } = defineProps<{
    data: ICarouselBlock;
}>();

const instanceId = `carousel-${data.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
const nextButtonClass = `${instanceId}-next`;
const prevButtonClass = `${instanceId}-prev`;
const containerRef = ref(null);

const _swiper = useSwiper(containerRef, {
    effect: "slide",
    navigation: {
        enabled: data.slides.length > 1,
        nextEl: `.${nextButtonClass}`,
        prevEl: `.${prevButtonClass}`,
    },
    loop: data.slides.length > 1,
    autoplay: data.autoplay
        ? {
              delay: data.autoplayDelay,
          }
        : false,
});
</script>
<template>
    <section class="relative carousel">
        <swiper-container
            ref="containerRef"
            :init="false"
            class="relative z-10"
        >
            <swiper-slide v-for="(item, index) in data.slides" :key="item.id">
                <component
                    :is="'link' in item && item.link ? NuxtLink : 'div'"
                    class="h-screen relative"
                    :to="item.link"
                >
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
                            'justify-center text-center':
                                item.textHPosition === 'Center',
                            'justify-end text-right':
                                item.textHPosition === 'Right',
                            'items-start': item.textVPosition === 'Top',
                            'items-center': item.textVPosition === 'Center',
                            'items-end': item.textVPosition === 'Bottom',
                        }"
                    >
                        <h2
                            class="font-semibold text-[1.25rem] lg:text-[2.75rem] px-8 lg:px-0"
                            :style="{
                                color: item.textColor
                                    ? item.textColor
                                    : 'inherit',
                            }"
                        >
                            {{ item.text }}
                        </h2>
                    </div>
                </component>
            </swiper-slide>
        </swiper-container>
        <div
            v-if="data.slides.length > 1"
            class="container z-20 hidden lg:flex items-center justify-between h-full absolute left-1/2 top-0 -translate-x-1/2"
        >
            <button
                :class="[
                    'bg-black/25 rotate-180 cursor-pointer rounded-full',
                    prevButtonClass,
                ]"
            >
                <SvgoChevron filled class="text-5xl text-white !mb-0" />
            </button>
            <button
                :class="[
                    'bg-black/25 cursor-pointer rounded-full',
                    nextButtonClass,
                ]"
            >
                <SvgoChevron filled class="text-5xl text-white !mb-0" />
            </button>
        </div>
    </section>
</template>
