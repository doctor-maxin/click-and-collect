<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import { FeatureRenderMedia } from "~/features/render-media";
import ProductCardOptions from "./product-card-options.vue";

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
</script>
<template>
  <article
    class="product-card flex group flex-col gap-4 w-full"
    :data-id="product.id"
  >
    <div class="relative">
      <NuxtLink class="contents" :to="`/products/${product.handle}`">
        <template v-if="product.images?.length">
          <swiper-container
            :init="false"
            :pagination="{
              el: `.product-card[data-id='${product.id}'] .product-card-pagination`,
              type: 'bullets',
            }"
            ref="containerRef"
            class="aspect-[15/18]"
          >
            <swiper-slide
              v-for="image of product.images"
              :key="image.id"
              class="size-full"
            >
              <NuxtImg
                class="object-cover object-center size-full"
                :src="image.url"
                loading="lazy"
              />
            </swiper-slide>
          </swiper-container>
          <div
            class="product-card-pagination z-10 absolute w-full gap-1 bottom-2 px-2 flex"
          ></div>
        </template>
        <div v-else class="aspect-[15/18]">
          <NuxtImg
            class="object-cover object-center size-full"
            src="/not_found.png"
          />
        </div>
      </NuxtLink>

      <ProductCardOptions
        class="group-hover:translate-y-0 transition-all translate-y-4 opacity-0 group-hover:opacity-100"
        :product="product"
      />
    </div>
    <div class="flex flex-col gap-2">
      <div class="text-base leading-4 uppercase font-medium">
        {{ product.title }}
      </div>
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
swiper-slide img {
  display: none;
}
swiper-slide:first-child img,
.swiper-initialized img {
  display: block;
}
</style>
