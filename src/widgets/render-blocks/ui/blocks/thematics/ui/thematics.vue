<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { IThematicsBlocks } from "~/widgets/render-blocks";

const { data } = defineProps<{
    data: IThematicsBlocks;
}>();

const instanceId = computed(
    () => `thematics-${String(data.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`,
);
const containerRef = ref(null);

const mobileVisibleCols = computed(() => data.mobileVisibleCols || 3);
const visibleCols = computed(() => data.visibleCols || data.items?.length || 1);
const canSlide = computed(
    () => data.isCarousel && (data.items?.length ?? 0) > 1,
);
const canAutoplay = computed(() => canSlide.value && !!data.autoplayDuration);

const _swiper = useSwiper(containerRef, {
    effect: "slide",
    loop: canSlide.value,
    speed: data.autoplayDuration || undefined,
    slidesPerView: mobileVisibleCols.value,
    spaceBetween: 16,
    breakpoints: {
        1024: {
            slidesPerView: "auto",
            spaceBetween: 44,
        },
        1768: {
            slidesPerView: visibleCols.value,
            spaceBetween: 44,
        },
    },
    autoplay: canAutoplay.value
        ? {
              delay: data.autoplayDelay || 3000,
          }
        : false,
});

const visibileItems = computed(() => {
    if (import.meta.server) return data.items.slice(0, data.visibleCols);
    console.log(data.mobileVisibleCols);
    return data.items.slice(
        0,
        window.innerWidth <= 768 ? data.mobileVisibleCols : data.visibleCols,
    );
});

const duplicatedItems = computed(() => [...data.items, ...data.items]);
</script>
<template>
    <section
        v-if="data.items?.length && !data.isCarousel"
        class="hide-scrollbar pb-4 lg:pb-0 px-4 2.5xl:px-0 w-full mx-auto snap-x snap-mandatory scroll-mx-4 overflow-x-auto overflow-y-hidden mt-4 mb-6 lg:my-12 flex scroll-px-4 2.5xl:justify-center gap-4 lg:gap-11"
        :class="{
            container: data.isCarousel,
        }"
    >
        <article
            v-for="(item, index) of visibileItems"
            :key="item.id"
            :class="{
                'snap-start': index === 0,
                'snap-end': index > 0,
            }"
        >
            <NuxtLink
                :to="item.link"
                class="flex max-w-[7.8rem] lg:max-w-40 flex-col gap-3 items-center"
            >
                <FeatureRenderMedia
                    class="aspect-square w-24 lg:w-30"
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

    <section
        v-else-if="data.items?.length"
        class="w-full mx-auto mt-4 mb-6 lg:my-12"
    >
        <swiper-container
            ref="containerRef"
            :init="false"
            :class="instanceId"
            class="w-full"
        >
            <swiper-slide
                v-for="item of duplicatedItems"
                :key="item.id"
                class="w-[7.8rem] lg:w-40"
            >
                <NuxtLink
                    :to="item.link"
                    class="flex flex-col gap-3 items-center mx-auto"
                >
                    <FeatureRenderMedia
                        class="aspect-square w-24 lg:w-30"
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
            </swiper-slide>
        </swiper-container>
    </section>
</template>
