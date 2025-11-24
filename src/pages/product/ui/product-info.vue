<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import { useProductStore } from "../lib/product-store";
import ProductColorPicker from "./product-color-picker.vue";
import ProductSizePicker from "./product-size-picker.vue";
import { UiWbButton } from "#components";

const productStore = useProductStore();
const { product, variant, price } = storeToRefs(productStore);
const router = useRouter();
const sku = computed(() => {
  if (variant.value?.sku?.includes("-")) {
    return variant.value?.sku?.split("-").slice(0, -1).join("-");
  }
  return variant.value?.sku;
});

const marketplaces = computed(
  () =>
    variant?.value?.metadata?.marketplaces as {
      link: string;
      provider: string;
    }[],
);

watch(
  variant,
  (v) => {
    if (!v) return;
    router.replace({
      query: {
        variant: v.id,
      },
    });
  },
  {
    deep: true,
  },
);
</script>
<template>
  <div class="w-full">
    <h1
      class="text-base lg:text-[1.25rem] font-medium leading-5 lg:leading-6 uppercase mb-3 lg:mb-4"
    >
      {{ product?.title }}
    </h1>
    <span
      class="text-base block mb-3 lg:mb-6 leading-5 text-[hsl(216,64%,15%)]/50"
      >Арт. {{ sku }}</span
    >
    <span v-if="typeof price === 'number'" class="my-6 text-2xl font-medium">{{
      price.toLocaleString("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
      })
    }}</span>
    <span class="text-base block my-3 lg:my-9 leading-5"
      >Состав:
      <span class="capitalize">
        {{ product?.metadata?.composition?.toLowerCase() }}</span
      ></span
    >
    <ProductColorPicker />
    <ProductSizePicker />
    <div v-if="marketplaces?.length" class="my-6 gap-6 w-full flex flex-col">
      <span class="text-gray text-base leading-5"
        >Данная цена может отличаться от цены в магазинах и на
        маркетплейсах</span
      >
      <template v-for="item of marketplaces" :key="item.provider">
        <UiWbButton :item="item" v-if="item.provider === 'WB'" />
        <UiOzonButton :item="item" v-if="item.provider === 'OZON'" />
        <UiLamodaButton :item="item" v-if="item.provider === 'LAMODA'" />
      </template>
    </div>
    <span v-else class="text-[1.25rem] leading-6 my-0"
      >Товар доступен только в розничных магазинах</span
    >
  </div>
</template>
