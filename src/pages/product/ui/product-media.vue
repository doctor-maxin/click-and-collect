<script setup lang="ts">
import type { StoreProductImage } from "@medusajs/types";
import { FeatureZoomImage } from "~/features/zoom-image";
import { useProductStore } from "../lib/product-store";
import { ClientOnly } from "#components";
import { ZoomImg, Magnifier } from "vue3-zoomer";

const productStore = useProductStore();
const { product, color } = storeToRefs(productStore);

function getThumbnailUrl(image?: StoreProductImage) {
  if (!image?.url?.trim()) return "/not_found.png";

  return image.url.replace("500px", "100px");
}
function getDefaultUrl(image?: StoreProductImage) {
  if (!image?.url?.trim()) return "/not_found.png";

  return image.url.replace("500px", "1400px");
}

const mainImage = ref(product?.value?.images?.[0]);

const colorImages = computed(() =>
  product.value?.images?.filter(
    (i) =>
      //@ts-ignore
      i.metadata?.color?.toLowerCase() === color.value?.value?.toLowerCase(),
  ),
);

watch(
  () => color.value?.value,
  (colorString: string) => {
    if (mainImage.value?.metadata?.color !== colorString) {
      mainImage.value = colorImages.value?.[0];
    }
  },
  {
    immediate: true,
  },
);
</script>
<template>
  <div>
    <div
      class="lg:grid items-start grid-cols-[5.75rem_1fr] hidden gap-4 w-full"
    >
      <div class="h-[38rem] overflow-y-hidden">
        <div
          class="w-full h-full hide-scrollbar flex flex-col overflow-y-auto snap-mandatory snap-y gap-3"
        >
          <img
            v-for="image of colorImages"
            :src="getThumbnailUrl(image)"
            alt="Product Image"
            class="max-w-[5.75rem] snap-start cursor-pointer aspect-[23/28] object-cover"
            @click="mainImage = image"
          />
        </div>
      </div>
      <div class="relative">
        <ClientOnly>
          <ZoomImg
            trigger="hover"
            :zoom-scale="3"
            :src="getDefaultUrl(mainImage)"
            :zoom="getDefaultUrl(mainImage)"
          />
        </ClientOnly>
      </div>
    </div>

    <div class="lg:hidden">
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
