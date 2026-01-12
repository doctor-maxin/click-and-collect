<script setup lang="ts">
import type { StoreProductImage } from "@medusajs/types";
import { FeatureZoomImage } from "~/features/zoom-image";
import { useProductStore } from "../lib/product-store";
import { ClientOnly } from "#components";
import { ZoomImg, Magnifier } from "vue3-zoomer";
import ProductImage from "~/widgets/products-grid/ui/product-image.vue";

const productStore = useProductStore();
const { product, color } = storeToRefs(productStore);
const mainImage = ref(product?.value?.images?.[0]);
const isError = ref(!mainImage.value?.url?.trim());
const img = useImage();

const appConfig = useAppConfig();
const isS3 = computed(() => appConfig.provider === "s3");

function getThumbnailUrl(image?: StoreProductImage) {
  if (!image?.url?.trim()) return "/not_found.png";

  return image.url.replace("500px", "100px");
}
function getDefaultUrl(image?: StoreProductImage) {
  if (!image?.url?.trim()) return "/not_found.png";

  return isS3.value
    ? img(
        image.url,
        {},
        {
          //@ts-ignore
          provider: "customS3",
        },
      )
    : image.url.replace("500px", "1400px");
}

const colorImages = computed(() =>
  product.value?.images?.filter(
    (i) =>
      //@ts-ignore
      i.metadata?.color?.toLowerCase() === color.value?.value?.toLowerCase(),
  ),
);

const onError = (event: Event) => {
  if (!event.target) return;
  const target = event.target as HTMLImageElement;
  target.src = "/not_found.png";
};
const zoomImgRef = useTemplateRef("zoomImgRef");
const onErrorZoomImg = () => {
  if (!zoomImgRef.value) return;
  isError.value = true;
};
const changeMainImage = (image: StoreProductImage) => {
  mainImage.value = image;
  isError.value = false;
};

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
          <ProductImage
            v-for="image of colorImages"
            :src="getThumbnailUrl(image)"
            alt="Product Image"
            :width="92"
            :height="112"
            class="max-w-[5.75rem] snap-start cursor-pointer aspect-[23/28] object-cover"
            @click="changeMainImage(image)"
            @error="onError"
          />
        </div>
      </div>
      <div class="relative h-full desktop-media">
        <ClientOnly>
          <ZoomImg
            v-if="!isError"
            ref="zoomImgRef"
            class="h-full"
            trigger="hover"
            :zoom-scale="3"
            :src="getDefaultUrl(mainImage)"
            :zoom="getDefaultUrl(mainImage)"
            @error="onErrorZoomImg"
          />
        </ClientOnly>
        <img
          v-if="isError"
          src="/not_found.png"
          alt="Product Image"
          class="h-full object-cover"
        />
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
            <ProductImage
              class="object-cover object-center size-full"
              :src="image.url"
              :alt="product?.title as string"
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

.desktop-media .vz-zoomimg-img {
  object-fit: cover;
}
</style>
