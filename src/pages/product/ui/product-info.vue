<script setup lang="ts">
import type { StoreProduct } from "@medusajs/types";
import { useProductStore } from "../lib/product-store";
import ProductColorPicker from "./product-color-picker.vue";
import ProductSizePicker from "./product-size-picker.vue";

const productStore = useProductStore();
const { variant, product } = storeToRefs(productStore);
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
      >{{ variant?.sku }}</span
    >

    <span class="text-base block my-3 lg:my-9 leading-5 uppercase">{{
      product?.metadata?.composition
    }}</span>
    <ProductColorPicker />
    <ProductSizePicker />
  </div>
</template>
