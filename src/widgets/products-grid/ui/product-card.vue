<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import { FeatureRenderMedia } from "~/features/render-media";
import ProductCardOptions from "./product-card-options.vue";
import ProductCardPrice from "./product-card-price.vue";
import ProductImage from "./product-image.vue";

const { product } = defineProps<{
    product: StoreProduct;
}>();
const containerRef = ref(null);

const swiper = useSwiper(containerRef, {
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
            console.log("Swiper initialized");
        },
    },
});

const imageList = computed(() => product.images?.slice(0, 6));

function onMouseOver(event: MouseEvent) {
    const target = event.target as HTMLDivElement;
    const size = imageList.value?.length ?? 0;
    const partWidth = target.offsetWidth / size;

    if (event.offsetX < 0) {
        swiper.instance.value?.slideTo(0, 0);
        return;
    }

    const index = Math.trunc(event.offsetX / partWidth);
    if (swiper.instance.value?.activeIndex !== index)
        swiper.instance.value?.slideTo(index);
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
            <NuxtLink class="contents" :to="link">
                <template v-if="imageList?.length">
                    <swiper-container
                        :init="false"
                        :pagination="{
                            el: `.product-card[data-id='${product.id}'] .product-card-pagination`,
                            type: 'bullets',
                        }"
                        effect="fade"
                        ref="containerRef"
                        class="aspect-[15/18]"
                    >
                        <swiper-slide
                            v-for="(image, index) of imageList"
                            :key="image.id"
                            class="size-full"
                        >
                            <ProductImage
                                class="object-cover object-center size-full"
                                :src="image.url"
                                :width="540"
                                :alt="
                                    (image.metadata?.alt as string) ??
                                    product.title
                                "
                                :loading="index === 0 ? 'eager' : 'lazy'"
                                format="webp"
                                fetchpriority="high"
                                sizes="(max-width: 768px) 350px, 540px"
                            />
                        </swiper-slide>
                    </swiper-container>
                    <div
                        class="product-card-pagination z-10 absolute w-full gap-1 bottom-2 px-2 flex"
                    ></div>
                </template>
                <div v-else class="aspect-[15/18]">
                    <ProductImage
                        alt="Product Image not found"
                        class="object-cover object-center size-full"
                        src="/not_found.png"
                    />
                </div>
            </NuxtLink>

            <ProductCardOptions
                class="group-hover:translate-y-0 transition-all translate-y-4 opacity-0 group-hover:opacity-100"
                :product="product"
                @mousemove.stop
            />
        </div>
        <div class="flex flex-col gap-2">
            <div class="text-xs lg:text-base leading-4 uppercase font-medium">
                {{ product.title }}
            </div>
            <ProductCardPrice
                v-if="product.variants?.[0]?.calculated_price"
                :calculated_price="product.variants?.[0]?.calculated_price"
            />
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

swiper-container,
swiper-container swiper-slide {
    display: block;
}
swiper-slide .ui-image-shell {
    display: none;
}
swiper-slide:first-child .ui-image-shell,
.swiper-initialized .ui-image-shell {
    display: block;
}
</style>
