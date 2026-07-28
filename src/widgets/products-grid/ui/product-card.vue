<script setup lang="ts">
import type { ProductWithDisplayTags } from "#shared/types/product-display-tag";
import type { SwiperContainer } from "swiper/element";
import type { Swiper, SwiperOptions } from "swiper/types";
import {
    ProductCardOverlayTags,
    ProductPriceTags,
} from "~/features/product-display-tags";
import ProductCardOptions from "./product-card-options.vue";
import ProductCardPrice from "./product-card-price.vue";
import ProductImage from "./product-image.vue";

const {
    product,
    imageWidth = 540,
    imageSizes = "(max-width: 768px) 350px, 540px",
    firstImageLoading = "eager",
    firstImageFetchPriority = "high",
} = defineProps<{
    product: ProductWithDisplayTags;
    imageWidth?: number;
    imageSizes?: string;
    firstImageLoading?: "lazy" | "eager";
    firstImageFetchPriority?: "auto" | "high" | "low";
}>();
const containerRef = ref<SwiperContainer | null>(null);
const swiperInstance = shallowRef<Swiper | null>(null);
const cardWidth = ref(0);
const swiperOptions = {
    pagination: {
        el: `.product-card[data-id='${product.id}'] .product-card-pagination`,
        type: "bullets",
        clickable: true,
    },
    on: {
        afterInit() {
            if (!containerRef.value) return;
            //@ts-ignore
            containerRef.value.classList.add("swiper-initialized");
        },
    },
} satisfies SwiperOptions;

function initializeSwiper() {
    const container = containerRef.value;
    if (!container) return;

    if (container.swiper && !container.swiper.destroyed) {
        swiperInstance.value = container.swiper;
        return;
    }

    Object.assign(container, swiperOptions);
    container.initialize();
    swiperInstance.value = container.swiper;
}
let swiperInitFrame: number | null = null;
const { stop: stopSwiperObserver } = useIntersectionObserver(
    containerRef,
    ([entry]) => {
        if (!entry?.isIntersecting) return;

        stopSwiperObserver();
        swiperInitFrame = requestAnimationFrame(() => {
            swiperInitFrame = null;
            initializeSwiper();
        });
    },
    { rootMargin: "200px" },
);

useResizeObserver(containerRef, ([entry]) => {
    cardWidth.value = entry?.contentRect.width ?? 0;
});

onBeforeUnmount(() => {
    stopSwiperObserver();

    if (swiperInitFrame !== null) {
        cancelAnimationFrame(swiperInitFrame);
    }
});

const imageList = computed(() => product.images?.slice(0, 6));
const discountPercentage = computed(() => {
    const calculatedPrice = product.variants?.[0]?.calculated_price;
    const originalAmount = calculatedPrice?.original_amount;
    const calculatedAmount = calculatedPrice?.calculated_amount;

    if (calculatedPrice && 'discount' in calculatedPrice) return calculatedPrice.discount as number
    if (
        typeof originalAmount !== "number" ||
        typeof calculatedAmount !== "number" ||
        originalAmount <= 0 ||
        calculatedAmount >= originalAmount
    ) {
        return null;
    }

    return Math.round(
        ((originalAmount - calculatedAmount) / originalAmount) * 100,
    );
});

function onMouseOver(event: MouseEvent) {
    const size = imageList.value?.length ?? 0;
    if (size <= 1 || cardWidth.value <= 0) return;

    initializeSwiper();
    const partWidth = cardWidth.value / size;

    if (event.offsetX < 0) {
        swiperInstance.value?.slideTo(0, 0);
        return;
    }

    const index = Math.min(size - 1, Math.trunc(event.offsetX / partWidth));
    if (swiperInstance.value?.activeIndex !== index) {
        swiperInstance.value?.slideTo(index);
    }
}

const smallestVariant = computed(() => {
    let smallest = product.variants?.[0];

    const optionId = product.options?.find((o) => o.title === "size");
    if (!optionId) return smallest;

    product.variants?.forEach((variant) => {
        let seq = variant.metadata?.sequence as number;
        if (seq < (smallest?.metadata?.sequence as number)) {
            smallest = variant;
        }
    });
    return smallest;
});
const link = computed(
    () => `/products/${product.handle}?variant=${smallestVariant?.value?.id}`,
);
</script>
<template>
    <article
        class="product-card flex group flex-col gap-2 lg:gap-4 w-full"
        :data-id="product.id"
    >
        <div class="relative" @mousemove="onMouseOver">
            <NuxtLink class="block" :to="link">
                <template v-if="imageList?.length">
                    <swiper-container
                        :init="false"
                        :pagination="{
                            el: `.product-card[data-id='${product.id}'] .product-card-pagination`,
                            type: 'bullets',
                        }"
                        effect="fade"
                        ref="containerRef"
                        class="aspect-15/18"
                    >
                        <swiper-slide
                            v-for="(image, index) of imageList"
                            :key="image.id"
                            class="size-full"
                        >
                            <ProductImage
                                class="object-cover object-center size-full"
                                :src="image.url"
                                :width="imageWidth"
                                :alt="
                                    (image.metadata?.alt as string) ??
                                    product.title
                                "
                                :loading="
                                    index === 0
                                        ? firstImageLoading
                                        : 'lazy'
                                "
                                :fetchpriority="
                                    index === 0
                                        ? firstImageFetchPriority
                                        : 'low'
                                "
                                :sizes="imageSizes"
                            />
                        </swiper-slide>
                    </swiper-container>
                    <div
                        class="product-card-pagination z-10 absolute w-full gap-1 bottom-2 px-2 flex"
                    ></div>
                </template>
                <div v-else class="aspect-15/18">
                    <ProductImage
                        alt="Product Image not found"
                        class="object-cover object-center size-full"
                        src="/not_found.png"
                    />
                </div>
            </NuxtLink>

            <ProductCardOverlayTags
                :tags="product.product_display_tags"
                :default-tags="product.metadata?.productType"
                :discount-percentage="discountPercentage"
            />
            <ProductCardOptions
                class="group-hover:translate-y-0 transition-all translate-y-4 opacity-0 group-hover:opacity-100"
                :product="product"
                @mousemove.stop
            />
        </div>
        <div class="flex flex-col gap-2">
            <div
                class="text-xs lg:text-base leading-4 lg:leading-6 uppercase font-medium"
            >
                {{ product.title }}
            </div>
            <ProductCardPrice
                v-if="product.variants?.[0]?.calculated_price"
                :calculated_price="product.variants?.[0]?.calculated_price"
            />
            <ProductPriceTags :tags="product.product_display_tags" />
        </div>
    </article>
</template>

<style lang="css">
.product-card-pagination .swiper-pagination-bullet {
    width: 100%;
    height: 2px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.6);
}
.product-card-pagination .swiper-pagination-bullet-active {
    background-color: rgba(255, 255, 255, 1);
}

.product-card swiper-container,
.product-card swiper-container swiper-slide {
    display: block;
}
.product-card
    swiper-container:not(.swiper-initialized)
    swiper-slide:not(:first-child) {
    display: none;
}
.product-card swiper-slide .ui-image-shell {
    display: none;
}
.product-card swiper-slide:first-child .ui-image-shell,
.product-card .swiper-initialized .ui-image-shell {
    display: block;
}
</style>
