<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import { normalizeSiteLink } from "~/shared/lib/normalize-site-link";
import type { IDepartmentsBlocks } from "~/widgets/render-blocks";

const { data } = defineProps<{
    data: IDepartmentsBlocks;
}>();
const {
    public: { siteUrl },
} = useRuntimeConfig();

const getDepartmentLink = (link: string) =>
    normalizeSiteLink(link, siteUrl as string | undefined);

const instanceId = computed(
    () => `departments-${String(data.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`,
);
const nextButtonClass = computed(() => `${instanceId.value}-next`);
const prevButtonClass = computed(() => `${instanceId.value}-prev`);
const containerRef = ref(null);

const mobileVisibleCols = computed(() => data.mobileVisibleCols || 1);
const visibleCols = computed(() => data.visibleCols || data.items?.length || 1);
const canSlide = computed(
    () => data.isCarousel && (data.items?.length ?? 0) > 1,
);
const canAutoplay = computed(() => canSlide.value && !!data.autoplayDuration);

const _swiper = useSwiper(containerRef, {
    effect: "slide",
    navigation: {
        enabled: canSlide.value,
        nextEl: `.${nextButtonClass.value}`,
        prevEl: `.${prevButtonClass.value}`,
    },
    loop: canSlide.value,
    speed: data.autoplayDuration || undefined,
    slidesPerView: mobileVisibleCols.value,
    spaceBetween: 16,
    breakpoints: {
        1024: {
            slidesPerView: "auto",
            spaceBetween: 16,
        },
        1768: {
            slidesPerView: visibleCols.value,
            spaceBetween: 16,
        },
    },
    autoplay: canAutoplay.value
        ? {
              delay: data.autoplayDelay || 3000,
          }
        : false,
});
console.log(data)
const duplicatedItems = computed(() => [...data.items, ...data.items]);
</script>
<template>
    <section
        v-if="data?.items?.length && !data.isCarousel"
        class="mx-auto my-9 px-4 gap-4 container hidden md:grid grid-cols-2 lg:grid-cols-[repeat(var(--departments-cols),minmax(0,1fr))]"
        :style="{
            '--departments-cols': data.items.length,
        }"
        role="navigation"
    >
        <article v-for="item of data.items" :key="item.id">
            <NuxtLink
                :to="getDepartmentLink(item.link)"
                class="flex justify-center items-center relative aspect-3/4"
            >
                <h3
                    :style="{
                        '--text-color': item.textColor
                            ? item.textColor
                            : 'white',
                    }"
                    class="absolute text-(--text-color) max-w-[95%] text-center uppercase font-bold z-10 text-[1.75rem] leading-9"
                >
                    {{ item.name }}
                </h3>
                <FeatureRenderMedia
                    class="w-full h-full"
                    :media="item.image"
                    :mobile-media="item.image"
                    image-provider="customS3"
                    :mobile-image-modifiers="{ width: 320, quality: 82 }"
                />
            </NuxtLink>
        </article>
    </section>

    <section
        v-else-if="data?.items?.length"
        class="relative mx-auto container w-full my-9"
        role="navigation"
    >
        <swiper-container
            ref="containerRef"
            :init="false"
            :class="instanceId"
            class="w-full"
        >
            <swiper-slide
                v-for="(item, index) of duplicatedItems"
                :key="`${item.id}-${index}`"
                class="w-[18rem] lg:w-[25rem]"
            >
                <NuxtLink
                    :to="getDepartmentLink(item.link)"
                    class="flex justify-center items-center relative aspect-3/4"
                >
                    <h3
                        :style="{
                            '--text-color': item.textColor
                                ? item.textColor
                                : 'white',
                        }"
                        class="absolute text-(--text-color) max-w-[95%] text-center uppercase font-bold z-10 text-[1.75rem] leading-9"
                    >
                        {{ item.name }}
                    </h3>
                    <FeatureRenderMedia
                        class="w-full h-full"
                        :media="item.image"
                        :mobile-media="item.image"
                        image-provider="customS3"
                        :mobile-image-modifiers="{ width: 320, quality: 82 }"
                    />
                </NuxtLink>
            </swiper-slide>
        </swiper-container>
        <div
            v-if="canSlide"
            class="z-20 pointer-events-none hidden lg:flex items-center justify-between h-full absolute left-0 top-0 w-full"
        >
            <button
                :class="[
                    'bg-black/25 3xl:-translate-x-[calc(100%+16px)] rotate-180 pointer-events-auto cursor-pointer rounded-full',
                    prevButtonClass,
                ]"
            >
                <SvgoChevron filled class="text-5xl text-white !mb-0" />
            </button>
            <button
                :class="[
                    'bg-black/25 3xl:translate-x-[calc(100%+16px)] cursor-pointer pointer-events-auto rounded-full',
                    nextButtonClass,
                ]"
            >
                <SvgoChevron filled class="text-5xl text-white !mb-0" />
            </button>
        </div>
    </section>
</template>
