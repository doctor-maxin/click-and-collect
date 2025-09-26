<script setup lang="ts">
import type { StoreProductImage } from "@medusajs/types";
import { useProductStore } from "../lib/product-store";

const productStore = useProductStore();
const { product } = storeToRefs(productStore);

function getThumbnailUrl(image?: StoreProductImage) {
  if (!image?.url?.trim()) return "/not_found.png";

  return image.url.replace("500px", "100px");
}
function getDefaultUrl(image?: StoreProductImage) {
  if (!image?.url?.trim()) return "/not_found.png";

  return image.url.replace("500px", "1400px");
}

const mainImage = ref(product?.value?.images?.[0]);
</script>
<template>
  <div class="lg:flex hidden gap-4 w-full">
    <div class="flex flex-col gap-3">
      <img
        v-for="image of product?.images"
        :src="getThumbnailUrl(image)"
        alt="Product Image"
        class="max-w-[5.75rem] cursor-pointer aspect-[23/28] object-cover"
        @click="mainImage = image"
      />
    </div>
    <div>
      <img
        :src="getDefaultUrl(mainImage)"
        alt="Product Image"
        class="object-cover"
      />
    </div>
  </div>

  <div>
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
          v-for="image of product?.images"
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
  </div>
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
