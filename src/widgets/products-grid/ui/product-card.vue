<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import { FeatureRenderMedia } from "~/features/render-media";
import ProductCardOptions from "./product-card-options.vue";

const { product } = defineProps<{
  product: StoreProduct;
}>();
const containerRef = ref(null);
const swiper = useSwiper(containerRef);

onMounted(() => {
  if (swiper.instance) {
  }
});
</script>
<template>
  <article class="flex flex-col gap-4 w-full" :data-id="product.id">
    <div class="relative">
      <NuxtLink class="contents" :to="`/products/${product.handle}`">
        <template v-if="product.images?.length">
          <ClientOnly>
            <swiper-container
              :pagination="{
                el: '.product-card-pagination',
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
                />
              </swiper-slide>
              <div slot="container-end">
                <div
                  class="product-card-pagination z-10 absolute w-full gap-1 bottom-2 px-2 flex"
                ></div>
              </div>
            </swiper-container>
          </ClientOnly>
        </template>
        <div v-else class="bg-gray-200 aspect-[15/18]" />
      </NuxtLink>

      <ProductCardOptions :product="product" />
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
</style>
