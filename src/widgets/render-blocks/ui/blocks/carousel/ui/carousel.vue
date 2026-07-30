<script setup lang="ts">
import type { ICarouselBlock } from "~/widgets/render-blocks";
import type { SwiperContainer } from "swiper/element";
import { FeatureRenderMedia } from "~/features/render-media";
import { normalizeSiteLink } from "~/shared/lib/normalize-site-link";
import { useKeepAliveSwiper } from "~/shared/lib/use-keep-alive-swiper";
import { NuxtLink } from "#components";

const { data } = defineProps<{
    data: ICarouselBlock;
}>();
const {
    public: { siteUrl },
} = useRuntimeConfig();

const getCarouselLink = (link?: string) =>
    link ? normalizeSiteLink(link, siteUrl as string | undefined) : undefined;

const instanceId = `carousel-${data.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
const nextButtonClass = `${instanceId}-next`;
const prevButtonClass = `${instanceId}-prev`;
const containerRef = ref<SwiperContainer | null>(null);
const activeSlideIndex = ref(0);

const updateActiveSlide = (swiper: { realIndex: number }) => {
    activeSlideIndex.value = swiper.realIndex;
};

useKeepAliveSwiper(containerRef, {
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
    on: {
        afterInit: updateActiveSlide,
        slideChange: updateActiveSlide,
    },
});
</script>
<template>
    <section class="relative carousel">
        <swiper-container
            ref="containerRef"
            :init="false"
            class="block relative w-full h-screen lg:h-[70vh] z-10"
        >
            <swiper-slide
                v-for="(item, index) in data.slides"
                :key="item.id"
                class="block w-full h-full"
            >
                <component
                    :is="'link' in item && item.link ? NuxtLink : 'div'"
                    class="block w-full h-full relative"
                    :to="getCarouselLink(item.link)"
                >
                    <FeatureRenderMedia
                        :media="item.media"
                        :mobile-media="item.mobileMedia"
                        image-provider="customS3"
                        :desktop-image-modifiers="{
                            width: 1920,
                            quality: 82,
                        }"
                        :mobile-image-modifiers="{
                            width: 720,
                            quality: 82,
                        }"
                        class="block w-full h-full"
                        :loading="index === 0 ? 'eager' : 'lazy'"
                        :fetch-priority="index === 0 ? 'high' : 'low'"
                        :preload="index === 0"
                        :video-autoplay="true"
                        :video-loop="true"
                        :video-controls="false"
                        :video-active="index === activeSlideIndex"
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
            class="container z-20 pointer-events-none hidden lg:flex items-center justify-between h-full absolute left-1/2 top-0 -translate-x-1/2"
        >
            <button
                type="button"
                aria-label="Предыдущий слайд"
                :class="[
                    'bg-black/25 3xl:-translate-x-[calc(100%+16px)] rotate-180 pointer-events-auto cursor-pointer rounded-full',
                    prevButtonClass,
                ]"
            >
                <SvgoChevron
                    aria-hidden="true"
                    filled
                    class="text-5xl text-white !mb-0"
                />
            </button>
            <button
                type="button"
                aria-label="Следующий слайд"
                :class="[
                    'bg-black/25 3xl:translate-x-[calc(100%+16px)] cursor-pointer pointer-events-auto rounded-full',
                    nextButtonClass,
                ]"
            >
                <SvgoChevron
                    aria-hidden="true"
                    filled
                    class="text-5xl text-white !mb-0"
                />
            </button>
        </div>
    </section>
</template>
